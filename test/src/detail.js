function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        
        let name = doc.select("h1").text() || url.split("/").pop().replace(".html", "").replace(/-/g, " ");
        let cover = doc.select("img").first().attr("src") || "";
        
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
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}