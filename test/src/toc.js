function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
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
            let href = link.attr("href");
            let text = link.text().trim();
            
            if (href && text) {
                // --- BỘ LỌC LINK RÁC ---
                // 1. Phải có số trong tên
                if (!text.match(/\d+/)) continue;
                
                // 2. Loại bỏ các dòng filter (Dưới..., Trên..., Mới nhất...)
                let t = text.toLowerCase();
                if (t.includes("dưới") || t.includes("trên") || t.includes("từ") || t.includes("đọc tiếp")) continue;
                if (t.includes("mới nhất") || t.includes("cũ nhất")) continue;

                // 3. Chỉ lấy link có từ khóa chương/chap (an toàn nhất)
                if (t.includes("chương") || t.includes("chap") || t.includes("hồi")) {
                    data.push({
                        name: text,
                        url: fixUrl(href),
                        host: "https://www.tvtruyen.com"
                    });
                }
            }
        }
        
        // --- SẮP XẾP SỐ HỌC (FIX LỖI THỨ TỰ) ---
        if (data.length > 0) {
            data.sort((a, b) => {
                let numA = extractNum(a.name);
                let numB = extractNum(b.name);
                return numA - numB;
            });
            
            // Lọc trùng lặp
            let unique = [];
            let seen = new Set();
            for(let item of data) {
                if(!seen.has(item.url)) {
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
    return match ? parseInt(match[1]) : 0;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}