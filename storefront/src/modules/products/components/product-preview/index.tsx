import { clx } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
      data-testid="product-wrapper"
    >
      <div
        className={clx(
          "rounded-2xl border border-ui-border-base bg-ui-bg-base overflow-hidden",
          "shadow-sm transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-elevation-card-hover"
        )}
      >
        {/* ✅ Image (square on mobile) */}
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="square"
          className="rounded-none"
        />

        {/* ✅ Content */}
        <div className="p-3">
          {/* ✅ Title one line */}
          <p className="text-sm font-semibold text-ui-fg-base truncate">
            {product.title}
          </p>

          {/* ✅ Price */}
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="text-sm font-bold text-ui-fg-base">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
