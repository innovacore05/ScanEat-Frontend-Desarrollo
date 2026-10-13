import type { ComponentPropsWithoutRef } from "react";

type SkeletonProps = ComponentPropsWithoutRef<"div">;

function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-neutral-200 ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
