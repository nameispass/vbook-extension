function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text(); // Lấy dữ liệu dạng text thô

        // --- BƯỚC 1: XỬ LÝ JSON (FIX LỖI ẢNH CHỨA NGOẶC NHỌN {}) ---
        // Nếu server trả về JSON, ta phải parse nó ra
        if (text.trim().startsWith("{")) {
            try {
                let json = JSON.parse(text);
                if (json.content) {
                    text = json.content; // Lấy nội dung thật từ trong JSON
                }
            } catch (err) {
                // Nếu lỗi parse, giữ nguyên text để xử lý như HTML thường
                console.error(err);
            }
        }

        // --- BƯỚC 2: XỬ LÝ KÝ TỰ MÃ HÓA (FIX LỖI \n, <\/div>) ---
        // Biến các ký tự escape thành HTML chuẩn
        text = text.replace(/\\n/g, "<br>");
        text = text.replace(/\\t/g, " ");
        text = text.replace(/\\r/g, "");
        text = text.replace(/\\"/g, '"');
        text = text.replace(/\\\//g, "/"); // Biến \/ thành /

        // --- BƯỚC 3: DỌN RÁC HTML ---
        // Xử lý bằng Regex thay vì dùng thư viện DOM để nhanh và tránh lỗi
        // Xóa script, style, form, popup báo cáo
        text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        text = text.replace(/<div[^>]*class="[^"]*(modal|report|comment|footer|ads)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
        
        // Xóa SVG rác (nguyên nhân gây lỗi flag 's' cũ)
        text = text.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
        text = text.replace(/<defs[^>]*>[\s\S]*?<\/defs>/gi, "");

        // --- BƯỚC 4: LỌC NỘI DUNG CHÍNH ---
        // Vì text giờ là HTML string, ta cần convert lại DOM để chọn div chuẩn (nếu cần)
        // Tuy nhiên, nếu đã lấy từ JSON thì thường đó là nội dung chuẩn rồi, trả về luôn.
        
        return Response.success({
            content: text,
            next: null,
            prev: null,
            host: "https://www.tvtruyen.com"
        });
    }
    return null;
}