function execute(url, page) {
    if (!page) page = 1;
    // Đảm bảo URL có phân trang
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    // THÊM HEADERS GIẢ LẬP TRÌNH DUYỆT (Quan trọng để tránh bị chặn)
    let res = fetch(fullUrl, {
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        let data = [];
        let checkSet = new Set(); // Dùng để loại bỏ truyện trùng lặp
        
        // CHIẾN THUẬT: LẤY TOÀN BỘ THẺ A TRÊN TRANG
        let links = doc.select("a");

        for (let i = 0; i < links.size(); i++) {
            let linkEl = links.get(i);
            let href = linkEl.attr("href");
            let title = linkEl.text().trim();
            
            // Xử lý lấy ảnh
            let imgEl = linkEl.select("img").first();
            let cover = "https://i.imgur.com/1upCXI1.png"; // Ảnh mặc định nếu không tìm thấy
            
            // Nếu thẻ A có chứa ảnh bên trong
            if (imgEl) {
                let src = imgEl.attr("data-src") || imgEl.attr("src");
                if (src) cover = src;
                
                // Nếu title đang rỗng, lấy từ alt của ảnh hoặc title của thẻ A
                if (!title) title = imgEl.attr("alt") || linkEl.attr("title");
            }

            // --- BỘ LỌC DỮ LIỆU (Logic quyết định) ---
            if (href && href.length > 10 && !checkSet.has(href)) {
                
                // 1. Phải là file .html (đặc trưng của tvtruyen)
                if (href.includes(".html")) {
                    
                    // 2. LOẠI BỎ LINK RÁC (Chương, Thể loại, Tìm kiếm...)
                    if (!href.includes("/chuong-") &&  // Bỏ link chương
                        !href.includes("/the-loai/") && // Bỏ link thể loại
                        !href.includes("/tac-gia/") &&  // Bỏ link tác giả
                        !href.includes("tim-kiem") &&
                        !href.includes("page=") &&      // Bỏ link phân trang
                        !title.includes("Chương") &&    // Bỏ text "Chương..."
                        !title.match(/^Trang \d+$/)     // Bỏ text "Trang 1, 2..."
                       ) {
                        
                        // Nếu tiêu đề hợp lệ (dài hơn 2 ký tự và không phải tên hệ thống)
                        if (title && title.length > 2 && 
                            !title.match(/^(Đọc|Xem|Trang chủ|Thể loại|Full|Hot|Mới)$/i)) {
                            
                            data.push({
                                name: title,
                                link: fixUrl(href),
                                cover: fixUrl(cover),
                                description: "TVTruyen",
                                host: "https://www.tvtruyen.com"
                            });
                            
                            checkSet.add(href); // Đánh dấu đã lấy link này
                        }
                    }
                }
            }
            // Giới hạn 40 truyện để extension chạy mượt
            if (data.length >= 40) break;
        }
        
        return Response.success(data);
    }
    return null;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    
    // Xử lý ảnh nằm trong css background url(...)
    if (url.includes("url(")) {
        let match = url.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (match) return match[1];
    }
    
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}