const baseUrl = (process.env.API_BASE_URL || 'http://127.0.0.1:3001').replace(/\/+$/, '');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, body) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new Error(`${path}: cannot reach the API at ${baseUrl} (${error.message})`);
  }

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`${path}: expected JSON, received HTTP ${response.status}.`);
  }
  if (!response.ok) {
    throw new Error(`${path}: HTTP ${response.status}: ${data.error || data.stderr || 'request failed'}`);
  }
  return data;
}

try {
  const health = await request('/api/health');
  assert(health.ok === true, 'health: server did not report ok=true.');
  assert(health.available === true, `health: C compiler is unavailable (${health.compiler}).`);
  console.log(`health: ok (${health.compiler} available)`);

  const run = await request('/api/run', {
    code: `#include <stdio.h>
int main(void) {
    int left, right;
    if (scanf("%d %d", &left, &right) != 2) return 1;
    printf("%d\\n", left + right);
    return 0;
}
`,
    stdin: '17 25\n',
  });
  assert(run.ok === true && run.phase === 'run', `run: ${run.error || run.stderr || 'execution failed'}`);
  assert(run.exitCode === 0 && !run.timedOut, 'run: expected exit code 0 without a timeout.');
  assert(run.stdout.trim() === '42', `run: expected stdout "42", received ${JSON.stringify(run.stdout)}.`);
  console.log(`run: ok (stdout ${JSON.stringify(run.stdout.trim())})`);

  const check = await request('/api/check', {
    code: `#include <stdio.h>
int main(void) {
    char line[128];
    while (fgets(line, sizeof line, stdin) != NULL) {
        fputs(line, stdout);
    }
    return 0;
}
`,
    tests: [
      { input: 'hello\r\nworld  \r\n', expected: 'hello\nworld\n' },
      { input: 'solo  ', expected: 'solo' },
    ],
  });
  assert(check.ok === true && check.phase === 'run', 'check: not all tests passed.');
  assert(Array.isArray(check.results) && check.results.length === 2, 'check: expected two test results.');
  assert(check.results.every((result) => result.passed), 'check: one or more comparisons failed.');
  console.log(`check: ok (${check.results.length}/${check.results.length} passed)`);
} catch (error) {
  console.error(`API smoke test failed: ${error.message}`);
  process.exitCode = 1;
}
