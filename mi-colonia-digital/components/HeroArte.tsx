// components/HeroArte.tsx — diseño visual de la parte
// principal: una calle de colonia mexicana dibujada en SVG
// (puestitos con toldos de colores de la plataforma, sol,
// árboles y pines de ubicación). Es decoración: no necesita
// archivos de imagen y se adapta a cualquier pantalla.
export default function HeroArte() {
  return (
    <svg
      viewBox="0 0 420 264"
      className="hero-arte"
      role="img"
      aria-label="Dibujo de una calle de la colonia con negocios locales"
    >
      <circle cx="356" cy="40" r="30" fill="#FDE68A" />
      <circle cx="356" cy="40" r="20" fill="#F59E0B" />
      <ellipse cx="70" cy="42" rx="34" ry="11" fill="#FFFFFF" opacity="0.85" />
      <ellipse cx="98" cy="36" rx="24" ry="9" fill="#FFFFFF" opacity="0.85" />
      <ellipse cx="196" cy="26" rx="26" ry="8" fill="#FFFFFF" opacity="0.7" />
      <rect x="18" y="86" width="52" height="118" rx="6" fill="#E7E5E4" />
      <rect x="30" y="100" width="12" height="14" rx="2" fill="#FFFFFF" />
      <rect x="48" y="100" width="12" height="14" rx="2" fill="#FFFFFF" />
      <rect x="30" y="126" width="12" height="14" rx="2" fill="#FFFFFF" />
      <rect x="48" y="126" width="12" height="14" rx="2" fill="#FFFFFF" />
      <rect x="336" y="70" width="64" height="134" rx="6" fill="#E7E5E4" />
      <rect x="348" y="86" width="14" height="16" rx="2" fill="#FFFFFF" />
      <rect x="372" y="86" width="14" height="16" rx="2" fill="#FFFFFF" />
      <rect x="348" y="114" width="14" height="16" rx="2" fill="#FFFFFF" />
      <rect x="372" y="114" width="14" height="16" rx="2" fill="#FFFFFF" />
      <rect x="0" y="204" width="420" height="60" fill="#F5EFE6" />
      <rect x="0" y="228" width="420" height="36" fill="#E7E5E4" />
      <path d="M0 246h420" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="22 16" />
      <g>
        <rect x="86" y="128" width="76" height="76" fill="#FFFFFF" />
        <path d="M80 128 124 106l44 22z" fill="#292524" />
        <path d="M78 140.5 84 128h80l6 12.5c0 3.4-2.6 5.5-5.7 5.5-2.8 0-5-1.6-5.7-4-.8 2.4-3 4-5.8 4s-5-1.6-5.7-4c-.7 2.4-2.9 4-5.7 4s-5-1.6-5.8-4c-.7 2.4-2.9 4-5.7 4s-5-1.6-5.8-4c-.7 2.4-2.9 4-5.7 4-3.1 0-5.7-2.1-5.7-5.5z" fill="#EA580C" />
        <rect x="112" y="168" width="24" height="36" fill="#FFEDD5" />
        <rect x="92" y="156" width="16" height="16" rx="2" fill="#FFEDD5" />
        <rect x="140" y="156" width="16" height="16" rx="2" fill="#FFEDD5" />
      </g>
      <g>
        <rect x="178" y="118" width="84" height="86" fill="#FFFFFF" />
        <path d="M171 118 220 92l49 26z" fill="#292524" />
        <path d="M169 131.5 176 118h88l7 13.5c0 3.7-2.9 6-6.3 6-3.1 0-5.5-1.8-6.3-4.4-.8 2.6-3.2 4.4-6.3 4.4s-5.5-1.8-6.3-4.4c-.8 2.6-3.2 4.4-6.3 4.4s-5.5-1.8-6.3-4.4c-.8 2.6-3.2 4.4-6.3 4.4s-5.5-1.8-6.3-4.4c-.8 2.6-3.2 4.4-6.3 4.4-3.4 0-6.3-2.3-6.3-6z" fill="#1D4ED8" />
        <rect x="206" y="164" width="28" height="40" fill="#DBEAFE" />
        <rect x="186" y="148" width="18" height="18" rx="2" fill="#DBEAFE" />
        <rect x="236" y="148" width="18" height="18" rx="2" fill="#DBEAFE" />
      </g>
      <g>
        <rect x="278" y="132" width="66" height="72" fill="#FFFFFF" />
        <path d="M272 132 311 112l39 20z" fill="#292524" />
        <path d="M270 143.5 276 132h70l6 11.5c0 3.2-2.5 5.2-5.5 5.2-2.7 0-4.8-1.5-5.5-3.8-.7 2.3-2.8 3.8-5.5 3.8s-4.8-1.5-5.5-3.8c-.7 2.3-2.8 3.8-5.5 3.8s-4.8-1.5-5.5-3.8c-.7 2.3-2.8 3.8-5.5 3.8-3 0-5.5-2-5.5-5.2z" fill="#16A34A" />
        <rect x="298" y="168" width="22" height="36" fill="#DCFCE7" />
        <rect x="284" y="156" width="14" height="14" rx="2" fill="#DCFCE7" />
        <rect x="324" y="156" width="14" height="14" rx="2" fill="#DCFCE7" />
      </g>
      <g>
        <rect x="52" y="176" width="6" height="28" fill="#92400E" />
        <circle cx="55" cy="162" r="19" fill="#16A34A" />
        <circle cx="42" cy="172" r="12" fill="#22C55E" />
      </g>
      <g>
        <rect x="368" y="180" width="6" height="24" fill="#92400E" />
        <circle cx="371" cy="167" r="16" fill="#16A34A" />
        <circle cx="381" cy="176" r="10" fill="#22C55E" />
      </g>
      <path d="M124 62c-6.4 0-10.8 4.5-10.8 10.1 0 7.1 10.8 16.9 10.8 16.9s10.8-9.8 10.8-16.9c0-5.6-4.4-10.1-10.8-10.1zm0 14.5a4.7 4.7 0 1 1 0-9.4 4.7 4.7 0 0 1 0 9.4z" fill="#EA580C" />
      <path d="M302 44c-5.2 0-8.8 3.7-8.8 8.2 0 5.8 8.8 13.8 8.8 13.8s8.8-8 8.8-13.8c0-4.5-3.6-8.2-8.8-8.2zm0 11.8a3.8 3.8 0 1 1 0-7.6 3.8 3.8 0 0 1 0 7.6z" fill="#1D4ED8" />
    </svg>
  );
}
