export default function ExploreLoading() {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3 border-b border-gray-100">
        <div className="h-6 w-12 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
          <div className="w-16 h-10 bg-gray-200 rounded-xl" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-16 bg-gray-100 rounded-full" />
          ))}
        </div>
      </div>

      {/* Result cards */}
      <div className="px-4 py-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 bg-gray-200 rounded" />
              <div className="h-2 w-48 bg-gray-100 rounded" />
              <div className="h-4 w-14 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
