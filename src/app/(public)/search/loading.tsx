// src/app/(public)/search/loading.tsx
export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse">
        <div className="border-b border-gray-100 pb-8 mb-10">
          <div className="h-8 bg-gray-100 rounded w-64 mb-4" />
          <div className="h-3 bg-gray-100 rounded w-48" />
        </div>
        <div className="max-w-xl mb-12">
          <div className="h-12 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-md overflow-hidden">
              <div className="aspect-[16/9] bg-gray-100" />
              <div className="p-6 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-16" />
                <div className="h-5 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
