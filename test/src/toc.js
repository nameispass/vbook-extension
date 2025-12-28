function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        
        // Tìm danh sách chapter
        let el = doc.select('.chapter-list a, .list-chapter a, a[href*="chuong"]');
        
        // Nếu không tìm thấy theo cách thông thường, thử cách khác
        if (el.size() === 0) {
            el = doc.select('a').filter(e => {
                let href = e.attr('href');
                return href && href.includes('chuong');
            });
        }
        
        const data = [];
        el.forEach(e => {
            let chapterUrl = e.attr('href');
            let chapterName = e.text();
            
            if (chapterUrl && chapterName) {
                data.push({
                    name: chapterName,
                    url: chapterUrl.startsWith('http') ? chapterUrl : 'https://www.tvtruyen.com' + chapterUrl,
                    host: "https://www.tvtruyen.com"
                });
            }
        });
        
        // Đảo ngược thứ tự (từ chapter 1 đến chapter mới nhất)
        data.reverse();
        
        return Response.success(data);
    }
    return null;
}