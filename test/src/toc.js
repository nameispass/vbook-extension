function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Quét link chương
        let links = doc.select("#list-chapter a, .list-chapter a, .list-chapters a, a");
        
        for (let i = 0; i < links.size(); i++) {
            let link = links.get(i);
            let href = link.attr("href");
            let text = link.text().trim();
            
            if (href && text) {
                // Lọc chỉ lấy link chương
                if (text.toLowerCase().includes("chương") || href.includes("chuong-")) {
                     data.push({
                        name: text,
                        url: fixUrl(href),
                        host: "https://www.tvtruyen.com"
                    });
                }
            }
        }
        
        // Sắp xếp lại chương (Nếu cần)
        if (data.length > 0) {
             // Đảo ngược nếu chương mới nhất nằm trên cùng
             // Logic: Kiểm tra số chương đầu và cuối
             let first = extractNum(data[0].name);
             let last = extractNum(data[data.length-1].name);
             if (first > last && last > 0) data.reverse();
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