import { Container } from "@medusajs/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      {/* Card wrapper */}
      <div className="rounded-2xl border border-ui-border-base bg-ui-bg-base overflow-hidden shadow-sm">
        {/* ✅ Square image skeleton */}
        <Container className="aspect-square w-full bg-ui-bg-subtle" />

        {/* Content */}
        <div className="p-3">
          {/* ✅ Title */}
          <div className="h-4 w-4/5 rounded bg-ui-bg-subtle" />

          {/* ✅ Price pill row */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="h-4 w-1/3 rounded bg-ui-bg-subtle" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
