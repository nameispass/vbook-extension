function execute(url, page) {
    if (!page) page = '1';
    
    let fullUrl = '';
    if (url === 'truyen-moi') {
        fullUrl = `https://www.tvtruyen.com/danh-sach/truyen-moi?page=${page}`;
    } else if (url === 'truyen-hot') {
        fullUrl = `https://www.tvtruyen.com/danh-sach/truyen-hot?page=${page}`;
    } else if (url === 'truyen-de-cu') {
        fullUrl = `https://www.tvtruyen.com/danh-sach/truyen-de-cu?page=${page}`;
    } else if (url === 'truyen-full') {
        fullUrl = `https://www.tvtruyen.com/danh-sach/truyen-full?page=${page}`;
    } else {
        fullUrl = `https://www.tvtruyen.com/the-loai/${url}?page=${page}`;
    }
    
    let response = fetch(fullUrl);
    if (response.ok) {
        let doc = response.html();
        let next = '';
        
        // Kiểm tra có trang tiếp theo không
        let nextPage = doc.select('.pagination .next:not(.disabled), .pagination a:contains(›)');
        if (nextPage.size() > 0) {
            next = (parseInt(page) + 1).toString();
        }
        
        // Tìm danh sách truyện
        let el = doc.select('.story-item, .item, [class*="story"], .grid-item');
        let data = [];
        
        for (var i = 0; i < el.size(); i++) {
            var e = el.get(i);
            
            // Tìm link truyện
            let linkElem = e.select('a[href*="/truyen/"]').first();
            if (!linkElem) {
                linkElem = e.select('a').first();
            }
            
            if (linkElem) {
                let link = linkElem.attr('href');
                let title = linkElem.attr('title') || linkElem.text();
                
                // Tìm ảnh bìa
                let cover = e.select('img').attr('src') || e.select('img').attr('data-src');
                
                // Tìm chapter mới nhất
                let description = '';
                let chapterElem = e.select('.chapter-text, .last-chapter, .new-chap, .chapter');
                if (chapterElem.size() > 0) {
                    description = chapterElem.text();
                }
                
                data.push({
                    name: title.trim(),
                    link: link.startsWith('http') ? link : 'https://www.tvtruyen.com' + link,
                    cover: cover ? (cover.startsWith('http') ? cover : 'https://www.tvtruyen.com' + cover) : '',
                    description: description.trim(),
                    host: "https://www.tvtruyen.com"
                });
            }
        }
        
        return Response.success(data, next);
    }
    return null;
}