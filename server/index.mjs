import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import express from 'express';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const envPath = join(rootDir, '.env');

if (existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch (error) {
    console.warn(`Could not load .env: ${error.message}`);
  }
}

function integerSetting(name, fallback, min, max = Number.MAX_SAFE_INTEGER) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

const PORT = integerSetting('PORT', 3001, 1, 65535);
const HOST = process.env.HOST?.trim() || '127.0.0.1';
const COMPILER = process.env.CC_PATH?.trim() || 'gcc';
const COMPILER_EXECUTABLE = /[\\/]/.test(COMPILER) ? resolve(rootDir, COMPILER) : COMPILER;
const MAX_RUN_TIMEOUT_MS = integerSetting('MAX_RUN_TIMEOUT_MS', 2000, 250, 5000);
const MAX_OUTPUT_BYTES = integerSetting('MAX_OUTPUT_BYTES', 65536, 1);
const COMPILE_TIMEOUT_MS = 10_000;
const DIST_DIR = join(rootDir, 'dist');

if (!['127.0.0.1', '::1', 'localhost'].includes(HOST)) {
  console.error('HOST must be a loopback address (127.0.0.1, ::1, or localhost).');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
app.use('/api', express.json({ limit: '256kb' }));

function elapsedSince(started) {
  return Math.round(performance.now() - started);
}

function failure(phase, message, durationMs = 0, extra = {}) {
  return {
    ok: false,
    phase,
    stdout: '',
    stderr: message,
    exitCode: null,
    durationMs,
    timedOut: false,
    outputTruncated: false,
    message,
    error: message,
    ...extra,
  };
}

function validationFailure(message, extra = {}) {
  return failure('validation', message, 0, extra);
}

function isApiPath(path) {
  return path === '/api' || path.startsWith('/api/');
}

function normalizeOutput(value) {
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .trimEnd();
}

function spawnCaptured(command, args, { cwd, input = '', timeoutMs, maxOutputBytes }) {
  return new Promise((resolve) => {
    const stdoutChunks = [];
    const stderrChunks = [];
    let outputBytes = 0;
    let outputTruncated = false;
    let timedOut = false;
    let errorCode = null;
    let settled = false;
    let timer = null;

    const finish = (code) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve({
        stdout: Buffer.concat(stdoutChunks).toString('utf8'),
        stderr: Buffer.concat(stderrChunks).toString('utf8'),
        exitCode: errorCode ? null : typeof code === 'number' ? code : null,
        timedOut,
        outputTruncated,
        errorCode,
      });
    };

    const collect = (chunk, chunks) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      const remaining = Math.max(0, maxOutputBytes - outputBytes);
      if (buffer.length > remaining) outputTruncated = true;
      if (remaining > 0) {
        const part = buffer.subarray(0, remaining);
        chunks.push(part);
        outputBytes += part.length;
      }
    };

    let child;
    try {
      child = spawn(command, args, {
        cwd,
        shell: false,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (error) {
      errorCode = error.code || 'SPAWN_ERROR';
      finish(null);
      return;
    }

    child.stdout.on('data', (chunk) => collect(chunk, stdoutChunks));
    child.stderr.on('data', (chunk) => collect(chunk, stderrChunks));
    child.stdin.on('error', () => {});
    child.stdin.end(input);
    child.on('error', (error) => {
      errorCode = error.code || 'SPAWN_ERROR';
    });
    child.on('close', (code) => finish(code));

    timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);
  });
}

async function detectCompiler() {
  const probe = await spawnCaptured(COMPILER_EXECUTABLE, ['--version'], {
    timeoutMs: 2000,
    maxOutputBytes: 4096,
  });
  return !probe.errorCode && !probe.timedOut && probe.exitCode === 0;
}

function compilerUnavailable(durationMs, extra = {}) {
  const message = `C compiler "${COMPILER}" is not available. Install GCC ` +
    '(MSYS2 MinGW-w64 on Windows, Xcode Command Line Tools on macOS, or your ' +
    'Linux package manager), or set CC_PATH in .env.';
  return failure('compile', message, durationMs, extra);
}

async function compileSource(code) {
  const tempDir = await mkdtemp(join(tmpdir(), 'loopcraft-'));
  const sourcePath = join(tempDir, 'program.c');
  const executablePath = join(tempDir, process.platform === 'win32' ? 'program.exe' : 'program');

  try {
    await writeFile(sourcePath, code, 'utf8');
    const result = await spawnCaptured(
      COMPILER_EXECUTABLE,
      ['-std=c11', '-O2', '-Wall', '-Wextra', sourcePath, '-o', executablePath],
      { cwd: tempDir, timeoutMs: COMPILE_TIMEOUT_MS, maxOutputBytes: MAX_OUTPUT_BYTES },
    );
    return { tempDir, executablePath, result };
  } catch (error) {
    await rm(tempDir, { recursive: true, force: true });
    throw error;
  }
}

function compileFailure(result, durationMs, extra = {}) {
  const message = result.timedOut
    ? 'Compilation timed out.'
    : result.errorCode
      ? `Could not start the C compiler (${result.errorCode}).`
      : 'Compilation failed.';
  return {
    ok: false,
    phase: 'compile',
    stdout: result.stdout,
    stderr: result.stderr || message,
    exitCode: result.exitCode,
    durationMs,
    timedOut: result.timedOut,
    outputTruncated: result.outputTruncated,
    error: message,
    ...extra,
  };
}

async function runProgram(executablePath, tempDir, stdin) {
  const command = process.platform === 'win32' ? executablePath : './program';
  const result = await spawnCaptured(command, [], {
    cwd: tempDir,
    input: stdin,
    timeoutMs: MAX_RUN_TIMEOUT_MS,
    maxOutputBytes: MAX_OUTPUT_BYTES,
  });
  const message = result.timedOut
    ? 'Program timed out.'
    : result.errorCode
      ? `Could not start the compiled program (${result.errorCode}).`
      : '';
  return {
    ok: !result.timedOut && !result.errorCode && result.exitCode === 0,
    phase: 'run',
    stdout: result.stdout,
    stderr: result.stderr || message,
    exitCode: result.exitCode,
    timedOut: result.timedOut,
    outputTruncated: result.outputTruncated,
  };
}

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;
const rateLimitHits = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of rateLimitHits) {
    const recent = hits.filter((time) => now - time < RATE_WINDOW_MS);
    if (recent.length) rateLimitHits.set(ip, recent);
    else rateLimitHits.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

function rateLimit(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const recent = (rateLimitHits.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    rateLimitHits.set(ip, recent);
    res.set('Retry-After', '60');
    res.status(429).json(validationFailure('Too many API executions. Limit: 60 per minute.'));
    return;
  }
  recent.push(now);
  rateLimitHits.set(ip, recent);
  next();
}

function validateCode(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }
  if (typeof body.code !== 'string' || body.code.trim() === '') {
    return 'code must be a nonempty string.';
  }
  if (body.code.length > 20000) return 'code must be at most 20000 characters.';
  return null;
}

