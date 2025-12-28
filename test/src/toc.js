function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        
        // Tìm danh sách chapter
        const chapterSelectors = [
            '.list-chapter a',
            '.chapter-list a', 
            '.chapters a',
            '#list-chapter a',
            'a[href*="/chuong-"]',
            'a[href*="/chap-"]',
            'a[href*="/chapter-"]'
        ];
        
        let el = null;
        for (let selector of chapterSelectors) {
            el = doc.select(selector);
            if (el.size() > 0) {
                break;
            }
        }
        
        const data = [];
        
        if (el && el.size() > 0) {
            el.forEach(e => {
                let chapterUrl = e.attr('href');
                let chapterName = e.text().trim();
                
                if (chapterUrl && chapterName) {
                    data.push({
                        name: chapterName,
                        url: chapterUrl.startsWith('http') ? chapterUrl : 'https://www.tvtruyen.com' + chapterUrl,
                        host: "https://www.tvtruyen.com"
                    });
                }
            });
        } else {
            // Fallback: tìm tất cả link có chứa số (có thể là chapter)
            doc.select('a').forEach(e => {
                let href = e.attr('href');
                let text = e.text().trim();
                
                if (href && text && (text.includes('Chương') || text.match(/Chap\.?\s*\d+/i))) {
                    data.push({
                        name: text,
                        url: href.startsWith('http') ? href : 'https://www.tvtruyen.com' + href,
                        host: "https://www.tvtruyen.com"
                    });
                }
            });
        }
        
        // Sắp xếp theo thứ tự (chapter 1 -> chapter n)
        data.sort((a, b) => {
            let numA = extractChapterNumber(a.name);
            let numB = extractChapterNumber(b.name);
            return numA - numB;
        });
        
        return Response.success(data);
    }
    
    return null;
}

// Hàm helper để trích xuất số chapter
function extractChapterNumber(text) {
    let match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}