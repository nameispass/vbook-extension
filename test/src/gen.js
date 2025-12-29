function execute(url, page) {
    if (!page) page = 1;
    let fullUrl = url;
    if (page > 1) {
        fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    }

    let res = fetch(fullUrl);
    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Xác định block truyện (thường là .col-truyen-main .row hoặc tương tự)
        // Thay vì select "a", hãy select wrapper của từng truyện để lấy info chính xác
        let elements = doc.select(".list-truyen .row, .col-truyen-main .list-group-item, .truyen-item"); 
        
        // Nếu không tìm thấy wrapper cụ thể, dùng logic cũ nhưng bổ sung lấy ảnh
        if (elements.size() === 0) {
             // Fallback logic cũ (đã cải tiến)
             let links = doc.select(".list-group-item, .row"); // Select div chứa truyện thay vì thẻ a
             // Logic này tuỳ thuộc vào HTML cụ thể của TVTruyen, 
             // nhưng tôi khuyên bạn nên Inspect Element trang web để xem class bao ngoài mỗi truyện là gì.
             // Dưới đây là ví dụ generic:
        }

        // Cách an toàn nhất nếu không biết class wrapper: Select thẻ img, sau đó tìm cha của nó
        let images = doc.select("img");
        for(let i = 0; i < images.size(); i++) {
            let img = images.get(i);
            let src = img.attr("src");
            let parent = img.parent(); // Thường là thẻ a
            if (parent.tagName() !== "a") parent = parent.parent(); // Lên 1 cấp nữa
            
            if (parent.tagName() === "a") {
                 let link = parent.attr("href");
                 let title = parent.attr("title") || img.attr("alt") || parent.text().trim();
                 
                 if (link && link.includes(".html") && title) {
                     data.push({
                        name: title,
                        link: fixUrl(link),
                        cover: fixUrl(src),
                        description: "TVTruyen",
                        host: "https://www.tvtruyen.com"
                    });
                 }
            }
            if(data.length >= 20) break;
        }

        return Response.success(data);
    }
    return null;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}