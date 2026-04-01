import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  return (
    <div className={cn("relative p-[4px] group rounded-[22px] overflow-hidden", containerClassName)}>
      
      {/* Gradiente animado FUERTE y RÁPIDO */}
      <motion.div
        className="absolute inset-0 rounded-[22px] z-[1]"
        style={{
          backgroundSize: "500% 500%",
          backgroundImage: `
            radial-gradient(circle at 20% 30%, #c026d3 30%, transparent 60%),
            radial-gradient(circle at 80% 20%, #6366f1 30%, transparent 60%),
            radial-gradient(circle at 30% 80%, #06b6d4 30%, transparent 60%),
            radial-gradient(circle at 70% 60%, #a855f7 30%, transparent 60%)
          `,
        }}
        animate={animate ? {
          backgroundPosition: ["0% 20%", "100% 80%", "0% 20%"]
        } : undefined}
        transition={{
          duration: 4,           // Más rápido (antes era 8)
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Glow extra visible */}
      <motion.div
        className="absolute inset-0 rounded-[22px] z-[2] opacity-50 group-hover:opacity-80 blur-sm"
        style={{
          background: "linear-gradient(90deg, #c026d3, #6366f1, #06b6d4, #c026d3)",
          backgroundSize: "400% 400%",
        }}
        animate={animate ? {
          backgroundPosition: ["100% 0%", "0% 100%", "100% 0%"]
        } : undefined}
        transition={{
          duration: 3,           // Aún más rápido
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Contenido */}
      <div 
        className={cn(
          "relative z-10 bg-neutral-950 rounded-[18px] h-full w-full flex flex-col border border-white/10",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};