"use client"

import { useEffect, useState, useRef, useCallback } from "react"

type Props = {
  children: React.ReactNode
}

export default function NavShell({ children }: Props) {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateNavbar = useCallback(() => {
    const y = window.scrollY

    if (y > lastScrollY.current && y > 10) {
      // Scrolling down - hide nav
      setVisible(false)
    } else if (y < lastScrollY.current) {
      // Scrolling up - show nav
      setVisible(true)
    }

    lastScrollY.current = y
    ticking.current = false
  }, [])

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(updateNavbar)
      ticking.current = true
    }
  }, [updateNavbar])

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [onScroll])

  // Listen for custom event to show nav (e.g., when product added to cart)
  useEffect(() => {
    const showNav = () => setVisible(true)
    window.addEventListener("show-nav", showNav)
    return () => window.removeEventListener("show-nav", showNav)
  }, [])

  return (
    <>
      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-[50px] md:h-[80px]" />

      <header
        className={`w-full h-[50px] md:h-[80px] bg-white flex items-center justify-between z-50 fixed top-0 left-0 right-0 transition-transform duration-300 border-b border-ui-border-base ${
          visible ? "translate-y-0 shadow-sm" : "-translate-y-full"
        }`}
      >
        {children}
      </header>
    </>
  )
}
