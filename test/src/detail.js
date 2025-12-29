function execute(url) {
    // Dùng GoogleBot cho chi tiết truyện luôn
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
        }
    });

    if (res.ok) {
        let doc = res.html();
        
        // Tên truyện
        let name = doc.select("h1.title, .truyen-title, h1").text().trim();
        name = name.replace(/^Đọc truyện /i, "").replace(/ \| TruyenTV.*/i, "").trim();

        let cover = doc.select(".book-thumb img, .info-holder img").attr("src");
        let author = doc.select(".info-holder .author, .tac-gia a").text().trim();
        
        // MÔ TẢ: Ưu tiên lấy từ meta description (sạch và chuẩn cho bot)
        let description = doc.select("meta[name='description']").attr("content");
        
        // Fallback: Nếu meta rỗng, lấy từ body
        if (!description || description.length < 20) {
            description = doc.select(".desc-text, .truyen-info-desc, #tab-1").text();
        }
        
        // Fallback 2: Lấy đoạn text dài nhất trong info
        if (!description) {
             description = doc.select(".col-info").text();
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
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}