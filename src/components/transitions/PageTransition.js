"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSound } from "@/hooks/useSound";

export default function PageTransition() {
  const pathname = usePathname();
  const { playSound, isInitialized } = useSound();

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (isInitialized) {
      playSound("page-transition");
    }
  }, [pathname, isInitialized, playSound]);

  return null;
}
