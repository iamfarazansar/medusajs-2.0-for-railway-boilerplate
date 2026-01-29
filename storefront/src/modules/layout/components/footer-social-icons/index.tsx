"use client"

import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa"

const socialLinks = [
  {
    icon: FaFacebookF,
    url: "https://www.facebook.com/ruggyland?mibextid=ZbWKwL",
  },
  {
    icon: FaTwitter,
    url: "https://twitter.com/RuggyLand",
  },
  {
    icon: FaYoutube,
    url: "https://www.youtube.com/@ruggylandshorts8823",
  },
  {
    icon: FaInstagram,
    url: "https://www.instagram.com/ruggyland/",
  },
]

export default function FooterSocialIcons() {
  return (
    <div className="flex gap-4 justify-center md:justify-start">
      {socialLinks.map(({ icon: Icon, url }) => (
        <div
          key={url}
          onClick={() => window.open(url, "_blank")}
          className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center text-black hover:bg-white/[0.5] cursor-pointer"
        >
          <Icon size={20} />
        </div>
      ))}
    </div>
  )
}
