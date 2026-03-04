import React from 'react';
import StorySlides from '@/components/ui/StorySlides/StorySlides';
import Footer from '@/components/layout/footer/Footer';

import { client } from '@/lib/sanityClient';
import { STORIES_QUERY } from '../../../../sanity/lib/queries';

async function Featured() {
    const data = await client.fetch(STORIES_QUERY);

    const stories = data.map((item) => ({
        profileName: item.organization,
        profileImg: item.profileImg,
        title: item.title.split(' '),
        storyImg: item.storyImg,
        linkSrc: item.link,
        linkLabel: 'Read More',
    }));

    return (
        <>
            <StorySlides stories={stories} />
            <Footer />
        </>
    );
}

export default Featured;
