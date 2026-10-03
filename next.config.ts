import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Las imágenes de habitaciones son URLs externas cargadas desde el panel admin
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
}

export default nextConfig
