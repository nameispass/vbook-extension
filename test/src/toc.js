function execute(url) {
    let data = [];
    let nextUrl = url;
    
    // Giới hạn lặp 50 trang để tránh treo app nếu web lỗi vòng lặp vô tận
    // Mỗi trang 50 chương -> 50 trang = 2500 chương (đủ cho hầu hết truyện)
    for (let i = 0; i < 50; i++) {
        let res = fetch(nextUrl);
        if (!res.ok) break;
        
        let doc = res.html();
        
        // 1. Lấy danh sách chương ở trang hiện tại
        let links = doc.select("#list-chapter a, .list-chapter a, .list-chapters a");
        let hasNewChapter = false;

        for (let j = 0; j < links.size(); j++) {
            let link = links.get(j);
            let text = link.text().trim();
            let href = link.attr("href");

            // Bộ lọc loại bỏ link rác/phân trang
            if (href && text && isNaN(text) && !href.includes("page=")) {
                data.push({
                    name: text,
                    url: fixUrl(href),
                    host: "https://www.tvtruyen.com"
                });
                hasNewChapter = true;
            }
        }
        
        // Nếu trang này không lấy được chương nào -> Dừng luôn
        if (!hasNewChapter) break;

        // 2. Tìm trang tiếp theo (Pagination)
        // Tìm nút "Trang sau", "»" hoặc nút liền kề nút đang active
        let nextBtn = doc.select(".pagination .next a, .pagination li.active + li a, a[rel='next']").first();
        
        if (nextBtn) {
            let nextHref = nextBtn.attr("href");
            if (nextHref && nextHref !== "#" && nextHref !== nextUrl) {
                nextUrl = fixUrl(nextHref);
            } else {
                break; // Không còn link trang sau -> Hết
            }
        } else {
            break; // Không tìm thấy nút phân trang -> Hết
        }
    }
    
    // 3. Sắp xếp lại chương (Nếu cần)
    if (data.length > 0) {
         let first = extractNum(data[0].name);
         let last = extractNum(data[data.length-1].name);
         // Nếu chương đầu > chương cuối (Mới nhất -> Cũ nhất), đảo ngược lại để đọc từ chương 1
         if (first > last) data.reverse();
    }

    return Response.success(data);
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