/**
 * Tìm kiếm truyện
 */
async function search(keyword, page) {
  const searchUrl = `https://www.tvtruyen.com/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page || 1}`;
  const res = await fetch(searchUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  const items = [];

  // Lấy kết quả tìm kiếm
  $('.search-result .story-item, .story-list .item, .list-stories .story').each((i, elem) => {
    const story = $(elem);
    const title = story.find('.title, .story-title, h3 a').text().trim();
    const link = story.find('a').attr('href');
    const cover = story.find('img').attr('src') || story.find('img').attr('data-src');
    const description = story.find('.description, .summary, .chapter').text().trim();
    
    if (title && link) {
      items.push({
        name: title,
        link: link.startsWith('http') ? link : `https://www.tvtruyen.com${link}`,
        cover: cover ? (cover.startsWith('http') ? cover : `https://www.tvtruyen.com${cover}`) : '',
        description: description || 'TVTruyen',
        host: 'https://www.tvtruyen.com'
      });
    }
  });

  // Kiểm tra có trang tiếp theo không
  const hasNext = $('.pagination .next:not(.disabled), .next-page:not(.disabled)').length > 0;

  return JSON.stringify({
    success: true,
    data: {
      items: items,
      hasNext: hasNext,
      currentPage: page || 1,
      keyword: keyword
    }
  });
}