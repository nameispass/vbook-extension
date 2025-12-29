function execute(url) {
    // 1. Dùng GoogleBot (Chìa khóa để không bị chặn)
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();

        // 2. GIẢI MÃ KÝ TỰ "CỨNG ĐẦU" NGAY TỪ ĐẦU
        // Biến tất cả các ký tự \n (xuống dòng mã hóa) thành thẻ <br> ngay lập tức
        // Bất kể nó nằm trong JSON hay HTML
        text = text.replace(/\\n/g, "<br>"); 
        text = text.replace(/\\r/g, "");
        text = text.replace(/\\t/g, " ");
        
        // Giải mã ký tự đặc biệt
        text = text.replace(/\\"/g, '"');  // \" -> "
        text = text.replace(/\\\//g, "/"); // \/ -> /
        text = text.replace(/\\\\/g, "\\");

        // 3. CHIẾN THUẬT VÉT CẠN NỘI DUNG
        // Thay vì parse JSON (dễ lỗi), ta dùng Regex để cắt bỏ phần đầu và đuôi của JSON
        // Thường JSON bắt đầu bằng {"content":" và kết thúc bằng "}
        
        // Xóa phần đầu JSON rác
        text = text.replace(/^[\s\S]*?"content"\s*:\s*"/, ""); 
        // Xóa phần đuôi JSON rác (từ dấu ngoặc kép cuối cùng trở đi)
        text = text.replace(/"\s*,?\s*"host"[\s\S]*$/, "");
        text = text.replace(/"\s*}\s*$/, "");

        // 4. DỌN RÁC HTML (BỘ LỌC)
        // Xóa script, style
        text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        
        // Xóa các menu, footer, quảng cáo (Dựa trên class phổ biến)
        text = text.replace(/<div[^>]*class="[^"]*(footer|ads|box-search|top-nav|menu|bread)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
        
        // Xóa các danh sách link (Menu truyện hot, thể loại...)
        text = text.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, "");
        text = text.replace(/<li[^>]*>[\s\S]*?<\/li>/gi, "");
        
        // Xóa các dòng text hệ thống cụ thể
        text = text.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
        text = text.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");
        text = text.replace(/Đọc truyện.*tại.*TVTruyen/gi, "");

        // 5. THẨM MỸ HÓA
        // Xóa các thẻ div còn sót lại (chỉ giữ text)
        text = text.replace(/<div[^>]*>/gi, "");
        text = text.replace(/<\/div>/gi, "<br>");
        
        // Xóa dòng trống thừa
        text = text.replace(/(<br>\s*){2,}/gi, "<br><br>");
        
        // Cắt bỏ các ký tự rác ở đầu/cuối chuỗi nếu còn sót
        text = text.trim();
        if (text.endsWith('"')) text = text.slice(0, -1);

        // 6. KIỂM TRA LẦN CUỐI
        // Nếu sau khi lọc mà nội dung quá ngắn (<100 ký tự) -> Có thể lỗi
        if (text.length < 100) {
            // Thử fallback sang HTML parser thường nếu cách trên lỡ tay xóa hết
            let doc = Html.parse(res.text()); // Parse lại từ text gốc
            let el = doc.select("#content, .content-hienthi").first();
            if (el) text = el.html();
        }

        return Response.success(text);
    }
    
    return null;
}