"use client";

import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Întârzierea în secunde, pentru intrări etajate într-un grup. */
  delay?: number;
  /** `load` pentru ce e deja pe ecran la deschidere, `view` pentru restul. */
  trigger?: "load" | "view";
};

/**
 * Intrarea unui bloc de pagină: urcă puțin și se limpezește.
 *
 * O singură mișcare, aceeași peste tot, cu o curbă care frânează la final. Rolul
 * ei e să spună în ce ordine se citește pagina, nu să se facă remarcată; de asta
 * distanța e mică și durata scurtă.
 *
 * Cine a cerut mișcare redusă primește conținutul direct, fără nicio tranziție.
 */
export function Reveal({ children, className, delay = 0, trigger = "view" }: RevealProps) {
  const reduce = useReducedMotion();
  const hidden = { opacity: 0, y: 16 };
  const shown = { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={reduce ? false : hidden}
      {...(trigger === "load"
        ? { animate: shown }
        : { whileInView: shown, viewport: { once: true, amount: 0.2 } })}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
