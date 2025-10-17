export function ChannelCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 border border-card-border animate-pulse">
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md" />
        <div className="flex-grow space-y-2">
          <div className="h-6 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
        </div>
      </div>
      <div className="flex gap-2 pt-3 border-t border-border">
        <div className="h-8 flex-1 bg-primary/20 rounded-lg" />
        <div className="h-8 flex-1 bg-secondary rounded-lg" />
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <ChannelCardSkeleton key={i} />
      ))}
    </div>
  );
}
