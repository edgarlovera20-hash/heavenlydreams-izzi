import { Check, Copy } from "lucide-react";
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
      <div className="ce-card">
        <p className="ce-label mb-2">Texto para el cliente</p>
        <pre className="whitespace-pre-wrap break-words text-sm text-slate-100">{props.mensaje}</pre>
      </div>
      <button type="button" className="ce-btn ce-btn-primary flex w-full items-center justify-center gap-2" onClick={copyText}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Texto copiado" : "Copiar texto"}
      </button>
    </div>
  );
}
