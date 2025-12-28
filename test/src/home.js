/**
 * Trang chủ TVTruyen
 * Lấy danh sách truyện mới cập nhật, hot, xem nhiều
 */
async function home(page) {
  const url = 'https://www.tvtruyen.com';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const items = [];

  // Lấy truyện mới cập nhật
  $('.list-stories .story-item, .story-list .item, .grid-stories .story').each((i, elem) => {
    const story = $(elem);
    const title = story.find('.title, .story-title, h3 a').text().trim();
    const link = story.find('a').attr('href');
    const cover = story.find('img').attr('src') || story.find('img').attr('data-src');
    const update = story.find('.chapter-text, .last-chapter, .chapter').text().trim();
    
    if (title && link) {
      items.push({
        name: title,
        link: link.startsWith('http') ? link : `https://www.tvtruyen.com${link}`,
        cover: cover ? (cover.startsWith('http') ? cover : `https://www.tvtruyen.com${cover}`) : '',
        description: `Chapter mới: ${update || 'Đang cập nhật'}`,
        host: 'https://www.tvtruyen.com'
      });
    }
  });

  // Nếu không lấy được theo selector trên, thử selector khác
  if (items.length === 0) {
    $('.hot-item, .new-item, .story-grid .item').each((i, elem) => {
      const story = $(elem);
      const title = story.find('a').attr('title') || story.find('img').attr('alt') || '';
      const link = story.find('a').attr('href');
      const cover = story.find('img').attr('src');
      
      if (title && link) {
        items.push({
          name: title,
          link: link.startsWith('http') ? link : `https://www.tvtruyen.com${link}`,
          cover: cover ? (cover.startsWith('http') ? cover : `https://www.tvtruyen.com${cover}`) : '',
          description: 'TVTruyen',
          host: 'https://www.tvtruyen.com'
        });
      }
    });
  }

  // Phân trang (nếu có)
  const hasNext = $('.pagination .next:not(.disabled), .next-page:not(.disabled)').length > 0;
  
  return JSON.stringify({
    success: true,
    data: {
      items: items,
      hasNext: hasNext,
      currentPage: page || 1
    }
  });
}