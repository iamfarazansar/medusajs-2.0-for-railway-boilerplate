"use client"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import LineItemOptions from "@modules/common/components/line-item-options"
import { convertToLocale } from "@lib/util/money"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart.items
  const hasOverflow = items && items.length > 4

  return (
    <div
      className={clx("flex flex-col gap-y-4 mt-4", {
        "overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
          hasOverflow,
      })}
    >
      {items
        ? items
            .sort((a, b) => {
              return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
            })
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                data-testid="product-row"
              >
                {/* Product Image */}
                <LocalizedClientLink
                  href={`/products/${item.product_handle}`}
                  className="shrink-0"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50">
                    <Thumbnail
                      thumbnail={item.thumbnail}
                      images={item.variant?.product?.images}
                      size="square"
                    />
                  </div>
                </LocalizedClientLink>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-gray-900 truncate">
                    {item.product_title}
                  </h3>
                  <div className="text-gray-500 text-sm">
                    <LineItemOptions
                      variant={item.variant}
                      data-testid="product-variant"
                    />
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    Qty: {item.quantity}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-base text-gray-900">
                    {convertToLocale({
                      amount: item.unit_price * item.quantity,
                      currency_code: cart.currency_code,
                    })}
                  </p>
                </div>
              </div>
            ))
        : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
    </div>
  )
}

export default ItemsPreviewTemplate
