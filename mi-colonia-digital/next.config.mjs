// next.config.mjs — configuración de Next.js.
// Permite mostrar las fotos del bucket de Supabase y los
// códigos QR de los escaparates con next/image si se usa.
// serverActions.bodySizeLimit: SIN esto, Next.js corta TODA
// acción de servidor en 1 MB (su límite de fábrica) y la subida
// de una foto de producto, portada o logo más pesada terminaba
// en la pantalla «Application error». Con "2mb" las fotos de
// hasta 2 MB sí llegan a la acción, que es quien valida el peso
// y responde con el mensaje amable si la foto pesa más.
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
};

export default nextConfig;
