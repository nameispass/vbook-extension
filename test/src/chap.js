function execute(url) {
    // 1. DÙNG GOOGLEBOT (Chìa khóa duy nhất để qua tường lửa)
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();
        let content = "";

        // 2. BÓC TÁCH NỘI DUNG TỪ JSON (Chiến thuật cắt chuỗi)
        // Tìm vị trí bắt đầu của "content":"
        let startKey = '"content":"';
        let startIndex = text.indexOf(startKey);
        
        if (startIndex >= 0) {
            // Cắt từ sau dấu : "
            let temp = text.substring(startIndex + startKey.length);
            
            // Tìm dấu ngoặc kép đóng chuỗi (kết thúc nội dung)
            // Lưu ý: Phải tìm dấu " mà KHÔNG bị escape (tức là không phải \")
            // Cách đơn giản nhất: Tìm chuỗi `","` (thường là key tiếp theo như "host" hoặc "next")
            let endIndex = temp.indexOf('","');
            if (endIndex === -1) endIndex = temp.lastIndexOf('"'); // Hoặc tìm dấu " cuối cùng
            
            if (endIndex > 0) {
                content = temp.substring(0, endIndex);
            }
        } 
        
        // Fallback: Nếu không phải JSON, thử lấy HTML thường
        if (!content) {
            let doc = res.html();
            if (doc) {
                let el = doc.select("#content, .content-hienthi, .chapter-c").first();
                if (el) content = el.html();
            }
        }

        // 3. XỬ LÝ & LÀM SẠCH (QUAN TRỌNG NHẤT)
        if (content) {
            // Bước A: Giải mã ký tự JSON (\n -> xuống dòng, \" -> ")
            content = content.replace(/\\n/g, "<br>");
            content = content.replace(/\\r/g, "");
            content = content.replace(/\\t/g, " ");
            content = content.replace(/\\"/g, '"');
            content = content.replace(/\\\//g, "/");
            content = content.replace(/\\\\/g, "\\");

            // Bước B: Xóa rác Menu/Quảng cáo (Dựa trên ảnh lỗi bạn gửi)
            // Xóa tất cả các danh sách (ul, li) -> Đây là cái menu "Truyện hot", "Ngôn tình"...
            content = content.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, "");
            content = content.replace(/<li[^>]*>[\s\S]*?<\/li>/gi, "");
            
            // Xóa các thẻ Link (a) -> Xóa "truyện mới", "thể loại"
            content = content.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, "");

            // Xóa Footer và các div rác
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search|top-nav)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            content = content.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");

            // Bước C: Xóa thẻ Script/Style/SVG
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");

            // Bước D: Thẩm mỹ (Xóa dòng trống)
            content = content.replace(/(<br>\s*){2,}/gi, "<br><br>");

            // Kiểm tra độ dài nội dung sau khi lọc
            if (content.length < 50) {
                 return Response.success({
                    content: "Nội dung chương ngắn bất thường. Có thể là chương ảnh hoặc bị lỗi lọc.",
                    host: "https://www.tvtruyen.com"
                });
            }

            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    return Response.success({
        content: "Lỗi kết nối (Mã: " + (res.status || "Unknown") + "). Vui lòng thử lại.",
        host: "https://www.tvtruyen.com"
    });
}