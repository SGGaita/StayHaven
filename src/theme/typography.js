import { Inter } from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });

export const typography = {
  fontFamily: inter.style.fontFamily,
  h1: {
    fontSize: '4rem',
    fontWeight: 800,
    lineHeight: 1.2,
    '@media (max-width:600px)': {
      fontSize: '2.5rem',
    },
  },
  h2: {
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1.3,
    '@media (max-width:600px)': {
      fontSize: '2rem',
    },
  },
  h3: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.6,
  },
  subtitle1: {
    fontSize: '1.125rem',
    lineHeight: 1.6,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    letterSpacing: '0.00714em',
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.7,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.7,
    letterSpacing: '0.01071em',
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
  },
}; 