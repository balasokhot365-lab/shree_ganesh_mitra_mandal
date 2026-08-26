import React from "react";

// Professional Lord Ganesha Auspicious Emblem / Icon
export const GaneshaIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "w-14 h-14",
  size = 56,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      style={{ shapeRendering: "geometricPrecision" }}
    >
      {/* Outer Divine Aura Glow & Rings */}
      <circle
        cx="60"
        cy="60"
        r="58"
        fill="#FFFBEB"
        stroke="#B45309"
        strokeWidth="2.5"
      />
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="#FEF3C7"
        stroke="#EA580C"
        strokeWidth="1"
        strokeDasharray="3 2"
      />

      {/* Rays of Glory / Tejo-valay */}
      <path
        d="M60 4 L60 12 M60 108 L60 116 M4 60 L12 60 M108 60 L116 60 M20 20 L26 26 M94 94 L100 100 M20 100 L26 94 M94 26 L100 20"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Royal Crown / Mukut */}
      <path
        d="M44 26 L60 8 L76 26 L70 34 L50 34 Z"
        fill="#D97706"
        stroke="#78350F"
        strokeWidth="1.8"
      />
      <polygon
        points="60,12 66,24 54,24"
        fill="#FDE047"
        stroke="#B45309"
        strokeWidth="0.8"
      />
      <circle cx="60" cy="18" r="3" fill="#DC2626" />
      <circle cx="50" cy="28" r="2" fill="#2563EB" />
      <circle cx="70" cy="28" r="2" fill="#2563EB" />
      <circle cx="60" cy="30" r="2.5" fill="#16A34A" />

      {/* Auspicious Big Ears */}
      {/* Left Ear */}
      <path
        d="M42 40 C20 40 18 64 34 72 C40 75 46 68 46 62"
        fill="#FFEDD5"
        stroke="#C2410C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M30 48 C26 54 28 62 34 66"
        stroke="#EA580C"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right Ear */}
      <path
        d="M78 40 C100 40 102 64 86 72 C80 75 74 68 74 62"
        fill="#FFEDD5"
        stroke="#C2410C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M90 48 C94 54 92 62 86 66"
        stroke="#EA580C"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Ganesha Face / Mastak */}
      <ellipse
        cx="60"
        cy="50"
        rx="18"
        ry="16"
        fill="#FED7AA"
        stroke="#C2410C"
        strokeWidth="2.2"
      />

      {/* Divine Trishul / Chandrakor Tilak on Forehead */}
      <path
        d="M60 36 L60 52"
        stroke="#DC2626"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M53 42 Q60 48 67 42"
        stroke="#DC2626"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx="60"
        cy="45"
        r="2.2"
        fill="#F59E0B"
        stroke="#78350F"
        strokeWidth="0.6"
      />

      {/* Divine Eyes */}
      <path
        d="M49 48 Q53 46 56 49"
        stroke="#78350F"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M64 49 Q67 46 71 48"
        stroke="#78350F"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="52.5" cy="50" rx="1.8" ry="2.2" fill="#431407" />
      <ellipse cx="67.5" cy="50" rx="1.8" ry="2.2" fill="#431407" />
      <circle cx="52" cy="49" r="0.6" fill="#FFFFFF" />
      <circle cx="67" cy="49" r="0.6" fill="#FFFFFF" />

      {/* Graceful Trunk (सोंड) */}
      <path
        d="M60 56 C57 66 52 76 56 86 C60 94 72 94 75 86 C77 81 72 78 68 80"
        fill="none"
        stroke="#EA580C"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M60 56 C57 66 52 76 56 86 C60 94 72 94 75 86 C77 81 72 78 68 80"
        fill="none"
        stroke="#FED7AA"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Red Tilak on Trunk */}
      <path
        d="M58 64 L58 72"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Sacred Tusk (Danta) */}
      <path
        d="M51 60 L46 66"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M69 60 L71 63"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Modak (मोदक) on Divine Palm */}
      <g transform="translate(30, 80)">
        <path
          d="M10 2 C16 2 20 12 18 18 C16 22 4 22 2 18 C0 12 4 2 10 2 Z"
          fill="#F59E0B"
          stroke="#B45309"
          strokeWidth="1.2"
        />
        <path
          d="M10 2 L10 20 M6 7 L7 18 M14 7 L13 18"
          stroke="#D97706"
          strokeWidth="0.8"
        />
        <circle cx="10" cy="1" r="1.5" fill="#DC2626" />
      </g>

      {/* Auspicious Footnote text */}
      <text
        x="60"
        y="110"
        textAnchor="middle"
        fontSize="9"
        fontWeight="900"
        fill="#78350F"
        fontFamily="serif"
      >
        ॥ श्री गणेश ॥
      </text>
    </svg>
  );
};

