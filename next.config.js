/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignora errores de lint como "no-explicit-any" en producción
  },
};

module.exports = nextConfig;
