'use client';
import './Copy.css';
import React, { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

export default function Copy({ children, animateOnScroll = true, delay = 0 }) {
  const containerRef = useRef(null);
  const elementRefs = useRef([]);
  const splitRefs = useRef([]);
  const lines = useRef([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const initializeSplitText = async () => {
        splitRefs.current = [];
        lines.current = [];
        elementRefs.current = [];

        let elements = [];

        if (containerRef.current.hasAttribute('data-copy-wrapper')) {
          elements = Array.from(containerRef.current.children);
        } else {
          elements = [containerRef.current];
        }

        elements.forEach((element) => {
          elementRefs.current.push(element);

          const split = SplitText.create(element, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'line++',
            lineThreshold: 0.1,
          });

          splitRefs.current.push(split);

          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;

          if (textIndent && textIndent !== '0px') {
            if (split.lines.length > 0) {
              split.lines[0].style.paddingLeft = textIndent;
            }
            element.style.textIndent = '0';
          }

          lines.current.push(...split.lines);
        });

        gsap.set(lines.current, { y: '100%' });

        const animationProps = {
          y: '0%',
          duration: 1,
          stagger: 0.1,
          ease: 'power4.out',
          delay: delay,
        };

        if (animateOnScroll) {
          gsap.to(lines.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 90%',
              once: true,
            },
          });
        } else {
          gsap.to(lines.current, animationProps);
        }
      };

      initializeSplitText();

      return () => {
        splitRefs.current.forEach((split) => {
          if (split) split.revert();
        });
      };
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay] }
  );

  return (
    <div
      ref={containerRef}
      data-copy-wrapper={React.Children.count(children) > 1}
    >
      {children}
    </div>
  );
}
