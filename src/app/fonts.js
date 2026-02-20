import localFont from "next/font/local";

export const ppNeueMontreal = localFont({
  src: [
    {
      path: "./fonts/neue-montral/ppneuemontreal-thin.woff",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/neue-montral/ppneuemontreal-book.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/neue-montral/ppneuemontreal-italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/neue-montral/ppneuemontreal-medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/neue-montral/ppneuemontreal-semibolditalic.woff",
      weight: "600",
      style: "italic",
    },
    {
      path: "./fonts/neue-montral/ppneuemontreal-bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neue",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Arial", "sans-serif"],
});

export const pangramSans = localFont({
  src: [
    {
      path: "./fonts/pangram-sans/PPPangramSans-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/pangram-sans/PPPangramSans-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/pangram-sans/PPPangramSans-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/pangram-sans/PPPangramSans-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/pangram-sans/PPPangramSans-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/pangram-sans/PPPangramSans-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/pangram-sans/PPPangramSans-Extrabold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-pangram",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Arial", "sans-serif"],
});

export const bigShouldersDisplay = localFont({
  src: "./fonts/big-shoulders-display/BigShouldersDisplay.ttf",
  variable: "--font-big-shoulders",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Arial", "sans-serif"],
});

export const goodMonolith = localFont({
  src: "./fonts/the-good-monolith/TheGoodMonolith.woff",
  variable: "--font-monolith",
  weight: "400",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  fallback: ["Courier New", "monospace"],
});
