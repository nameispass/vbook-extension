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
        
        // CÁCH ĐƠN GIẢN NHẤT: Tìm tất cả link có text
        let allLinks = doc.select("a");
        
        for (let i = 0; i < allLinks.size(); i++) {
            let link = allLinks.get(i);
            let href = link.attr("href");
            let text = link.text().trim();
            
            // Lọc cơ bản: link .html, có text, không phải menu
            if (href && text && 
                href.includes(".html") &&
                !href.includes("/the-loai/") &&
                !href.includes("/tim-kiem/") &&
                !href.includes("/tac-gia/") &&
                text.length > 3 && 
                text.length < 80 &&
                !text.match(/^(trang chủ|thể loại|tìm kiếm|đăng nhập|đăng ký)$/i)) {
                
                // Không tìm ảnh nữa (quá phức tạp)
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