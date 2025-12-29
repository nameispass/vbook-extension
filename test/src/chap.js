function execute(url) {
    // 1. Dùng GoogleBot để đi qua tường lửa (như các lần trước đã test thành công)
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        // Lấy dữ liệu thô (giống ý tưởng Code 3 của bạn)
        let text = res.text();
        let content = "";

        // --- BƯỚC 1: BÓC TÁCH NỘI DUNG ---
        
        // Kiểm tra xem có phải JSON không (Dấu hiệu: chứa "content": "...)
        // Dùng Regex để cắt lấy phần nội dung nằm giữa ngoặc kép
        let jsonMatch = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        
        if (jsonMatch) {
            // TRƯỜNG HỢP 1: LÀ JSON (Bị mã hóa)
            content = jsonMatch[1];
            
            // Giải mã thủ công các ký tự đặc biệt (Fix lỗi \n \t \")
            content = content.replace(/\\n/g, "<br>");  // Biến \n thành xuống dòng
            content = content.replace(/\\r/g, "");
            content = content.replace(/\\t/g, " ");
            content = content.replace(/\\"/g, '"');     // Biến \" thành "
            content = content.replace(/\\\//g, "/");    // Biến \/ thành /
            content = content.replace(/\\\\/g, "\\");
            
        } else {
            // TRƯỜNG HỢP 2: LÀ HTML BÌNH THƯỜNG
            // Nếu không khớp regex JSON, ta parse nó như HTML thông thường
            let doc = res.html();
            if (doc) {
                // Thử các selector phổ biến của TVTruyen
                let el = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
                if (el) {
                    content = el.html();
                } else {
                    // Fallback: Tìm div chứa nhiều chữ nhất (nếu class bị đổi)
                    let divs = doc.select("div");
                    let max = 0;
                    for(let i=0; i<divs.size(); i++){
                         let d = divs.get(i);
                         if(!d.attr("class").includes("container") && !d.attr("class").includes("main")) {
                             if(d.text().length > max) {
                                 max = d.text().length;
                                 el = d;
                             }
                         }
                    }
                    if(el) content = el.html();
                }
            }
        }

        // --- BƯỚC 2: DỌN RÁC (CLEANING) ---
        if (content) {
            // Xóa các thành phần rác hệ thống
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search|top-nav)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            
            // Xóa các link rác, menu rác
            content = content.replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, "");
            content = content.replace(/<li[^>]*>[\s\S]*?<\/li>/gi, "");
            content = content.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, "");
            
            // Xóa các dòng text quảng cáo cụ thể
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            content = content.replace(/Điều Khoản[\s\S]*?Bảo Mật/gi, "");
            content = content.replace(/Đọc truyện.*tại.*TVTruyen/gi, "");

            // Xử lý xuống dòng đẹp mắt (xóa dòng trống thừa)
            content = content.replace(/(<br>\s*){2,}/gi, "<br><br>");

            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    
    // Nếu vẫn lỗi, trả về text thô 100 ký tự đầu để debug
    return Response.success({
        content: "Không lấy được nội dung. Server trả về mã: " + (res.status || "Unknown"),
        host: "https://www.tvtruyen.com"
    });
}