function execute(key, page) {
    if (!page) page = '1';
    
    let response = fetch(`https://www.tvtruyen.com/tim-kiem`, {
        method: "GET",
        queries: {
            keyword: key,
            page: page
        }
    });
    
    if (response.ok) {
        let doc = response.html();
        let data = [];
        
        // Tìm các item kết quả
        let el = doc.select('.list-story .story-item, .story-list .story-item, .row .col-story');
        
        if (el.size() === 0) {
            // Fallback: tìm link .html
            el = doc.select('a[href$=".html"]').filter(e => {
                let href = e.attr('href');
                return href && !href.includes('/the-loai/') && e.text().trim().length > 2;
            });
        }
        
        for (var i = 0; i < el.size(); i++) {
            var e = el.get(i);
            
            let linkElem, href, text;
            
            if (e.tagName() === 'a') {
                linkElem = e;
                href = linkElem.attr('href');
                text = linkElem.text().trim();
            } else {
                linkElem = e.select('a').first();
                if (linkElem) {
                    href = linkElem.attr('href');
                    text = linkElem.attr('title') || linkElem.text().trim();
                }
            }
            
            if (href && href.endsWith('.html') && text && !href.includes('/the-loai/')) {
                // Tìm ảnh
                let cover = '';
                if (e.tagName() !== 'a') {
                    cover = e.select('img').attr('src') || e.select('img').attr('data-src');
                }
                
                data.push({
                    name: text,
                    link: href.startsWith('http') ? href : 'https://www.tvtruyen.com' + href,
                    cover: cover ? (cover.startsWith('http') ? cover : 'https://www.tvtruyen.com' + cover) : '',
                    description: 'TVTruyen',
                    host: "https://www.tvtruyen.com"
                });
                
                if (data.length >= 20) break;
            }
        }
        
        // Kiểm tra phân trang
        let next = '';
        let nextPage = doc.select('.pagination .next:not(.disabled), a:contains(Trang sau)');
        if (nextPage.size() > 0) {
            next = (parseInt(page) + 1).toString();
        }
        
        return Response.success(data, next);
    }
    
    return null;
}