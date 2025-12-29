function execute(url, page) {
    if (!page) page = 1;
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    let res = fetch(fullUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Mobile Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        
        // --- FIX LỖI CRASH (IMAGE 1) ---
        // Nếu doc bị null (do web lỗi), dừng ngay lập tức
        if (!doc) return Response.success([]);

        let data = [];
        let items = doc.select(".list-truyen .row > div, .col-truyen-main .row > div, .list-group-item");
        
        if (items.size() === 0) items = doc.select("a:has(img)");

        for (let i = 0; i < items.size(); i++) {
            let item = items.get(i);
            
            let linkEl = item.select("a").first();
            if (!linkEl && item.tagName() === "a") linkEl = item;
            let imgEl = item.select("img").first();

            if (linkEl) {
                let href = linkEl.attr("href");
                let title = linkEl.text().trim();
                
                if (!title) title = linkEl.attr("title") || (imgEl ? imgEl.attr("alt") : "");
                
                let cover = "https://i.imgur.com/1upCXI1.png";
                if (imgEl) cover = imgEl.attr("data-src") || imgEl.attr("src");

                // --- BỘ LỌC RÁC (FIX LỖI IMAGE 7) ---
                if (isValid(href, title)) {
                    data.push({
                        name: title,
                        link: fixUrl(href),
                        cover: fixUrl(cover),
                        description: "TVTruyen",
                        host: "https://www.tvtruyen.com"
                    });
                }
            }
        }
        return Response.success(data);
    }
    return null;
}

function isValid(href, title) {
    if (!href || !title) return false;
    if (href.length < 5 || href.includes("javascript")) return false;
    // Bỏ các link danh mục
    if (href.includes("/the-loai/") || href.includes("/tac-gia/") || href.includes("/tim-kiem")) return false;
    
    // Bỏ Item rác là tên trang web
    let t = title.toLowerCase();
    if (t.includes("truyentv") || t.includes("đọc truyện chữ") || t.includes("tiểu thuyết online")) return false;
    if (t.includes("trang chủ") || t.includes("liên hệ")) return false;
    
    return true;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.includes("url(")) {
        let match = url.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (match) return match[1];
    }
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}