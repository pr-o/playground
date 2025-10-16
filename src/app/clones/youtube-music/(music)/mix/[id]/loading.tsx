export default function MixLoading() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <div className="h-40 w-full animate-pulse rounded-3xl bg-white/10" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3 text-music-muted"
          >
            <div className="h-10 w-10 animate-pulse rounded-md bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-white/10" />
              <div className="h-2 w-1/3 animate-pulse rounded-full bg-white/10" />
            </div>
            <div className="h-2 w-10 animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </section>
  );
}
