function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        
        let name = "Truyện TVTruyen";
        let titleElem = doc.select("h1, h2, .title, .story-title");
        if (titleElem.size() > 0) {
            name = titleElem.first().text().trim();
        }
        
        let cover = "";
        let imgs = doc.select("img");
        if (imgs.size() > 0) {
            cover = imgs.first().attr("src") || "";
        }
        
        return Response.success({
            name: name,
            cover: fixUrl(cover),
            author: "Đang cập nhật",
            description: "Mô tả truyện từ TVTruyen.com",
            ongoing: true,
            detail: "",
            host: "https://www.tvtruyen.com"
        });
    }
    return null;
}

function fixUrl(url) {
    if (!url || url.trim() === "") return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}