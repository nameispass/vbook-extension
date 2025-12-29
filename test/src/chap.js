function execute(url) {
    // 1. Dùng BingBot (Đang hoạt động tốt)
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();
        
        // Thay thế xuống dòng để giữ format
        text = text.replace(/\\n/g, "<br>");
        text = text.replace(/\r?\n/g, "<br>");

        let doc = Html.parse(text);
        
        // 2. DANH SÁCH RÁC CẦN XÓA (Cập nhật dựa trên ảnh lỗi của bạn)
        let garbage = [
            // Rác kỹ thuật (Gây ra lỗi hiển thị code loằng ngoằng)
            "script", "style", "iframe", "svg", "path", "defs", "symbol", "noscript",
            
            // Rác Modal (Cái khung 'Danh sách chương' bị lẫn vào)
            "[class*='chapter-modal']", // Xóa tất cả class có chữ chapter-modal
            ".modal", "#modal", 
            
            // Rác điều hướng
            ".chapter-nav", ".navigation", ".pagination", 
            ".prev-chapter", ".next-chapter",
            
            // Rác Header/Footer/Quảng cáo
            "header", "footer", ".header", ".footer",
            ".menu", ".nav", ".top-nav", ".bottom-nav",
            ".ads", ".banner", ".box-search",
            
            // Các nút bấm và link
            "button", "input", "select", "option", "a"
        ];
        
        // Thực hiện xóa
        for (let g of garbage) {
            doc.select(g).remove();
        }
        
        // 3. CHỌN NỘI DUNG
        let content = "";
        
        // Ưu tiên tìm vùng nội dung chuẩn
        let el = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
        
        if (el) {
            content = el.html();
        } else {
            // Nếu không thấy, lấy Body (đã được dọn sạch rác ở trên)
            // Lọc tiếp các div rác còn sót lại trong body
            let body = doc.select("body");
            
            // Xóa các div rỗng hoặc div chỉ chứa icon
            let divs = body.select("div");
            for(let i=0; i<divs.size(); i++) {
                let d = divs.get(i);
                if (d.text().trim().length < 5 && !d.select("img").first()) {
                    d.remove();
                }
            }
            content = body.html();
        }

        // 4. LÀM SẠCH TEXT LẦN CUỐI (Regex Cleaner)
        if (content) {
            // Xóa tàn dư của các thẻ SVG hoặc code bị lộ thiên
            content = content.replace(/class="[^"]*"/g, ""); // Xóa attribute class thừa
            content = content.replace(/viewBox="[^"]*"/g, "");
            content = content.replace(/d="M[^"]*"/g, ""); // Xóa đường vẽ SVG
            content = content.replace(/<[^>]*>/g, function(match){
                // Giữ lại thẻ br, p, b, i, strong, em. Xóa các thẻ lạ khác.
                if (match.match(/^<\/?(br|p|b|i|strong|em|div)/i)) return match;
                return ""; 
            });

            // Xóa text rác
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            content = content.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");
            content = content.replace(/Danh sách chương/gi, ""); // Xóa tiêu đề modal

            // Format đẹp
            content = content.replace(/(<br>\s*){2,}/gi, "<br><br>");
            
            return Response.success(content);
        }
    }
    
    // Xử lý lỗi Null Object Reference (Khi mạng lỗi)
    return Response.success("Lỗi tải chương. Vui lòng thử lại. (Mã: " + (res ? res.status : "Mất kết nối") + ")");
}