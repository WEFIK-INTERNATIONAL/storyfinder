export const PHOTOS_QUERY = `
*[_type == "photo"] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  image{
    asset->{
      _id,
      url,
      metadata { lqip, dimensions }
    }
  },
  price,
  isPaid,
  featured,
  views,
  "category": category->title
}`

export const PHOTO_QUERY = `
*[_type == "photo" && slug.current == $slug][0]{
  _id,
  title,
  description,
  "slug": slug.current,
  image{
    asset->{
      _id,
      url,
      metadata { lqip, dimensions }
    }
  },
  price,
  isPaid,
  views,
  enabled,
  downloadFile,
  exif,
  "category": category->title,
  publishedAt
}`

export const CATEGORIES_QUERY = `
*[_type == "category"] | order(title asc){
  _id,
  title,
  "slug": slug.current
}`

export const POSTS_QUERY = `
*[_type == "post"] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  mainImage{
    asset->{ url }
  },
  excerpt,
  publishedAt
}`

export const POST_QUERY = `
*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,

  mainImage{
    asset->{
      _id,
      url,
      metadata { lqip, dimensions }
    },
    alt
  },

  body,   // PortableText (Block Content)

  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  }
}`

export const WATERMARK_QUERY = `
*[_type == "watermark"][0]{
  image{ asset->{ url } },
  opacity,
  size,
  position,
  _updatedAt
}`

export const FEATURED_PHOTOS_QUERY = `
*[_type == "photo" && featured == true] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  image{ asset->{ url } },
  price,
  isPaid
}`

export const PHOTOS_BY_CATEGORY_QUERY = `
*[_type == "photo" && category->slug.current == $slug] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  image{ asset->{ url } },
  price,
  isPaid
}`

export const GALLERIES_QUERY = `
*[_type == "gallery"] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  coverImage{ asset->{ url } },
  "category": category->title
}`

export const GALLERY_QUERY = `
*[_type == "gallery" && slug.current == $slug][0]{
  title,
  description,
  photos[]->{
    _id,
    title,
    "slug": slug.current,
    image{ asset->{ url } },
    price,
    isPaid
  }
}`
