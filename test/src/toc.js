function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Tìm chapters
        let links = doc.select("a[href*='chuong'], a[href*='chapter'], a[href*='chap']");
        
        if (links.size() === 0) {
            // Tìm link có text "Chương"
            links = doc.select("a").filter(e => e.text().includes("Chương"));
        }
        
        links.each((i, link) => {
            let href = link.attr("href");
            let text = link.text().trim();
            if (href && text) {
                data.push({
                    name: text,
                    url: fixUrl(href),
                    host: "https://www.tvtruyen.com"
                });
            }
        });
        
        return Response.success(data);
    }
    return null;
}

function fixUrl(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}