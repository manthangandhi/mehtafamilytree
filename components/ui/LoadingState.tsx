export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-12 text-sm text-muted">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-amber-600" />
      <span>{label}</span>
    </div>
  );
}
