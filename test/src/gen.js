function execute(url, page) {
    if (!page) page = 1;
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    // GIẢ DANH GOOGLE BOT (Thường ít bị chặn hơn)
    let res = fetch(fullUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        
        if (!doc) {
             return Response.success([{
                name: "Lỗi: Doc Null",
                link: "error",
                cover: "https://i.imgur.com/1upCXI1.png",
                description: "Không đọc được dữ liệu trang web.",
                host: "https://www.tvtruyen.com"
            }]);
        }

        let data = [];
        
        // --- CHIẾN THUẬT VÉT CẠN (Lấy tất cả thẻ A) ---
        // Không tìm theo class nữa, lấy tất cả link trên trang
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

            // --- BỘ LỌC CỰC KỲ ĐƠN GIẢN ---
            // Chỉ cần link có chứa .html và KHÔNG phải link rác
            if (href && href.includes(".html")) {
                // Loại bỏ link hệ thống
                if (!href.includes("/the-loai/") && 
                    !href.includes("/tac-gia/") && 
                    !href.includes("tim-kiem") && 
                    !href.includes("dang-nhap") &&
                    !href.includes("account")) {
                    
                     // Loại bỏ tên rác
                     let t = title ? title.toLowerCase() : "";
                     if (!t.includes("trang chủ") && !t.includes("liên hệ") && !t.includes("truyentv")) {
                         
                         data.push({
                            name: title || "Truyện (Không tên)",
                            link: fixUrl(href),
                            cover: fixUrl(cover),
                            description: "TVTruyen",
                            host: "https://www.tvtruyen.com"
                        });
                     }
                }
            }
            if (data.length >= 40) break;
        }

        // --- DEBUG: HIỆN TIÊU ĐỀ TRANG NẾU KHÔNG CÓ TRUYỆN ---
        // Giúp xác định xem web đang trả về cái gì (VD: "Just a moment..." là bị Cloudflare chặn)
        if (data.length === 0) {
            let pageTitle = doc.select("title").text();
            let pageBody = doc.body().text().substring(0, 100); // Lấy 100 ký tự đầu của trang
            
            return Response.success([{
                name: "Không tìm thấy truyện",
                link: "error",
                cover: "https://i.imgur.com/1upCXI1.png",
                description: "Tiêu đề trang nhận được: " + pageTitle + ". Nội dung đầu: " + pageBody,
                host: "https://www.tvtruyen.com"
            }]);
        }

        return Response.success(data);
    }
    
    return Response.success([{
        name: "Lỗi kết nối",
        link: "error",
        cover: "https://i.imgur.com/1upCXI1.png",
        description: "Mã lỗi: " + res.code, // Hiện mã lỗi HTTP (403, 404, 500...)
        host: "https://www.tvtruyen.com"
    }]);
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