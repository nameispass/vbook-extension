function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
        }
    });

    if (res.ok) {
        let doc = res.html();
        
        let name = doc.select("h1.title, .truyen-title, h1").text().trim();
        let cover = doc.select(".book-thumb img, .info-holder img, .col-info img, .img-thumbnail").attr("src");
        let author = doc.select(".info-holder .author, .tac-gia a, .list-info .author").text().trim();
        
        // --- CẬP NHẬT SELECTOR MÔ TẢ ---
        // Thử nhiều class khác nhau
        let description = doc.select(".desc-text, .truyen-info-desc, .gioi-thieu, .story-detail-content, #tab-1").html();
        
        // Làm sạch mô tả
        if (description) {
            description = description.replace(/<a[^>]*>.*?<\/a>/g, ""); // Xóa link rác trong mô tả
            description = description.replace(/\n/g, "<br>");
        } else {
            description = "Chưa có mô tả.";
        }

        return Response.success({
            name: name,
            cover: fixUrl(cover),
            author: author || "Đang cập nhật",
            description: description,
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