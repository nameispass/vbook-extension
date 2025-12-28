function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        
        // Tìm nội dung
        let content = "";
        let selectors = [".chapter-content", ".content-chap", ".ndchapter", ".content", "article"];
        
        for (let selector of selectors) {
            let elem = doc.select(selector).first();
            if (elem) {
                content = elem.html();
                break;
            }
        }
        
        if (!content) {
            content = "<p>Đang tải nội dung...</p>";
        }
        
        // Làm sạch
        content = cleanHtml(content);
        
        // Tìm chapter tiếp theo/trước đó
        let next = findChapter(doc, ["Tiếp", "Next", "›"]);
        let prev = findChapter(doc, ["Trước", "Prev", "‹"]);
        
        return Response.success({
            content: content,
            next: next,
            prev: prev,
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
        .replace(/\n/g, '')
        .replace(/(<br\s*\/?>\s*){2,}/g, '<br>');
}

function findChapter(doc, keywords) {
    let links = doc.select("a");
    for (let i = 0; i < links.size(); i++) {
        let link = links.get(i);
        let text = link.text().trim().toLowerCase();
        let href = link.attr("href");
        
        if (href && keywords.some(k => text.includes(k.toLowerCase()))) {
            return fixUrl(href);
        }
    }
    return null;
}

function fixUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}