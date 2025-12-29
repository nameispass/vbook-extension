function execute(url, page) {
    if (!page) page = 1;
    
    // Xử lý tạo link phân trang
    let fullUrl = url;
    if (page > 1) {
        // Kiểm tra xem url đã có tham số chưa để nối &page= hay ?page=
        fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    }

    let res = fetch(fullUrl);
    if (res.ok) {
        let doc = res.html();
        let data = [];

        // 1. KHOANH VÙNG NỘI DUNG CHÍNH (QUAN TRỌNG)
        // Chỉ tìm trong cột nội dung chính để tránh lấy nhầm Sidebar/Menu
        let mainContent = doc.select(".col-truyen-main, .list-truyen, #list-page, .col-content").first();
        
        // Nếu không tìm thấy vùng chính (phòng hờ web đổi giao diện), dùng tạm cả trang (doc)
        let searchScope = mainContent ? mainContent : doc;

        // 2. TÌM CÁC ITEM TRUYỆN
        // TVTruyen thường dùng cấu trúc: .row (mỗi dòng 1 truyện) hoặc .list-group-item
        let items = searchScope.select(".row, .list-group-item, .item-truyen");

        for (let i = 0; i < items.size(); i++) {
            let item = items.get(i);
            
            // Tìm thẻ A (Link + Tên) và thẻ Img (Ảnh) BÊN TRONG item
            let titleEl = item.select("h3 a, .truyen-title a, a").first(); // Ưu tiên tìm trong thẻ h3 trước
            let imgEl = item.select("img").first();

            if (titleEl) {
                let link = titleEl.attr("href");
                let title = titleEl.text().trim();
                
                // Nếu tiêu đề rỗng, thử lấy từ title attribute
                if (!title) title = titleEl.attr("title");
                if (!title && imgEl) title = imgEl.attr("alt");

                let cover = "";
                if (imgEl) {
                    // Hỗ trợ lấy ảnh lazyload (data-src)
                    cover = imgEl.attr("data-src") || imgEl.attr("src");
                }
                
                // Nếu cover không có http, tự động fix
                cover = fixUrl(cover);
                link = fixUrl(link);

                // 3. BỘ LỌC (FILTER) CHẶN RÁC
                // Chỉ lấy item thỏa mãn điều kiện là Link Truyện
                if (isValidStory(link, title)) {
                    data.push({
                        name: title,
                        link: link,
                        cover: cover,
                        description: item.select(".author, .chapter-text").text().trim() || "TVTruyen", // Lấy thêm tên tác giả hoặc chương mới nhất làm mô tả
                        host: "https://www.tvtruyen.com"
                    });
                }
            }
        }
        return Response.success(data);
    }
    return null;
}

// Hàm kiểm tra xem link có phải là truyện hợp lệ không
function isValidStory(link, title) {
    if (!link || !title) return false;
    
    // Link quá ngắn hoặc link javascript -> Bỏ
    if (link.length < 5 || link.includes("javascript")) return false;

    // Link chứa các từ khóa của danh mục/thể loại/tác giả -> Bỏ (đây là nguyên nhân lỗi ảnh 2 của bạn)
    if (link.includes("/the-loai/") || 
        link.includes("/tac-gia/") || 
        link.includes("/quoc-gia/") ||
        link.includes("/tim-kiem")) {
        return false;
    }

    // Tiêu đề là các từ khóa hệ thống -> Bỏ
    let badTitles = ["trang chủ", "thể loại", "liên hệ", "đổi mật khẩu", "đăng xuất", "truyện full"];
    if (badTitles.includes(title.toLowerCase())) return false;

    return true;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    // Xử lý trường hợp ảnh nằm trong css background url(...)
    if (url.includes("url(")) {
        let match = url.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (match) url = match[1];
    }
    
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}