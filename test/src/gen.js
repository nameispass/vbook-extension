function execute(url, page) {
    if (!page) page = 1;
    // URL phân trang
    let fullUrl = url + (url.includes("?") ? "&" : "?") + "page=" + page;
    
    // Header giả lập trình duyệt thật
    let res = fetch(fullUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.tvtruyen.com/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
    });

    if (res.ok) {
        let text = res.text();
        let data = [];
        
        // --- TRƯỜNG HỢP 1: SERVER TRẢ VỀ JSON (API) ---
        if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
            try {
                let json = JSON.parse(text);
                // Giả sử API trả về mảng trong các key phổ biến
                let items = json.data || json.items || json.list || (Array.isArray(json) ? json : []);
                
                items.forEach(function(item) {
                    data.push({
                        name: item.name || item.title || "Không tên",
                        link: fixUrl(item.url || item.href || item.link),
                        cover: fixUrl(item.cover || item.image || item.img),
                        description: "TVTruyen API",
                        host: "https://www.tvtruyen.com"
                    });
                });
            } catch (e) {
                // Nếu parse lỗi, bỏ qua để xử lý như HTML
            }
        }

        // --- TRƯỜNG HỢP 2: SERVER TRẢ VỀ HTML (WEB) ---
        if (data.length === 0) {
            let doc = res.html(); // VBook tự parse text thành doc
            
            // Quét tìm truyện theo nhiều kiểu selector
            let elements = doc.select(".list-truyen .row > div, .col-truyen-main .row > div, .list-group-item, .item-truyen");
            
            // Fallback: Quét tất cả thẻ A có ảnh
            if (elements.size() === 0) {
                elements = doc.select("a:has(img)");
            }

            for (let i = 0; i < elements.size(); i++) {
                let item = elements.get(i);
                let linkEl = item.select("a").first() || (item.tagName() === "a" ? item : null);
                let imgEl = item.select("img").first();

                if (linkEl) {
                    let href = linkEl.attr("href");
                    let title = linkEl.text().trim();
                    if (!title) title = linkEl.attr("title") || (imgEl ? imgEl.attr("alt") : "");
                    
                    let cover = "https://i.imgur.com/1upCXI1.png";
                    if (imgEl) cover = imgEl.attr("data-src") || imgEl.attr("src");

                    if (isValid(href, title)) {
                        data.push({
                            name: title,
                            link: fixUrl(href),
                            cover: fixUrl(cover),
                            description: item.select(".author, .text-muted").text().trim() || "TVTruyen",
                            host: "https://www.tvtruyen.com"
                        });
                    }
                }
            }
        }

        // --- DEBUG: NẾU KHÔNG CÓ DỮ LIỆU, BÁO LỖI TRONG APP ---
        if (data.length === 0) {
            return Response.success([{
                name: "Không tìm thấy truyện nào",
                link: "error",
                cover: "https://i.imgur.com/1upCXI1.png",
                description: "Vui lòng kiểm tra lại kết nối hoặc trang web.",
                host: "https://www.tvtruyen.com"
            }]);
        }

        return Response.success(data);
    }
    
    return null;
}

function isValid(href, title) {
    if (!href || !title) return false;
    if (href.length < 5 || href.includes("javascript")) return false;
    if (href.includes("/the-loai/") || href.includes("/tac-gia/") || href.includes("tim-kiem")) return false;
    
    let t = title.toLowerCase();
    let bad = ["trang chủ", "liên hệ", "truyentv", "đọc truyện", "tiểu thuyết"];
    for (let b of bad) if (t.includes(b)) return false;

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