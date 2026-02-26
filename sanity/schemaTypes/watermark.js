import { defineField, defineType } from "sanity";

export default defineType({
  name: "watermark",
  title: "Watermark Settings",
  type: "document",

  __experimental_actions: ["update", "publish"],

  fields: [
    defineField({
      name: "image",
      title: "Watermark PNG",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "opacity",
      title: "Opacity (0–1)",
      type: "number",
      initialValue: 0.25,
      validation: (Rule) => Rule.min(0).max(1).precision(2),
    }),

    defineField({
      name: "size",
      title: "Scale (0.1 – 1)",
      type: "number",
      initialValue: 0.4,
      validation: (Rule) => Rule.min(0.1).max(1),
    }),

    defineField({
      name: "position",
      title: "Position",
      type: "string",
      options: {
        list: [
          { title: "Center", value: "center" },
          { title: "Bottom Right", value: "bottom-right" },
          { title: "Bottom Left", value: "bottom-left" },
          { title: "Top Right", value: "top-right" },
          { title: "Top Left", value: "top-left" },
        ],
        layout: "radio",
      },
      initialValue: "bottom-right",
    }),
  ],

  preview: {
    select: { media: "image" },
    prepare() {
      return {
        title: "Global Watermark Settings",
      };
    },
  },
});
