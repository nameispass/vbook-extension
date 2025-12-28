function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        
        // Tìm nội dung - cách đơn giản không dùng .exists()
        let content = "";
        let selectors = [".chapter-content", ".content-chap", ".ndchapter", ".content", "article", "div"];
        
        for (let selector of selectors) {
            let elems = doc.select(selector);
            if (elems.size() > 0) {
                // Chọn phần tử có nhiều text nhất
                for (let i = 0; i < elems.size(); i++) {
                    let elem = elems.get(i);
                    let elemHtml = elem.html();
                    if (elemHtml && elemHtml.length > 500) {
                        content = elemHtml;
                        break;
                    }
                }
                if (content) break;
            }
        }
        
        if (!content || content.length < 100) {
            content = "<p>Đang tải nội dung từ TVTruyen...</p>";
        }
        
        // Làm sạch
        content = cleanHtml(content);
        
        return Response.success({
            content: content,
            next: null,
            prev: null,
            host: "https://www.tvtruyen.com"
        });
    }
    return null;
}

function cleanHtml(html) {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<ins\b[^<]*(?:(?!<\/ins>)<[^<]*)*<\/ins>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<div[^>]*class="[^"]*ads[^"]*"[^>]*>.*?<\/div>/gi, '')
        .replace(/<a[^>]*href="[^"]*ads[^"]*"[^>]*>.*?<\/a>/gi, '')
        .replace(/\n/g, '')
        .replace(/(<br\s*\/?>\s*){2,}/g, '<br>');
}