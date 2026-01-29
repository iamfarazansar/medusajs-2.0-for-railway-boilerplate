"use client"

import { useToggleState } from "@medusajs/ui"
import CountrySelectFooter from "@modules/layout/components/country-select-footer"
import { HttpTypes } from "@medusajs/types"

type Props = {
  regions: HttpTypes.StoreRegion[]
}

export default function CountrySelectFooterNav({ regions }: Props) {
  const countryToggleState = useToggleState()

  return (
    <div
      className="flex items-center"
      onMouseEnter={countryToggleState.open}
      onMouseLeave={countryToggleState.close}
    >
      <CountrySelectFooter toggleState={countryToggleState} regions={regions} />
    </div>
  )
}
