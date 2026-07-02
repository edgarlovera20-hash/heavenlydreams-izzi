import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="text-lg font-semibold text-slate-100">Algo salió mal</p>
          <p className="text-sm text-slate-400">
            Ocurrió un error inesperado. Tus capturas guardadas no se perdieron: están en el celular.
          </p>
          <button type="button" className="ce-btn ce-btn-primary" onClick={() => window.location.reload()}>
            Recargar la app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
