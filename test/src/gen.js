function execute(url, page) {
    if (!page) page = 1;
    
    // Tạo URL phân trang chuẩn
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
        
        // Chọn vùng danh sách: Hỗ trợ cả dạng Grid (row) và List (list-group)
        let items = doc.select(".list-truyen .row > div, .col-truyen-main .row > div, .list-group-item");
        
        // Fallback: Nếu không tìm thấy vùng trên, quét tất cả thẻ A có chứa Ảnh
        if (items.size() === 0) {
            items = doc.select("a:has(img)");
        }

        for (let i = 0; i < items.size(); i++) {
            let item = items.get(i);
            
            // Tìm Link và Ảnh
            let linkEl = item.select("h3 a, .title a, a").first();
            // Nếu item chính là thẻ a (trường hợp fallback)
            if (!linkEl && item.tagName() === "a") linkEl = item;
            
            let imgEl = item.select("img").first();

            if (linkEl) {
                let href = linkEl.attr("href");
                let title = linkEl.text().trim();
                
                // Fallback lấy tên từ title hoặc alt ảnh
                if (!title) title = linkEl.attr("title");
                if (!title && imgEl) title = imgEl.attr("alt");

                // Lấy ảnh: Ưu tiên data-src (lazyload)
                let cover = "https://i.imgur.com/1upCXI1.png";
                if (imgEl) {
                    cover = imgEl.attr("data-src") || imgEl.attr("src");
                }

                if (isValid(href, title)) {
                    data.push({
                        name: title,
                        link: fixUrl(href),
                        cover: fixUrl(cover),
                        description: item.select(".author, .chapter-text, .text-muted").text().trim() || "TVTruyen",
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
    
    // Loại bỏ các link không phải truyện
    if (href.includes("/the-loai/") || href.includes("/tac-gia/") || href.includes("/tim-kiem")) return false;
    
    // Loại bỏ các link hệ thống
    let bad = ["trang chủ", "liên hệ", "đăng nhập", "đăng ký", "xem thêm"];
    if (bad.includes(title.toLowerCase())) return false;
    
    // Loại bỏ link chương nếu lỡ quét nhầm
    if (title.toLowerCase().startsWith("chương")) return false;

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