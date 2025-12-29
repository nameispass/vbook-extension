function execute(url) {
    // Dùng BingBot (Đã được kiểm chứng là tải được HTML)
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();
        
        // 1. XỬ LÝ KÝ TỰ XUỐNG DÒNG (Bí kíp của Code 3)
        // Thay thế \n thành <br> ngay trên text thô để giữ định dạng
        text = text.replace(/\\n/g, "<br>"); 
        text = text.replace(/\r?\n/g, "<br>");
        
        let doc = Html.parse(text);
        
        // 2. DỌN RÁC TOÀN BỘ TRANG (QUAN TRỌNG)
        // Xóa tất cả các thành phần không phải là nội dung truyện
        let garbage = [
            "script", "style", "iframe", "svg", "noscript", "button", "input",
            ".header", "#header", "header", ".top-nav", ".navbar",
            ".footer", "#footer", "footer", ".bottom-nav",
            ".menu", "#menu", "nav", ".navigation", ".bread", ".breadcrumbs",
            ".ads", ".advertisement", ".banner", ".google-auto-placed",
            ".comment", ".comment-box", "#comment", ".list-comment",
            ".modal", "#report_modal", ".popup",
            ".search", ".box-search",
            ".sidebar", ".col-md-4", ".right-side", // Cột bên phải
            ".list-chapter", "#list-chapter", ".pagination", ".trang", // Danh sách chương ở dưới
            ".setting-box", ".fa", // Icon và setting
            "a" // Xóa sạch các link (vì trong nội dung truyện chữ không cần link)
        ];
        
        for (let g of garbage) {
            doc.select(g).remove();
        }
        
        // 3. TÌM NỘI DUNG (MỞ RỘNG)
        let content = "";
        
        // Thử các class chuẩn + class từ gợi ý của bạn (box-chap, article)
        let el = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text, div.box-chap, article").first();
        
        if (el) {
            content = el.html();
        } else {
            // --- CHIẾN THUẬT CUỐI CÙNG: VÉT CẠN BODY ---
            // Nếu không tìm thấy class nào khớp, lấy luôn thẻ BODY (đã được dọn sạch rác ở bước 2)
            // Đây là cách đảm bảo 100% không bị trắng trang, trừ khi trang web rỗng
            content = doc.select("body").html();
        }

        // 4. LÀM SẠCH LẦN CUỐI
        if (content) {
            // Xóa các dòng text hệ thống sót lại
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            content = content.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");
            content = content.replace(/Đọc truyện.*tại.*TVTruyen/gi, "");
            content = content.replace(/Copyright.*/gi, "");
            
            // Format giãn dòng cho dễ đọc
            content = content.replace(/(<br>\s*){2,}/gi, "<br><br>"); 
            
            // Kiểm tra nếu nội dung quá ngắn
            if (content.length < 50) {
                 return Response.success("Nội dung quá ngắn. <br>Server trả về: " + text.substring(0, 200));
            }

            return Response.success(content);
        }
    }
    
    return Response.success("Lỗi kết nối (Mã: " + res.status + ")");
}