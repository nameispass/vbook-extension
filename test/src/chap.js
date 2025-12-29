function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        
        // Tìm vùng nội dung
        let contentEl = doc.select("#content, .content-hienthi, .chapter-c").first();
        
        if (contentEl) {
            // Xóa rác trước khi lấy HTML
            contentEl.select("script, iframe, style, .ads, .google-auto-placed, div[style*='display:none']").remove();
            contentEl.select("a[href*='tvtruyen'], .logo-truyen").remove();

            let html = contentEl.html();
            
            // --- KHẮC PHỤC LỖI "invalid flag 's'" TẠI ĐÂY ---
            // Thay vì dùng /.../gsi (gây lỗi), ta dùng /.../gi kết hợp [\s\S]
            // [\s\S] nghĩa là: khớp ký tự khoảng trắng HOẶC không phải khoảng trắng -> Tức là khớp TẤT CẢ
            
            html = html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
            html = html.replace(/<defs[^>]*>[\s\S]*?<\/defs>/gi, "");
            html = html.replace(/&nbsp;/g, " "); // Thay thế khoảng trắng đặc biệt

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