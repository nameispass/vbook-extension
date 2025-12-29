function execute(url, page) {
    if (!page) page = 1;
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    let res = fetch(fullUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        let data = [];
        let checkSet = new Set();
        
        let links = doc.select("a");

        for (let i = 0; i < links.size(); i++) {
            let linkEl = links.get(i);
            let href = linkEl.attr("href");
            let title = linkEl.text().trim();
            let imgEl = linkEl.select("img").first();

            // Logic lấy ảnh và tên
            let cover = "https://i.imgur.com/1upCXI1.png";
            if (imgEl) {
                let src = imgEl.attr("data-src") || imgEl.attr("src");
                if (src) cover = src;
                if (!title) title = imgEl.attr("alt") || linkEl.attr("title");
            }

            // BỘ LỌC DỮ LIỆU
            if (href && href.length > 5 && !checkSet.has(href)) {
                // Chỉ lấy link .html
                if (href.includes(".html")) {
                    
                    // Loại bỏ các link không phải truyện
                    if (!href.includes("/chuong-") && 
                        !href.includes("/the-loai/") && 
                        !href.includes("/tac-gia/") && 
                        !href.includes("tim-kiem") &&
                        !href.includes("page=") &&
                        !title.includes("Chương")
                       ) {
                        
                        // Kiểm tra tên hợp lệ
                        if (title && title.length > 2 && !isBadName(title)) {
                            
                            data.push({
                                name: title,
                                link: fixUrl(href),
                                cover: fixUrl(cover),
                                description: "TVTruyen",
                                host: "https://www.tvtruyen.com"
                            });
                            
                            checkSet.add(href);
                        }
                    }
                }
            }
            // ĐÃ XÓA GIỚI HẠN break ĐỂ LOAD HẾT TRANG
        }
        
        return Response.success(data);
    }
    return null;
}

function isBadName(name) {
    let bad = ["trang chủ", "thể loại", "full", "hot", "mới", "đăng nhập", "đăng ký", "quên mật khẩu", "liên hệ"];
    return bad.includes(name.toLowerCase());
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