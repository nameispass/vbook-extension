function execute(url) {
    let res = fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Mobile Safari/537.36",
            "Referer": "https://www.tvtruyen.com/"
        }
    });

    if (res.ok) {
        let text = res.text();
        let content = "";

        // --- BƯỚC 1: XỬ LÝ JSON ---
        if (text.trim().startsWith("{")) {
            try {
                let json = JSON.parse(text);
                // Thử tất cả các key có thể chứa nội dung
                if (json.content) content = json.content;
                else if (json.data && json.data.content) content = json.data.content;
                else if (json.data) content = json.data; // Trường hợp data chính là content
                
            } catch (e) {
                // Nếu parse lỗi -> Có thể là HTML thường bị nhầm
                let match = text.match(/"content"\s*:\s*"([^"]+)"/);
                if (match) content = match[1];
            }
        } 
        
        // --- BƯỚC 2: XỬ LÝ HTML THƯỜNG (Nếu bước 1 thất bại) ---
        if (!content) {
            let doc = res.html();
            if (doc) {
                // Xóa rác
                doc.select(".modal, #report_modal, .comment-box, form, .ads").remove();
                
                let el = doc.select("#content, .content-hienthi, .chapter-c, .truyen-text").first();
                
                // Fallback tìm div to nhất
                if (!el) {
                     let divs = doc.select("div");
                     let max = 0;
                     for(let i=0; i<divs.size(); i++){
                         let d = divs.get(i);
                         if(d.text().length > max && !d.attr("class").includes("container")) {
                             max = d.text().length;
                             el = d;
                         }
                     }
                }
                if (el) content = el.html();
            }
        }

        // --- BƯỚC 3: GIẢI MÃ & LÀM SẠCH ---
        if (content) {
            // Giải mã ký tự JSON escape
            content = content.replace(/\\n/g, "<br>");
            content = content.replace(/\\t/g, " ");
            content = content.replace(/\\\//g, "/");
            content = content.replace(/\\"/g, '"');
            content = content.replace(/\\r/g, "");

            // Xóa rác HTML
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            content = content.replace(/<\/div>/gi, ""); // Xóa thẻ đóng div thừa
            content = content.replace(/<div[^>]*>/gi, "<br>"); // Div -> xuống dòng

            return Response.success({
                content: content,
                host: "https://www.tvtruyen.com"
            });
        }
    }
    return null;
}