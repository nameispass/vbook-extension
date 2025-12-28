/**
 * Lấy danh sách truyện theo thể loại
 */
async function genre(genreId, page) {
  // TVTruyen có thể có trang thể loại hoặc không
  // Giả sử URL có dạng: https://www.tvtruyen.com/the-loai/{genreId}?page={page}
  const genreUrl = `https://www.tvtruyen.com/the-loai/${genreId}?page=${page || 1}`;
  
  try {
    const res = await fetch(genreUrl);
    const html = await res.text();
    const $ = cheerio.load(html);

    const items = [];

    $('.genre-list .story-item, .list-stories .story, .grid-stories .item').each((i, elem) => {
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
        currentPage: page || 1,
        genre: genreId
      }
    });
  } catch (error) {
    // Nếu không có trang thể loại, trả về danh sách rỗng
    return JSON.stringify({
      success: true,
      data: {
        items: [],
        hasNext: false,
        currentPage: 1,
        genre: genreId
      }
    });
  }
}