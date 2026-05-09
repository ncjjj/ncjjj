"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollStack() {
  useEffect(() => {
    const cleanup = ScrollTrigger.matchMedia({
      "(min-width: 1025px)": () => {
        const sections = gsap.utils.toArray<HTMLElement>(".panel");

        sections.forEach((section, i) => {
          const nextSection = sections[i + 1];

          if (nextSection) {
            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              pin: true,
              pinSpacing: false,
              endTrigger: nextSection,
              end: "top top",
            });
          }
        });

        return () => {
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
      },
    });

    return () => {
      const c = cleanup as any; if (c && typeof c.revert === "function") c.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}

