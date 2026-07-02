import { Check } from "lucide-react";

export function WizardSteps(props: { labels: string[]; currentIndex: number }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Progreso de la captura">
      {props.labels.map((label, index) => {
        const isDone = index < props.currentIndex;
        const isCurrent = index === props.currentIndex;
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors " +
                  (isDone
                    ? "bg-[var(--ce-success)] text-slate-900"
                    : isCurrent
                      ? "bg-[var(--ce-primary)] text-white ring-4 ring-[var(--ce-primary-soft)]"
                      : "bg-white/5 text-[var(--ce-text-faint)] border border-[var(--ce-border-strong)]")
                }
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <span
                className={
                  "hidden text-center text-[10px] font-semibold uppercase tracking-wide sm:block " +
                  (isCurrent ? "text-[var(--ce-text)]" : "text-[var(--ce-text-faint)]")
                }
              >
                {label}
              </span>
            </div>
            {index < props.labels.length - 1 && (
              <div className={"mb-4 h-0.5 flex-1 rounded-full sm:mb-5 " + (isDone ? "bg-[var(--ce-success)]" : "bg-[var(--ce-border-strong)]")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
