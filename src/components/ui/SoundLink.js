"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useSound } from "@/hooks/useSound";

export default function SoundLink({
  soundType = "link-click",
  href,
  children,
  className = "",
  onClick,
  ...props
}) {
  const { playSound } = useSound();

  const handleClick = useCallback(
    (e) => {
      playSound(soundType);
      onClick?.(e);
    },
    [playSound, soundType, onClick],
  );

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
