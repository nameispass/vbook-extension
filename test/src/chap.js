function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        
        // 1. Xóa rác quảng cáo/script trước để không ảnh hưởng việc đếm chữ
        doc.select("script, style, iframe, .ads, .google-auto-placed, .fb-comments").remove();
        doc.select("div[style*='display:none']").remove();
        doc.select("a[href*='tvtruyen'], .logo-truyen").remove();

        // 2. Thuật toán tìm nội dung: Tìm thẻ div chứa nhiều text nhất
        let content = "";
        
        // Ưu tiên 1: Tìm theo các class phổ biến (nhanh hơn)
        let candidate = doc.select("#content, .content-hienthi, .chapter-c, .entry-content").first();
        if (candidate && candidate.text().length > 100) {
            content = candidate.html();
        } 
        // Ưu tiên 2: Nếu không thấy, quét tất cả thẻ div (chậm hơn chút nhưng chắc ăn)
        else {
            let divs = doc.select("div, article");
            let maxLen = 0;
            let bestDiv = null;
            
            for (let i = 0; i < divs.size(); i++) {
                let div = divs.get(i);
                // Bỏ qua các thẻ bao ngoài quá lớn (như body, container chính)
                if (div.attr("class") && div.attr("class").includes("container")) continue;
                
                let textLen = div.text().trim().length;
                if (textLen > maxLen) {
                    maxLen = textLen;
                    bestDiv = div;
                }
            }
            
            if (bestDiv && maxLen > 200) { // Nội dung phải dài hơn 200 ký tự mới tính
                content = bestDiv.html();
            }
        }

        if (content) {
            // 3. Làm sạch lần cuối
            content = content.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
            content = content.replace(/<defs[^>]*>[\s\S]*?<\/defs>/gi, "");
            content = content.replace(/&nbsp;/g, " ");
            
            // Xóa các dòng rác thường thấy ở đầu/cuối
            content = content.replace(/Truyện được copy tại.*/gi, "");
            
            return Response.success({
                content: content,
                next: null,
                prev: null,
                host: "https://www.tvtruyen.com"
            });
        } else {
             // Fallback: Nếu vẫn không tìm thấy, trả về thông báo lỗi đẹp
             return Response.success({
                content: "<p>Không lấy được nội dung chương này. Có thể là chương ảnh hoặc nội dung bị khóa VIP.</p>",
                next: null,
                prev: null,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    return null;
}