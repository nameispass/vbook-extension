function execute(url, page) {
    // 1. XỬ LÝ PHÂN TRANG (QUAN TRỌNG NHẤT CHO SCROLL)
    if (!page) page = 1;
    
    // Tạo URL: Nếu url gốc chưa có '?' thì thêm '?', ngược lại thêm '&'
    // Ví dụ: tvtruyen.com/the-loai?page=2
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    let res = fetch(fullUrl);
    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // 2. CHỌN VÙNG DỮ LIỆU
        // Quét tất cả các div có class là 'row' (lưới) hoặc 'list-group-item' (danh sách)
        // Đây là cách bao quát nhất cho TVTruyen
        let items = doc.select(".row .item, .list-group-item, .col-truyen-main .row > div");

        // Fallback: Nếu không tìm thấy class cụ thể, quét thẻ A có ảnh
        if (items.size() === 0) {
            items = doc.select("a:has(img)");
        }

        for (let i = 0; i < items.size(); i++) {
            let item = items.get(i);
            
            // Tìm thẻ A (Link) và IMG (Ảnh)
            let linkEl = item.tagName() === "a" ? item : item.select("a").first();
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
                        description: item.select(".author, .chapter-text").text().trim() || "TVTruyen",
                        host: "https://www.tvtruyen.com"
                    });
                }
            }
        }
        
        // Trả về danh sách. Nếu data.length > 0, App sẽ tự động gọi tiếp page + 1 khi cuộn xuống.
        return Response.success(data);
    }
    return null;
}

function isValid(href, title) {
    if (!href || !title) return false;
    if (href.length < 5 || href.includes("javascript")) return false;
    // Bỏ link rác
    if (href.includes("/the-loai/") || href.includes("/tac-gia/") || href.includes("dang-nhap")) return false;
    // Bỏ tên rác
    let bad = ["trang chủ", "liên hệ", "xem thêm", "đọc ngay"];
    if (bad.includes(title.toLowerCase())) return false;
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