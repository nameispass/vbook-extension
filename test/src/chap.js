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

        // --- CHIẾN THUẬT 1: BÓC TÁCH JSON BẰNG REGEX (Mạnh hơn JSON.parse) ---
        // Tìm chuỗi "content":"..." bất kể cấu trúc xung quanh
        // Regex này bắt được nội dung nằm giữa "content":" và " tiếp theo, xử lý cả ký tự escape
        let match = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        
        if (match) {
            content = match[1]; // Lấy nội dung bên trong dấu ngoặc kép
        } else {
            // --- CHIẾN THUẬT 2: NẾU KHÔNG PHẢI JSON, XỬ LÝ HTML ---
            // Đôi khi Googlebot lại nhận được HTML thường
            content = text;
            // Xóa rác HTML nếu cần thiết (như code cũ)
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            
            // Tìm div nội dung nếu là HTML
            let doc = res.html();
            if (doc) {
                 let el = doc.select("#content, .content-hienthi, .chapter-c").first();
                 if (el) content = el.html();
            }
        }

        // --- CHIẾN THUẬT 3: GIẢI MÃ KÝ TỰ (QUAN TRỌNG) ---
        if (content) {
            // Xử lý các ký tự \n, \t, \" do JSON trả về
            // JSON.parse tự làm việc này, nhưng nếu dùng Regex ta phải tự làm
            try {
                // Mẹo: Dùng JSON.parse để giải mã chuỗi string đơn lẻ
                content = JSON.parse('"' + content + '"');
            } catch (e) {
                // Nếu lỗi, giải mã thủ công
                content = content.replace(/\\n/g, "<br>");
                content = content.replace(/\\t/g, " ");
                content = content.replace(/\\"/g, '"');
                content = content.replace(/\\\//g, "/");
            }
            
            // Dọn rác lần cuối
            content = content.replace(/\\r/g, "");
            content = content.replace(/<div[^>]*>/gi, "");
            content = content.replace(/<\/div>/gi, "<br>");

            // Kiểm tra nếu nội dung quá ngắn -> Báo lỗi cụ thể
            if (content.length < 50) {
                 return Response.success({
                    content: "Nội dung chương quá ngắn hoặc bị lỗi tải. <br>Dữ liệu thô: " + content.substring(0, 100),
                    host: "https://www.tvtruyen.com"
                });
            }

            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    // Thay vì trả về null (gây lỗi app), trả về thông báo lỗi để bạn biết server phản hồi gì
    return Response.success({
        content: "Lỗi kết nối đến server (Mã lỗi: " + res.code + "). Vui lòng thử lại sau.",
        host: "https://www.tvtruyen.com"
    });
}