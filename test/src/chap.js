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

        // --- CÁCH 1: REGEX BẮT JSON (LINH HOẠT HƠN) ---
        // Tìm key "content" theo sau là dấu hai chấm (có thể có khoảng trắng) và dấu ngoặc kép
        let jsonMatch = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        
        if (jsonMatch) {
            content = jsonMatch[1];
        } 
        // --- CÁCH 2: HTML FALLBACK ---
        else {
            let doc = res.html();
            if (doc) {
                let el = doc.select("#content, .content-hienthi, .chapter-c, #chapter-c").first();
                if (el) content = el.html();
            }
        }

        if (content) {
            // GIẢI MÃ JSON
            try {
                // Thử giải mã bằng JSON.parse một đoạn nhỏ
                content = content.replace(/\\n/g, "<br>");
                content = content.replace(/\\"/g, '"');
                content = content.replace(/\\\//g, "/");
                content = content.replace(/\\\\/g, "\\");
                content = content.replace(/\\t/g, " ");
            } catch (e) {
                // Nếu lỗi thì giữ nguyên replace cơ bản
            }

            // DỌN RÁC (Giữ nguyên bộ lọc rác cũ)
            content = content.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, "");
            content = content.replace(/<li[^>]*>[\s\S]*?<\/li>/gi, "");
            content = content.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, "");
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search|top-nav)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
            
            // Xóa dòng trống
            content = content.replace(/(<br>\s*){2,}/gi, "<br><br>");

            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    // In ra 100 ký tự đầu của response để debug nếu vẫn lỗi
    let debugText = "";
    try {
        let raw = res.text();
        debugText = raw.substring(0, 100).replace(/</g, "&lt;");
    } catch(e) {}

    return Response.success({
        content: "Không lấy được nội dung (Mã 200).<br>Server trả về: " + debugText,
        host: "https://www.tvtruyen.com"
    });
}