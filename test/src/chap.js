function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        
        // 1. Chọn vùng nội dung chính xác
        // TVTruyen thường để nội dung trong #content hoặc .content-hienthi
        let contentEl = doc.select("#content, .content-hienthi").first();
        
        if (contentEl) {
            // 2. Xóa rác (Quảng cáo, Logo, Script) TRƯỚC khi lấy html
            // Tuyệt đối không dùng .parent(), chỉ dùng .select().remove()
            contentEl.select("script, iframe, style, .ads, .google-auto-placed, div[style*='display:none']").remove();
            contentEl.select("a[href*='tvtruyen'], .logo-truyen").remove(); // Xóa dòng quảng cáo tên web

            let html = contentEl.html();
            
            // 3. Xử lý text rác bằng Regex (nếu còn sót)
            // Xóa các dòng text vô nghĩa hoặc svg rác
            html = html.replace(/<svg[^>]*>.*?<\/svg>/gsi, "");
            
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