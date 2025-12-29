function execute(url) {
    // Sử dụng User-Agent giả lập trình duyệt để tránh bị chặn
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        // Lấy dữ liệu thô dưới dạng văn bản
        let text = res.text();

        // Kiểm tra xem dữ liệu có phải là JSON không
        if (text.trim().startsWith("{")) {
            try {
                let json = JSON.parse(text);
                // Trích xuất nội dung từ JSON
                if (json.content) {
                    text = json.content;
                } else if (json.data && json.data.content) {
                    text = json.data.content;
                }
            } catch (e) {
                // Nếu không phân tích được JSON, thử dùng Regex để trích xuất
                let match = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                if (match) text = match[1];
            }
            
            // Xử lý các ký tự thoát trong chuỗi JSON
            text = text.replace(/\\n/g, "\n");
            text = text.replace(/\\"/g, '"');
            text = text.replace(/\\\//g, "/");
        }

        // Thay thế ký tự xuống dòng bằng thẻ <br> để hiển thị đúng định dạng
        text = text.replace(/\r?\n/g, "<br>");

        // Phân tích cú pháp HTML từ văn bản đã xử lý
        let doc = Html.parse(text);
        
        // Tìm nội dung chính trong các thẻ div thông thường
        let contentEl = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
        let content = "";

        if (contentEl) {
            content = contentEl.html();
        } else {
            // Nếu không tìm thấy thẻ div cụ thể, sử dụng toàn bộ văn bản (đã loại bỏ thẻ body/html nếu có)
            if (text.length > 200 && !text.includes("<body")) {
                content = text;
            } else {
                 // Tìm thẻ div chứa nhiều văn bản nhất làm nội dung dự phòng
                 let divs = doc.select("div");
                 let max = 0;
                 for(let i=0; i<divs.size(); i++){
                     let d = divs.get(i);
                     if(d.attr("class").includes("container") || d.attr("class").includes("main")) continue;
                     
                     if(d.text().length > max) {
                         max = d.text().length;
                         content = d.html();
                     }
                 }
            }
        }

        // Làm sạch nội dung: loại bỏ quảng cáo, script, style, và các liên kết rác
        if (content) {
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search|top-nav)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            content = content.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, "");
            content = content.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, "");
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            
            return Response.success(content);
        }
    }
    return null;
}