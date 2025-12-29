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
        
        // --- CHỐNG LỖI CRASH (NULL DOC) ---
        if (!doc) {
            return Response.success([{
                name: "Lỗi kết nối (Doc null)",
                link: "error",
                cover: "https://i.imgur.com/1upCXI1.png",
                description: "Không tải được trang web. Vui lòng thử lại.",
                host: "https://www.tvtruyen.com"
            }]);
        }

        let data = [];
        
        // --- CHIẾN THUẬT 1: QUÉT THEO CẤU TRÚC CHUẨN ---
        let items = doc.select(".list-truyen .row > div, .col-truyen-main .row > div, .list-group-item");
        
        // --- CHIẾN THUẬT 2: QUÉT LỎNG (FALLBACK) ---
        // Nếu chiến thuật 1 không ra gì, quét TẤT CẢ thẻ a có chứa ảnh
        if (items.size() === 0) {
            items = doc.select("a:has(img)");
        }

        // --- CHIẾN THUẬT 3: QUÉT SIÊU LỎNG (DESPERATE MODE) ---
        // Nếu vẫn không có gì, quét tất cả link .html (chấp nhận rác, lọc sau)
        if (items.size() === 0) {
            items = doc.select("a[href*='.html']");
        }

        for (let i = 0; i < items.size(); i++) {
            let item = items.get(i);
            
            let linkEl = item.select("a").first();
            if (!linkEl && item.tagName() === "a") linkEl = item; // Nếu chính item là thẻ a
            
            let imgEl = item.select("img").first();

            if (linkEl) {
                let href = linkEl.attr("href");
                let title = linkEl.text().trim();
                
                // Cố gắng tìm tên từ các thuộc tính khác
                if (!title) title = linkEl.attr("title");
                if (!title && imgEl) title = imgEl.attr("alt");

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
            }
            // Giới hạn 40 truyện để tránh lag
            if (data.length >= 40) break;
        }

        // --- DEBUG: NẾU VẪN TRỐNG, HIỆN THÔNG BÁO ---
        if (data.length === 0) {
             return Response.success([{
                name: "Không tìm thấy truyện nào",
                link: "error",
                cover: "https://i.imgur.com/1upCXI1.png",
                description: "Code đã chạy nhưng không khớp selector nào.",
                host: "https://www.tvtruyen.com"
            }]);
        }

        return Response.success(data);
    }
    
    return null;
}

function isValid(href, title) {
    if (!href || !title) return false;
    if (href.length < 5 || href.includes("javascript")) return false;
    // Bỏ link không phải truyện
    if (href.includes("/the-loai/") || href.includes("/tac-gia/") || href.includes("/tim-kiem")) return false;
    
    let t = title.toLowerCase();
    // Bỏ logo/trang chủ
    if (t.includes("truyentv") || t.includes("đọc truyện chữ") || t.includes("tiểu thuyết online")) return false;
    if (t.includes("trang chủ") || t.includes("liên hệ") || t.includes("giới thiệu")) return false;
    
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