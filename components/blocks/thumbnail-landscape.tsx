export const THUMBNAIL_BACKGROUND = "#f6f7f5";

const PALETTES = [
  { sky: "#dce9ed", sun: "#f4e3b8", back: "#bdcbaa", middle: "#9eb792", front: "#7f9e83" },
  { sky: "#e9e8df", sun: "#f4e3b8", back: "#c9c9ac", middle: "#adb597", front: "#8f9e82" },
  { sky: "#dfe7ed", sun: "#f4e3b8", back: "#b7c8bc", middle: "#99b4a6", front: "#7e9e92" },
];

/** Shared placeholder artwork for photo frames and album layout thumbnails. */
export function ThumbnailLandscape({ tone = 0 }: { tone?: number }) {
  const palette = PALETTES[tone % PALETTES.length]!;
  return (
    <svg width="100%" height="100%" viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ display: "block" }}>
      <path fill={palette.sky} d="M0 0h160v160H0z" />
      <circle cx="122" cy="56" r="13" fill={palette.sun} />
      <path fill="#f6f8f5" d="M27 78a8 8 0 0 1 0-16h3a13 13 0 0 1 25-3 9 9 0 0 1 12 8 6 6 0 0 1 0 11Z" />
      <path fill={palette.back} d="M0 104c28-13 47-5 77 7s57-21 83-13v62H0Z" />
      <path fill={palette.middle} d="M0 120c38 9 56-18 91-9s46 20 69 7v42H0Z" />
      <path fill={palette.front} d="M0 137c38-13 66 16 102 1s42-12 58-8v30H0Z" />
    </svg>
  );
}
