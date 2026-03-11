import NotFoundClient from '../components/ui/NotFoundClient';

export const metadata = {
    title: '404 — Page Not Found',
    description: 'The page you are looking for could not be found.',
    robots: {
        index: false,
        follow: true,
    },
};

export default function NotFound() {
    return <NotFoundClient />;
}
