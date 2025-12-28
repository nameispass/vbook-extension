function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        
        // Lấy tiêu đề
        let name = '';
        const titleSelectors = ['h1.title', 'h1', '.story-title', '.book-title', '.novel-title'];
        for (let selector of titleSelectors) {
            let elem = doc.select(selector).first();
            if (elem && elem.text().trim()) {
                name = elem.text().trim();
                break;
            }
        }
        
        if (!name) {
            // Lấy từ URL
            let path = url.split('/').pop();
            name = path.replace('.html', '').split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
        
        // Lấy ảnh bìa
        let cover = '';
        const coverSelectors = ['.story-cover img', '.book-cover img', '.novel-cover img', 'img.cover', '.thumbnail img'];
        for (let selector of coverSelectors) {
            let elem = doc.select(selector).first();
            if (elem) {
                cover = elem.attr('src') || elem.attr('data-src');
                break;
            }
        }
        
        // Lấy tác giả
        let author = 'Đang cập nhật';
        let html = doc.html();
        let authorMatch = html.match(/Tác giả[:\s]+([^<\n]+)/i);
        if (authorMatch) author = authorMatch[1].trim();
        
        // Lấy mô tả
        let description = '';
        const descSelectors = ['.story-description', '.book-description', '.novel-description', '.description', '.summary'];
        for (let selector of descSelectors) {
            let elem = doc.select(selector).first();
            if (elem && elem.text().trim()) {
                description = elem.text().trim();
                break;
            }
        }
        
        // Lấy trạng thái
        let ongoing = true;
        let statusText = html.match(/Tình trạng[:\s]+([^<\n]+)/i);
        if (statusText && (statusText[1].includes('Hoàn thành') || statusText[1].includes('Full'))) {
            ongoing = false;
        }
        
        // Lấy thể loại
        let detail = '';
        let genreElems = doc.select('a[href*="/the-loai/"]');
        let genres = [];
        genreElems.forEach(e => {
            let genre = e.text().trim();
            if (genre && !genres.includes(genre)) {
                genres.push(genre);
            }
        });
        
        if (genres.length > 0) {
            detail += 'Thể loại: ' + genres.join(', ') + '<br>';
        }
        
        // Xử lý URL ảnh
        if (cover && !cover.startsWith('http')) {
            cover = 'https://www.tvtruyen.com' + (cover.startsWith('/') ? cover : '/' + cover);
        }
        
        return Response.success({
            name: name,
            cover: cover,
            author: author,
            description: description,
            ongoing: ongoing,
            detail: detail,
            host: "https://www.tvtruyen.com"
        });
    }
    
    return null;
}