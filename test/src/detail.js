function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
        }
    });

    if (res.ok) {
        let doc = res.html();
        
        let name = doc.select("h1.title, .truyen-title").text().trim();
        name = name.replace(/^Đọc truyện /i, "").replace(/ \| TruyenTV.*/i, "").trim();

        let cover = doc.select(".book-thumb img, .info-holder img, .col-info img").attr("src");
        let author = doc.select(".info-holder .author, .tac-gia a").text().trim();
        
        // Lấy mô tả: Thử thẻ meta trước, sau đó đến các div
        let description = doc.select("meta[name='description']").attr("content");
        if (!description || description.length < 50) {
            description = doc.select(".desc-text, .truyen-info-desc, .gioi-thieu").html();
        }
        
        // Làm sạch mô tả
        if (description) {
            description = description.replace(/\n/g, "<br>");
            description = description.replace(/<a[^>]*>.*?<\/a>/g, "");
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