"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Afirmația dintre secțiuni: cuvintele se aprind pe măsură ce treci prin dreptul
 * lor, de la gri la culoarea textului.
 *
 * E singurul loc din pagină unde mișcarea e legată de derulare. Are voie, fiindcă
 * aici mișcarea chiar spune ceva: citești fraza în ritmul în care cobori, nu o
 * primești dintr-o dată ca pe un slogan.
 */
export function Statement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className="font-display text-muted-foreground mx-auto max-w-4xl text-center text-[1.75rem] leading-[1.35] font-medium tracking-[-0.02em] text-balance sm:text-[2.5rem]"
    >
      {words.map((word, index) => (
        <Word
          key={`${word}-${index}`}
          word={word}
          progress={scrollYProgress}
          range={[index / words.length, (index + 1.6) / words.length]}
          reduce={reduce ?? false}
        />
      ))}
    </p>
  );
}

function Word({
  word,
  progress,
  range,
  reduce,
}: {
  word: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  reduce: boolean;
}) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  return (
    <motion.span className="text-foreground inline-block" style={reduce ? undefined : { opacity }}>
      {word}
      {" "}
    </motion.span>
  );
}
