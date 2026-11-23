export function ProgressBar({ value, label, className = '', barClassName = 'bg-forest' }: { value: number; label: string; className?: string; barClassName?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-line ${className}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
      <div className={`h-full rounded-full transition-[width] duration-500 ${barClassName}`} style={{ width: `${safeValue}%` }} />
    </div>
  );
}
