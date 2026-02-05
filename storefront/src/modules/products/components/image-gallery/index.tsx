"use client"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import "react-responsive-carousel/lib/styles/carousel.min.css" // requires a loader
import { Carousel } from "react-responsive-carousel"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-scroll thumbnail into view when selection changes
  useEffect(() => {
    if (isMobile && thumbRefs.current[selectedIndex]) {
      thumbRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [selectedIndex, isMobile])

  return (
    <div className="text-white text-[20px] w-full max-w-[1360px] mx-auto sticky top-[50px]">
      <Carousel
        infiniteLoop={true}
        showIndicators={false}
        showStatus={false}
        thumbWidth={60}
        className="productCarousel"
        showThumbs={!isMobile}
        selectedItem={selectedIndex}
        onChange={(index) => setSelectedIndex(index)}
      >
        {images.map((img) => (
          <img key={img.id} src={img.url} alt="Product image" />
        ))}
      </Carousel>

      {/* Custom mobile thumbnails with native scrolling */}
      {isMobile && (
        <div
          className="mobile-thumbs-container"
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "8px",
            padding: "10px 0",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {images.map((img, index) => (
            <button
              key={img.id}
              ref={(el) => {
                thumbRefs.current[index] = el
              }}
              onClick={() => setSelectedIndex(index)}
              style={{
                flexShrink: 0,
                width: "60px",
                height: "60px",
                borderRadius: "6px",
                overflow: "hidden",
                border:
                  selectedIndex === index
                    ? "2px solid #000"
                    : "2px solid transparent",
                padding: 0,
                background: "none",
                cursor: "pointer",
              }}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
