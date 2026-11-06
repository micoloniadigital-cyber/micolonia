// next.config.mjs — configuración de Next.js.
// Permite mostrar las fotos del bucket de Supabase y los
// códigos QR de los escaparates con next/image si se usa.
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
};

export default nextConfig;
