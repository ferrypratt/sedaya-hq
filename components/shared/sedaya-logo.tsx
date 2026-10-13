import React from 'react';

interface SedayaLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  variant?: 'black' | 'white' | 'currentColor';
}

export function SedayaLogo({
  className = 'w-8 h-8',
  variant = 'currentColor',
  ...props
}: SedayaLogoProps) {
  const fillColor =
    variant === 'black'
      ? '#000000'
      : variant === 'white'
      ? '#FFFFFF'
      : 'currentColor';

  return (
    <svg
      viewBox="0 0 500 540"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sedaya HQ Logo"
      className={className}
      {...props}
    >
      {/* SEDAYA Upper Wordmark */}
      <text
        x="250"
        y="120"
        textAnchor="middle"
        fill={fillColor}
        style={{
          fontFamily:
            "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontWeight: 900,
          fontSize: '118px',
          letterSpacing: '-0.015em',
        }}
      >
        SEDAYA
      </text>

      {/* Heavy Bold 'H' Glyph */}
      <path
        d="M20 170 H108 V288 H166 V170 H254 V452 H166 V348 H108 V452 H20 Z"
        fill={fillColor}
      />

      {/* Massive 'Q' Glyph with Curved Counter and Integrated Wave Tail */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M372 170 C312 170 268 218 268 310 C268 402 312 452 372 452 C402 452 428 438 447 416 L447 430 C447 438 450 445 456 450 C440 464 416 472 388 472 C350 472 316 458 288 440 C278 434 265 438 260 448 C255 458 259 471 269 477 C304 500 345 514 388 514 C432 514 466 498 483 470 C488 462 488 452 485 444 C482 436 476 430 468 426 L468 402 C474 376 476 344 476 310 C476 218 432 170 372 170 Z M372 232 C404 232 422 262 422 310 C422 358 404 390 372 390 C340 390 322 358 322 310 C322 262 340 232 372 232 Z"
        fill={fillColor}
      />

      {/* Dynamic Wave Tail of Q */}
      <path
        d="M266 450 C295 478 338 496 385 496 C426 496 458 480 476 456 C466 478 436 492 400 492 C355 492 316 474 286 446 C278 438 268 442 266 450 Z"
        fill={fillColor}
      />
    </svg>
  );
}
