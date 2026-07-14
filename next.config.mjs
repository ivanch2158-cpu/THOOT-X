// next.config.mjs
// Configuración de Next.js — headers de seguridad y soporte de imágenes

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // No bloquear el build en Vercel por errores de ESLint (ej. comillas sin escapar en JSX)
  // El lint sigue corriendo localmente y en CI, pero no detiene el deploy
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  // Soporte para imágenes desde Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
