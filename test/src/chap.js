function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Mobile Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text(); // Lấy text thô trước
        let content = "";

        // --- XỬ LÝ JSON (FIX LỖI HIỂN THỊ NGOẶC NHỌN {}) ---
        // Nếu text bắt đầu bằng {, khả năng cao là JSON
        if (text.trim().startsWith("{")) {
            try {
                let json = JSON.parse(text);
                // TVTruyen thường trả về json.content hoặc json.data.content
                if (json.content) content = json.content;
                else if (json.data && json.data.content) content = json.data.content;
                
                // Nếu JSON rỗng (như ảnh 6d1de0), báo lỗi
                if (!content) {
                    return Response.success({
                        content: "<p>Nội dung chương này đang bị lỗi từ phía server (Trả về rỗng). Vui lòng thử chương khác.</p>",
                        host: "https://www.tvtruyen.com"
                    });
                }
            } catch (e) {
                // Nếu parse lỗi, dùng regex trích xuất thô
                let match = text.match(/"content"\s*:\s*"([^"]+)"/);
                if (match) content = match[1];
                else content = text; // Fallback dùng nguyên text
            }
        } else {
            // Nếu là HTML thường
            let doc = res.html();
            if (doc) {
                // Xóa rác
                doc.select(".modal, #report_modal, .comment-box, form, .ads").remove();
                let el = doc.select("#content, .content-hienthi, .chapter-c").first();
                if (!el) {
                     // Tìm div to nhất
                     let divs = doc.select("div");
                     let max = 0;
                     for(let i=0; i<divs.size(); i++){
                         let d = divs.get(i);
                         if(d.text().length > max && !d.attr("class").includes("container")) {
                             max = d.text().length;
                             el = d;
                         }
                     }
                }
                if (el) content = el.html();
            }
        }

        // --- GIẢI MÃ HTML & FIX KÝ TỰ LẠ (\n, \/div) ---
        if (content) {
            // Xử lý các ký tự escape của JSON
            content = content.replace(/\\n/g, "<br>");  // Biến \n thành xuống dòng
            content = content.replace(/\\t/g, " ");     // Biến \t thành khoảng trắng
            content = content.replace(/\\\//g, "/");    // Biến \/ thành /
            content = content.replace(/\\"/g, '"');     // Biến \" thành "
            content = content.replace(/\\r/g, "");

            // Xóa thẻ rác còn sót lại
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<\/div>/gi, ""); // Xóa thẻ đóng div thừa thãi
            content = content.replace(/<div[^>]*>/gi, "<br>"); // Biến thẻ mở div thành xuống dòng cho thoáng

            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    return null;
}