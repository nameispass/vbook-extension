function execute(url) {
    console.log('TVTruyen chap.js - URL:', url);
    
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        
        // Tìm nội dung chapter
        let content = '';
        const contentSelectors = [
            '.chapter-content',
            '.chapter-c',
            '.content-chap',
            '.chapter-detail',
            '.ndchapter',
            '#chapter-content',
            '.content',
            '.entry-content',
            'article'
        ];
        
        for (let selector of contentSelectors) {
            let elem = doc.select(selector).first();
            if (elem) {
                content = elem.html();
                break;
            }
        }
        
        if (content) {
            // Làm sạch nội dung
            content = cleanHtml(content);
            
            // Tìm chapter tiếp theo và trước đó
            let next = findChapterLink(doc, ['Tiếp', 'Next', 'Sau', '›']);
            let prev = findChapterLink(doc, ['Trước', 'Prev', 'Back', '‹']);
            
            return Response.success({
                content: content,
                next: next,
                prev: prev,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    return null;
}

// Hàm làm sạch HTML
function cleanHtml(html) {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<ins\b[^<]*(?:(?!<\/ins>)<[^<]*)*<\/ins>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<div[^>]*class="[^"]*ads[^"]*"[^>]*>.*?<\/div>/gi, '')
        .replace(/<a[^>]*href="[^"]*ads[^"]*"[^>]*>.*?<\/a>/gi, '')
        .replace(/\n/g, '')
        .replace(/(<br\s*\/?>\s*){2,}/g, '<br>')
        .replace(/style="[^"]*"/gi, '')
        .replace(/class="[^"]*"/gi, '')
        .replace(/<img/gi, '<img style="max-width:100%;height:auto;display:block;margin:10px auto;"');
}

// Hàm tìm link chapter
function findChapterLink(doc, keywords) {
    let links = doc.select('a');
    for (let i = 0; i < links.size(); i++) {
        let link = links.get(i);
        let text = link.text().trim().toLowerCase();
        let href = link.attr('href');
        
        if (href && keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
            return href.startsWith('http') ? href : 'https://www.tvtruyen.com' + href;
        }
    }
    return null;
}