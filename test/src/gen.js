function execute(url, page) {
    if (!page) page = 1;
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    let res = fetch(fullUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Tìm vùng chứa truyện
        let items = doc.select(".list-truyen .row > div, .col-truyen-main .row > div, .list-group-item, .item-truyen");
        
        // Fallback mạnh: Nếu không tìm thấy class, tìm mọi thẻ A có ảnh
        if (items.size() === 0) {
            items = doc.select("a:has(img)");
        }

        for (let i = 0; i < items.size(); i++) {
            let item = items.get(i);
            
            let linkEl = item.select("a").first();
            // Nếu item chính là thẻ a
            if (!linkEl && item.tagName() === "a") linkEl = item;
            
            let imgEl = item.select("img").first();

            if (linkEl) {
                let href = linkEl.attr("href");
                let title = linkEl.text().trim();
                
                // Fallback tên
                if (!title) title = linkEl.attr("title");
                if (!title && imgEl) title = imgEl.attr("alt");

                // Lấy ảnh
                let cover = "https://i.imgur.com/1upCXI1.png";
                if (imgEl) {
                    cover = imgEl.attr("data-src") || imgEl.attr("src");
                }

                if (isValid(href, title)) {
                    data.push({
                        name: title,
                        link: fixUrl(href),
                        cover: fixUrl(cover),
                        description: item.select(".author").text().trim() || "TVTruyen",
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
    // Bỏ link rác
    if (href.length < 5 || href.includes("javascript")) return false;
    if (href.includes("/the-loai/") || href.includes("/tac-gia/") || href.includes("/tim-kiem")) return false;
    
    // --- BỘ LỌC QUAN TRỌNG (FIX LỖI LOGO) ---
    // Loại bỏ các tiêu đề là tên trang web
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