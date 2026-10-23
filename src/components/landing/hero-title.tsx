"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Titlul paginii, dezvăluit propoziție cu propoziție.
 *
 * Cele trei fraze sunt trei pași ai aceluiași lucru, iar textul le spune în
 * ordine. Dacă apar în ordine, ochiul citește secvența, nu un bloc de litere.
 * Fiecare stă pe rândul ei și intră de sub o linie, ca un titlu care se așază.
 */
export function HeroTitle({ title, className }: { title: string; className?: string }) {
  const reduce = useReducedMotion();
  const lines = title
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <h1 className={className}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.75, delay: 0.08 + index * 0.11, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}.
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
