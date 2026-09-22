import type { Config } from "tailwindcss";

// 브랜드 색상은 app/globals.css 의 CSS 변수와 같은 값이다.
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B2A4A",
          deep: "#0F1D36",
          light: "#2B3F6B",
        },
        brand: {
          DEFAULT: "#2F6BFF",
          dark: "#1F52D6",
          light: "#5B8CFF",
        },
        sky: {
          50: "#F4F8FF",
          100: "#EAF2FF",
          200: "#D6E4FF",
        },
        ink: "#1E293B",
        muted: "#64748B",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
