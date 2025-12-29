function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    });

    if (res.ok) {
        let doc = res.html();
        
        // Selector chuẩn cho trang chi tiết TVTruyen
        let name = doc.select("h1.title, .truyen-title").text().trim();
        let cover = doc.select(".book-thumb img, .info-holder img").attr("src");
        let author = doc.select(".info-holder .author, .tac-gia a").text().trim();
        let description = doc.select(".desc-text, .truyen-info-desc").text().trim();
        
        // Fallback
        if (!name) name = doc.select("h1").text().trim();
        
        return Response.success({
            name: name,
            cover: fixUrl(cover),
            author: author || "Đang cập nhật",
            description: description || "Không có mô tả",
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