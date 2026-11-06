// components/Logo.tsx — logo oficial de Mi Colonia Digital:
// el puestito de la colonia (techo, toldo a rayas, pin de
// ubicación y bolsa de compra) en el naranja de la marca.
// Es un SVG dibujado en código: se ve nítido en cualquier
// tamaño, no pesa y no necesita archivos de imagen.
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Logo de Mi Colonia Digital"
      className="logo"
    >
      <rect width="64" height="64" rx="16" fill="#EA580C" />
      <path
        d="M32 5.5c-3.8 0-6.4 2.6-6.4 6 0 4.2 6.4 10 6.4 10s6.4-5.8 6.4-10c0-3.4-2.6-6-6.4-6zm0 8.6a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z"
        fill="#FFF7ED"
      />
      <path d="M13.5 28.5 32 18l18.5 10.5v2.8H13.5z" fill="#FFFFFF" />
      <path
        d="M12 34.6 14.6 31h34.8L52 34.6c0 2.1-1.7 3.6-3.8 3.6-1.9 0-3.4-1.1-3.9-2.8-.5 1.7-2 2.8-3.9 2.8s-3.4-1.1-3.8-2.8c-.5 1.7-2 2.8-3.9 2.8s-3.4-1.1-3.9-2.8c-.4 1.7-1.9 2.8-3.8 2.8-1.9 0-3.4-1.1-3.9-2.8-.5 1.7-2 2.8-3.9 2.8-2.1 0-3.8-1.5-3.8-3.6z"
        fill="#FFEDD5"
      />
      <path
        d="M22.3 31v3.9M32 31v5.4M41.7 31v3.9"
        stroke="#EA580C"
        strokeOpacity="0.35"
        strokeWidth="1.6"
      />
      <path d="M16.5 38.5h31V57h-11V45h-9v12h-11z" fill="#FFFFFF" />
      <path d="M29.6 53.9 30.3 49h3.4l.7 4.9z" fill="#FFEDD5" />
      <path
        d="M30.6 49a1.5 1.5 0 0 1 2.8 0"
        fill="none"
        stroke="#FFEDD5"
        strokeWidth="1.3"
      />
    </svg>
  );
}
