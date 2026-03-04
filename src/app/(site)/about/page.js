import Footer from '@/components/layout/footer/Footer';
import React from 'react';
import AboutDissolveHero from '@/components/about/dissolvecanvas/AboutDissolveHero';
import AboutPhotographer from '@/components/about/aboutphotographer/AboutPhotographer';
import Spotlight from '@/components/about/spotlight/Spotlight';
import AboutRetouch from '@/components/about/aboutretouch/AboutRetouch';
import AboutFeatured from '@/components/about/aboutfeatured/AboutFeatured';

export default function About() {
    return (
        <>
            <AboutDissolveHero />
            <AboutPhotographer />
            <Spotlight />
            <AboutRetouch />
            <AboutFeatured />
            <Footer />
        </>
    );
}
