import { useRef } from "react";

export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export function useAnimatedIconHover() {
  const iconRef = useRef<AnimatedIconHandle>(null);

  return {
    iconRef,
    rowHandlers: {
      onMouseEnter: () => iconRef.current?.startAnimation(),
      onMouseLeave: () => iconRef.current?.stopAnimation(),
    },
  };
}
