function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        
        // Tìm nội dung chapter
        let content = doc.select('.chapter-content, .chapter-c, .content-chap, .chapter-detail, .ndchapter').html();
        
        // Nếu không tìm thấy, thử lấy toàn bộ nội dung chính
        if (!content) {
            content = doc.select('.content, article, .entry-content').html();
        }
        
        if (content) {
            // Làm sạch nội dung
            content = content.replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<ins[^>]*>.*?<\/ins>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/<div[^>]*class="[^"]*ads[^"]*"[^>]*>.*?<\/div>/gi, '')
                .replace(/<a[^>]*href="[^"]*ads[^"]*"[^>]*>.*?<\/a>/gi, '')
                .replace(/\n/g, '')
                .replace(/(<br\s*\/?>\s*){2,}/g, '<br>')
                .replace(/style="[^"]*"/gi, '')
                .replace(/class="[^"]*"/gi, '');
            
            // Thêm CSS để căn chỉnh hình ảnh
            content = content.replace(/<img/gi, '<img style="max-width:100%;height:auto;display:block;margin:10px auto;"');
            
            return Response.success(content);
        }
    }
    return null;
}