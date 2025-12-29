function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();
        let content = "";

        // --- XỬ LÝ 1: NẾU LÀ JSON ---
        if (text.trim().startsWith("{")) {
            try {
                let json = JSON.parse(text);
                if (json.content) content = json.content;
                else if (json.data && json.data.content) content = json.data.content;
            } catch (e) {
                // Parse lỗi thì coi như là HTML thường
                content = text;
            }
        } 
        // --- XỬ LÝ 2: NẾU LÀ HTML THƯỜNG ---
        else {
             // Tự tạo doc để select cho dễ
             let doc = res.html();
             
             // Dọn rác trước
             doc.select("script, style, iframe, .ads, .modal, #report_modal, .comment-box, form").remove();
             
             // Chọn nội dung
             let el = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
             
             // Fallback tìm div to nhất
             if (!el) {
                 let divs = doc.select("div");
                 let max = 0;
                 for (let i = 0; i < divs.size(); i++) {
                     let d = divs.get(i);
                     if (d.attr("class") && (d.attr("class").includes("container") || d.attr("class").includes("wrap"))) continue;
                     let len = d.text().length;
                     if (len > max) { max = len; el = d; }
                 }
             }
             
             if (el) {
                 el.select(".text-center, a").remove(); // Xóa rác trong nội dung
                 content = el.html();
             }
        }

        // --- XỬ LÝ 3: GIẢI MÃ KÝ TỰ (QUAN TRỌNG) ---
        if (content && content.length > 0) {
            // Fix lỗi hiển thị \n, \/div từ JSON raw
            content = content.replace(/\\n/g, "<br>");
            content = content.replace(/\\t/g, " ");
            content = content.replace(/\\\//g, "/"); // Biến \/ thành /
            content = content.replace(/\\"/g, '"');
            
            // Xóa thẻ code rác nếu có
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            
            // Xóa SVG gây lỗi flag s
            content = content.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
            content = content.replace(/<defs[^>]*>[\s\S]*?<\/defs>/gi, "");

            return Response.success({
                content: content,
                next: null,
                prev: null,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    // Trả về thông báo lỗi thay vì null để người dùng biết
    return Response.success({
        content: "Không lấy được nội dung chương này. Vui lòng thử 'Tải lại' hoặc kiểm tra trên trình duyệt.",
        next: null,
        prev: null,
        host: "https://www.tvtruyen.com"
    });
}