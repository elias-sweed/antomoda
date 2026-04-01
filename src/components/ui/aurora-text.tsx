"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion"; // Importamos HTMLMotionProps
import React from "react";

// Cambiamos la interfaz para que use los tipos de framer-motion
interface AuroraTextProps extends HTMLMotionProps<"span"> {
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

      <span className="relative z-10 bg-clip-text text-transparent" aria-hidden="true">
        {children}
      </span>
    </motion.span>
  );
}