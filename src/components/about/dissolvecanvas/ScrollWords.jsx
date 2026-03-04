"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function ScrollWords({text}) {
  const containerRef = useRef(null);
  const wordsRef = useRef([]);

  // Split text into words
  const words = text.split(" ");

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const wordEls = wordsRef.current.filter(Boolean);

      gsap.set(wordEls, { opacity: 0 });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 25%",
        end: "bottom 100%",
        onUpdate: (self) => {
          const progress = self.progress;
          const totalWords = wordEls.length;

          wordEls.forEach((word, index) => {
            const wordProgress = index / totalWords;
            const nextWordProgress = (index + 1) / totalWords;

            let opacity = 0;

            if (progress >= nextWordProgress) {
              opacity = 1;
            } else if (progress >= wordProgress) {
              const fadeProgress =
                (progress - wordProgress) / (nextWordProgress - wordProgress);
              opacity = fadeProgress;
            }

            gsap.to(word, {
              opacity,
              duration: 0.1,
              overwrite: true,
            });
          });
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="absolute left-0 bottom-0 w-full h-[125svh] flex justify-center items-center text-center z-3"
    >
      <h2
        className="w-[75%] text-[#1a1614] max-w-[calc(100%-4rem)]"
      >
        {words.map((word, i) => (
          <span
            key={i}
            ref={(el) => (wordsRef.current[i] = el)}
            className="inline-block mr-2"
          >
            {word}
          </span>
        ))}
      </h2>
    </div>
  );
}
