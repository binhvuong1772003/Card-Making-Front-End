import { THUMBNAIL_BACKGROUND, ThumbnailLandscape } from "./thumbnail-landscape";

function Photo({ x, y, w, h, tone = 0 }: { x: number; y: number; w: number; h: number; tone?: number }) {
  return (
    <svg x={x} y={y} width={w} height={h} overflow="hidden" style={{ borderRadius: 3 }}>
      <ThumbnailLandscape tone={tone} />
    </svg>
  );
}

/** Small layout diagrams: the arrangement carries the meaning, rather than sample photo subjects. */
export function AlbumThumbnail({ type }: { type: string }) {
  return (
    <svg viewBox="0 0 160 160" width="100%" height="100%" aria-hidden="true" style={{ display: "block", background: THUMBNAIL_BACKGROUND }}>
      {type === "Album" ? (
        <>
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={[0.4, 0.6, 0.85][i]}>
              <g transform="translate(0 6) skewY(-8)"><Photo x={8 + i * 13} y={55 - i * 10} w={18 + i * 6} h={50 + i * 19} tone={i + 1} /></g>
              <g transform="translate(0 -16) skewY(8)"><Photo x={134 - i * 19} y={55 - i * 10} w={18 + i * 6} h={50 + i * 19} tone={i + 2} /></g>
            </g>
          ))}
          <rect x="49" y="23" width="62" height="114" rx="5" fill="#fff" stroke="#dce2de" />
          <Photo x={52} y={26} w={56} h={108} />
        </>
      ) : type === "AlbumGrid" ? (
        Array.from({ length: 6 }, (_, i) => <Photo key={i} x={12 + (i % 3) * 47} y={25 + Math.floor(i / 3) * 58} w={42} h={53} tone={i} />)
      ) : type === "AlbumStrip" ? (
        <>
          {[0, 1, 2, 3].map((i) => <Photo key={i} x={-29 + i * 61} y={34} w={55} h={91} tone={i} />)}
          <path d="M58 139h44m-5-4 5 4-5 4" fill="none" stroke="#8b9c96" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        [0, 1, 2, 3].map((i) => {
          const x = 16 + (i % 2) * 70;
          const y = 14 + Math.floor(i / 2) * 69;
          return (
            <g key={i} transform={`rotate(${[-6, 5, 4, -5][i]} ${x + 29} ${y + 32})`}>
              <rect x={x} y={y} width="58" height="65" rx="2" fill="#fff" stroke="#dce2de" />
              <Photo x={x + 4} y={y + 4} w={50} h={48} tone={i} />
            </g>
          );
        })
      )}
    </svg>
  );
}
