function execute(url) {
    // Giả lập Chrome Mobile y hệt người dùng thật
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Referer": "https://www.tvtruyen.com/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
    });

    if (res.ok) {
        let text = res.text(); // Lấy dữ liệu thô (Raw Text)

        // --- XỬ LÝ 1: NẾU LÀ JSON (Chứa "content": "...") ---
        // Web trả về JSON nhưng bên trong lại chứa mã HTML bị escape (\n, \")
        if (text.includes('"content"')) {
            // Dùng Regex lấy nội dung trong ngoặc kép
            // Pattern: "content"\s*:\s*" (lấy mọi thứ cho đến khi gặp dấu " tiếp theo mà không bị escape)
            let match = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (match) {
                text = match[1];
                // Giải mã các ký tự đặc biệt của JSON
                text = text.replace(/\\n/g, "<br>");  // Biến \n thành xuống dòng
                text = text.replace(/\\r/g, "");
                text = text.replace(/\\"/g, '"');     // Biến \" thành "
                text = text.replace(/\\\//g, "/");    // Biến \/ thành /
                text = text.replace(/\\\\/g, "\\");
            }
        } 
        // --- XỬ LÝ 2: NẾU LÀ HTML THƯỜNG ---
        else {
            // Mẹo của Code 3: Thay thế xuống dòng thực (\n) bằng <br> trước khi parse
            text = text.replace(/\r?\n/g, "<br>");
        }

        // --- BƯỚC CUỐI: LỌC RÁC & TRẢ VỀ ---
        // Parse lại text thành HTML để dùng selector dọn rác
        let doc = Html.parse(text);
        
        // Thử lấy div nội dung chính (nếu có cấu trúc HTML)
        let contentEl = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
        let content = contentEl ? contentEl.html() : text; // Nếu không tìm thấy div, dùng nguyên text đã xử lý

        // Dọn dẹp rác
        content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search|top-nav|menu)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
        content = content.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, ""); // Xóa link rác
        content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");

        // Kiểm tra độ dài
        if (content.length < 50) {
            return Response.success("Nội dung chương trống hoặc bị khóa. <br>Vui lòng thử mở bằng trình duyệt.");
        }

        return Response.success(content);
    }
    return null;
}