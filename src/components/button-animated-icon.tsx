import type { ComponentType, HTMLAttributes, RefAttributes } from "react";
import type { RefObject } from "react";
import type { AnimatedIconHandle } from "@/components/layout/sidebar-animated-icon";

export type AnimatedIconComponent = ComponentType<
  { size?: number; className?: string } & HTMLAttributes<HTMLDivElement> &
    RefAttributes<AnimatedIconHandle>
>;

interface ButtonAnimatedIconProps {
  icon: AnimatedIconComponent;
  iconRef: RefObject<AnimatedIconHandle | null>;
  size?: number;
  className?: string;
}

export function ButtonAnimatedIcon({
  icon: Icon,
  iconRef,
  size = 16,
  className,
}: ButtonAnimatedIconProps) {
  return (
    <Icon
      ref={iconRef}
      size={size}
      className={className}
    />
  );
}
