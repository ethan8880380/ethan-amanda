"use client";

import { useMemo } from "react";

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: "red" | "white";
  rotation: number;
  swayAmount: number;
}

export function FallingPetals({ count = 20 }: { count?: number }) {
  const petals = useMemo<Petal[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 12 + Math.random() * 14,
      color: Math.random() > 0.5 ? "red" : "white",
      rotation: Math.random() * 360,
      swayAmount: 20 + Math.random() * 40,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.left}%`,
            top: "-30px",
            animation: `fall ${petal.duration}s linear ${petal.delay}s infinite`,
          }}
        >
          <div
            style={{
              width: petal.size,
              height: petal.size * 0.7,
              animation: `sway ${2 + Math.random()}s ease-in-out infinite alternate, spin ${3 + Math.random() * 2}s linear infinite`,
              transform: `rotate(${petal.rotation}deg)`,
            }}
          >
            {/* Rose petal SVG shape */}
            <svg
              viewBox="0 0 24 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              style={{
                filter: petal.color === "red" 
                  ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" 
                  : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            >
              <path
                d="M12 0C6 0 0 6 0 12C0 15 3 18 6 18C9 18 12 15 12 12C12 15 15 18 18 18C21 18 24 15 24 12C24 6 18 0 12 0Z"
                fill={petal.color === "red" ? "#c41e3a" : "#fff5f5"}
                fillOpacity={petal.color === "red" ? 0.9 : 0.85}
              />
              {/* Inner petal detail */}
              <path
                d="M12 2C8 2 4 6 4 10C4 12 6 14 8 14C10 14 12 12 12 10C12 12 14 14 16 14C18 14 20 12 20 10C20 6 16 2 12 2Z"
                fill={petal.color === "red" ? "#8b0000" : "#ffe4e4"}
                fillOpacity={0.4}
              />
            </svg>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 50px)) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes sway {
          0% {
            transform: translateX(-15px) rotate(-10deg);
          }
          100% {
            transform: translateX(15px) rotate(10deg);
          }
        }

        @keyframes spin {
          0% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          100% {
            transform: rotateY(360deg) rotateX(180deg);
          }
        }
      `}</style>
    </div>
  );
}
