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
        let links = doc.select("a");
        
        for (let i = 0; i < links.size(); i++) {
            let link = links.get(i);
            let text = link.text().trim();
            let href = link.attr("href");
            
            if (text && href) {
                if (!text.match(/^(Chương|Chap|Chapter|Hồi)\s*\d+/i)) continue;
                if (text.includes("Dưới") || text.includes("Trên")) continue;

                data.push({
                    name: text,
                    url: fixUrl(href),
                    host: "https://www.tvtruyen.com"
                });
            }
        }
        
        if (data.length > 0) {
            data.sort((a, b) => extractNum(a.name) - extractNum(b.name));
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