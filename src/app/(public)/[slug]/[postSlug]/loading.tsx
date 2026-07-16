// src/app/(public)/[category]/[postSlug]/loading.tsx
export default function PostLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse">
        <div className="max-w-4xl border-b border-gray-100 pb-8 mb-10">
          <div className="h-3 bg-gray-100 rounded w-24 mb-4" />
          <div className="h-10 bg-gray-100 rounded w-3/4 mb-3" />
          <div className="h-6 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="aspect-[21/10] bg-gray-100 rounded-sm mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${100 - i * 10}%` }} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="h-[200px] bg-gray-50 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
