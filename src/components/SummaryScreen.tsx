import { Check, Copy, MessageCircleMore } from "lucide-react";
import { useState } from "react";

export function SummaryScreen(props: { mensaje: string }) {
  const [copied, setCopied] = useState(false);

  async function copyText() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(props.mensaje);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = props.mensaje;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("[SummaryScreen] No se pudo copiar", err);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ce-success-soft)] text-[var(--ce-success)]">
          <MessageCircleMore className="h-4 w-4" />
        </span>
        <p className="ce-eyebrow">Texto listo para el cliente</p>
      </div>

      <div className="ce-card">
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-[var(--ce-text)]">{props.mensaje}</pre>
      </div>

      <button type="button" className="ce-btn ce-btn-primary flex w-full items-center justify-center gap-2" onClick={copyText}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Texto copiado" : "Copiar texto"}
      </button>
      <p className="px-1 text-center text-xs text-[var(--ce-text-faint)]">Pégalo en WhatsApp o SMS para enviárselo al cliente.</p>
    </div>
  );
}
