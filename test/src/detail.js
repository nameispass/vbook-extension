/**
 * Chi tiết thông tin truyện
 */
async function detail(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Lấy thông tin cơ bản
  const title = $('h1.title, .story-title, h1').first().text().trim();
  const cover = $('.story-cover img, .cover img, .thumbnail img').attr('src') || 
                $('img[src*="cover"], img[alt*="cover"]').attr('src');

  // Lấy mô tả
  let description = $('.story-description, .description, .summary, .content').text().trim();
  if (!description) {
    description = $('.detail-content p, .info-desc').text().trim();
  }

  // Lấy thông tin chi tiết
  const info = {};
  $('.story-info .info-item, .info-list li, .detail-info span').each((i, elem) => {
    const text = $(elem).text().trim();
    if (text.includes('Tác giả:')) info.author = text.replace('Tác giả:', '').trim();
    if (text.includes('Tình trạng:')) info.status = text.replace('Tình trạng:', '').trim();
    if (text.includes('Thể loại:')) info.genre = text.replace('Thể loại:', '').trim();
  });

  // Lấy danh sách thể loại
  const genres = [];
  $('.genres a, .tags a, .category a').each((i, elem) => {
    genres.push($(elem).text().trim());
  });

  // Lấy chapter mới nhất
  const latestChapter = $('.last-chapter a, .new-chap a, .chapter-list .chapter-item:first-child').text().trim();

  return JSON.stringify({
    success: true,
    data: {
      title: title,
      cover: cover ? (cover.startsWith('http') ? cover : `https://www.tvtruyen.com${cover}`) : '',
      author: info.author || 'Đang cập nhật',
      status: info.status || 'Đang tiến hành',
      description: description || 'Chưa có mô tả',
      genres: genres.length > 0 ? genres : [info.genre || 'Truyện tranh'],
      chapters: [],
      latestChapter: latestChapter || 'Chương 1',
      url: url
    }
  });
}