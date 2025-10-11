import { NotionWorkspace } from '@/components/notion/NotionWorkspace';

export default function NotionClonePage() {
  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <NotionWorkspace />
      </div>
    </main>
  );
}
