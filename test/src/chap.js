function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        
        // TVTruyen thường dùng class này cho nội dung
        let contentElement = doc.select(".content-hienthi");
        
        // Fallback nếu không tìm thấy class trên
        if (!contentElement || contentElement.size() === 0) {
            contentElement = doc.select("#content");
        }

        if (contentElement.size() > 0) {
            let elem = contentElement.get(0);
            
            // Xóa các thành phần rác thường gặp trong content
            elem.select("script, style, iframe, .ads, .google-auto-placed, div[style*='display:none']").remove();
            
            // Xóa các dòng text quảng cáo nếu có
            let content = elem.html();

            // Làm sạch các thẻ SVG/Path rác như trong ảnh lỗi của bạn
            content = content.replace(/<svg[^>]*>.*?<\/svg>/gsi, "");
            content = content.replace(/<defs[^>]*>.*?<\/defs>/gsi, "");
            
            return Response.success({
                content: content,
                next: null, // vbook tự động xử lý next/prev dựa trên danh sách chương
                prev: null,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    return null;
}