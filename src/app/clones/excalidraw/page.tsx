import { ExcalidrawApp } from '@/components/clones/excalidraw/ExcalidrawApp';

export default function ExcalidrawClonePage() {
  return (
    <main className="flex min-h-screen flex-col px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <ExcalidrawApp />
      </div>
    </main>
  );
}
