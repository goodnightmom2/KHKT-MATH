import React, { useId } from 'react';
import { motion, type Variants, type Transition } from 'motion/react';
import { OptiExpression, OptiPose } from '../types/math';

export type OptiActionState = 'idle' | 'nod' | 'think' | 'celebrate' | 'wave';

interface OptiMascotProps {
  expression?: OptiExpression;
  pose?: OptiPose;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  actionState?: OptiActionState;
  className?: string;
  animate?: boolean;
}

export const OptiMascot: React.FC<OptiMascotProps> = ({
  expression = 'happy',
  pose = 'idle',
  size = 'md',
  actionState = 'idle',
  className = '',
  animate = true
}) => {
  // Generate unique ID per component instance so hidden desktop/mobile instances NEVER collide in SVG <defs> on mobile browsers!
  const rawId = useId();
  const uid = `shiba-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 56
      : size === 'md'
      ? 120
      : size === 'lg'
      ? 200
      : 300;

  const normalizedAction = actionState === 'wave' ? 'celebrate' : actionState;

  // Head animation variants
  const headVariants: Variants = {
    idle: {
      y: [0, -2.5, 0],
      rotate: [0, 0.8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    nod: {
      y: [0, -7, 2, -5, 0],
      rotate: [0, -2, 2, -1, 0],
      transition: {
        duration: 1.2,
        repeat: 2,
        ease: 'easeInOut'
      }
    },
    think: {
      rotate: [0, -6, -5],
      y: [0, -2, -1],
      transition: {
        duration: 1.4,
        ease: 'easeOut'
      }
    },
    celebrate: {
      y: [0, -10, 0, -7, 0],
      rotate: [0, 3, -3, 2, 0],
      scale: [1, 1.04, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  // Ear twitch variants
  const leftEarVariants: Variants = {
    idle: { rotate: [0, -2, 0], transition: { duration: 2.8, repeat: Infinity } },
    nod: { rotate: [0, -5, 2, 0], transition: { duration: 0.6, repeat: 3 } },
    think: { rotate: -4, transition: { duration: 0.4 } },
    celebrate: { rotate: [0, -7, 3, 0], transition: { duration: 0.5, repeat: Infinity } }
  };

  const rightEarVariants: Variants = {
    idle: { rotate: [0, 2, 0], transition: { duration: 2.8, repeat: Infinity } },
    nod: { rotate: [0, 5, -2, 0], transition: { duration: 0.6, repeat: 3 } },
    think: { rotate: 5, transition: { duration: 0.4 } },
    celebrate: { rotate: [0, 7, -3, 0], transition: { duration: 0.5, repeat: Infinity } }
  };

  // Natural blinking eyes animation
  const blinkTransition: Transition = {
    duration: 3.6,
    repeat: Infinity,
    times: [0, 0.93, 0.96, 0.98, 1],
    ease: 'easeInOut'
  };

  const isCheerOrExcited = expression === 'cheering' || expression === 'excited';
  const isEncouraging = expression === 'encouraging';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${
        animate ? 'transition-transform duration-300 hover:scale-105' : ''
      } ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      aria-label={`Linh vật Chó Shiba AI Opti biểu cảm ${expression}`}
    >
      <svg
        viewBox="0 0 340 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Shiba Golden-Orange Fur Gradient */}
          <linearGradient id={`${uid}-fur`} x1="80" y1="35" x2="250" y2="290" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Shiba Cream-White Urajiro Fur Gradient */}
          <linearGradient id={`${uid}-cream`} x1="160" y1="115" x2="160" y2="235" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="75%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>

          {/* Inner Ear Warm Peach-Pink */}
          <linearGradient id={`${uid}-ear-pink`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>

          {/* Cyber Tech Jacket Navy-Blue Gradient */}
          <linearGradient id={`${uid}-jacket`} x1="90" y1="195" x2="235" y2="285" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="45%" stopColor="#0F3A5D" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Hologram Cyan Screen Gradient */}
          <linearGradient id={`${uid}-holo`} x1="220" y1="125" x2="325" y2="215" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.82" />
            <stop offset="55%" stopColor="#22D3EE" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.45" />
          </linearGradient>

          {/* Cyber Headset Metallic Gradient */}
          <linearGradient id={`${uid}-metal`} x1="65" y1="45" x2="255" y2="175" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        {/* === 1. GROUND SHADOW === */}
        <ellipse cx="160" cy="318" rx="68" ry="11" fill="#94A3B8" fillOpacity="0.32" />

        {/* === 2. FLUFFY CURLED SHIBA TAIL (Wagging on Left Side) === */}
        <motion.g
          animate={
            animate
              ? {
                  rotate: isCheerOrExcited ? [-8, 12, -8] : [-4, 6, -4]
                }
              : undefined
          }
          transition={{ duration: isCheerOrExcited ? 0.6 : 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '112px', originY: '258px' }}
        >
          {/* Outer Golden Tail Curl */}
          <path
            d="M 112 262 C 62 265, 42 225, 58 192 C 70 170, 98 175, 98 198 C 98 214, 82 222, 88 238 Z"
            fill={`url(#${uid}-fur)`}
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* White Fluffy Tail Tip */}
          <path
            d="M 58 192 C 66 175, 92 175, 96 194 C 86 202, 70 202, 58 192 Z"
            fill="#FFFBEB"
            stroke="#1E293B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* === 3. SHIBA LEGS & PAW FEET === */}
        <g>
          {/* Left Leg */}
          <path
            d="M 116 262 L 112 304 C 112 311, 138 311, 138 304 L 142 266 Z"
            fill={`url(#${uid}-fur)`}
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Left White Socks & Paw */}
          <ellipse cx="124" cy="308" rx="18" ry="9.5" fill="#FFFBEB" stroke="#1E293B" strokeWidth="3.2" />
          <line x1="119" y1="303" x2="118" y2="314" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="126" y1="303" x2="126" y2="315" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />

          {/* Right Leg */}
          <path
            d="M 178 266 L 182 304 C 182 311, 208 311, 208 304 L 204 262 Z"
            fill={`url(#${uid}-fur)`}
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Right White Socks & Paw */}
          <ellipse cx="196" cy="308" rx="18" ry="9.5" fill="#FFFBEB" stroke="#1E293B" strokeWidth="3.2" />
          <line x1="193" y1="303" x2="193" y2="315" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="201" y1="303" x2="202" y2="314" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* === 4. CYBER-TECH JACKET & TORSO (Matching Image 2) === */}
        <motion.g
          animate={animate && normalizedAction === 'celebrate' ? { y: [0, -3, 0] } : undefined}
          transition={{ duration: 0.7, repeat: Infinity }}
        >
          {/* Main Jacket Torso */}
          <path
            d="M 102 196 C 95 220, 96 252, 104 270 C 135 278, 185 278, 216 270 C 224 252, 225 220, 218 196 Z"
            fill={`url(#${uid}-jacket)`}
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Silver/White Shoulder Armor Panels */}
          <path
            d="M 102 198 C 90 205, 84 218, 90 228 L 114 214 L 114 198 Z"
            fill="#E2E8F0"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M 218 198 C 230 205, 236 218, 230 228 L 206 214 L 206 198 Z"
            fill="#E2E8F0"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* High Tech Collar with Cyan Neon Trim */}
          <path
            d="M 104 188 C 122 208, 198 208, 216 188 L 222 202 C 198 220, 122 220, 98 202 Z"
            fill="#0F172A"
            stroke="#1E293B"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M 110 197 C 132 211, 188 211, 210 197"
            stroke="#22D3EE"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bottom Ribbed Hem of Jacket */}
          <path
            d="M 104 262 C 135 270, 185 270, 216 262 L 214 272 C 185 279, 135 279, 106 272 Z"
            fill="#334155"
            stroke="#1E293B"
            strokeWidth="3"
          />

          {/* Center Zipper Line */}
          <line x1="160" y1="210" x2="160" y2="274" stroke="#0F172A" strokeWidth="4" />
          <line x1="160" y1="210" x2="160" y2="274" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Glowing Cyan Circuit Lines on Jacket */}
          <path
            d="M 122 218 L 138 232 L 138 260"
            stroke="#22D3EE"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="122" cy="218" r="2.8" fill="#67E8F9" />
          <path
            d="M 198 230 L 182 242 L 182 260"
            stroke="#22D3EE"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="198" cy="230" r="2.8" fill="#67E8F9" />

          {/* Glowing AI Gear/Brain Emblem on Chest */}
          <circle cx="184" cy="224" r="9" fill="#0EA5E9" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="2" />
          <circle cx="184" cy="224" r="4" fill="#67E8F9" />
        </motion.g>

        {/* === 5. LEFT ARM (Paw on Hip) & RIGHT ARM (Touching Hologram / Waving) === */}
        {/* Left Arm on Hip */}
        <g>
          <path
            d="M 96 208 C 72 222, 70 245, 92 256 L 108 246 C 95 238, 96 226, 106 218 Z"
            fill={`url(#${uid}-jacket)`}
            stroke="#1E293B"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          {/* Left Golden Paw on Hip */}
          <circle cx="102" cy="252" r="11" fill="#F59E0B" stroke="#1E293B" strokeWidth="3.2" />
          <circle cx="105" cy="254" r="6" fill="#FFFBEB" />
        </g>

        {/* Right Arm + Glowing Holographic Screen */}
        <motion.g
          animate={
            animate
              ? pose === 'waving' || normalizedAction === 'celebrate'
                ? { rotate: [0, -8, 6, -8, 0], y: [0, -4, 0] }
                : { y: [0, -4, 0] }
              : undefined
          }
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '215px', originY: '215px' }}
        >
          {/* Right Sleeve reaching toward Hologram */}
          <path
            d="M 216 208 C 235 215, 252 204, 262 186 L 246 176 C 238 190, 226 196, 212 194 Z"
            fill={`url(#${uid}-jacket)`}
            stroke="#1E293B"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />

          {/* Floating Cyan Hologram Tablet (Directly from Image 2!) */}
          <g transform="translate(0, -2)">
            {/* Outer Glow */}
            <polygon
              points="238,132 326,120 314,192 226,198"
              fill="#22D3EE"
              fillOpacity="0.18"
            />
            {/* Main Translucent Cyan Screen */}
            <polygon
              points="242,135 322,124 311,189 230,195"
              fill={`url(#${uid}-holo)`}
              stroke="#22D3EE"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Hologram Code & Math Graphics (`</>`, Waveform & Bar Chart) */}
            <text x="248" y="150" fontSize="10" fontWeight="bold" fill="#083344" fontFamily="monospace">
              {'</>'}
            </text>
            <line x1="246" y1="157" x2="274" y2="155" stroke="#0E7490" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="245" y1="163" x2="268" y2="161" stroke="#0E7490" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="244" y1="169" x2="272" y2="167" stroke="#0E7490" strokeWidth="2.2" strokeLinecap="round" />

            {/* Waveform Graph on Hologram */}
            <polyline
              points="280,152 286,152 290,140 294,160 298,146 302,154 312,152"
              fill="none"
              stroke="#083344"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Mini Bar Chart on Hologram */}
            <rect x="282" y="175" width="5" height="9" rx="1" fill="#0E7490" />
            <rect x="290" y="170" width="5" height="14" rx="1" fill="#0E7490" />
            <rect x="298" y="164" width="5" height="20" rx="1" fill="#083344" />

            {/* Floating Cyber Sparkle Particles around Hologram */}
            <circle cx="292" cy="112" r="3.5" fill="#22D3EE" />
            <circle cx="330" cy="148" r="2.8" fill="#67E8F9" />
            <circle cx="322" cy="202" r="3.2" fill="#22D3EE" />
          </g>

          {/* Shiba Right Paw with Cute Toe-Beans touching Hologram */}
          <g transform="translate(256, 178)">
            <ellipse cx="0" cy="0" rx="14" ry="12" fill="#FFFBEB" stroke="#1E293B" strokeWidth="3" />
            {/* Paw Pad & Toe Beans */}
            <ellipse cx="0" cy="3" rx="5.5" ry="4" fill="#F59E0B" />
            <circle cx="-6" cy="-4" r="2.3" fill="#F59E0B" />
            <circle cx="0" cy="-6" r="2.3" fill="#F59E0B" />
            <circle cx="6" cy="-4" r="2.3" fill="#F59E0B" />
          </g>
        </motion.g>

        {/* === 6. SHIBA HEAD, EARS, HEADSET & HOLOGRAPHIC VISOR === */}
        <motion.g
          variants={animate ? headVariants : undefined}
          animate={animate ? normalizedAction : undefined}
          style={{ originX: '160px', originY: '190px' }}
        >
          {/* Cyber Headset Top Arch Band (Behind Ears) */}
          <path
            d="M 74 125 C 74 52, 246 52, 246 125"
            stroke={`url(#${uid}-metal)`}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 74 125 C 74 52, 246 52, 246 125"
            stroke="#1E293B"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
            opacity="0.25"
          />

          {/* Left Pointed Shiba Ear */}
          <motion.g
            variants={animate ? leftEarVariants : undefined}
            animate={animate ? normalizedAction : undefined}
            style={{ originX: '112px', originY: '78px' }}
          >
            <path
              d="M 84 96 C 76 62, 82 28, 96 22 C 112 20, 134 48, 140 72 Z"
              fill={`url(#${uid}-fur)`}
              stroke="#1E293B"
              strokeWidth="3.6"
              strokeLinejoin="round"
            />
            <path
              d="M 93 86 C 88 62, 92 38, 100 34 C 110 34, 124 54, 128 70 Z"
              fill={`url(#${uid}-ear-pink)`}
            />
          </motion.g>

          {/* Right Pointed Shiba Ear */}
          <motion.g
            variants={animate ? rightEarVariants : undefined}
            animate={animate ? normalizedAction : undefined}
            style={{ originX: '208px', originY: '78px' }}
          >
            <path
              d="M 236 96 C 244 62, 238 28, 224 22 C 208 20, 186 48, 180 72 Z"
              fill={`url(#${uid}-fur)`}
              stroke="#1E293B"
              strokeWidth="3.6"
              strokeLinejoin="round"
            />
            <path
              d="M 227 86 C 232 62, 228 38, 220 34 C 210 34, 196 54, 192 70 Z"
              fill={`url(#${uid}-ear-pink)`}
            />
          </motion.g>

          {/* Main Shiba Inu Golden Head Contour (Fluffy Cheeks) */}
          <path
            d="M 78 136 C 72 86, 108 56, 160 56 C 212 56, 248 86, 242 136 C 250 172, 222 202, 160 202 C 98 202, 70 172, 78 136 Z"
            fill={`url(#${uid}-fur)`}
            stroke="#1E293B"
            strokeWidth="3.6"
            strokeLinejoin="round"
          />

          {/* Classic Shiba Cream-White Face Mask (Urajiro Cheeks & Muzzle) */}
          <path
            d="M 85 150 C 92 128, 118 124, 138 140 C 148 126, 172 126, 182 140 C 202 124, 228 128, 235 150 C 240 178, 212 200, 160 200 C 108 200, 80 178, 85 150 Z"
            fill={`url(#${uid}-cream)`}
          />

          {/* Signature Shiba Cream Eyebrow Spots (Mameshiba Brows) */}
          <ellipse
            cx="128"
            cy="104"
            rx="11"
            ry="6.5"
            transform="rotate(-10 128 104)"
            fill="#FFFBEB"
          />
          <ellipse
            cx="192"
            cy="104"
            rx="11"
            ry="6.5"
            transform="rotate(10 192 104)"
            fill="#FFFBEB"
          />

          {/* Cyber Headset Ear-Cups (Left & Right with Glowing Cyan Core) */}
          <g>
            {/* Left Ear-Cup */}
            <ellipse
              cx="74"
              cy="136"
              rx="14"
              ry="24"
              fill="#334155"
              stroke="#1E293B"
              strokeWidth="3.4"
            />
            <ellipse cx="72" cy="136" rx="7" ry="13" fill="#06B6D4" stroke="#0F172A" strokeWidth="2" />
            <ellipse cx="72" cy="136" rx="3.5" ry="7" fill="#A5F3FC" />

            {/* Right Ear-Cup */}
            <ellipse
              cx="244"
              cy="132"
              rx="11"
              ry="21"
              fill="#334155"
              stroke="#1E293B"
              strokeWidth="3.4"
            />
            <ellipse cx="246" cy="132" rx="5" ry="11" fill="#06B6D4" />

            {/* Headset Boom Microphone on Left Cheek */}
            <path
              d="M 78 154 L 106 172"
              stroke="#334155"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <path
              d="M 78 154 L 106 172"
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="108" cy="173" r="4.5" fill="#22D3EE" stroke="#1E293B" strokeWidth="2" />
          </g>

          {/* === SHIBA EYES === */}
          {expression === 'wink' ? (
            <>
              <motion.g
                animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : undefined}
                transition={blinkTransition}
                style={{ originX: '125px', originY: '128px' }}
              >
                <ellipse cx="125" cy="128" rx="12.5" ry="14.5" fill="#0F172A" />
                <circle cx="121" cy="122" r="4.8" fill="#FFFFFF" />
                <circle cx="130" cy="133" r="2.2" fill="#FFFFFF" />
              </motion.g>
              <path
                d="M 182 130 Q 195 118 208 130"
                stroke="#0F172A"
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : isCheerOrExcited ? (
            <>
              <path
                d="M 113 131 Q 125 116 137 131"
                stroke="#0F172A"
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 183 131 Q 195 116 207 131"
                stroke="#0F172A"
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : (
            <motion.g
              animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : undefined}
              transition={blinkTransition}
              style={{ originX: '160px', originY: '128px' }}
            >
              {/* Left Eye */}
              <ellipse cx="125" cy="128" rx="12.5" ry="14.5" fill="#0F172A" />
              <circle cx="121" cy="122" r="4.8" fill="#FFFFFF" />
              <circle cx="130" cy="133" r="2.2" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="195" cy="128" rx="12.5" ry="14.5" fill="#0F172A" />
              <circle cx="191" cy="122" r="4.8" fill="#FFFFFF" />
              <circle cx="200" cy="133" r="2.2" fill="#FFFFFF" />
            </motion.g>
          )}

          {/* === CYBER HOLOGRAPHIC MONOCLE VISOR OVER RIGHT EYE (Signature detail from Image 2!) === */}
          <g>
            {/* Connector arm from right ear-cup */}
            <path d="M 236 124 L 242 126" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            {/* Translucent Cyan HUD Visor Lens */}
            <rect
              x="172"
              y="108"
              width="62"
              height="38"
              rx="10"
              fill="#22D3EE"
              fillOpacity="0.34"
              stroke="#06B6D4"
              strokeWidth="2.8"
            />
            {/* Inner HUD Targeting Graphics */}
            <circle
              cx="195"
              cy="128"
              r="16"
              stroke="#A5F3FC"
              strokeWidth="1.3"
              strokeDasharray="4 3"
              fill="none"
            />
            <line x1="216" y1="116" x2="226" y2="116" stroke="#CFFAFE" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="218" y1="122" x2="226" y2="122" stroke="#CFFAFE" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="179" cy="115" r="2" fill="#CFFAFE" />
          </g>

          {/* === SHIBA NOSE & HAPPY DOGGY SMILE === */}
          {/* Cute Dark Shiba Nose */}
          <path
            d="M 150 144 C 150 139, 170 139, 170 144 C 170 151, 163 156, 160 156 C 157 156, 150 151, 150 144 Z"
            fill="#0F172A"
          />
          <ellipse cx="157" cy="143" rx="3.5" ry="1.8" fill="#FFFFFF" fillOpacity="0.65" />

          {/* Mouth & Pink Tongue */}
          {expression === 'sad' || isEncouraging ? (
            <path
              d="M 146 168 Q 160 160 174 168"
              stroke="#0F172A"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          ) : expression === 'thinking' ? (
            <path
              d="M 146 164 Q 155 168 160 160 Q 166 168 175 162"
              stroke="#0F172A"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <g>
              {/* Classic Shiba W-Smile + Open Happy Mouth */}
              <path
                d="M 136 158 Q 148 168 160 156 Q 172 168 184 158"
                stroke="#0F172A"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M 143 161 C 145 184, 175 184, 177 161 Z"
                fill="#7F1D1D"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Cute Pink Shiba Tongue */}
              <path
                d="M 149 169 C 152 181, 168 181, 171 169 C 165 166, 155 166, 149 169 Z"
                fill="#FB7185"
              />
            </g>
          )}
        </motion.g>
      </svg>
    </div>
  );
};
