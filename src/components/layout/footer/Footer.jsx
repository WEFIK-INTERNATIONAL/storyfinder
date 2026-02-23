'use client';
import './Footer.css';
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import Button from '@/components/ui/button/Button';
import { IoMail } from 'react-icons/io5';
import Copy from '@/components/ui/copy/Copy';
import Particle from '@/lib/Particle';

gsap.registerPlugin(useGSAP);

const Footer = () => {
  const footerRef = useRef(null);
  const explosionContainerRef = useRef(null);
  const [kolkataTime, setKolkataTime] = useState('');

  const config = {
    gravity: 0.25,
    friction: 0.99,
    imageSize: 300,
    horizontalForce: 20,
    verticalForce: 15,
    rotationSpeed: 10,
    resetDelay: 500,
  };

  const imageParticleCount = 10;
  const imagePaths = Array.from(
    { length: imageParticleCount },
    (_, i) => `/objects/obj-${i + 1}.png`
  );

  useEffect(() => {
    const updateKolkataTime = () => {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };

      const formatter = new Intl.DateTimeFormat('en-US', options);
      const kolkataTimeString = formatter.format(new Date());
      setKolkataTime(kolkataTimeString);
    };

    updateKolkataTime();
    const timeInterval = setInterval(updateKolkataTime, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  useGSAP(
    () => {
      let hasExploded = false;
      let animationId;
      let checkTimeout;

      imagePaths.forEach((path) => {
        const img = new Image();
        img.src = path;
      });

      const getComputedImageSize = () => {
        const viewportWidth =
          typeof window !== 'undefined' ? window.innerWidth : 1200;
        const viewportHeight =
          typeof window !== 'undefined' ? window.innerHeight : 800;
        const baseOnWidth = Math.floor(viewportWidth * 0.18);
        const baseOnHeight = Math.floor(viewportHeight * 0.22);
        return Math.max(
          300,
          Math.min(config.imageSize, baseOnWidth, baseOnHeight)
        );
      };

      const createParticles = () => {
        if (!explosionContainerRef.current) return;
        explosionContainerRef.current.innerHTML = '';

        const particleSize = getComputedImageSize();
        explosionContainerRef.current.style.setProperty(
          '--particle-size',
          `${particleSize}px`
        );

        imagePaths.forEach((path) => {
          const particle = document.createElement('img');
          particle.src = path;
          particle.classList.add('explosion-particle-img');
          explosionContainerRef.current.appendChild(particle);
        });
      };

      const explode = () => {
        if (hasExploded || !explosionContainerRef.current) return;

        hasExploded = true;
        createParticles();

        const particleElements = explosionContainerRef.current.querySelectorAll(
          '.explosion-particle-img'
        );
        const particles = Array.from(particleElements).map(
          (element) => new Particle(element)
        );

        const animate = () => {
          particles.forEach((particle) => particle.update());
          animationId = requestAnimationFrame(animate);

          if (
            explosionContainerRef.current &&
            particles.every(
              (particle) =>
                particle.y > explosionContainerRef.current.offsetHeight / 2
            )
          ) {
            cancelAnimationFrame(animationId);
          }
        };

        animate();
      };

      const checkFooterPosition = () => {
        if (!footerRef.current) return;

        const footerRect = footerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (footerRect.top > viewportHeight + 100) {
          hasExploded = false;
        }

        if (!hasExploded && footerRect.top <= viewportHeight + 250) {
          explode();
        }
      };

      createParticles();
      setTimeout(checkFooterPosition, 500);

      const scrollHandler = () => {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(checkFooterPosition, 5);
      };

      const resizeHandler = () => {
        const newSize = getComputedImageSize();
        if (explosionContainerRef.current) {
          explosionContainerRef.current.style.setProperty(
            '--particle-size',
            `${newSize}px`
          );
        }
        hasExploded = false;
      };

      window.addEventListener('scroll', scrollHandler);
      window.addEventListener('resize', resizeHandler);

      return () => {
        window.removeEventListener('scroll', scrollHandler);
        window.removeEventListener('resize', resizeHandler);
        clearTimeout(checkTimeout);
        cancelAnimationFrame(animationId);
        if (explosionContainerRef.current) {
          explosionContainerRef.current.innerHTML = '';
        }
      };
    },
    { scope: footerRef }
  );

  return (
    <footer ref={footerRef}>
      <div className="container">
        <div className="footer-header-content">
          <div className="footer-header">
            <Copy animateOnScroll={true} delay={0.2}>
              <h1>Let&apos;s capture stories that feel alive</h1>
            </Copy>
          </div>
          <div className="footer-link">
            <Button
              animateOnScroll={true}
              delay={0.5}
              variant="light"
              icon={IoMail}
              href="/contact"
            >
              Say Hello
            </Button>
          </div>
        </div>
        <div className="footer-byline">
          <div className="footer-time">
            <p>
              Kolkata, ON <span>{kolkataTime}</span>
            </p>
          </div>

          <div className="footer-author">
            <a
              className="font-accent text-[#ff6e14]"
              href="https://wefik.in"
              target="_blank"
            >
              Developed by Wefik
            </a>
          </div>

          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} StoryFinder</p>
          </div>
        </div>
      </div>
      <div className="explosion-container" ref={explosionContainerRef}></div>
    </footer>
  );
};

export default Footer;
