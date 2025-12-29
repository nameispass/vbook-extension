function execute(url) {
    // 1. Dùng BingBot (Thử thay đổi nhân dạng để tránh bị chặn như GoogleBot/Chrome)
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text(); // Lấy toàn bộ dữ liệu thô

        // 2. XỬ LÝ SƠ BỘ (QUAN TRỌNG)
        // Biến đổi ngay các ký tự xuống dòng mã hóa thành thẻ <br>
        text = text.replace(/\\n/g, "<br>");
        text = text.replace(/\\r/g, "");
        text = text.replace(/\\t/g, " ");
        text = text.replace(/\\"/g, '"');
        text = text.replace(/\\\//g, "/");

        // 3. CHIẾN THUẬT TÌM NỘI DUNG
        let content = "";

        // Cách A: Tìm trong JSON ("content":"...")
        // Cắt chuỗi từ "content":" đến "," tiếp theo
        let startKey = '"content":"';
        let idx = text.indexOf(startKey);
        if (idx > -1) {
            let temp = text.substring(idx + startKey.length);
            // Tìm điểm kết thúc (thường là "," hoặc "})
            let endIdx = temp.indexOf('","');
            if (endIdx === -1) endIdx = temp.lastIndexOf('"');
            
            if (endIdx > 0) {
                content = temp.substring(0, endIdx);
            }
        }

        // Cách B: Nếu không thấy JSON, tìm trong HTML
        if (!content || content.length < 50) {
            let doc = Html.parse(text);
            let el = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
            if (el) {
                content = el.html();
            } else {
                // Fallback: Tìm thẻ div to nhất không phải là container
                let divs = doc.select("div");
                let max = 0;
                for(let i=0; i<divs.size(); i++) {
                    let d = divs.get(i);
                    let cls = d.attr("class") || "";
                    if (!cls.includes("container") && !cls.includes("row") && !cls.includes("nav")) {
                        if (d.text().length > max) {
                            max = d.text().length;
                            content = d.html();
                        }
                    }
                }
            }
        }

        // 4. KIỂM TRA & TRẢ KẾT QUẢ
        if (content && content.length > 100) {
            // Dọn rác lần cuối
            content = content.replace(/<div[^>]*class="[^"]*(footer|ads|box-search)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/Truyện Full[\s\S]*?Đam Mỹ Sắc/gi, "");
            
            return Response.success(content);
        } else {
            // --- CHẾ ĐỘ DEBUG (QUAN TRỌNG) ---
            // Nếu không tìm thấy nội dung, in ra 200 ký tự đầu tiên của trang web
            // để xem server đang trả về cái gì (Cloudflare? Đăng nhập? Lỗi server?)
            let debugInfo = text.substring(0, 300).replace(/</g, "&lt;");
            
            return Response.success({
                content: "<b>Không lấy được nội dung.</b><br><br><b>Server trả về:</b><br>" + debugInfo,
                host: "https://www.tvtruyen.com"
            });
        }
    }

    return Response.success("Lỗi kết nối: " + (res.status || "Unknown"));
}