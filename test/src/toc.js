function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Chọn vùng danh sách chương cụ thể (thường là #list-chapter hoặc .list-chapter)
        // Kết hợp chọn thẻ 'a' bên trong
        let links = doc.select("#list-chapter a, .list-chapter a, .list-chapters a");

        for (let i = 0; i < links.size(); i++) {
            let link = links.get(i);
            let text = link.text().trim();
            let href = link.attr("href");

            // --- BỘ LỌC QUAN TRỌNG ---
            // 1. Phải có link và text
            // 2. Text không được là số thuần (để loại bỏ phân trang 1, 2, 3...)
            // 3. Link không chứa từ khóa "page=" (để loại bỏ link chuyển trang)
            if (href && text && isNaN(text) && !href.includes("page=")) {
                data.push({
                    name: text,
                    url: fixUrl(href),
                    host: "https://www.tvtruyen.com"
                });
            }
        }
        
        // Sắp xếp lại nếu cần (thường TVTruyen để mới nhất lên đầu, ta cần cũ nhất lên đầu)
        if (data.length > 0) {
             // Kiểm tra nếu chương đầu tiên số lớn hơn chương cuối cùng -> Đảo ngược
             let first = extractNum(data[0].name);
             let last = extractNum(data[data.length-1].name);
             if (first > last) data.reverse();
        }

        return Response.success(data);
    }
    return null;
}

function extractNum(text) {
    let match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}