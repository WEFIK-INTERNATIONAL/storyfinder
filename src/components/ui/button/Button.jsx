'use client';
import './Button.css';
import { HiLightningBolt } from 'react-icons/hi';
import { useViewTransition } from '@/hooks/useViewTransition';
import React, { useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function Button({
  href,
  children,
  variant = 'dark',
  icon,
  animateOnScroll = false,
  delay = 0,
}) {
  const IconComponent = icon || HiLightningBolt;
  const { navigateWithTransition } = useViewTransition();
  const buttonRef = useRef(null);
  const labelRef = useRef(null);
  const iconRef = useRef(null);
  const splitRef = useRef(null);
  const lines = useRef([]);

  useGSAP(
    () => {
      if (!labelRef.current || !buttonRef.current) return;

      const split = SplitText.create(labelRef.current, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'line++',
        lineThreshold: 0.1,
      });

      splitRef.current = split;
      lines.current = split.lines;

      gsap.set(lines.current, { y: '100%' });

      if (iconRef.current) {
        gsap.set(iconRef.current, { scale: 0 });
      }

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
            trigger: labelRef.current,
            start: 'top 90%',
            once: true,
          },
        });
        if (iconRef.current) {
          gsap.to(iconRef.current, {
            scale: 1,
            duration: 0.8,
            ease: 'power4.out',
            delay: delay + 0.3,
            scrollTrigger: {
              trigger: labelRef.current,
              start: 'top 90%',
              once: true,
            },
          });
        }
      } else {
        gsap.to(lines.current, animationProps);
        if (iconRef.current) {
          gsap.to(iconRef.current, {
            scale: 1,
            duration: 0.8,
            ease: 'power4.out',
            delay: delay,
          });
        }
      }

      return () => {
        if (splitRef.current) {
          splitRef.current.revert();
        }
      };
    },
    { scope: buttonRef, dependencies: [animateOnScroll, delay] }
  );

  return (
    <a
      ref={buttonRef}
      href={href}
      className={`button button--${variant}`}
      onClick={(e) => {
        if (!href) return;
        e.preventDefault();
        navigateWithTransition(href);
      }}
    >
      <span className="button-label" ref={labelRef}>
        {children}
      </span>
      <span className="button-icon">
        <span className="button-icon-inner" ref={iconRef}>
          <IconComponent size={12} />
        </span>
      </span>
    </a>
  );
}
