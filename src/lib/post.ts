/**
 * Shared helpers for blog post rendering.
 */

/**
 * Resolve the thumbnail/card image for a blog post. Priority:
 *   1. `heroImage` if explicitly set (e.g. uploaded press-kit image,
 *      or a DALL-E hero generated for lifestyle articles).
 *   2. YouTube `maxresdefault.jpg` derived from `heroVideoId`
 *      (the standard for 上映ガイド-series articles, where the hero
 *      is the embedded official trailer's poster frame).
 *   3. `null` — caller should render no image.
 */
export function resolvePostThumbnail(data: {
  heroImage?: string;
  heroVideoId?: string;
}): string | null {
  if (data.heroImage) return data.heroImage;
  if (data.heroVideoId)
    return `https://img.youtube.com/vi/${data.heroVideoId}/maxresdefault.jpg`;
  return null;
}
