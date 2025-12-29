function execute(url) {
    // 1. Dùng GoogleBot (Bắt buộc để lấy dữ liệu)
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();

        // 2. TIỀN XỬ LÝ: Biến JSON/Text thành HTML chuẩn
        // Nếu là JSON {"content":...}, bóc tách lấy ruột
        let jsonMatch = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (jsonMatch) {
            text = jsonMatch[1];
            // Giải mã ký tự
            text = text.replace(/\\n/g, "<br>").replace(/\\"/g, '"').replace(/\\\//g, "/");
        } else {
            // Nếu là HTML thường, thay thế xuống dòng
            text = text.replace(/\r?\n/g, "<br>");
        }

        // 3. PARSE HTML
        let doc = Html.parse(text);

        // 4. ÁP DỤNG LOGIC CODE 5: TÌM & DỌN RÁC
        if (doc) {
            // A. Tìm vùng chứa nội dung (Thử các selector phổ biến của TVTruyen)
            let content = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
            
            // Fallback: Nếu không tìm thấy class cụ thể, lấy Body (nhưng phải dọn rác kỹ ở bước sau)
            if (!content) {
                content = doc.select("body").first();
            }

            // B. Dọn rác (Giống hàm loadNewWeb/loadOldWeb trong Code 5)
            if (content) {
                // Xóa rác hệ thống
                content.select("script, style, iframe, svg, noscript, button, input").remove();
                
                // Xóa Modal/Popup (Cái khung 'Danh sách chương' trong ảnh lỗi của bạn)
                content.select("[class*='chapter-modal'], .modal, #modal").remove();
                
                // Xóa Header, Footer, Menu, Quảng cáo
                content.select(".header, .footer, .menu, .nav, .box-search, .ads, .banner").remove();
                content.select(".list-chapter, .pagination, .bread, .alert").remove();
                
                // Xóa các link rác
                content.select("a").remove();

                // C. Trả về HTML đã làm sạch
                let html = content.html();
                
                // Xử lý text rác còn sót lại bằng Regex
                html = html.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
                html = html.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");
                html = html.replace(/Đọc truyện.*tại.*TVTruyen/gi, "");
                
                // Format lại dòng cho đẹp
                html = html.replace(/(<br>\s*){2,}/gi, "<br><br>");

                // Kiểm tra nếu nội dung quá ngắn -> Báo lỗi
                if (html.length < 100) {
                    return Response.success("Nội dung quá ngắn (Có thể bị lỗi tải).<br>Thử tải lại.");
                }

                return Response.success(html);
            }
        }
    }
    
    return Response.success("Lỗi kết nối (Mã: 200). Không tìm thấy nội dung.");
}