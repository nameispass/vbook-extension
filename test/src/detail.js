function execute(url) {
    let res = fetch(url, {
        headers: {
             "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Mobile Safari/537.36"
        }
    });

    if (res.ok) {
        let doc = res.html();
        if (!doc) return null;
        
        // Selector chính xác cho TVTruyen
        // Tìm h1 có class title, hoặc h1 bất kỳ nằm trong main content
        let name = doc.select("h1.title, .truyen-title, .col-truyen-main h1").text().trim();
        
        // Nếu không tìm thấy, lấy thẻ meta title nhưng cắt bỏ phần đuôi " - TVTruyen"
        if (!name) {
             name = doc.select("title").text().replace(/\s*-\s*TVTruyen.*/i, "").trim();
        }

        let cover = doc.select(".book-thumb img, .info-holder img, .col-info img").attr("src");
        let author = doc.select(".info-holder .author, .tac-gia a, .list-info .author").text().trim();
        let description = doc.select(".desc-text, .truyen-info-desc, .gioi-thieu").text().trim();

        return Response.success({
            name: name || "Chưa cập nhật tên",
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