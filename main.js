const baseUrl = "https://www.tvtruyen.com";

function detail(url) {
    const response = fetch(url);
    if (response.ok) {
        const doc = response.html();
        return Response.success({
            name: doc.select("h1.title").text(),
            cover: doc.select(".book-info img").attr("src"),
            author: doc.select(".info-item:contains(Tác giả) a").text(),
            description: doc.select(".desc-text").text(),
            detail: doc.select(".info-item:contains(Tình trạng)").text(),
            host: baseUrl
        });
    }
    return null;
}

function toc(url) {
    const response = fetch(url);
    if (response.ok) {
        const doc = response.html();
        const el = doc.select(".list-chapter li a");
        const data = [];
        for (let i = 0; i < el.size(); i++) {
            var e = el.get(i);
            data.push({
                name: e.text(),
                url: e.attr("href"),
                host: baseUrl
            })
        }
        return Response.success(data);
    }
    return null;
}

function chap(url) {
    const response = fetch(url);
    if (response.ok) {
        const doc = response.html();
        let content = doc.select(".chapter-c").html();
        content = content.replace(/<div class="ads.*?>.*?<\/div>/g, '');
        return Response.success(content);
    }
    return null;
}

function search(key, page) {
    const url = baseUrl + "/tim-kiem?keyword=" + encodeURIComponent(key);
    const response = fetch(url);
    if (response.ok) {
        const doc = response.html();
        const el = doc.select(".list-truyen .row");
        const data = [];
        for (let i = 0; i < el.size(); i++) {
            var e = el.get(i);
            data.push({
                name: e.select(".truyen-title a").text(),
                link: e.select(".truyen-title a").attr("href"),
                cover: e.select("img").attr("src"),
                description: e.select(".author").text(),
                host: baseUrl
            })
        }
        return Response.success(data);
    }
    return null;
}