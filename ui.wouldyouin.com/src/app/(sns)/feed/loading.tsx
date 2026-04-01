export default function FeedLoading() {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      {/* Stories skeleton */}
      <div className="flex gap-3 px-4 py-3 border-b border-gray-200">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="w-10 h-2 bg-gray-100 rounded mt-1" />
          </div>
        ))}
      </div>

      {/* Post skeletons — 2 posts for fast paint */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="mb-4">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            <div className="space-y-1">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-2 w-14 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="w-full aspect-square bg-gray-100" />
          <div className="px-4 py-3 space-y-2">
            <div className="flex gap-4">
              <div className="w-6 h-6 bg-gray-200 rounded" />
              <div className="w-6 h-6 bg-gray-200 rounded" />
              <div className="w-6 h-6 bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-52 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
