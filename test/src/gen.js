function execute(url, page) {
    if (!page) page = 1;
    // Xử lý url để thêm page
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    let res = fetch(fullUrl);
    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // CHIẾN THUẬT: QUÉT TẤT CẢ THẺ A CÓ CHỨA ẢNH
        // Tại sao? 
        // 1. Link truyện luôn có ảnh bìa đi kèm -> Lấy được Cover.
        // 2. Link sidebar (thể loại) thường chỉ là chữ -> Tự động bị loại bỏ.
        // 3. Không lo web đổi tên class (như .col-truyen-main hay .list-content).
        
        let links = doc.select("a");
        
        for (let i = 0; i < links.size(); i++) {
            let linkEl = links.get(i);
            let imgEl = linkEl.select("img").first();

            // Chỉ xử lý nếu thẻ Link này có chứa Ảnh bên trong
            if (imgEl) {
                let href = linkEl.attr("href");
                // Lấy ảnh: ưu tiên data-src (lazyload) rồi đến src
                let cover = imgEl.attr("data-src") || imgEl.attr("src");
                
                // Lấy tên: Ưu tiên alt của ảnh, hoặc title của link
                let name = imgEl.attr("alt") || linkEl.attr("title");
                
                // Nếu tên vẫn rỗng, thử tìm các thẻ tiêu đề bên trong
                if (!name || name.trim() === "") {
                    name = linkEl.select("h3, h4, .title").text().trim();
                }

                // KIỂM TRA HỢP LỆ (Bộ lọc quan trọng)
                if (isValidStory(href, name, cover)) {
                    data.push({
                        name: name.trim(),
                        link: fixUrl(href),
                        cover: fixUrl(cover),
                        description: "TVTruyen",
                        host: "https://www.tvtruyen.com"
                    });
                }
            }
            // Giới hạn số lượng để không quá tải nếu trang quá dài
            if (data.length >= 30) break;
        }
        
        return Response.success(data);
    }
    return null;
}

// Hàm lọc rác: Loại bỏ icon, banner, link thể loại, link user...
function isValidStory(href, name, cover) {
    if (!href || !name || !cover) return false;
    
    // 1. Loại bỏ các link hệ thống/javascript
    if (href.length < 5 || href.includes("javascript:")) return false;
    
    // 2. Loại bỏ link trỏ về danh mục (nguyên nhân gây lỗi ảnh 2 cũ của bạn)
    // Lưu ý: Link truyện thường là .html, nhưng link thể loại cũng .html nên phải check từ khóa
    if (href.includes("/the-loai/") || 
        href.includes("/tac-gia/") || 
        href.includes("tim-kiem") || 
        href.includes("dang-nhap")) {
        return false;
    }

    // 3. Loại bỏ ảnh rác (Logo, Icon user, Banner quảng cáo)
    let badImages = ["logo", "icon", "banner", "user", "facebook", "google"];
    for (let bad of badImages) {
        if (cover.toLowerCase().includes(bad)) return false;
    }

    // 4. Loại bỏ tên rác
    let lowerName = name.toLowerCase();
    if (lowerName.includes("trang chủ") || lowerName.includes("liên hệ")) return false;

    return true;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    
    // Xử lý trường hợp ảnh dùng css background-image: url(...)
    if (url.includes("url(")) {
        let match = url.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (match) return match[1];
    }
    
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}