function execute(url, page) {
    if (!page) page = '1';
    
    // Thêm phân trang vào URL nếu cần
    let fullUrl = url;
    if (page > 1) {
        if (url.includes('?')) {
            fullUrl = url + '&page=' + page;
        } else {
            fullUrl = url + '?page=' + page;
        }
    }
    
    let response = fetch(fullUrl);
    if (response.ok) {
        let doc = response.html();
        let data = [];
        
        // CÁCH 1: Tìm các item truyện theo class phổ biến
        const itemSelectors = [
            '.list-story .story-item',
            '.story-list .story-item', 
            '.row .col-story',
            '.content-story .item',
            '.list-story-item',
            '.story-item',
            '.item-story',
            '.book-item',
            '.novel-item',
            '.item'
        ];
        
        let el = null;
        for (let selector of itemSelectors) {
            el = doc.select(selector);
            if (el.size() > 0) {
                break;
            }
        }
        
        // CÁCH 2: Nếu không tìm thấy, tìm tất cả link .html
        if (!el || el.size() === 0) {
            // Tìm tất cả link có .html và không phải thể loại/tìm kiếm
            let allHtmlLinks = doc.select('a[href$=".html"]').filter(e => {
                let href = e.attr('href');
                return href && 
                       !href.includes('/the-loai/') && 
                       !href.includes('/tim-kiem/') &&
                       !href.includes('/tac-gia/') &&
                       !href.includes('/tag/') &&
                       e.text().trim().length > 2;
            });
            
            // Nhóm các link thành items
            let processedLinks = new Set();
            
            allHtmlLinks.each((i, link) => {
                let href = link.attr('href');
                let text = link.text().trim();
                
                if (!processedLinks.has(href) && text && text.length > 2) {
                    processedLinks.add(href);
                    
                    // Tìm ảnh gần link này
                    let cover = '';
                    let parent = link.parent();
                    let img = parent.select('img').first();
                    
                    if (!img.exists()) {
                        // Tìm ảnh trong cùng container
                        let container = link.closest('div, li, article');
                        if (container) {
                            img = container.select('img').first();
                        }
                    }
                    
                    if (img.exists()) {
                        cover = img.attr('src') || img.attr('data-src');
                    }
                    
                    // Tìm chapter mới nhất
                    let description = '';
                    let chapterText = link.parent().select('.chapter-text, .last-chapter, .new-chap').text();
                    if (!chapterText) {
                        // Tìm text sibling
                        let siblings = link.parent().children();
                        siblings.each((j, sibling) => {
                            if (sibling.text().includes('Chương') || sibling.text().includes('chap')) {
                                description = sibling.text().trim();
                            }
                        });
                    } else {
                        description = chapterText;
                    }
                    
                    data.push({
                        name: text,
                        link: href.startsWith('http') ? href : 'https://www.tvtruyen.com' + href,
                        cover: cover ? (cover.startsWith('http') ? cover : 'https://www.tvtruyen.com' + cover) : '',
                        description: description || 'TVTruyen',
                        host: "https://www.tvtruyen.com"
                    });
                }
            });
        } else {
            // Xử lý các item tìm thấy qua selector
            for (var i = 0; i < el.size(); i++) {
                var e = el.get(i);
                
                // Tìm link truyện trong item
                let linkElem = e.select('a[href$=".html"]').first();
                if (!linkElem || (linkElem.attr('href') && linkElem.attr('href').includes('/the-loai/'))) {
                    linkElem = e.select('a').first();
                }
                
                if (linkElem && linkElem.attr('href')) {
                    let href = linkElem.attr('href');
                    let text = linkElem.attr('title') || linkElem.text().trim();
                    
                    if (href && href.endsWith('.html') && !href.includes('/the-loai/') && text) {
                        // Tìm ảnh bìa
                        let cover = e.select('img').attr('src') || e.select('img').attr('data-src');
                        
                        // Tìm chapter mới nhất
                        let description = e.select('.chapter-text, .last-chapter, .new-chap, .chapter').text();
                        
                        data.push({
                            name: text,
                            link: href.startsWith('http') ? href : 'https://www.tvtruyen.com' + href,
                            cover: cover ? (cover.startsWith('http') ? cover : 'https://www.tvtruyen.com' + cover) : '',
                            description: description.trim() || 'TVTruyen',
                            host: "https://www.tvtruyen.com"
                        });
                    }
                }
            }
        }
        
        // Kiểm tra phân trang
        let next = '';
        let nextPage = doc.select('.pagination .next:not(.disabled), a:contains(Trang sau), a:contains(›)');
        if (nextPage.size() > 0) {
            next = (parseInt(page) + 1).toString();
        }
        
        // Loại bỏ trùng lặp
        let uniqueData = [];
        let seenLinks = new Set();
        
        data.forEach(item => {
            if (!seenLinks.has(item.link)) {
                seenLinks.add(item.link);
                uniqueData.push(item);
            }
        });
        
        return Response.success(uniqueData.slice(0, 30), next);
    }
    
    return null;
}