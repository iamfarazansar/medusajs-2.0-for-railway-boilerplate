"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { MeiliSearch } from "meilisearch"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BsSearch, BsX } from "react-icons/bs"
import Image from "next/image"

const SEARCH_ENDPOINT =
  process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || "http://localhost:7700"
const SEARCH_API_KEY = process.env.NEXT_PUBLIC_SEARCH_API_KEY || ""

type ProductHit = {
  id: string
  title: string
  handle: string
  description?: string
  thumbnail?: string
  variant_sku?: string
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProductHit[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Focus input when search opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to let animation start before focusing
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeSearch()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const client = new MeiliSearch({
        host: SEARCH_ENDPOINT,
        apiKey: SEARCH_API_KEY,
      })
      const searchResults = await client
        .index("products")
        .search(searchQuery, { limit: 8 })
      setResults(searchResults.hits as ProductHit[])
    } catch (err) {
      console.error("Search error:", err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => performSearch(value), 250)
  }

  const closeSearch = () => {
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Expanding search container */}
      <div
        className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out rounded-full ${
          isOpen
            ? "w-[200px] sm:w-[260px] md:w-[320px] bg-gray-100 border border-gray-200"
            : "w-8 md:w-12"
        }`}
      >
        {/* Search icon / toggle button */}
        <button
          onClick={() => {
            if (!isOpen) setIsOpen(true)
          }}
          className={`flex-shrink-0 w-8 md:w-12 h-8 md:h-12 rounded-full flex justify-center items-center cursor-pointer transition ${
            isOpen ? "" : "hover:bg-black/[0.05]"
          }`}
          aria-label="Search"
        >
          <BsSearch className="text-[15px] md:text-[18px] text-black" />
        </button>

        {/* Input field - slides in */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search rugs..."
          value={query}
          onChange={handleInputChange}
          className={`bg-transparent outline-none text-sm md:text-base flex-1 pr-2 transition-opacity duration-200 ${
            isOpen ? "opacity-100 w-full" : "opacity-0 w-0 pointer-events-none"
          }`}
        />

        {/* Close button */}
        {isOpen && (
          <button
            onClick={closeSearch}
            className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex justify-center items-center text-gray-400 hover:text-black transition"
            aria-label="Close search"
          >
            <BsX className="text-xl md:text-2xl" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full right-0 mt-2 w-[300px] sm:w-[350px] md:w-[400px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[100]">
          {isSearching ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {results.map((product, i) => (
                <LocalizedClientLink
                  key={product.id}
                  href={`/products/${product.handle}`}
                  onClick={closeSearch}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition ${
                    i > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  {/* Product thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.thumbnail ? (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  {/* Product name */}
                  <span className="text-sm font-medium text-gray-800 line-clamp-2">
                    {product.title}
                  </span>
                </LocalizedClientLink>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
