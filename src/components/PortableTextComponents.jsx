import Image from 'next/image';
import { urlFor } from '@/lib/image';

export const portableTextComponents = {
    /* ================= IMAGES ================= */
    types: {
        image: ({ value }) => {
            const src = urlFor(value).width(2000).quality(90).url();

            return (
                <figure className="my-12 w-full">
                    <div className="relative w-full max-h-[90vh] overflow-hidden rounded-xl">
                        <Image
                            src={src}
                            alt={value?.alt || 'Blog image'}
                            width={2000}
                            height={1200}
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="w-full h-auto max-h-[90vh] object-contain rounded-xl"
                        />
                    </div>

                    {value?.caption && (
                        <figcaption className="text-center text-sm text-[#e3e3db]/50 mt-3 font-[var(--font-monolith)] uppercase tracking-widest">
                            {value.caption}
                        </figcaption>
                    )}
                </figure>
            );
        },
    },

    /* ================= HEADINGS & BLOCKS ================= */
    block: {
        h1: ({ children }) => (
            <h1 className="text-4xl md:text-5xl font-bold mt-12 mb-6">
                {children}
            </h1>
        ),
        h2: ({ children }) => (
            <h2
                data-toc
                className="reveal text-3xl md:text-4xl font-bold mt-12 mb-6"
            >
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-2xl md:text-3xl font-semibold mt-8 mb-4">
                {children}
            </h3>
        ),
        h4: ({ children }) => (
            <h4 className="text-xl font-semibold mt-6 mb-3">{children}</h4>
        ),
        h5: ({ children }) => (
            <h5 className="text-lg font-semibold mt-5 mb-2">{children}</h5>
        ),
        h6: ({ children }) => (
            <h6 className="text-base font-semibold mt-4 mb-2">{children}</h6>
        ),

        normal: ({ children }) => (
            <p className="text-lg leading-relaxed text-[#e3e3db]/85 mb-5">
                {children}
            </p>
        ),

        blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[#c0501a]/50 pl-6 italic text-[#e3e3db]/70 my-8">
                {children}
            </blockquote>
        ),
    },

    /* ================= LISTS ================= */
    list: {
        bullet: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 mb-5 text-[#e3e3db]/85">
                {children}
            </ul>
        ),
        number: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 mb-5 text-[#e3e3db]/85">
                {children}
            </ol>
        ),
    },

    listItem: {
        bullet: ({ children }) => <li>{children}</li>,
        number: ({ children }) => <li>{children}</li>,
    },

    /* ================= MARKS ================= */
    marks: {
        strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
        ),

        em: ({ children }) => <em className="italic">{children}</em>,

        underline: ({ children }) => (
            <span className="underline">{children}</span>
        ),

        'strike-through': ({ children }) => (
            <span className="line-through">{children}</span>
        ),

        link: ({ value, children }) => {
            const target = (value?.href || '').startsWith('http')
                ? '_blank'
                : '_self';

            return (
                <a
                    href={value?.href}
                    target={target}
                    rel="noopener noreferrer"
                    className="text-[#c0501a] no-underline border-b border-[#c0501a]/40 hover:border-[#c0501a] hover:text-[#e3e3db] transition-colors duration-300"
                >
                    {children}
                </a>
            );
        },
    },
};
