function execute(url, page) {
    if (!page) page = 1;
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    // Thêm User-Agent để tránh bị chặn bởi tường lửa đơn giản
    let res = fetch(fullUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    });

    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // DANH SÁCH CÁC LOẠI KHUNG CHỨA (CONTAINER)
        // Code sẽ thử tìm theo thứ tự ưu tiên: 
        // 1. List group (dạng danh sách dọc)
        // 2. Row (dạng lưới)
        // 3. Các thẻ div có class chứa chữ "col-" (cột)
        // 4. Nếu không tìm thấy gì, lấy tất cả thẻ <li> hoặc <tr>
        
        let elements = doc.select(".list-group-item, .row .col-md-3, .row .col-xs-6, .item-truyen, .col-truyen-main div");
        
        // Fallback: Nếu selector trên không ra gì, quét thẻ a trực tiếp (chấp nhận rác rồi lọc sau)
        if (elements.size() === 0) {
            elements = doc.select("a");
        }

        for (let i = 0; i < elements.size(); i++) {
            let el = elements.get(i);
            
            // Tìm thẻ A (Link) trong khung
            let linkEl = el.tagName() === "a" ? el : el.select("a").first();
            
            // Tìm thẻ IMG (Ảnh) trong khung
            let imgEl = el.select("img").first();

            if (linkEl) {
                let link = linkEl.attr("href");
                let name = linkEl.text().trim();
                
                // Nếu tên trong thẻ a rỗng, thử tìm trong title attribute hoặc ảnh
                if (!name) name = linkEl.attr("title");
                if (!name && imgEl) name = imgEl.attr("alt");
                
                // Lấy ảnh: Nếu không có ảnh thật, dùng ảnh mặc định của vbook
                let cover = "https://i.imgur.com/1upCXI1.png"; // Ảnh default
                if (imgEl) {
                    let src = imgEl.attr("data-src") || imgEl.attr("src");
                    if (src) cover = src;
                }

                // --- BỘ LỌC DỮ LIỆU ---
                if (isValidStory(link, name)) {
                    data.push({
                        name: name,
                        link: fixUrl(link),
                        cover: fixUrl(cover),
                        description: el.text().replace(name, "").trim() || "TVTruyen",
                        host: "https://www.tvtruyen.com"
                    });
                }
            }
            if (data.length >= 30) break;
        }
        
        return Response.success(data);
    }
    return null;
}

function isValidStory(link, name) {
    if (!link || !name) return false;
    if (link.length < 5 || link.includes("javascript:")) return false;
    
    // Loại bỏ các link không phải truyện
    if (link.includes("/the-loai/") || 
        link.includes("/tac-gia/") || 
        link.includes("dang-nhap") || 
        link.includes("dang-ky")) {
        return false;
    }
    
    // Loại bỏ các tên hệ thống
    let badNames = ["trang chủ", "thể loại", "tìm kiếm", "liên hệ", "đọc ngay", "xem thêm"];
    if (badNames.includes(name.toLowerCase())) return false;

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