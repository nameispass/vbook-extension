function execute(url, page) {
    if (!page) page = '1';
    
    let fullUrl = url;
    if (page > 1) {
        fullUrl = url + (url.includes('?') ? '&' : '?') + 'page=' + page;
    }
    
    let response = fetch(fullUrl);
    if (response.ok) {
        let doc = response.html();
        let data = [];
        
        // Đơn giản: tìm tất cả link có .html
        let links = doc.select('a[href$=".html"]');
        
        for (var i = 0; i < links.size(); i++) {
            var link = links.get(i);
            let href = link.attr('href');
            let text = link.text().trim();
            
            // Lọc link truyện (không phải thể loại, tìm kiếm, v.v.)
            if (href && text && text.length > 2 && 
                !href.includes('/the-loai/') && 
                !href.includes('/tim-kiem/') &&
                !href.includes('/tac-gia/')) {
                
                data.push({
                    name: text,
                    link: href.startsWith('http') ? href : 'https://www.tvtruyen.com' + href,
                    cover: '',
                    description: 'TVTruyen',
                    host: "https://www.tvtruyen.com"
                });
                
                if (data.length >= 20) break;
            }
        }
        
        // Kiểm tra phân trang
        let next = '';
        let nextBtn = doc.select('a:contains(Trang sau), a:contains(›)');
        if (nextBtn.size() > 0) {
            next = (parseInt(page) + 1).toString();
        }
        
        return Response.success(data, next);
    }
    
    return null;
}