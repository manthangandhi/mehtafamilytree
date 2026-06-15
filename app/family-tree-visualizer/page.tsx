import FamilyTreeClient from "./FamilyTreeClient";

export default function FamilyTreePage() {
  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <header className="px-6 py-5 bg-surface/95 backdrop-blur border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10.5V6a1 1 0 0 0-1-1h-2.5"/><path d="M11 6V3a1 1 0 0 0-1-1H7.5"/><path d="M12 12H3"/><path d="M18 12h3"/><path d="M12 12v9"/><path d="M12 12L3 3"/><path d="m12 12 9-9"/></svg>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">Mehta Kutumb Lineage</h1>
            <p className="text-xs text-muted -mt-0.5">Our family across every household and generation</p>
          </div>
        </div>
        <div className="hidden md:block text-xs text-muted">Drag to explore • Zoom with controls</div>
      </header>
      <main className="flex-1 overflow-hidden relative">
        <FamilyTreeClient />
      </main>
    </div>
  );
}
