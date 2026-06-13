"use client";

import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes, MouseEvent } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface TriangleAlertIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface TriangleAlertIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const TriangleAlertIcon = forwardRef<TriangleAlertIconHandle, TriangleAlertIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={controls}
            d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
            variants={{
              normal: { pathLength: 1, opacity: 1 },
              animate: {
                pathLength: [0, 1],
                opacity: [0.4, 1],
                transition: { duration: 0.35 },
              },
            }}
          />
          <motion.path
            animate={controls}
            d="M12 9v4"
            variants={{
              normal: { opacity: 1, y: 0 },
              animate: {
                opacity: [0, 1],
                y: [2, 0],
                transition: { duration: 0.2, delay: 0.15 },
              },
            }}
          />
          <motion.path
            animate={controls}
            d="M12 17h.01"
            variants={{
              normal: { opacity: 1, scale: 1 },
              animate: {
                opacity: [0, 1],
                scale: [0.5, 1],
                transition: { duration: 0.2, delay: 0.25 },
              },
            }}
          />
        </svg>
      </div>
    );
  }
);

TriangleAlertIcon.displayName = "TriangleAlertIcon";

export { TriangleAlertIcon };
