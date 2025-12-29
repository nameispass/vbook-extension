function execute(url) {
    // 1. Dùng BingBot (Đã xác nhận lấy được HTML)
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();
        
        // Thay thế xuống dòng trước khi parse để giữ định dạng
        text = text.replace(/\\n/g, "<br>"); 
        text = text.replace(/\r?\n/g, "<br>");

        let doc = Html.parse(text);
        
        // 2. DỌN RÁC TOÀN TRANG (QUAN TRỌNG)
        // Xóa ngay các thành phần không phải truyện
        let garbage = [
            "script", "style", "iframe", "svg", "noscript",
            ".header", "#header", "header",
            ".footer", "#footer", "footer",
            ".menu", "#menu", "nav", ".navigation", ".bread",
            ".ads", ".advertisement", ".banner",
            ".comment", ".comment-box", "#comment",
            ".modal", "#report_modal",
            ".search", ".box-search",
            ".sidebar", ".col-md-4", // Cột bên phải
            ".list-chapter", ".pagination", // Danh sách chương và phân trang ở dưới
            "a" // Xóa sạch các link (vì trong nội dung truyện thường không có link)
        ];
        
        for (let g of garbage) {
            doc.select(g).remove();
        }
        
        // 3. CHIẾN THUẬT TÌM NỘI DUNG
        let content = "";
        
        // Ưu tiên 1: Các ID/Class chuẩn
        let el = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
        
        if (el) {
            content = el.html();
        } else {
            // Ưu tiên 2: Tìm thẻ Div hoặc Article còn lại có nhiều chữ nhất
            // Sau khi đã xóa hết Header/Footer thì cái còn lại to nhất chính là nội dung
            let candidates = doc.select("div, article");
            let maxLen = 0;
            
            for(let i=0; i<candidates.size(); i++) {
                let c = candidates.get(i);
                // Bỏ qua thẻ bao ngoài (body, container)
                if (c.attr("class").includes("container") || c.attr("class").includes("wrap")) continue;
                
                let len = c.text().length;
                if (len > maxLen) {
                    maxLen = len;
                    content = c.html();
                }
            }
        }
        
        // Fallback cuối cùng: Nếu vẫn không tìm thấy, lấy luôn Body đã dọn rác
        if (!content || content.length < 100) {
            content = doc.select("body").html();
        }

        // 4. LÀM SẠCH TEXT
        if (content) {
            // Xóa các dòng text hệ thống sót lại
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            content = content.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");
            content = content.replace(/Đọc truyện.*tại.*TVTruyen/gi, "");
            
            // Format
            content = content.replace(/(<br>\s*){2,}/gi, "<br><br>"); // Giãn dòng đẹp
            
            return Response.success(content);
        }
    }
    
    return Response.success("Lỗi tải chương (Mã: " + res.status + ")");
}