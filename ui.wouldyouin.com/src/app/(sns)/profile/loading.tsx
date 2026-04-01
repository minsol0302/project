export default function ProfileLoading() {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      {/* Header skeleton */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-28 bg-gray-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 bg-gray-200 rounded-lg" />
            <div className="w-6 h-6 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Avatar + stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-200" />
          <div className="flex-1 flex justify-around text-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-8 bg-gray-200 rounded mx-auto" />
                <div className="h-2 w-10 bg-gray-100 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Name & bio */}
        <div className="mb-4 space-y-1">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-40 bg-gray-100 rounded" />
        </div>
      </div>

      {/* ScheduleCarousel skeleton */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {/* 일정 추가 버튼 스켈레톤 */}
          <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg" />
          {/* 일정 카드 스켈레톤 */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 py-3 flex justify-center">
            <div className="w-5 h-5 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton - Posts tab */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="h-7 w-28 bg-gray-200 rounded-full" />
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Grid skeleton — 3x3 grid (posts) */}
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
