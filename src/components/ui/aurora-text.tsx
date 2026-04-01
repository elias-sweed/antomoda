"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface AuroraTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children: React.ReactNode;
  colors?: string[];
  speed?: number;
}

export function AuroraText({
  className,
  children,
  colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8", "#FF0080"],
  speed = 1.5,
  ...props
}: AuroraTextProps) {
  return (
    <motion.span
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {/* Gradiente animado que se mueve dentro del texto */}
      <motion.span
        className="absolute inset-0 bg-[length:200%_200%] bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 8 / speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {children}
      </motion.span>

      {/* Texto visible (para accesibilidad y renderizado) */}
      <span className="relative z-10 bg-clip-text text-transparent" aria-hidden="true">
        {children}
      </span>
    </motion.span>
  );
}