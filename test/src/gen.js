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
        
        // CÁCH 1: Tìm tất cả link .html và lọc
        let allLinks = doc.select("a");
        
        for (let i = 0; i < allLinks.size(); i++) {
            let link = allLinks.get(i);
            let href = link.attr("href");
            let text = link.text().trim();
            
            // Lọc link truyện (không dùng .exists())
            if (href && text && 
                href.includes(".html") &&
                !href.includes("/the-loai/") &&
                !href.includes("/tim-kiem/") &&
                !href.includes("/tac-gia/") &&
                text.length > 3 && 
                text.length < 80) {
                
                // Tìm ảnh - CÁCH MỚI không dùng .exists()
                let cover = "";
                
                // Cách 1: Tìm img trong link
                let imgs = link.select("img");
                if (imgs.size() > 0) {
                    cover = imgs.first().attr("src") || imgs.first().attr("data-src");
                } else {
                    // Cách 2: Tìm img trong parent
                    let parent = link.parent();
                    let parentImgs = parent.select("img");
                    if (parentImgs.size() > 0) {
                        cover = parentImgs.first().attr("src") || parentImgs.first().attr("data-src");
                    }
                }
                
                data.push({
                    name: text,
                    link: fixUrl(href),
                    cover: fixUrl(cover),
                    description: "TVTruyen",
                    host: "https://www.tvtruyen.com"
                });
                
                if (data.length >= 15) break;
            }
        }
        
        // Nếu không đủ, tìm thêm
        if (data.length < 5) {
            // Tìm theo class item/story
            let items = doc.select(".item, .story-item, [class*='item'], [class*='story']");
            for (let i = 0; i < items.size(); i++) {
                let item = items.get(i);
                let itemLinks = item.select("a");
                if (itemLinks.size() > 0) {
                    let link = itemLinks.first();
                    let href = link.attr("href");
                    let text = link.text().trim();
                    
                    if (href && text) {
                        data.push({
                            name: text,
                            link: fixUrl(href),
                            cover: "",
                            description: "TVTruyen",
                            host: "https://www.tvtruyen.com"
                        });
                        
                        if (data.length >= 10) break;
                    }
                }
            }
        }
        
        return Response.success(data.slice(0, 12));
    }
    
    return null;
}

function fixUrl(url) {
    if (!url || url.trim() === "") return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("//")) return "https:" + url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}