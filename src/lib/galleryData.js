export const FASHION_IMAGES = Array.from({ length: 14 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `https://assets.codepen.io/7558/orange-portrait_${n}.jpg`;
});

export const IMAGE_DATA = [
    {
        number: '01',
        title: "Begin Before You're Ready",
        description:
            'The work starts when you notice the quiet pull. Breathe once, clear the room inside you, and move one pixel forward.',
    },
    {
        number: '02',
        title: 'Negative Space, Positive Signal',
        description:
            'Leave room around the idea. In the silence, the design answers back and shows you what to remove.',
    },
    {
        number: '03',
        title: 'Friction Is a Teacher',
        description:
            'When the line resists, listen. Constraints are coordinates—plot them, then chart a cleaner route.',
    },
    {
        number: '04',
        title: 'Golden Minute',
        description:
            "Catch the light while it's honest. One honest frame beats a hundred almosts.",
    },
    {
        number: '05',
        title: 'Shadow Carries Form',
        description:
            "The dark reveals the edge. Let contrast articulate what you mean but can't yet say.",
    },
    {
        number: '06',
        title: 'City Breath',
        description:
            "Steel, glass, heartbeat. Edit until the street's rhythm fits inside a single grid.",
    },
    {
        number: '07',
        title: 'Soft Focus, Sharp Intent',
        description:
            'Blur the noise, not the purpose. What matters remains in crisp relief.',
    },
    {
        number: '08',
        title: 'Time-Tested, Future-Ready',
        description:
            'Classics survive because they serve. Keep the spine, tune the surface, respect the lineage.',
    },
    {
        number: '09',
        title: 'Grace Under Revision',
        description:
            "Drafts don't apologize. They evolve. Let elegance emerge through cuts, not flourishes.",
    },
    {
        number: '10',
        title: 'Style That Outlasts Seasons',
        description:
            'Trends talk. Principles walk. Build on principles and let trends accessorize.',
    },
    {
        number: '11',
        title: 'Edges and Experiments',
        description:
            "Push just past comfort. Leave a fingerprint the algorithm can't fake.",
    },
    {
        number: '12',
        title: 'Portrait of Attention',
        description:
            'Form is what you see. Presence is what you feel. Aim for presence.',
    },
    {
        number: '13',
        title: 'Light Speaks First',
        description:
            'Expose for truth. Shadows are sentences, highlights the punctuation.',
    },
    {
        number: '14',
        title: 'Contemporary Is a Moving Target',
        description:
            'Design for now by listening deeper than now. The signal is older than the feed.',
    },
];

export const GRID_CONFIG = {
    itemSize: 320,
    rows: 8,
    cols: 12,
    initialZoom: 0.6,
};

export const TOTAL_ITEMS = GRID_CONFIG.rows * GRID_CONFIG.cols;
