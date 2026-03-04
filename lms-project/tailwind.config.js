/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      // ===== ANIMATIONS =====
      animation: {
        // Float animations
        float: "float 3s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-delayed": "float 3s ease-in-out 1.5s infinite",

        // Fade animations
        fadeIn: "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",

        // Blob animation (for backgrounds)
        blob: "blob 7s infinite",
        "blob-slow": "blob 10s infinite",

        // Slide animations
        slideIn: "slideIn 0.3s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",

        // Pulse variations
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-slow-custom": "pulse-slow 3s ease-in-out infinite",

        // Spin
        "spin-slow": "spin-slow 8s linear infinite",
        "spin-reverse": "spin 4s linear infinite reverse",

        // Scale
        scale: "scale 0.3s ease-in-out",
        "scale-bounce": "scaleBounce 0.5s ease-in-out",

        // Confetti
        confetti: "confetti 1s ease-out forwards",

        // Shimmer (loading effect)
        shimmer: "shimmer 2s infinite",

        // Bounce variations
        "bounce-soft": "bounceSoft 2s infinite",

        // Wiggle for attention
        wiggle: "wiggle 1s ease-in-out infinite",

        // Glow effect
        glow: "glow 2s ease-in-out infinite",

        // Gradient move
        "gradient-xy": "gradientXY 15s ease infinite",
      },

      // ===== KEYFRAMES =====
      keyframes: {
        // Float family
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
        },

        // Fade family
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        // Blob family
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },

        // Slide family
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },

        // Pulse custom
        "pulse-slow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },

        // Spin slow
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },

        // Scale family
        scale: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        scaleBounce: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
          "75%": { transform: "scale(0.95)" },
        },

        // Confetti
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          "100%": { transform: "translateY(100px) rotate(720deg)", opacity: 0 },
        },

        // Shimmer
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },

        // Bounce soft
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },

        // Wiggle
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },

        // Glow
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 5px rgba(139, 92, 246, 0.5)",
            borderColor: "rgba(139, 92, 246, 0.5)",
          },
          "50%": {
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.8)",
            borderColor: "rgba(139, 92, 246, 0.8)",
          },
        },

        // Gradient XY
        gradientXY: {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },

      // ===== ANIMATION DELAYS =====
      animationDelay: {
        0: "0s",
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
        2000: "2s",
        3000: "3s",
        4000: "4s",
        5000: "5s",
      },

      // ===== BACKDROP BLUR =====
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },

      // ===== CUSTOM COLORS (Optional) =====
      colors: {
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        secondary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },

      // ===== BACKGROUND GRADIENTS =====
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-shine":
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
      },

      // ===== BOX SHADOWS (2025-26 Trending) =====
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        medium:
          "0 4px 20px -2px rgba(0,0,0,0.1), 0 12px 25px -4px rgba(0,0,0,0.05)",
        hard: "0 10px 40px -3px rgba(0,0,0,0.15), 0 15px 30px -5px rgba(0,0,0,0.1)",
        glow: "0 0 30px -5px rgba(139, 92, 246, 0.5)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        neubrutalism: "5px 5px 0px 0px rgba(0,0,0,1)",
        "neubrutalism-light": "3px 3px 0px 0px rgba(0,0,0,0.8)",
      },

      // ===== BORDER RADIUS (2026 Trending) =====
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
        circle: "50%",
      },

      // ===== FONT FAMILY =====
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Clash Display", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      // ===== Z-INDEX =====
      zIndex: {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        max: "9999",
      },
    },
  },

  // ===== PLUGINS =====
  plugins: [
    // Custom plugin for animation delays
    function ({ addUtilities, theme }) {
      const animationDelay = theme("animationDelay");
      const utilities = Object.entries(animationDelay).map(([key, value]) => ({
        [`.animation-delay-${key}`]: { animationDelay: value },
      }));
      addUtilities(utilities);
    },

    // Custom plugin for backdrop blur variants
    function ({ addUtilities }) {
      addUtilities({
        ".backdrop-blur-xs": { backdropFilter: "blur(2px)" },
        ".backdrop-blur-sm": { backdropFilter: "blur(4px)" },
        ".backdrop-blur-md": { backdropFilter: "blur(8px)" },
        ".backdrop-blur-lg": { backdropFilter: "blur(12px)" },
        ".backdrop-blur-xl": { backdropFilter: "blur(16px)" },
        ".backdrop-blur-2xl": { backdropFilter: "blur(24px)" },
      });
    },
  ],
};
