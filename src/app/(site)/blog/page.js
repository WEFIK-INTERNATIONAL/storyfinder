import Minimap from '@/components/ui/minimap/Minimap';
import React from 'react';

function Blog() {
  return (
    <div>
      <Minimap
        images={[
          { src: '/work/work_1_1.jpg', alt: 'Image 1' },
          { src: '/work/work_1_2.jpg', alt: 'Image 2' },
          { src: '/work/work_1_3.jpg', alt: 'Image 3' },
          { src: '/work/work_2_1.jpg', alt: 'Image 4' },
          { src: '/work/work_2_2.jpg', alt: 'Image 5' },
          { src: '/work/work_2_3.jpg', alt: 'Image 6' },
          { src: '/work/work_3_1.jpg', alt: 'Image 7' },
          { src: '/work/work_3_2.jpg', alt: 'Image 8' },
          { src: '/work/work_3_3.jpg', alt: 'Image 9' },
        ]}
        category="Potrait"
      />
    </div>
  );
}

export default Blog;
