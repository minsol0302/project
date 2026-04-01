/**
 * Skeleton shown INSTANTLY while page JS loads.
 * This eliminates the blank screen and makes FCP < 0.3s.
 */
export default function SnsLoading() {
  return (
    <div className="min-h-screen bg-white max-w-md mx-auto animate-pulse">
      {/* TopBar skeleton */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-40">
        <div className="flex items-center justify-between">
          <div className="h-7 w-20 bg-gray-200 rounded" />
          <div className="flex gap-4">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stories skeleton */}
      <div className="flex gap-3 px-4 py-3 border-b border-gray-200">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="w-10 h-2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Post skeletons */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="mb-4">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
          <div className="w-full aspect-square bg-gray-100" />
          <div className="px-4 py-2 space-y-2">
            <div className="h-3 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
