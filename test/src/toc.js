function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Tìm chapters - cách đơn giản
        let links = doc.select("a");
        
        for (let i = 0; i < links.size(); i++) {
            let link = links.get(i);
            let href = link.attr("href");
            let text = link.text().trim();
            
            // Lọc chapter
            if (href && text && 
                (href.includes("chuong") || href.includes("chapter") || 
                 text.includes("Chương") || text.match(/Chap\.?\s*\d+/i))) {
                
                data.push({
                    name: text,
                    url: fixUrl(href),
                    host: "https://www.tvtruyen.com"
                });
            }
        }
        
        // Sắp xếp nếu có số chapter
        if (data.length > 0) {
            data.sort((a, b) => {
                let numA = extractChapterNumber(a.name);
                let numB = extractChapterNumber(b.name);
                return numA - numB;
            });
        }
        
        return Response.success(data);
    }
    return null;
}

function extractChapterNumber(text) {
    let match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

function fixUrl(url) {
    if (!url || url.trim() === "") return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}