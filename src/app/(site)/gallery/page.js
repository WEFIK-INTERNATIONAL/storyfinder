import { client } from '@/lib/sanityClient';
import GalleryClient from './GalleryClient';
import { GALLERIES_QUERY } from '../../../../sanity/lib/queries';

export default async function Page() {
    const galleries = await client.fetch(GALLERIES_QUERY);
    console.log(galleries);

    return (
        <div>
            <GalleryClient galleries={galleries} />
        </div>
    );
}
