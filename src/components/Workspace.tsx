import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { TestCase } from '../data/types';
import { loadDraft, saveDraft } from '../lib/progress';
import { Icon } from './Icon';

interface TestResult {
  index: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  exitCode: number | null;
  timedOut: boolean;
  stderr: string;
}

interface ExecutionResponse {
  ok: boolean;
  phase: 'compile' | 'run' | 'validation';
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  timedOut: boolean;
  outputTruncated: boolean;
  results?: TestResult[];
  message?: string;
  error?: string;
}

interface WorkspaceProps {
  id: string;
  initialCode: string;
  mode?: 'run' | 'check';
  tests?: TestCase[];
  stdin?: string;
  filename?: string;
  onPassed?: () => void;
}

const apiBase = import.meta.env.VITE_API_URL || '/api';

export function Workspace({ id, initialCode, mode = 'run', tests = [], stdin = '', filename = 'main.c', onPassed }: WorkspaceProps) {
  const [code, setCode] = useState(() => loadDraft(id) ?? initialCode);
  const [input, setInput] = useState(stdin);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineNumbers = useMemo(() => Array.from({ length: code.split('\n').length }, (_, index) => index + 1), [code]);

  useEffect(() => {
    setCode(loadDraft(id) ?? initialCode);
    setInput(stdin);
    setResult(null);
  }, [id, initialCode, stdin]);

  useEffect(() => {
    saveDraft(id, code);
  }, [code, id]);

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nextCode = `${code.slice(0, start)}  ${code.slice(end)}`;
    setCode(nextCode);
    window.requestAnimationFrame(() => target.setSelectionRange(start + 2, start + 2));
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function execute() {
    if (!code.trim()) return;
    setRunning(true);
    setResult(null);
    try {
      const response = await fetch(`${apiBase}/${mode === 'check' ? 'check' : 'run'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'check' ? { code, tests } : { code, stdin: input }),
      });
      const data = await response.json() as ExecutionResponse;
      if (!response.ok) {
        setResult({
          ok: false,
          phase: 'validation',
          stdout: '',
          stderr: '',
          exitCode: null,
          durationMs: 0,
          timedOut: false,
          outputTruncated: false,
          message: data.message ?? data.error ?? 'The local runner could not process this request.',
        });
        return;
      }
      setResult(data);
      if (mode === 'check' && data.ok) onPassed?.();
    } catch {
      setResult({
        ok: false,
        phase: 'validation',
        stdout: '',
        stderr: '',
        exitCode: null,
        durationMs: 0,
        timedOut: false,
        outputTruncated: false,
        message: 'The local runner is not reachable. Start the app with npm run dev and make sure GCC is installed.',
      });
    } finally {
      setRunning(false);
    }
  }

  const passedCount = result?.results?.filter((test) => test.passed).length ?? 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-card" aria-labelledby={`${id}-workspace-title`}>
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="eyebrow">Local C workspace</p>
          <h2 id={`${id}-workspace-title`} className="mt-1 text-lg font-extrabold">{mode === 'check' ? 'Write, compile, and test' : 'Experiment with the example'}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#7b877f]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e2f1e8] px-3 py-1.5 text-[#286044]"><span className="h-1.5 w-1.5 rounded-full bg-[#3f745c]" />GCC · C11</span>
          <span className="hidden sm:inline">Drafts save locally</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px]">
        <div className="min-w-0 bg-[#132019]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-mono text-xs text-white/55">{filename}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={copyCode} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white">
                <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />{copied ? 'Copied' : 'Copy'}
              </button>
              <button type="button" onClick={() => { setCode(initialCode); setResult(null); }} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white">
                <Icon name="reset" className="h-3.5 w-3.5" />Reset
              </button>
            </div>
          </div>
          <div className="flex min-h-[340px]">
            <div ref={gutterRef} className="code-scroll select-none overflow-hidden border-r border-white/10 py-4 text-right font-mono text-[13px] leading-6 text-white/25" aria-hidden="true">
              {lineNumbers.map((line) => <div key={line} className="px-3">{line}</div>)}
            </div>
            <textarea ref={textareaRef} value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={handleEditorKeyDown} onScroll={(event) => { if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop; }} className="code-scroll min-h-[340px] min-w-0 flex-1 resize-y bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-[#e7efe8] caret-lime outline-none sm:text-sm" aria-label="C source code" spellCheck={false} autoCapitalize="off" autoCorrect="off" />
          </div>
        </div>

        <aside className="border-t border-line bg-cream/70 p-5 lg:border-l lg:border-t-0">
          <h3 className="text-sm font-extrabold">Run settings</h3>
          <dl className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3"><dt className="text-[#7b877f]">Compiler</dt><dd className="font-bold">GCC</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-[#7b877f]">Standard</dt><dd className="font-bold">C11</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-[#7b877f]">Time limit</dt><dd className="font-bold">2 seconds</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-[#7b877f]">Mode</dt><dd className="font-bold">{mode === 'check' ? `${tests.length} tests` : 'Standard input'}</dd></div>
          </dl>
          <div className="mt-5 rounded-2xl border border-line bg-white p-3.5 text-xs leading-5 text-[#647168]">
            <div className="flex items-center gap-2 font-bold text-ink"><Icon name="shield" className="h-4 w-4 text-forest" />Local only</div>
            <p className="mt-1.5">Code is compiled on this machine. Do not paste passwords or private information.</p>
          </div>
        </aside>
      </div>

      {mode === 'run' && (
        <div className="border-t border-line p-5">
          <label htmlFor={`${id}-stdin`} className="field-label">Program input <span className="font-normal text-[#7b877f]">(standard input)</span></label>
          <textarea id={`${id}-stdin`} value={input} onChange={(event) => setInput(event.target.value)} className="field-input min-h-[92px] resize-y font-mono text-sm" placeholder="Values your program should read, separated by spaces or newlines" spellCheck={false} />
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-line bg-cream/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[#647168]" aria-live="polite">
          {running ? 'Compiling and running your code…' : result?.ok ? (mode === 'check' ? `All ${tests.length} checks passed.` : 'Program finished successfully.') : result ? 'The run needs another look. Review the feedback below.' : 'Ready when you are. Your draft stays in this browser.'}
        </p>
        <button type="button" onClick={execute} disabled={running || !code.trim()} className="btn-primary shrink-0">
          <Icon name={running ? 'clock' : 'play'} className="h-4 w-4" />{running ? 'Running…' : mode === 'check' ? 'Run all tests' : 'Compile and run'}
        </button>
      </div>

      {result && (
        <div className="border-t border-line p-5" aria-live="polite">
          {result.message && (
            <div className="rounded-2xl border border-[#ead7b8] bg-[#fff9ef] p-4 text-sm leading-6 text-[#74501b]">
              <div className="flex items-start gap-2"><Icon name="info" className="mt-1 h-4 w-4 shrink-0" /><p>{result.message}</p></div>
            </div>
          )}

          {result.results && (
            <div className="mb-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold">Test results</h3>
                <span className={`pill ${result.ok ? 'bg-[#e2f1e8] text-[#286044]' : 'bg-[#f8e2e2] text-[#934141]'}`}>{passedCount}/{result.results.length} passed</span>
              </div>
              <div className="mt-3 grid gap-2">
                {result.results.map((test) => (
                  <div key={test.index} className={`rounded-xl border p-3 ${test.passed ? 'border-[#cfe5d7] bg-[#f4fbf7]' : 'border-[#eed0d0] bg-[#fff8f8]'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold">Check {test.index + 1}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${test.passed ? 'text-[#286044]' : 'text-[#934141]'}`}><Icon name={test.passed ? 'check' : 'close'} className="h-3.5 w-3.5" />{test.passed ? 'Passed' : test.timedOut ? 'Timed out' : 'Failed'}</span>
                    </div>
                    {!test.passed && (
                      <div className="mt-2 grid gap-2 font-mono text-[11px] sm:grid-cols-2">
                        <div><p className="mb-1 font-sans font-semibold text-[#7b877f]">Expected</p><pre className="code-scroll overflow-x-auto rounded-lg bg-white p-2">{test.expected || '(empty)'}</pre></div>
                        <div><p className="mb-1 font-sans font-semibold text-[#7b877f]">Your output</p><pre className="code-scroll overflow-x-auto rounded-lg bg-white p-2">{test.actual || '(empty)'}</pre></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(result.stdout || result.stderr || (!result.message && !result.results)) && (
            <div className="overflow-hidden rounded-2xl bg-[#132019]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                <span className="text-xs font-bold text-white/60">Console</span>
                <span className="font-mono text-[11px] text-white/40">{result.durationMs} ms · exit {result.exitCode ?? '—'}</span>
              </div>
              <div className="space-y-3 p-4 font-mono text-sm leading-6">
                {result.stdout && <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#9eb2a4]">stdout</p><pre className="code-scroll overflow-x-auto whitespace-pre-wrap text-[#e7efe8]">{result.stdout}</pre></div>}
                {result.stderr && <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#ffb4a4]">stderr / compiler</p><pre className="code-scroll overflow-x-auto whitespace-pre-wrap text-[#ffc0b3]">{result.stderr}</pre></div>}
                {!result.stdout && !result.stderr && <p className="text-white/40">No console output.</p>}
              </div>
            </div>
          )}
          {result.timedOut && <p className="mt-3 text-sm font-semibold text-[#934141]">The program exceeded its time limit and was stopped.</p>}
          {result.outputTruncated && <p className="mt-3 text-sm font-semibold text-[#8a5a12]">The output was truncated after reaching the safety limit.</p>}
        </div>
      )}
    </section>
  );
}
