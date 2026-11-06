// components/SocialIcons.tsx — iconos OFICIALES de marca
// (SVG con los colores oficiales): Facebook #1877F2,
// Instagram con su gradiente oficial, TikTok y WhatsApp
// #25D366. Se usan en el pie, en los enlaces de redes de
// cada negocio y en los botones de WhatsApp.
export function FacebookIcon({ className = "red-icono" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

export function InstagramIcon({ className = "red-icono" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ig-grad-mcd" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD600" />
          <stop offset="25%" stopColor="#FF7A00" />
          <stop offset="50%" stopColor="#FF0069" />
          <stop offset="75%" stopColor="#D300C5" />
          <stop offset="100%" stopColor="#7638FA" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5.5" fill="url(#ig-grad-mcd)" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="#fff" />
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4.5" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.95" />
    </svg>
  );
}

export function TikTokIcon({ className = "red-icono" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <rect width="24" height="24" rx="5.5" fill="#000" />
      <path fill="#25F4EE" d="M16.6 3c.4 2.1 1.8 3.6 3.9 3.9v3c-1.5 0-2.9-.5-3.9-1.3v6.1c0 3.4-2.5 5.8-5.7 5.8A5.6 5.6 0 0 1 5.3 15c0-3.2 2.6-5.7 5.9-5.6v3.1c-1.5-.3-2.8.9-2.8 2.4 0 1.4 1.1 2.5 2.5 2.5 1.5 0 2.6-1.1 2.6-2.8V3h3.1z" />
      <path fill="#fff" d="M16.2 3.2c.4 2 1.7 3.4 3.7 3.8v2.7c-1.4 0-2.7-.4-3.7-1.2v6.2c0 3.2-2.3 5.5-5.3 5.5a5.3 5.3 0 0 1-5.3-5.3c0-3 2.4-5.4 5.4-5.3v2.8c-1.4-.2-2.6.9-2.6 2.3 0 1.3 1 2.3 2.3 2.3 1.4 0 2.5-1 2.5-2.6V3.2h3z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "red-icono" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path fill="#25D366" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.9-4.45 9.9-9.91C21.94 6.45 17.5 2 12.04 2zm0 18.13a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28z" />
    </svg>
  );
}
