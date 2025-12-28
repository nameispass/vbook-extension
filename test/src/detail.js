function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        let name = "Truyện TVTruyen";
        let titles = doc.select("h1, h2, .title");
        if (titles.size() > 0) {
            name = titles.get(0).text().trim();
        }
        
        return Response.success({
            name: name,
            cover: "",
            author: "Tác giả",
            description: "Mô tả truyện",
            ongoing: true,
            detail: "TVTruyen.com",
            host: "https://www.tvtruyen.com"
        });
    }
    return null;
}