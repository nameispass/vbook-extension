/**
 * Lấy nội dung chapter
 */
async function chap(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Lấy tiêu đề chapter
  const title = $('h1.chapter-title, .title-chapter, h1.title').text().trim() || 
                $('title').text().split('-')[0].trim();

  // Lấy nội dung chính
  let content = '';

  // Thử các selector phổ biến cho nội dung truyện tranh
  const contentSelectors = [
    '.chapter-content',
    '.chapter-c',
    '.box-chap',
    '.content-chap',
    '#chapter-content',
    '.chapter-detail',
    '.ndchapter',
    '.chapter-text',
    '.content'
  ];

  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.html();
      break;
    }
  }

  // Nếu không tìm thấy, thử lấy tất cả ảnh trong trang
  if (!content) {
    const images = [];
    $('img').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && (src.includes('truyen') || src.includes('chapter') || src.includes('chuong'))) {
        images.push(`<img src="${src.startsWith('http') ? src : `https://www.tvtruyen.com${src}`}">`);
      }
    });
    content = images.join('<br>');
  }

  // Làm sạch nội dung
  content = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<ins[^>]*>.*?<\/ins>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/class="[^"]*"/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');

  // Lấy chapter tiếp theo và trước đó
  const nextChapter = $('a.next-chapter, .next, .btn-next, a:contains("Chương sau")').attr('href');
  const prevChapter = $('a.prev-chapter, .prev, .btn-prev, a:contains("Chương trước")').attr('href');

  return JSON.stringify({
    success: true,
    data: {
      title: title,
      content: content,
      next: nextChapter ? 
        (nextChapter.startsWith('http') ? nextChapter : `https://www.tvtruyen.com${nextChapter}`) : 
        null,
      prev: prevChapter ? 
        (prevChapter.startsWith('http') ? prevChapter : `https://www.tvtruyen.com${prevChapter}`) : 
        null,
      url: url
    }
  });
}