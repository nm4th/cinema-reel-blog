import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  return rss({
    title: 'CINEMA REEL 新宿 ブログ',
    description:
      '新宿駅徒歩2分のレンタルシアター CINEMA REEL 新宿 公式ブログ。プライベートシネマの楽しみ方、推し活上映会、デート、誕生日サプライズなど。',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: '<language>ja-jp</language>',
  });
}
