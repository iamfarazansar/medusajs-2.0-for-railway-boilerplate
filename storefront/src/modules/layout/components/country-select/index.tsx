"use client"

import React, { useMemo } from "react"
import ReactCountryFlag from "react-country-flag"
import { clx } from "@medusajs/ui"
import { ArrowRightMini } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { BsTruck } from "react-icons/bs"
import type { StateType } from "@lib/hooks/use-toggle-state"

type CountryOption = {
  country: string
  region: string
  label: string
}

type Props = {
  toggleState: StateType
  regions: HttpTypes.StoreRegion[]
}

export default function CountrySelect({ toggleState, regions }: Props) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()

  const { state, open, close } = toggleState

  const options = useMemo<CountryOption[]>(() => {
    return (
      regions
        ?.flatMap((r) =>
          r.countries?.map((c) => ({
            country: c.iso_2,
            region: r.id,
            label: c.display_name,
          }))
        )
        .filter(Boolean)
        .sort((a, b) => (a.label ?? "").localeCompare(b.label ?? "")) || []
    )
  }, [regions])

  const selected = useMemo(() => {
    if (!countryCode || !options.length) return null
    return options.find((o) => o.country === countryCode) ?? null
  }, [options, countryCode])

  const currentPath = useMemo(() => {
    if (!countryCode) return "/"
    const after = pathname.split(`/${countryCode}`)[1]
    return after?.length ? after : "/"
  }, [pathname, countryCode])

  const handleChange = (option: CountryOption) => {
    updateRegion(option.country, currentPath)
    close()
  }

  if (!selected) return null

  return (
    <div className="relative inline-flex">
      {/* Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          state ? close() : open()
        }}
        className="
          flex items-center gap-2
          px-3 py-2
          rounded-full
          hover:bg-black/[0.05]
          transition
          focus:outline-none
        "
      >
        <BsTruck className="text-[18px]" />

        <span className="flex items-center gap-2 text-sm font-medium min-w-0">
          <ReactCountryFlag
            svg
            style={{ width: 16, height: 16 }}
            countryCode={selected.country}
          />

          {/* Mobile = show code */}
          <span className="md:hidden">{selected.country.toUpperCase()}</span>

          {/* Desktop = show full */}
          <span className="hidden md:inline max-w-[140px] truncate">
            {selected.label}
          </span>
        </span>

        <ArrowRightMini
          className={clx(
            "transition-transform duration-150",
            state ? "rotate-90" : ""
          )}
        />
      </button>

      {/* Dropdown */}
      {/* Dropdown */}
      {state && (
        <div
          className="
      absolute top-full left-0
      md:right-0 md:left-auto
      z-[900]
      pt-2
    "
          onMouseEnter={open}
          onMouseLeave={close}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="
        w-fit
        min-w-[170px]
        max-w-[220px]
        max-h-[420px]
        overflow-y-scroll
        bg-white
        drop-shadow-md
        text-small-regular
        uppercase
        text-black
        no-scrollbar
        rounded-rounded
        focus:outline-none
      "
          >
            {options.map((o) => (
              <button
                key={o.country}
                type="button"
                onClick={() => handleChange(o)}
                className="
            w-full text-left
            py-2 px-3
            hover:bg-gray-200
            cursor-pointer
            flex items-center gap-x-2
          "
              >
                <ReactCountryFlag
                  svg
                  style={{ width: "16px", height: "16px" }}
                  countryCode={o.country}
                />
                <span className="truncate">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
