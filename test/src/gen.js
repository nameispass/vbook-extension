function execute(url, page) {
    if (!page) page = 1;
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    // Giữ GoogleBot vì nó đang hoạt động tốt cho List
    let res = fetch(fullUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        let allLinks = doc.select("a");

        for (let i = 0; i < allLinks.size(); i++) {
            let linkEl = allLinks.get(i);
            let href = linkEl.attr("href");
            let title = linkEl.text().trim();
            let imgEl = linkEl.select("img").first();

            // Fallback tên
            if (!title) title = linkEl.attr("title");
            if (!title && imgEl) title = imgEl.attr("alt");

            // Lấy ảnh
            let cover = "https://i.imgur.com/1upCXI1.png";
            if (imgEl) cover = imgEl.attr("data-src") || imgEl.attr("src");

            if (isValid(href, title)) {
                data.push({
                    name: title,
                    link: fixUrl(href),
                    cover: fixUrl(cover),
                    description: "TVTruyen",
                    host: "https://www.tvtruyen.com"
                });
            }
            // ĐÃ BỎ GIỚI HẠN SỐ LƯỢNG ĐỂ LOAD HẾT TRANG
        }
        return Response.success(data);
    }
    return null;
}

function isValid(href, title) {
    if (!href || !title) return false;
    if (!href.includes(".html")) return false;
    if (href.length < 10) return false;
    
    let t = title.toLowerCase();
    if (t.includes("truyentv") || t.includes("đọc truyện") || t.includes("liên hệ") || t.includes("trang chủ")) return false;
    if (href.includes("/the-loai/") || href.includes("/tac-gia/") || href.includes("account")) return false;

    return true;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}