function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();
        let content = "";

        // --- BƯỚC 1: BÓC TÁCH JSON ---
        // Server trả về dạng: {"content": "Nội dung truyện..."}
        // Ta dùng Regex để lấy nội dung trong ngoặc kép của key "content"
        let match = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        
        if (match) {
            content = match[1]; // Lấy nội dung thô
        } else {
            // Nếu không phải JSON, thử xử lý như HTML thường
            let doc = res.html();
            if (doc) {
                let el = doc.select("#content, .content-hienthi, .chapter-c").first();
                if (el) content = el.html();
            }
        }

        // --- BƯỚC 2: GIẢI MÃ & LÀM SẠCH (QUAN TRỌNG) ---
        if (content && content.length > 0) {
            // 1. Giải mã ký tự escape của JSON (\n, \t, \")
            try {
                // Dùng JSON.parse cho chuỗi string để giải mã chuẩn nhất
                content = JSON.parse('"' + content + '"');
            } catch (e) {
                // Fallback thủ công nếu lỗi
                content = content.replace(/\\n/g, "<br>");
                content = content.replace(/\\t/g, " ");
                content = content.replace(/\\"/g, '"');
                content = content.replace(/\\\//g, "/");
            }

            // 2. Xóa các thẻ rác hệ thống (Footer, Header, Quảng cáo)
            // Xóa các link rác như trong ảnh bạn gửi (truyện mới, thể loại...)
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            content = content.replace(/Điều Khoản[\s\S]*?Chính Sách Bảo Mật/gi, ""); 
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            
            // Xóa thẻ style, script
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

            // 3. Định dạng lại
            content = content.replace(/\n/g, "<br>"); // Chuyển xuống dòng thành thẻ br
            content = content.replace(/<br>\s*<br>/g, "<br>"); // Xóa dòng trống thừa

            // Kiểm tra nếu nội dung quá ngắn (chỉ còn lại rác)
            if (content.length < 100) {
                 return Response.success({
                    content: "Chương này có nội dung quá ngắn hoặc là chương ảnh. <br>Vui lòng thử mở bằng trình duyệt.",
                    host: "https://www.tvtruyen.com"
                });
            }

            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    return Response.success({
        content: "Lỗi kết nối hoặc không lấy được dữ liệu. (Response Code: " + res.code + ")",
        host: "https://www.tvtruyen.com"
    });
}