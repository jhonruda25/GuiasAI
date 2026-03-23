import { Suspense } from 'react';
import { WorkspaceClient } from '@/components/workspace/workspace-client';

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center px-4">
          <div className="rounded-full border border-border bg-card px-5 py-3 text-sm text-muted-foreground shadow-sm">
            Preparando tu espacio de trabajo...
          </div>
        </main>
      }
    >
      <WorkspaceClient />
    </Suspense>
  );
}
