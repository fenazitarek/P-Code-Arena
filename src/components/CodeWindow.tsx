import { useState } from 'react';
import { Icon } from './Icon';

export function CodeWindow({ code, output, filename = 'main.c' }: { code: string; output: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#132019] shadow-soft">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff8f7a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f5cf72]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#8fd6a8]" />
          </div>
          <span className="font-mono text-xs text-white/60">{filename}</span>
        </div>
        <button type="button" onClick={copyCode} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Copy code example">
          <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />{copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="code-scroll overflow-x-auto p-5 font-mono text-[13px] leading-6 text-[#e7efe8] sm:p-6 sm:text-sm"><code>{code}</code></pre>
      <div className="border-t border-white/10 bg-black/15 px-5 py-4 sm:px-6">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9eb2a4]">
          <Icon name="terminal" className="h-3.5 w-3.5" /> Output
        </div>
        <pre className="code-scroll overflow-x-auto font-mono text-sm text-lime"><code>{output}</code></pre>
      </div>
    </div>
  );
}
