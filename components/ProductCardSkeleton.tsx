'use client';

export default function ProductCardSkeleton() {
  return (
    <div className="group relative bg-ds-card border border-ds-border shadow-ds-card flex flex-col rounded-2xl overflow-hidden">
      {/* Image box placeholder */}
      <div className="relative aspect-[3/4] w-full bg-ds-image overflow-hidden">
        <div className="w-full h-full shimmer-skeleton" />
      </div>

      {/* Info placeholder */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow gap-2 sm:gap-3 bg-ds-card">
        {/* Brand placeholder */}
        <div className="h-3 w-1/3 rounded-md shimmer-skeleton" />
        
        {/* Model placeholder */}
        <div className="h-4 w-3/4 rounded-md shimmer-skeleton" />
        
        {/* Price placeholder */}
        <div className="h-4 w-1/4 rounded-md mt-1 shimmer-skeleton" />
      </div>
    </div>
  );
}
