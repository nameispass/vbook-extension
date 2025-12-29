function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        
        // 1. Lấy Tên và làm sạch
        let name = doc.select("h1.title, .truyen-title, h1").text().trim();
        // Xóa các từ thừa do SEO của web thêm vào
        name = name.replace(/^Đọc truyện /i, "").replace(/ \| TruyenTV.*/i, "").trim();

        let cover = doc.select(".book-thumb img, .info-holder img, .img-thumbnail").attr("src");
        let author = doc.select(".info-holder .author, .tac-gia a, .list-info .author").text().trim();
        
        // 2. Lấy Mô tả (Thử nhiều nguồn)
        // Ưu tiên lấy từ thẻ meta description (chuẩn nhất cho bot)
        let description = doc.select("meta[name='description']").attr("content");
        
        // Nếu không có, tìm trong các thẻ div
        if (!description || description.length < 10) {
            description = doc.select(".desc-text, .truyen-info-desc, .gioi-thieu, #tab-1").text();
        }

        return Response.success({
            name: name,
            cover: fixUrl(cover),
            author: author || "Đang cập nhật",
            description: description || "Chưa có mô tả.",
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