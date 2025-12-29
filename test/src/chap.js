function execute(url) {
    // Sử dụng User-Agent Chrome như Code 3
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        // Lấy text thô (Raw Text)
        let text = res.text();

        // --- BƯỚC 1: KIỂM TRA & BÓC TÁCH JSON ---
        // Nếu server trả về JSON {"content": "..."}, ta phải lấy nội dung ra trước
        if (text.trim().startsWith("{")) {
            try {
                let json = JSON.parse(text);
                if (json.content) {
                    text = json.content;
                } else if (json.data && json.data.content) {
                    text = json.data.content;
                }
            } catch (e) {
                // Nếu parse JSON lỗi (do ký tự lạ), dùng Regex cắt chuỗi
                let match = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                if (match) text = match[1];
            }
            
            // Xử lý các ký tự escape đặc thù của JSON sau khi bóc tách
            text = text.replace(/\\n/g, "\n"); // Đưa về xuống dòng chuẩn
            text = text.replace(/\\"/g, '"');
            text = text.replace(/\\\//g, "/");
        }

        // --- BƯỚC 2: XỬ LÝ XUỐNG DÒNG (BÍ KÍP CỦA CODE 3) ---
        // Thay thế toàn bộ ký tự xuống dòng \n bằng <br> để HTML hiển thị đúng
        text = text.replace(/\r?\n/g, "<br>");

        // --- BƯỚC 3: PARSE HTML & LẤY NỘI DUNG ---
        let doc = Html.parse(text);
        
        // Thử tìm nội dung trong các thẻ div chuẩn
        let contentEl = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
        let content = "";

        if (contentEl) {
            content = contentEl.html();
        } else {
            // Nếu không tìm thấy div (hoặc text ban đầu là JSON text trần), 
            // thì chính text đó là nội dung (sau khi đã lọc sạch thẻ body/html nếu có)
            if (text.length > 200 && !text.includes("<body")) {
                content = text;
            } else {
                 // Fallback: Tìm div chứa nhiều chữ nhất
                 let divs = doc.select("div");
                 let max = 0;
                 for(let i=0; i<divs.size(); i++){
                     let d = divs.get(i);
                     // Bỏ qua div hệ thống
                     if(d.attr("class").includes("container") || d.attr("class").includes("main")) continue;
                     
                     if(d.text().length > max) {
                         max = d.text().length;
                         content = d.html();
                     }
                 }
            }
        }

        // --- BƯỚC 4: DỌN RÁC ---
        if (content) {
            // Xóa rác hệ thống
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search|top-nav)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            
            // Xóa các link rác
            content = content.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, "");
            content = content.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, "");
            
            // Xóa text quảng cáo
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            
            return Response.success(content);
        }
    }
    return null;
}