function execute(url) {
    // Dùng GoogleBot để đồng bộ
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Chọn tất cả thẻ a
        let links = doc.select("a");
        
        for (let i = 0; i < links.size(); i++) {
            let link = links.get(i);
            let href = link.attr("href");
            let text = link.text().trim();
            
            if (href && text) {
                // --- BỘ LỌC CHƯƠNG ---
                let lowerText = text.toLowerCase();
                
                // 1. Phải chứa số
                if (!text.match(/\d+/)) continue;
                
                // 2. Phải chứa từ khóa chương
                if (!lowerText.includes("chương") && !lowerText.includes("chap")) continue;
                
                // 3. LOẠI BỎ RÁC PHÂN LOẠI (Nguyên nhân gây lỗi ảnh 2)
                if (lowerText.includes("dưới") || lowerText.includes("trên") || lowerText.includes("từ")) continue;
                if (lowerText.includes("mới nhất") || lowerText.includes("đọc tiếp")) continue;

                data.push({
                    name: text,
                    url: fixUrl(href),
                    host: "https://www.tvtruyen.com"
                });
            }
        }
        
        // --- THUẬT TOÁN SẮP XẾP SỐ HỌC ---
        if (data.length > 0) {
            data.sort((a, b) => {
                let numA = extractNum(a.name);
                let numB = extractNum(b.name);
                return numA - numB;
            });
            
            // Xóa chương trùng lặp (nếu có)
            let uniqueData = [];
            let seenUrl = new Set();
            for (let item of data) {
                if (!seenUrl.has(item.url)) {
                    seenUrl.add(item.url);
                    uniqueData.push(item);
                }
            }
            return Response.success(uniqueData);
        }

        return Response.success(data);
    }
    return null;
}

// Hàm tách số chuẩn: "Chương 10: Tiêu đề" -> lấy số 10
function extractNum(text) {
    // Regex lấy số đầu tiên xuất hiện trong chuỗi
    let match = text.match(/(\d+)/); 
    if (match) return parseInt(match[1]);
    return 999999; // Nếu không tìm thấy số, đẩy xuống cuối
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}