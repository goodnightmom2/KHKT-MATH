import React from 'react';
import { motion, type Variants, type Transition } from 'motion/react';
import { OptiExpression, OptiPose } from '../types/math';

export type OptiActionState = 'idle' | 'nod' | 'think' | 'celebrate';

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

  // Head animation variants based on actionState (nodding, thinking, idle breathing)
  const headVariants: Variants = {
    idle: {
      y: [0, -2, 0],
      rotate: [0, 0.5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    },
    nod: {
      y: [0, -8, 2, -6, 1, 0],
      rotate: [0, -2, 2, -1, 0],
      transition: {
        duration: 1.2,
        repeat: 2,
        ease: 'easeInOut'
      }
    },
    think: {
      rotate: [0, -7, -6],
      y: [0, -3, -2],
      transition: {
        duration: 1.4,
        ease: 'easeOut'
      }
    },
    celebrate: {
      y: [0, -12, 0, -8, 0],
      rotate: [0, 3, -3, 2, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: 2,
        ease: 'easeInOut'
      }
    }
  };

  // Ear twitch variants
  const leftEarVariants: Variants = {
    idle: { rotate: 0 },
    nod: {
      rotate: [0, -4, 2, 0],
      transition: { duration: 0.6, repeat: 3 }
    },
    think: {
      rotate: -3,
      transition: { duration: 0.4 }
    },
    celebrate: {
      rotate: [0, -6, 3, 0],
      transition: { duration: 0.5, repeat: 3 }
    }
  };

  const rightEarVariants: Variants = {
    idle: { rotate: 0 },
    nod: {
      rotate: [0, 4, -2, 0],
      transition: { duration: 0.6, repeat: 3 }
    },
    think: {
      rotate: 4,
      transition: { duration: 0.4 }
    },
    celebrate: {
      rotate: [0, 6, -3, 0],
      transition: { duration: 0.5, repeat: 3 }
    }
  };

  // Natural blinking eyes animation (every ~3.5 seconds)
  const blinkTransition: Transition = {
    duration: 3.5,
    repeat: Infinity,
    times: [0, 0.94, 0.96, 0.98, 1],
    ease: 'easeInOut'
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        animate ? 'transition-transform duration-300 hover:scale-105' : ''
      } ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      aria-label={`Linh vật Opti biểu cảm ${expression}`}
    >
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="opti-blue-hood" x1="60" y1="20" x2="260" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="45%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="opti-inner-ear" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          <linearGradient id="opti-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="opti-face-white" x1="160" y1="90" x2="160" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          <linearGradient id="opti-body-white" x1="160" y1="210" x2="160" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <linearGradient id="opti-eye-iris" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="40%" stopColor="#1E3A8A" />
            <stop offset="75%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <linearGradient id="opti-cape" x1="100" y1="220" x2="220" y2="310" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>

          <filter id="opti-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- CAPE (Áo choàng xanh hoàng gia bay nhẹ với Framer Motion) --- */}
        <motion.path
          d={
            pose === 'running'
              ? 'M 100 230 C 60 250, 40 285, 50 310 C 110 300, 160 295, 230 305 C 265 295, 275 260, 220 230 Z'
              : 'M 105 230 C 80 255, 75 290, 85 305 C 130 300, 190 300, 235 305 C 245 285, 240 255, 215 230 Z'
          }
          fill="url(#opti-cape)"
          animate={
            animate
              ? {
                  d: [
                    'M 105 230 C 80 255, 75 290, 85 305 C 130 300, 190 300, 235 305 C 245 285, 240 255, 215 230 Z',
                    'M 105 230 C 76 258, 70 293, 82 308 C 130 302, 190 302, 238 308 C 248 288, 244 258, 215 230 Z',
                    'M 105 230 C 80 255, 75 290, 85 305 C 130 300, 190 300, 235 305 C 245 285, 240 255, 215 230 Z'
                  ]
                }
              : undefined
          }
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* --- BODY (Thân robot trắng gốm sứ tròn trịa) --- */}
        <motion.g
          animate={
            animate && actionState === 'celebrate'
              ? { y: [0, -3, 0] }
              : undefined
          }
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <ellipse cx="160" cy="255" rx="52" ry="46" fill="url(#opti-body-white)" stroke="#E2E8F0" strokeWidth="2" />

          {/* Feet */}
          <ellipse cx="132" cy="296" rx="20" ry="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="188" cy="296" rx="20" ry="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />

          {/* Cape Clasp & Chest Emblem */}
          <circle cx="160" cy="226" r="9" fill="url(#opti-gold)" stroke="#D97706" strokeWidth="1.5" />
          <path d="M 158 221 L 162 225 L 158 229 L 160 225 Z" fill="#78350F" />
        </motion.g>

        {/* --- HEAD & FACE GROUP (Có thể gật đầu, nghiêng suy tư, chớp mắt) --- */}
        <motion.g
          variants={animate ? headVariants : undefined}
          animate={animate ? actionState : undefined}
          style={{ originX: '160px', originY: '210px' }}
        >
          {/* Left Ear Outer & Inner */}
          <motion.g
            variants={animate ? leftEarVariants : undefined}
            animate={animate ? actionState : undefined}
            style={{ originX: '130px', originY: '75px' }}
          >
            <path
              d="M 95 105 C 75 80, 52 42, 65 30 C 80 20, 118 48, 130 75 Z"
              fill="url(#opti-blue-hood)"
            />
            <path
              d="M 92 95 C 78 78, 62 48, 70 40 C 78 35, 105 56, 116 75 Z"
              fill="url(#opti-inner-ear)"
            />
          </motion.g>

          {/* Right Ear Outer & Inner */}
          <motion.g
            variants={animate ? rightEarVariants : undefined}
            animate={animate ? actionState : undefined}
            style={{ originX: '190px', originY: '75px' }}
          >
            <path
              d="M 225 105 C 245 80, 268 42, 255 30 C 240 20, 202 48, 190 75 Z"
              fill="url(#opti-blue-hood)"
            />
            <path
              d="M 228 95 C 242 78, 258 48, 250 40 C 242 35, 215 56, 204 75 Z"
              fill="url(#opti-inner-ear)"
            />
          </motion.g>

          {/* Main Blue Hood Contour */}
          <path
            d="M 80 150 C 68 95, 105 55, 160 55 C 215 55, 252 95, 240 150 C 245 195, 225 228, 160 230 C 95 228, 75 195, 80 150 Z"
            fill="url(#opti-blue-hood)"
          />

          {/* --- WHITE FACE --- */}
          <path
            d="M 98 152 C 92 110, 118 84, 160 84 C 202 84, 228 110, 222 152 C 220 188, 198 214, 160 214 C 122 214, 100 188, 98 152 Z"
            fill="url(#opti-face-white)"
          />

          {/* --- FOREHEAD EMBLEM (Biểu tượng vàng trên trán - Delta cong toán học) --- */}
          <motion.g
            filter="url(#opti-glow)"
            animate={
              animate && (actionState === 'nod' || actionState === 'celebrate')
                ? { scale: [1, 1.15, 1] }
                : undefined
            }
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ originX: '160px', originY: '105px' }}
          >
            <path
              d="M 160 94 C 165 99, 172 105, 170 110 C 168 114, 163 113, 160 109 C 157 113, 152 114, 150 110 C 148 105, 155 99, 160 94 Z"
              fill="url(#opti-gold)"
              stroke="#F59E0B"
              strokeWidth="1.2"
            />
          </motion.g>

          {/* --- BLUSH CHEEKS --- */}
          <ellipse cx="118" cy="168" rx="10" ry="6" fill="#F472B6" fillOpacity="0.45" />
          <ellipse cx="202" cy="168" rx="10" ry="6" fill="#F472B6" fillOpacity="0.45" />

          {/* --- EYES (Với Chớp Mắt Tự Nhiên & Biểu Cảm Linh Hoạt) --- */}
          {expression === 'wink' ? (
            <>
              {/* Left Eye: Big sparkle eye with blink */}
              <motion.g
                animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : undefined}
                transition={blinkTransition}
                style={{ originX: '132px', originY: '148px' }}
              >
                <ellipse cx="132" cy="148" rx="15" ry="19" fill="url(#opti-eye-iris)" />
                <ellipse cx="132" cy="158" rx="11" ry="6" fill="#67E8F9" fillOpacity="0.6" />
                <circle cx="127" cy="140" r="5.5" fill="#FFFFFF" />
                <circle cx="138" cy="154" r="2.8" fill="#FFFFFF" />
              </motion.g>
              {/* Right Eye: Cute Wink Arc */}
              <path
                d="M 188 152 Q 200 140 212 152"
                stroke="#1E3A8A"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : expression === 'cheering' ? (
            <>
              {/* Both eyes joyful crescents ^_^ */}
              <motion.path
                d="M 120 152 Q 132 136 144 152"
                stroke="#1E3A8A"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                animate={animate ? { scaleY: [1, 1.2, 1] } : undefined}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ originX: '132px', originY: '144px' }}
              />
              <motion.path
                d="M 176 152 Q 188 136 200 152"
                stroke="#1E3A8A"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                animate={animate ? { scaleY: [1, 1.2, 1] } : undefined}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ originX: '188px', originY: '144px' }}
              />
            </>
          ) : expression === 'surprised' ? (
            <motion.g
              animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : undefined}
              transition={blinkTransition}
              style={{ originX: '160px', originY: '146px' }}
            >
              {/* Extra large rounded eyes */}
              <ellipse cx="132" cy="146" rx="17" ry="21" fill="url(#opti-eye-iris)" />
              <circle cx="126" cy="138" r="6" fill="#FFFFFF" />
              <circle cx="138" cy="154" r="3" fill="#FFFFFF" />
              <ellipse cx="132" cy="158" rx="12" ry="6" fill="#67E8F9" fillOpacity="0.65" />

              <ellipse cx="188" cy="146" rx="17" ry="21" fill="url(#opti-eye-iris)" />
              <circle cx="182" cy="138" r="6" fill="#FFFFFF" />
              <circle cx="194" cy="154" r="3" fill="#FFFFFF" />
              <ellipse cx="188" cy="158" rx="12" ry="6" fill="#67E8F9" fillOpacity="0.65" />
            </motion.g>
          ) : expression === 'thinking' ? (
            <motion.g
              animate={
                animate
                  ? {
                      scaleY: [1, 1, 0.08, 1, 1],
                      x: [0, 2, 0]
                    }
                  : undefined
              }
              transition={{
                scaleY: blinkTransition,
                x: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              }}
              style={{ originX: '160px', originY: '144px' }}
            >
              {/* Eyes looking up and slightly to the right */}
              <ellipse cx="133" cy="144" rx="15" ry="18" fill="url(#opti-eye-iris)" />
              <circle cx="135" cy="135" r="5" fill="#FFFFFF" />
              <ellipse cx="133" cy="154" rx="10" ry="5" fill="#67E8F9" fillOpacity="0.6" />

              <ellipse cx="189" cy="144" rx="15" ry="18" fill="url(#opti-eye-iris)" />
              <circle cx="191" cy="135" r="5" fill="#FFFFFF" />
              <ellipse cx="189" cy="154" rx="10" ry="5" fill="#67E8F9" fillOpacity="0.6" />
            </motion.g>
          ) : expression === 'sad' ? (
            <motion.g
              animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : undefined}
              transition={blinkTransition}
              style={{ originX: '160px', originY: '152px' }}
            >
              {/* Downward empathetic eyes */}
              <ellipse cx="132" cy="152" rx="14" ry="17" fill="url(#opti-eye-iris)" />
              <circle cx="127" cy="146" r="5" fill="#FFFFFF" />
              <path d="M 120 135 Q 133 139 144 135" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              <ellipse cx="188" cy="152" rx="14" ry="17" fill="url(#opti-eye-iris)" />
              <circle cx="183" cy="146" r="5" fill="#FFFFFF" />
              <path d="M 176 135 Q 187 139 200 135" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </motion.g>
          ) : (
            /* Default Happy with Natural Blinking */
            <motion.g
              animate={animate ? { scaleY: [1, 1, 0.08, 1, 1] } : undefined}
              transition={blinkTransition}
              style={{ originX: '160px', originY: '148px' }}
            >
              <ellipse cx="132" cy="148" rx="15" ry="19" fill="url(#opti-eye-iris)" />
              <circle cx="126" cy="139" r="5.5" fill="#FFFFFF" />
              <circle cx="138" cy="154" r="2.8" fill="#FFFFFF" />
              <ellipse cx="132" cy="158" rx="11" ry="6" fill="#67E8F9" fillOpacity="0.6" />

              <ellipse cx="188" cy="148" rx="15" ry="19" fill="url(#opti-eye-iris)" />
              <circle cx="182" cy="139" r="5.5" fill="#FFFFFF" />
              <circle cx="194" cy="154" r="2.8" fill="#FFFFFF" />
              <ellipse cx="188" cy="158" rx="11" ry="6" fill="#67E8F9" fillOpacity="0.6" />
            </motion.g>
          )}

          {/* --- MOUTH (Khuôn miệng biểu cảm) --- */}
          {expression === 'surprised' ? (
            <ellipse cx="160" cy="180" rx="7" ry="9" fill="#1E3A8A" stroke="#F43F5E" strokeWidth="1.5" />
          ) : expression === 'cheering' ? (
            <path
              d="M 151 174 Q 160 188 169 174 Q 160 178 151 174 Z"
              fill="#E11D48"
              stroke="#9F1239"
              strokeWidth="1.5"
            />
          ) : expression === 'sad' ? (
            <path
              d="M 154 180 Q 160 176 166 180"
              stroke="#1E3A8A"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : expression === 'thinking' ? (
            <path
              d="M 155 178 Q 162 181 168 176"
              stroke="#1E3A8A"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M 151 175 Q 160 185 169 175"
              stroke="#1E3A8A"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </motion.g>

        {/* --- HANDS / PROPS (Tạo dáng bàn tay & phụ kiện) --- */}
        {pose === 'pointing' ? (
          <>
            {/* Left Hand pointing up */}
            <motion.g
              animate={animate ? { y: [0, -4, 0] } : undefined}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ellipse cx="88" cy="225" rx="13" ry="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
              <path d="M 85 220 L 80 185 Q 85 180 90 185 L 91 220 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            </motion.g>
            <ellipse cx="232" cy="245" rx="14" ry="13" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          </>
        ) : pose === 'waving' ? (
          <>
            <ellipse cx="88" cy="245" rx="14" ry="13" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            {/* Right Hand waving smoothly with Framer Motion */}
            <motion.g
              animate={
                animate
                  ? {
                      rotate: [0, -18, 12, -18, 0],
                      y: [0, -4, 0]
                    }
                  : undefined
              }
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '242px', originY: '215px' }}
            >
              <ellipse cx="242" cy="195" rx="14" ry="13" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
              <circle cx="248" cy="188" r="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            </motion.g>
          </>
        ) : pose === 'reading' ? (
          <>
            <rect x="130" y="235" width="60" height="42" rx="6" fill="#1E40AF" stroke="#60A5FA" strokeWidth="2" />
            <rect x="135" y="240" width="50" height="32" rx="3" fill="#0F172A" />
            <path d="M 160 246 L 168 260 L 152 260 Z" fill="none" stroke="#FBBF24" strokeWidth="1.8" />
            <ellipse cx="128" cy="254" rx="11" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <ellipse cx="192" cy="254" rx="11" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          </>
        ) : (
          /* Default Idle / Holding Tablet */
          <>
            <g transform="translate(-4, 0)">
              <rect x="92" y="230" width="36" height="46" rx="5" transform="rotate(-15 92 230)" fill="#1E40AF" stroke="#60A5FA" strokeWidth="2" />
              <path d="M 104 246 L 112 258 L 98 258 Z" fill="none" stroke="#FBBF24" strokeWidth="1.5" transform="rotate(-15 92 230)" />
              <ellipse cx="118" cy="248" rx="12" ry="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            </g>
            <ellipse cx="228" cy="242" rx="13" ry="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          </>
        )}
      </svg>
    </div>
  );
};
