"use client";

import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Flip } from "gsap/Flip";
import CustomEase from "gsap/CustomEase";
import SplitText from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable, InertiaPlugin, Flip, CustomEase, SplitText);
}

export const customEase = "power4.inOut";
export const centerEase = "power2.out";

export { gsap, Draggable, InertiaPlugin, Flip, CustomEase, SplitText };
