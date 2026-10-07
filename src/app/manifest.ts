import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "369 LTD",
    short_name: "369 LTD",
    description: "Where crypto meets reality. Dubai crypto desk for USDT and property payments.",
    start_url: "/",
    display: "standalone",
    background_color: "#020326",
    theme_color: "#020326",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
