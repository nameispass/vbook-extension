function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        
        // Lấy tên truyện
        let name = doc.select("h1.title, .title, h1").first().text().trim();
        
        // Lấy ảnh bìa (Selectors phổ biến của web truyện)
        let cover = doc.select(".book-thumb img, .thumb img, .img-block img").first().attr("src");
        
        // Lấy tác giả
        let author = doc.select(".author, .tac-gia, a[href*='tac-gia']").first().text().trim();
        
        // Lấy mô tả
        let description = doc.select(".desc-text, .description, .noidung").text().trim();

        return Response.success({
            name: name,
            cover: fixUrl(cover),
            author: author || "Unknown",
            description: description,
            ongoing: true,
            host: "https://www.tvtruyen.com"
        });
    }
    return null;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}