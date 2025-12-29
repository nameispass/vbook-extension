function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Lấy tất cả link
        let links = doc.select("a");
        
        for (let i = 0; i < links.size(); i++) {
            let link = links.get(i);
            let text = link.text().trim();
            let href = link.attr("href");
            
            if (text && href) {
                // --- BỘ LỌC NGHIÊM NGẶT ---
                // Chỉ lấy link có chữ "Chương" hoặc "Chap"
                if (!text.match(/^(Chương|Chap|Chapter|Hồi)\s*\d+/i)) continue;
                
                // Loại bỏ link rác chứa từ khóa bộ lọc
                if (text.includes("Dưới") || text.includes("Trên") || text.includes("mới")) continue;

                data.push({
                    name: text,
                    url: fixUrl(href),
                    host: "https://www.tvtruyen.com"
                });
            }
        }
        
        // --- SẮP XẾP SỐ HỌC ---
        if (data.length > 0) {
            data.sort((a, b) => {
                return extractNum(a.name) - extractNum(b.name);
            });
            
            // Lọc trùng
            let unique = [];
            let seen = new Set();
            for (let item of data) {
                if (!seen.has(item.url)) {
                    seen.add(item.url);
                    unique.push(item);
                }
            }
            return Response.success(unique);
        }

        return Response.success(data);
    }
    return null;
}

function extractNum(text) {
    let match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : -1;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}