// Professional Chhatrapati Shivaji Maharaj Royal Emblem / Icon
export const ShivajiMaharajIcon: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = "w-14 h-14", size = 56 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      style={{ shapeRendering: "geometricPrecision" }}
    >
      {/* Royal Saffron & Gold Border */}
      <circle
        cx="60"
        cy="60"
        r="58"
        fill="#FFFBEB"
        stroke="#991B1B"
        strokeWidth="2.5"
      />
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="#FEF3C7"
        stroke="#B45309"
        strokeWidth="1"
        strokeDasharray="3 2"
      />

      {/* Royal Rajmudra Octagon Crest Background */}
      <polygon
        points="60,16 88,28 100,56 88,84 60,96 32,84 20,56 32,28"
        fill="#FFEDD5"
        stroke="#991B1B"
        strokeWidth="1.5"
      />

      {/* Saffron Maratha Flag Zenda Accent */}
      <path d="M26 22 L54 36 L26 50 Z" fill="#EA580C" opacity="0.3" />

      {/* Royal Jiretop (जिरेटोप) - Chhatrapati Crown */}
      <path
        d="M40 44 C40 28 80 28 80 44 Z"
        fill="#991B1B"
        stroke="#7F1D1D"
        strokeWidth="2"
      />
      {/* Jiretop Gold Ribbon Base */}
      <path
        d="M38 43 Q60 48 82 43"
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M38 43 Q60 48 82 43"
        stroke="#D97706"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Kalgi / Turra (Feather Crest with Pearl & Ruby) */}
      <path
        d="M60 30 C58 14 54 8 60 4 C66 8 62 14 60 30 Z"
        fill="#F59E0B"
        stroke="#B45309"
        strokeWidth="1.2"
      />
      <circle
        cx="60"
        cy="28"
        r="3.5"
        fill="#DC2626"
        stroke="#991B1B"
        strokeWidth="1"
      />
      <circle cx="60" cy="20" r="2" fill="#FDE047" />

      {/* Royal Face Profile */}
      <path
        d="M44 45 C44 45 44 68 60 71 C76 68 76 45 76 45 Z"
        fill="#FFEDD5"
        stroke="#9A3412"
        strokeWidth="2"
      />

      {/* Chandrakor & Tilak (छत्रपतींची चंद्रकोर) */}
      <path d="M56 40 Q60 45 64 40 Q60 43 56 40 Z" fill="#DC2626" />
      <circle cx="60" cy="45" r="1.5" fill="#DC2626" />

      {/* Eyes with Resolute & Sovereign Warrior Focus */}
      <path
        d="M48 48 Q53 46 57 48"
        stroke="#1F2937"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M63 48 Q67 46 72 48"
        stroke="#1F2937"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="52" cy="49" rx="1.8" ry="1.2" fill="#1F2937" />
      <ellipse cx="68" cy="49" rx="1.8" ry="1.2" fill="#1F2937" />

      {/* Sharp Royal Nose */}
      <path
        d="M60 48 L59 55 L62 56"
        stroke="#9A3412"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Majestic Maratha Moustache (मिशा) & Royal Beard */}
      <path
        d="M50 58 Q60 63 70 58 Q68 65 60 65 Q52 65 50 58 Z"
        fill="#1F2937"
      />
      <path d="M54 65 Q60 74 66 65 Q60 70 54 65 Z" fill="#1F2937" />

      {/* Pearl Necklace (कंठहार) with Ruby Pendant */}
      <path
        d="M44 71 Q60 84 76 71"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeDasharray="2 2"
      />
      <circle
        cx="60"
        cy="79"
        r="3.5"
        fill="#DC2626"
        stroke="#991B1B"
        strokeWidth="1"
      />

      {/* Auspicious Footnote text */}
      <text
        x="60"
        y="110"
        textAnchor="middle"
        fontSize="9"
        fontWeight="900"
        fill="#991B1B"
        fontFamily="serif"
      >
        ॥ जय शिवराय ॥
      </text>
    </svg>
  );
};

// Official Mandal Seal Component
export const MandalSeal: React.FC<{ size?: number; className?: string }> = ({
  size = 80,
  className = "",
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderColor: "#991B1B",
        backgroundColor: "#FEF2F2",
      }}
      className={`border-2 border-dashed rounded-full flex flex-col items-center justify-center text-center p-1.5 transform -rotate-6 select-none shadow-xs ${className}`}
    >
      <span
        style={{ color: "#991B1B" }}
        className="text-[8px] font-black uppercase tracking-tight leading-none"
      >
        श्री गणेश मित्र मंडळ
      </span>
      <span
        style={{ color: "#B91C1C" }}
        className="text-[6.5px] font-bold leading-tight mt-0.5"
      >
        शिरसवडी (सातारा)
      </span>
      <div
        style={{ backgroundColor: "#991B1B" }}
        className="w-10 h-[1px] my-[2px]"
      />
      <span
        style={{ color: "#7F1D1D" }}
        className="text-[7.5px] font-extrabold leading-none tracking-tighter"
      >
        ★ अधिकृत शिक्का ★
      </span>
      <span
        style={{ color: "#991B1B" }}
        className="text-[5.5px] font-medium leading-none mt-0.5"
      >
        रजि. १५४१६/२००३
      </span>
    </div>
  );
};
