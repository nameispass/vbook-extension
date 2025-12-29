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
        
        // Danh sách các selector bao quanh item truyện thường gặp
        // Ưu tiên: item trong list > grid > thẻ div generic
        let selectors = [
            ".list-group-item",         // List dọc phổ biến
            ".col-truyen-main .row",    // Grid 
            ".truyen-item",             // Class định danh item
            ".item",
            "div.col-md-3",             // Bootstrap Column
            "div.col-6"                 // Mobile Column
        ];
        
        let elements = null;
        // Thử từng selector, nếu tìm thấy phần tử thì dùng luôn
        for (let i = 0; i < selectors.length; i++) {
            let temp = doc.select(selectors[i]);
            if (temp && temp.size() > 0) {
                elements = temp;
                break;
            }
        }
        
        // Fallback: Nếu không tìm thấy container, tìm trực tiếp thẻ A có chứa ảnh (không dùng parent)
        // Lưu ý: Chỉ dùng logic này nếu các selector trên thất bại
        if ((!elements || elements.size() === 0)) {
             elements = doc.select("a:has(img)"); 
        }

        if (elements) {
            for (let i = 0; i < elements.size(); i++) {
                let el = elements.get(i);
                
                let linkEl, imgEl;
                
                // Trường hợp el chính là thẻ <a> (Fallback case)
                if (el.tagName() === "a") {
                    linkEl = el;
                    imgEl = el.select("img").first();
                } else {
                    // Trường hợp el là container (div, li...) -> tìm a và img bên trong
                    linkEl = el.select("a").first();
                    imgEl = el.select("img").first();
                }

                if (linkEl) {
                    let link = linkEl.attr("href");
                    let name = linkEl.attr("title") || linkEl.text().trim();
                    let cover = "";
                    
                    if (imgEl) {
                        // Ưu tiên lấy data-src (ảnh gốc) trước src (ảnh placeholder nếu có lazyload)
                        cover = imgEl.attr("data-src") || imgEl.attr("data-original") || imgEl.attr("src");
                        if (!name || name === "") name = imgEl.attr("alt");
                    }

                    // Lọc rác: Bỏ qua các link hệ thống, link javascript, link quá ngắn
                    if (link && link.length > 5 && !link.includes("javascript") && name && name.length > 2) {
                        data.push({
                            name: name,
                            link: fixUrl(link),
                            cover: fixUrl(cover),
                            description: "TVTruyen",
                            host: "https://www.tvtruyen.com"
                        });
                    }
                }
            }
        }
        return Response.success(data);
    }
    return null;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    // Xử lý ảnh lazy load có thể bắt đầu bằng url background
    if (url.includes("url(")) {
        url = url.match(/url\(['"]?([^'"]+)['"]?\)/)[1];
    }
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}