app.get('/api/health', async (req, res) => {
  const available = await detectCompiler();
  res.json({ ok: true, compiler: COMPILER, available });
});

app.post('/api/run', rateLimit, async (req, res) => {
  const invalid = validateCode(req.body);
  if (invalid) {
    res.status(400).json(validationFailure(invalid));
    return;
  }
  const stdin = req.body.stdin === undefined ? '' : req.body.stdin;
  if (typeof stdin !== 'string') {
    res.status(400).json(validationFailure('stdin must be a string.'));
    return;
  }
  if (stdin.length > 10000) {
    res.status(400).json(validationFailure('stdin must be at most 10000 characters.'));
    return;
  }

  const started = performance.now();
  let tempDir;
  try {
    if (!(await detectCompiler())) {
      res.status(503).json(compilerUnavailable(elapsedSince(started)));
      return;
    }

    const compiled = await compileSource(req.body.code);
    tempDir = compiled.tempDir;
    if (compiled.result.errorCode) {
      res.status(503).json(compilerUnavailable(elapsedSince(started)));
      return;
    }
    if (compiled.result.exitCode !== 0 || compiled.result.timedOut) {
      res.json(compileFailure(compiled.result, elapsedSince(started)));
      return;
    }

    const result = await runProgram(compiled.executablePath, tempDir, stdin);
    res.json({ ...result, durationMs: elapsedSince(started) });
  } catch (error) {
    console.error(`POST /api/run failed: ${error.message}`);
    res.status(500).json(failure('compile', 'Internal server error while processing the request.', elapsedSince(started)));
  } finally {
    if (tempDir) await rm(tempDir, { recursive: true, force: true });
  }
});

