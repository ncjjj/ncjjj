"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollStack() {
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    let triggers: ScrollTrigger[] = [];

    const setup = () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      triggers = [];

      if (!media.matches) {
        return;
      }

      const sections = gsap.utils.toArray<HTMLElement>(".panel");

      sections.forEach((section, i) => {
        const nextSection = sections[i + 1];

        if (nextSection) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              pin: true,
              pinSpacing: false,
              endTrigger: nextSection,
              end: "top top",
            })
          );
        }
      });
    };

    setup();
    media.addEventListener("change", setup);

    return () => {
      media.removeEventListener("change", setup);
      triggers.forEach((trigger) => trigger.kill());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}

