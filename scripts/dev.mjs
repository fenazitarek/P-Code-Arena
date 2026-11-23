import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const viteBin = join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const apiEntry = join(rootDir, 'server', 'index.mjs');

for (const file of [viteBin, apiEntry]) {
  if (!existsSync(file)) {
    console.error(`[dev] Required local file not found: ${file}`);
    console.error('[dev] Run npm install in the project directory first.');
    process.exit(1);
  }
}

const children = [];
let stopping = false;
let forceTimer;
let portWarningShown = false;

function isRunning(child) {
  return child.exitCode === null && child.signalCode === null;
}

function warnPortConflict(label) {
  if (portWarningShown) return;
  portWarningShown = true;
  console.error(`[dev] ${label} could not start because its port is already in use. ` +
    'Stop the process using API port 3001 or Vite port 5173, then retry.');
}

function stop(code) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) {
    if (isRunning(child)) child.kill('SIGTERM');
  }
  forceTimer = setTimeout(() => {
    for (const child of children) {
      if (isRunning(child)) child.kill('SIGKILL');
    }
  }, 2000);
  forceTimer.unref();
}

function start(label, args, env = process.env) {
  const child = spawn(process.execPath, args, {
    cwd: rootDir,
    env,
    shell: false,
    windowsHide: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  children.push(child);

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  let stderrTail = '';
  child.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
    stderrTail = (stderrTail + chunk.toString('utf8')).slice(-2000);
    if (/EADDRINUSE|port\s+\d+\s+is\s+already\s+in\s+use/i.test(stderrTail)) {
      warnPortConflict(label);
    }
  });

  child.on('error', (error) => {
    console.error(`[dev] Failed to start ${label}: ${error.message}`);
    if (error.code === 'EADDRINUSE') warnPortConflict(label);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (!stopping) {
      console.error(`[dev] ${label} exited unexpectedly (${signal || `code ${code}`}). Stopping both processes.`);
      stop(code ?? 1);
    }
    if (children.every((entry) => !isRunning(entry))) clearTimeout(forceTimer);
  });

  return child;
}

const apiEnv = { ...process.env };
if (!apiEnv.HOST) apiEnv.HOST = '127.0.0.1';

start('API server', [apiEntry], apiEnv);
start('Vite', [viteBin, '--host', '127.0.0.1', '--port', '5173', '--strictPort']);

process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));
process.on('exit', () => {
  for (const child of children) {
    if (isRunning(child)) child.kill('SIGKILL');
  }
});
