"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState, useId } from "react"
import ReactCountryFlag from "react-country-flag"
import { clx } from "@medusajs/ui"
import { ArrowRightMini } from "@medusajs/icons"
import { StateType } from "@lib/hooks/use-toggle-state"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { BsTruck } from "react-icons/bs"

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectProps = {
  toggleState: StateType
  regions: HttpTypes.StoreRegion[]
}

const CountrySelect = ({ toggleState, regions }: CountrySelectProps) => {
  const uid = useId() // ✅ stable across SSR + client

  const [current, setCurrent] = useState<CountryOption | null>(null)

  const { countryCode } = useParams()
  const currentPath = usePathname().split(`/${countryCode}`)[1]

  const { state, close, open } = toggleState

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

  useEffect(() => {
    if (!countryCode || !options.length) return
    const selected = options.find((o) => o.country === countryCode)
    if (selected) setCurrent(selected)
  }, [options, countryCode])

  const handleChange = (option: CountryOption) => {
    setCurrent(option)
    updateRegion(option.country, currentPath)
    close()
  }

  return (
    <div className="relative inline-flex">
      <Listbox value={current} onChange={handleChange} as="div">
        <ListboxButton
          id={`country-select-btn-${uid}`} // ✅ FIX hydration mismatch
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
              countryCode={current?.country ?? ""}
            />

            {/* ✅ Mobile = show country code only */}
            <span className="md:hidden">
              {(current?.country ?? "").toUpperCase()}
            </span>

            {/* ✅ Desktop = show full label */}
            <span className="hidden md:inline max-w-[140px] truncate">
              {current?.label}
            </span>
          </span>

          <ArrowRightMini
            className={clx(
              "transition-transform duration-150",
              state ? "rotate-90" : ""
            )}
          />
        </ListboxButton>

        <Transition
          show={state}
          as={Fragment}
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions
            id={`country-select-options-${uid}`} // ✅ also stable
            className="
              absolute
              top-full
              mt-2
              left-0
              md:right-0 md:left-auto
              w-fit
              min-w-[170px]
              max-w-[220px]
              overflow-y-scroll
              z-[900]
              bg-white
              drop-shadow-md
              text-small-regular
              uppercase
              text-black
              no-scrollbar
              rounded-rounded
              focus:outline-none
            "
            static
          >
            {options.map((o, index) => (
              <ListboxOption
                key={index}
                value={o}
                className="py-2 hover:bg-gray-200 px-3 cursor-pointer flex items-center gap-x-2"
              >
                <ReactCountryFlag
                  svg
                  style={{ width: "16px", height: "16px" }}
                  countryCode={o.country ?? ""}
                />
                {o.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </Listbox>
    </div>
  )
}

export default CountrySelect
