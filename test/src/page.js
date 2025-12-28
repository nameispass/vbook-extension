/**
 * Xử lý phân trang
 */
async function page(url, page) {
  // Thêm số trang vào URL nếu cần
  let pageUrl = url;
  if (page > 1) {
    if (url.includes('?')) {
      pageUrl = `${url}&page=${page}`;
    } else {
      pageUrl = `${url}?page=${page}`;
    }
  }

  const res = await fetch(pageUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  const items = [];

  // Logic tương tự home.js
  $('.list-stories .story-item, .story-list .item').each((i, elem) => {
    const story = $(elem);
    const title = story.find('.title, .story-title, h3 a').text().trim();
    const link = story.find('a').attr('href');
    const cover = story.find('img').attr('src');
    const update = story.find('.chapter-text, .last-chapter').text().trim();
    
    if (title && link) {
      items.push({
        name: title,
        link: link.startsWith('http') ? link : `https://www.tvtruyen.com${link}`,
        cover: cover ? (cover.startsWith('http') ? cover : `https://www.tvtruyen.com${cover}`) : '',
        description: update || 'TVTruyen',
        host: 'https://www.tvtruyen.com'
      });
    }
  });

  const hasNext = $('.pagination .next:not(.disabled)').length > 0;

  return JSON.stringify({
    success: true,
    data: {
      items: items,
      hasNext: hasNext,
      currentPage: page || 1
    }
  });
}