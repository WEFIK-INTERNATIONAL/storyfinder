import {
    ppNeueMontreal,
    goodMonolith,
    bigShouldersDisplay,
    pangramSans,
} from './fonts';
import PageTransition from '@/components/transitions/PageTransition';
import { ViewTransitions } from 'next-view-transitions';
import ClientLayout from './client-layout';
import './globals.css';

export const metadata = {
    title: 'Storyfinder',
    description:
        'An interactive photography Portfolio that tells a story through images. Explore captivating narratives and discover the art of visual storytelling.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${goodMonolith.variable} ${ppNeueMontreal.variable} ${bigShouldersDisplay.variable} ${pangramSans.variable} antialiased`}
            >
                <ViewTransitions>
                    <PageTransition />
                    <ClientLayout>{children}</ClientLayout>
                </ViewTransitions>
            </body>
        </html>
    );
}
