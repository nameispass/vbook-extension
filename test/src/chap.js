function execute(url) {
    // Thêm Header để server trả về nội dung chuẩn
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let doc = res.html();

        // 1. DỌN RÁC (Xóa Popup báo cáo, Bình luận, Script)
        // Xóa ngay lập tức các thành phần gây nhiễu
        let garbage = [
            ".modal", "#report_modal", ".report-content", // Khung báo cáo
            ".comment-box", "#comment", ".list-comment",  // Khung bình luận
            "form", ".form-group", "input", "textarea",   // Form nhập liệu
            "script", "style", "iframe", ".ads",          // Code rác
            ".google-auto-placed", "div[style*='display:none']",
            ".alert", ".breadcrumb", ".footer"
        ];
        garbage.forEach(g => doc.select(g).remove());

        // 2. TÌM NỘI DUNG
        // Ưu tiên các vùng nội dung chuẩn
        let contentEl = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
        
        // Fallback: Nếu không thấy, tìm thẻ div chứa nhiều chữ nhất
        if (!contentEl) {
            let divs = doc.select("div");
            let maxLen = 0;
            for(let i=0; i<divs.size(); i++) {
                let d = divs.get(i);
                if (d.attr("class") && (d.attr("class").includes("container") || d.attr("class").includes("main"))) continue;
                let len = d.text().length;
                if (len > maxLen) {
                    maxLen = len;
                    contentEl = d;
                }
            }
        }

        if (contentEl) {
            // Xóa rác bên trong nội dung một lần nữa
            contentEl.select(".text-center, .advertisement, a, strong:contains(Truyện), i:contains(Truyện)").remove();
            
            let html = contentEl.html();

            // 3. XỬ LÝ KÝ TỰ LẠ (Fix lỗi hiển thị \n, <\/div>)
            // Nếu server trả về text bị escape (\n, \t, \/), ta phải replace nó
            if (html.includes("\\n") || html.includes("\\/")) {
                html = html.replace(/\\n/g, "<br>"); // Biến \n thành xuống dòng
                html = html.replace(/\\t/g, " ");    // Biến \t thành khoảng trắng
                html = html.replace(/\\\/div>/g, ""); // Xóa thẻ đóng div lỗi
                html = html.replace(/\\/g, "");      // Xóa các dấu gạch chéo ngược còn lại
            }

            // Xử lý icon SVG rác (dùng regex [\s\S] để tránh lỗi flag s)
            html = html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
            html = html.replace(/<defs[^>]*>[\s\S]*?<\/defs>/gi, "");
            
            // Xử lý JSON rác nếu có (như ảnh bạn gửi)
            if (html.startsWith("{") && html.includes("content")) {
                // Nếu nội dung lại là 1 chuỗi JSON, cố gắng lọc lấy text
                html = "Nội dung đang được cập nhật hoặc bị lỗi định dạng.";
            }

            return Response.success({
                content: html,
                next: null,
                prev: null,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    return null;
}