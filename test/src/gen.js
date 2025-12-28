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
        
        // THỬ CÁC CÁCH KHÁC NHAU:
        
        // Cách 1: Tìm link .html có text dài
        let links = doc.select("a[href$='.html']");
        
        for (let i = 0; i < links.size(); i++) {
            let link = links.get(i);
            let href = link.attr("href");
            let text = link.text().trim();
            
            // Lọc link truyện
            if (href && text && 
                text.length > 3 && 
                text.length < 80 &&
                !href.includes("/the-loai/") &&
                !href.includes("/tim-kiem/") &&
                !href.includes("/tac-gia/")) {
                
                // Tìm ảnh
                let cover = "";
                let img = link.select("img").first();
                if (!img.exists()) {
                    let parent = link.parent();
                    img = parent.select("img").first();
                }
                
                if (img.exists()) {
                    cover = img.attr("src") || img.attr("data-src");
                }
                
                data.push({
                    name: text,
                    link: fixUrl(href),
                    cover: fixUrl(cover),
                    description: "TVTruyen",
                    host: "https://www.tvtruyen.com"
                });
                
                if (data.length >= 20) break;
            }
        }
        
        // Cách 2: Nếu không tìm thấy, tìm theo item
        if (data.length === 0) {
            let items = doc.select(".item, [class*='item'], .story, [class*='story']");
            for (let i = 0; i < items.size(); i++) {
                let item = items.get(i);
                let link = item.select("a").first();
                if (link.exists()) {
                    let href = link.attr("href");
                    let text = link.text().trim();
                    
                    if (href && text && href.includes(".html")) {
                        data.push({
                            name: text,
                            link: fixUrl(href),
                            cover: "",
                            description: "TVTruyen",
                            host: "https://www.tvtruyen.com"
                        });
                    }
                }
            }
        }
        
        return Response.success(data.slice(0, 15));
    }
    
    return null;
}

function fixUrl(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}