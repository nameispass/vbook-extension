function execute(url) {
    // Dùng GoogleBot để đồng bộ với danh sách
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        
        // Nếu doc bị null (do mạng), trả về null để App báo lỗi mạng
        if (!doc) return null;
        
        // Lấy Tên Truyện (Cố gắng tìm mọi ngóc ngách)
        let name = doc.select("h1").text().trim();
        if (!name) name = doc.select("title").text().replace("- TVTruyen", "").trim();
        if (!name) name = "Truyện không tên";

        // Lấy Ảnh
        let cover = doc.select(".book-thumb img, .info-holder img, .col-info img, img[src*='upload']").attr("src");
        
        // Lấy Tác giả
        let author = doc.select(".info-holder .author, .tac-gia a, .list-info .author").text().trim();
        
        // Lấy Mô tả (Ưu tiên meta description sạch)
        let description = doc.select("meta[name='description']").attr("content");
        if (!description || description.length < 20) {
             description = doc.select(".desc-text, .truyen-info-desc, #tab-1").text();
        }

        return Response.success({
            name: name,
            cover: fixUrl(cover),
            author: author || "Đang cập nhật",
            description: description || "Chưa có mô tả",
            detail: "TVTruyen",
            host: "https://www.tvtruyen.com"
        });
    }
    
    return null;
}

function fixUrl(url) {
    if (!url || url === "") return "https://i.imgur.com/1upCXI1.png";
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}