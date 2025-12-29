function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();

        // --- BƯỚC 1: XÓA RÁC (CLEAN UP) ---
        // Xóa tất cả các thành phần không phải truyện
        let garbageClasses = [
            ".modal", "#report_modal", ".report-content", // Phần báo cáo
            ".comment-box", "#comment", ".list-comment",  // Phần bình luận
            "form", ".form-group",                        // Các form nhập liệu
            ".ads", ".google-auto-placed", "iframe",      // Quảng cáo
            ".text-center", ".navigation", ".footer",     // Điều hướng đầu đuôi
            "div[style*='display:none']"                  // Các thẻ ẩn
        ];
        
        for (let cls of garbageClasses) {
            doc.select(cls).remove();
        }

        // --- BƯỚC 2: LẤY NỘI DUNG ---
        let content = "";
        
        // Ưu tiên theo thứ tự độ chính xác
        let e = doc.select("#content").first();
        if (!e) e = doc.select(".content-hienthi").first();
        if (!e) e = doc.select(".chapter-c").first();
        if (!e) e = doc.select(".truyen-text").first();

        if (e) {
            // Xóa thẻ 'a' trong nội dung (thường là tên web chèn vào)
            e.select("a").remove(); 
            content = e.html();
        } 
        // Fallback: Nếu không tìm thấy class chuẩn, tìm thẻ div to nhất còn lại
        else {
            let divs = doc.select("div");
            let maxLen = 0;
            for(let i=0; i<divs.size(); i++) {
                let d = divs.get(i);
                // Bỏ qua các thẻ container hệ thống
                if (d.attr("class") && (d.attr("class").includes("container") || d.attr("class").includes("main"))) continue;
                
                let len = d.text().length;
                if (len > maxLen) {
                    maxLen = len;
                    content = d.html();
                }
            }
        }

        if (content && content.length > 50) {
            // Xử lý định dạng text
            content = content.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, ""); // Xóa icon SVG
            content = content.replace(/<defs[^>]*>[\s\S]*?<\/defs>/gi, "");
            content = content.replace(/&nbsp;/g, " ");
            
            return Response.success({
                content: content,
                next: null,
                prev: null,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    return null;
}