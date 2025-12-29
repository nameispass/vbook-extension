function execute(url) {
    // Đổi sang User-Agent của người dùng thật để tránh bị chặn ở trang chương
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-A505F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.74 Mobile Safari/537.36",
            "Referer": "https://www.tvtruyen.com/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
    });

    if (res.ok) {
        let text = res.text();
        let content = "";

        // --- CHIẾN THUẬT: ĐÀO DỮ LIỆU ---
        // 1. Thử tìm JSON content (Cấu trúc: "content": "...")
        // Dùng Regex lấy nội dung trong ngoặc kép
        let match = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (match) {
            content = match[1];
            // Giải mã JSON string thủ công để tránh lỗi
            try {
                 // Hack: Parse chuỗi JSON nhỏ để giải mã ký tự escape
                 content = JSON.parse('"' + content + '"'); 
            } catch (e) {
                 content = content.replace(/\\n/g, "<br>").replace(/\\"/g, '"').replace(/\\\//g, "/");
            }
        } 
        // 2. Nếu không ra, thử tìm HTML thuần
        else {
            // Parse HTML nếu server trả về trang web
            let doc = res.html();
            if (doc) {
                let el = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
                if (el) content = el.html();
            }
        }

        // --- DỌN DẸP NỘI DUNG ---
        if (content && content.length > 0) {
            // Xóa rác hệ thống (Header, Footer, Quảng cáo)
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search|top-nav)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            
            // Xóa các dòng link rác
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            content = content.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");

            // Format lại dòng
            content = content.replace(/\n/g, "<br>");
            content = content.replace(/<br>\s*<br>/g, "<br>"); // Xóa dòng trống kép

            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    // Nếu vẫn lỗi, trả về nội dung báo lỗi chi tiết hơn
    let errCode = (res.status) ? res.status : (res.code ? res.code : "Unknown");
    return Response.success({
        content: "Không tải được chương này. (Lỗi: " + errCode + ").<br>Vui lòng thử tải lại hoặc mở bằng trình duyệt.",
        host: "https://www.tvtruyen.com"
    });
}