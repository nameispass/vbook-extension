function execute(keyword, page) {
    if (!page) page = 1;
    
    let url = `https://www.tvtruyen.com/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`;
    let res = fetch(url);
    
    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        let links = doc.select("a[href$='.html']");
        for (let i = 0; i < links.size(); i++) {
            let link = links.get(i);
            let href = link.attr("href");
            let text = link.text().trim();
            
            if (href && text && !href.includes("/the-loai/")) {
                data.push({
                    name: text,
                    link: fixUrl(href),
                    cover: "",
                    description: "Kết quả tìm kiếm",
                    host: "https://www.tvtruyen.com"
                });
                
                if (data.length >= 15) break;
            }
        }
        
        return Response.success(data);
    }
    return null;
}

function fixUrl(url) {
    if (!url || url.trim() === "") return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}