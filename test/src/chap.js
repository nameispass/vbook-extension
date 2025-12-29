function execute(url) {
    // 1. QUAY LẠI DÙNG GOOGLEBOT (Vì nó không bị chặn kết nối)
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();
        let content = "";

        // 2. XỬ LÝ DỮ LIỆU JSON
        // Tìm chuỗi nằm giữa "content":" và " (hoặc hết chuỗi)
        // Regex này bỏ qua các dấu ngoặc kép đã được escape (\")
        let match = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        
        if (match) {
            content = match[1];
        } else {
            // Nếu không khớp regex, có thể dữ liệu là HTML thường
            let doc = res.html();
            if (doc) {
                let el = doc.select("#content, .content-hienthi, .chapter-c").first();
                if (el) content = el.html();
                else content = text; // Fallback lấy toàn bộ text nếu không tìm thấy div
            }
        }

        // 3. GIẢI MÃ & DỌN RÁC (QUAN TRỌNG NHẤT)
        if (content) {
            // Bước A: Giải mã ký tự JSON cơ bản
            // Thay thế thủ công để an toàn hơn JSON.parse
            content = content.replace(/\\n/g, "<br>");  // \n -> Xuống dòng
            content = content.replace(/\\r/g, "");      // \r -> Xóa
            content = content.replace(/\\t/g, " ");     // \t -> Khoảng trắng
            content = content.replace(/\\"/g, '"');     // \" -> "
            content = content.replace(/\\\//g, "/");    // \/ -> /
            content = content.replace(/\\\\/g, "\\");   // \\ -> \

            // Bước B: Xóa rác HTML (Footer, Quảng cáo, Link rác)
            // Xóa các div chứa class rác thường gặp
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search|top-nav|menu)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            
            // Xóa các dòng link rác cụ thể (như trong ảnh bạn gửi)
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            content = content.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");
            content = content.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, ""); // Xóa các danh sách ul (thường là menu)
            content = content.replace(/<li[^>]*>[\s\S]*?<\/li>/gi, "");

            // Bước C: Xóa thẻ Script/Style cứng đầu
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

            // Bước D: Thẩm mỹ
            // Xóa các dòng trống liên tiếp
            content = content.replace(/(<br>\s*){2,}/gi, "<br>");
            
            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    // Báo lỗi chi tiết nếu vẫn thất bại
    return Response.success({
        content: "Lỗi tải chương (Mã: " + (res.status || "Unknown") + ").<br>Vui lòng thử lại sau.",
        host: "https://www.tvtruyen.com"
    });
}