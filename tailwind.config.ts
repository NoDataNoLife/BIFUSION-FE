export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E68A00', // Frame 4 주황색
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#434D5A', // Frame 4 어두운 회색
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#8D5A00', // Frame 4 갈색
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F4F4F5',
          foreground: '#71717A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
        hbios: ['HBIOS-SYS', 'Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
