function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();
        let content = "";

        // --- BƯỚC 1: CẮT CHUỖI JSON ---
        // Tìm đoạn text nằm giữa "content":" và "," (hoặc "})
        let startKey = '"content":"';
        let startIndex = text.indexOf(startKey);
        
        if (startIndex >= 0) {
            // Cắt bỏ phần đầu
            let temp = text.substring(startIndex + startKey.length);
            
            // Tìm điểm kết thúc nội dung. 
            // Nội dung thường kết thúc bởi chuỗi "," (chuyển sang key tiếp theo)
            // Hoặc "host" hoặc "next"
            let endIndex = temp.indexOf('","');
            if (endIndex === -1) endIndex = temp.lastIndexOf('"');
            
            if (endIndex > 0) {
                content = temp.substring(0, endIndex);
            }
        } 
        
        // Fallback: Nếu không tìm thấy JSON, thử lấy HTML thường
        if (!content) {
            let doc = res.html();
            if (doc) {
                let el = doc.select("#content, .content-hienthi, .chapter-c").first();
                if (el) content = el.html();
            }
        }

        // --- BƯỚC 2: LÀM SẠCH DỮ LIỆU ---
        if (content) {
            // A. Giải mã ký tự JSON (\n, \t, \")
            content = content.replace(/\\n/g, "<br>");  // Quan trọng: \n -> xuống dòng
            content = content.replace(/\\r/g, "");
            content = content.replace(/\\t/g, " ");
            content = content.replace(/\\"/g, '"');
            content = content.replace(/\\\//g, "/");
            content = content.replace(/\\\\/g, "\\");

            // B. Xóa Menu/Link rác (Dựa trên ảnh lỗi JSON bạn gửi)
            // Xóa các link (thể loại, truyện mới...)
            content = content.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, "");
            
            // Xóa danh sách ul li (menu)
            content = content.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, "");
            content = content.replace(/<li[^>]*>[\s\S]*?<\/li>/gi, "");
            
            // Xóa Footer và Điều khoản
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            content = content.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");
            
            // C. Xóa Script/Style/SVG
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");

            // D. Thẩm mỹ (Xóa dòng trống thừa)
            content = content.replace(/(<br>\s*){2,}/gi, "<br><br>");

            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    return Response.success({
        content: "Lỗi kết nối (GoogleBot thất bại). Mã lỗi: " + (res.status || "Unknown"),
        host: "https://www.tvtruyen.com"
    });
}