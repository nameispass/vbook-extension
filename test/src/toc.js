/**
 * Lấy danh sách chapter (mục lục)
 */
async function toc(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const chapters = [];

  // Tìm danh sách chapter theo các selector phổ biến
  const chapterList = $('.chapter-list, .list-chapter, #chapter-list, .chapters');
  
  if (chapterList.length > 0) {
    chapterList.find('li, .chapter-item, a').each((i, elem) => {
      const chapter = $(elem);
      const chapterLink = chapter.find('a').attr('href') || chapter.attr('href');
      const chapterName = chapter.find('a').text().trim() || chapter.text().trim();
      
      if (chapterLink && chapterName) {
        // Extract chapter number
        let chapterNum = 1;
        const match = chapterName.match(/Chương\s*(\d+)/i) || chapterLink.match(/chuong-(\d+)/i);
        if (match) {
          chapterNum = parseInt(match[1]);
        } else {
          chapterNum = i + 1;
        }

        chapters.push({
          name: chapterName,
          link: chapterLink.startsWith('http') ? chapterLink : `https://www.tvtruyen.com${chapterLink}`,
          chapter: chapterNum,
          update_time: '', // Có thể lấy từ thuộc tính data-time nếu có
          host: 'https://www.tvtruyen.com'
        });
      }
    });
  } else {
    // Fallback: tìm tất cả link có chứa "chuong"
    $('a[href*="chuong"]').each((i, elem) => {
      const chapter = $(elem);
      const chapterLink = chapter.attr('href');
      const chapterName = chapter.text().trim();
      
      if (chapterLink && chapterName && chapterName.toLowerCase().includes('chương')) {
        chapters.push({
          name: chapterName,
          link: chapterLink.startsWith('http') ? chapterLink : `https://www.tvtruyen.com${chapterLink}`,
          chapter: i + 1,
          update_time: '',
          host: 'https://www.tvtruyen.com'
        });
      }
    });
  }

  // Sắp xếp chapter theo số thứ tự (từ mới đến cũ)
  chapters.sort((a, b) => b.chapter - a.chapter);

  return JSON.stringify({
    success: true,
    data: chapters
  });
}