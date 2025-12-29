function execute(url, page) {
    if (!page) page = 1;
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    let res = fetch(fullUrl);
    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Chọn các khối bao quanh truyện (List item)
        let items = doc.select(".list-group-item, .row-truyen, .col-truyen-main .row");

        for (let i = 0; i < items.size(); i++) {
            let item = items.get(i);
            
            // 1. Lấy Tiêu Đề: Chỉ tìm thẻ A nằm trong thẻ H3 (Tiêu đề chuẩn)
            // Để tránh lấy nhầm thẻ A của "Chương mới nhất"
            let titleLink = item.select("h3 a, .title a").first();
            
            // Fallback: Nếu không có h3, tìm thẻ a đầu tiên không phải là chương
            if (!titleLink) {
                 let links = item.select("a");
                 for(let j=0; j<links.size(); j++) {
                     let l = links.get(j);
                     let t = l.text();
                     if (t.length > 5 && !t.includes("Chương") && !t.includes("Chap")) {
                         titleLink = l;
                         break;
                     }
                 }
            }

            if (titleLink) {
                let name = titleLink.text().trim();
                let link = titleLink.attr("href");
                
                // 2. Lấy Ảnh: Tìm thẻ img trong cùng khối item
                let imgEl = item.select("img").first();
                let cover = "https://i.imgur.com/1upCXI1.png"; // Ảnh mặc định
                
                if (imgEl) {
                    // Ưu tiên data-src (lazyload) -> src
                    cover = imgEl.attr("data-src") || imgEl.attr("data-original") || imgEl.attr("src");
                }

                // 3. Lấy mô tả (Chapter mới nhất hoặc tác giả)
                let description = item.select(".author, .chapter-text, .text-info").text().trim();

                if (isValid(name, link)) {
                    data.push({
                        name: name,
                        link: fixUrl(link),
                        cover: fixUrl(cover),
                        description: description || "TVTruyen",
                        host: "https://www.tvtruyen.com"
                    });
                }
            }
        }
        return Response.success(data);
    }
    return null;
}

function isValid(name, link) {
    if (!name || !link) return false;
    if (link.includes("javascript")) return false;
    // Lọc bỏ nếu lỡ lấy nhầm link chương
    if (name.startsWith("Chương") || name.startsWith("Chap")) return false;
    return true;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.includes("url(")) {
         let match = url.match(/url\(['"]?([^'"]+)['"]?\)/);
         if (match) return match[1];
    }
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}