app.post('/api/check', rateLimit, async (req, res) => {
  const invalid = validateCode(req.body);
  if (invalid) {
    res.status(400).json(validationFailure(invalid, { results: [] }));
    return;
  }
  const tests = req.body.tests;
  if (!Array.isArray(tests) || tests.length < 1 || tests.length > 10) {
    res.status(400).json(validationFailure('tests must be an array containing 1 to 10 tests.', { results: [] }));
    return;
  }
  for (const [index, test] of tests.entries()) {
    if (!test || typeof test !== 'object' || Array.isArray(test)) {
      res.status(400).json(validationFailure(`Test ${index + 1} must be an object.`, { results: [] }));
      return;
    }
    if (typeof test.input !== 'string' || typeof test.expected !== 'string') {
      res.status(400).json(validationFailure(`Test ${index + 1} input and expected must be strings.`, { results: [] }));
      return;
    }
    if (test.input.length > 5000 || test.expected.length > 5000) {
      res.status(400).json(validationFailure(`Test ${index + 1} input and expected must be at most 5000 characters.`, { results: [] }));
      return;
    }
  }

  const started = performance.now();
  let tempDir;
  try {
    if (!(await detectCompiler())) {
      res.status(503).json(compilerUnavailable(elapsedSince(started), { results: [] }));
      return;
    }

    const compiled = await compileSource(req.body.code);
    tempDir = compiled.tempDir;
    if (compiled.result.errorCode) {
      res.status(503).json(compilerUnavailable(elapsedSince(started), { results: [] }));
      return;
    }
    if (compiled.result.exitCode !== 0 || compiled.result.timedOut) {
      res.json(compileFailure(compiled.result, elapsedSince(started), { results: [] }));
      return;
    }

    const results = [];
    let anyTestOutputTruncated = false;
    for (const [index, test] of tests.entries()) {
      const result = await runProgram(compiled.executablePath, tempDir, test.input);
      anyTestOutputTruncated ||= result.outputTruncated;
      const passed = result.ok &&
        !result.outputTruncated &&
        normalizeOutput(result.stdout) === normalizeOutput(test.expected);
      results.push({
        index,
        input: test.input,
        expected: test.expected,
        actual: result.stdout,
        passed,
        exitCode: result.exitCode,
        timedOut: result.timedOut,
        stderr: result.stderr,
      });
    }

    const stdout = results.map((result) => result.actual).join('');
    const stderr = results.map((result) => result.stderr).join('');
    let remaining = MAX_OUTPUT_BYTES;
    const stdoutBuffer = Buffer.from(stdout);
    const stderrBuffer = Buffer.from(stderr);
    const cappedStdout = stdoutBuffer.subarray(0, remaining);
    remaining -= cappedStdout.length;
    const cappedStderr = stderrBuffer.subarray(0, remaining);
    const aggregateTruncated = stdoutBuffer.length + stderrBuffer.length > MAX_OUTPUT_BYTES;
    const lastResult = results.at(-1);

    res.json({
      ok: results.every((result) => result.passed),
      phase: 'run',
      stdout: cappedStdout.toString('utf8'),
      stderr: cappedStderr.toString('utf8'),
      exitCode: lastResult.exitCode,
      durationMs: elapsedSince(started),
      timedOut: results.some((result) => result.timedOut),
      outputTruncated: aggregateTruncated || anyTestOutputTruncated,
      results,
    });
  } catch (error) {
    console.error(`POST /api/check failed: ${error.message}`);
    res.status(500).json(failure('compile', 'Internal server error while processing the request.', elapsedSince(started), { results: [] }));
  } finally {
    if (tempDir) await rm(tempDir, { recursive: true, force: true });
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: 'API route not found.' });
});

app.use((error, req, res, next) => {
  if (!isApiPath(req.path)) {
    next(error);
    return;
  }
  if (error.type === 'entity.too.large') {
    res.status(413).json(validationFailure('Request body is too large (limit 256kb).', req.path === '/api/check' ? { results: [] } : {}));
    return;
  }
  if (error.status === 400 && error instanceof SyntaxError) {
    res.status(400).json(validationFailure('Invalid JSON request body.', req.path === '/api/check' ? { results: [] } : {}));
    return;
  }
  console.error(`API error: ${error.message}`);
  res.status(500).json(failure('compile', 'Internal server error.', 0, req.path === '/api/check' ? { results: [] } : {}));
});

if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !isApiPath(req.path)) {
      res.sendFile(join(DIST_DIR, 'index.html'));
      return;
    }
    next();
  });
}

const server = app.listen(PORT, HOST, () => {
  const displayHost = HOST.includes(':') ? `[${HOST}]` : HOST;
  console.log(`API server listening on http://${displayHost}:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing server or set PORT in .env.`);
  } else {
    console.error(`API server failed to start: ${error.message}`);
  }
  process.exit(1);
});
