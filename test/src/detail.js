function execute(url) {
    let response = fetch(url);
    if (response.ok) {
        let doc = response.html();
        
        // Lấy tiêu đề
        let name = doc.select('h1.title, .story-title, h1').text();
        
        // Lấy ảnh bìa
        let cover = doc.select('.story-cover img, .cover img, .thumbnail img').attr('src');
        
        // Lấy tác giả
        let author = 'Đang cập nhật';
        let authorElem = doc.select('a[href*="tac-gia"], span:contains(Tác giả) + a, .author a');
        if (authorElem.size() > 0) {
            author = authorElem.text();
        } else {
            // Tìm trong text
            let text = doc.text();
            let match = text.match(/Tác giả[:\s]+([^\n]+)/i);
            if (match) author = match[1].trim();
        }
        
        // Lấy trạng thái
        let ongoing = true;
        let statusText = doc.select('.status, .label-status, .info-status').text();
        if (statusText.includes('Hoàn thành') || statusText.includes('Full') || statusText.includes('Completed')) {
            ongoing = false;
        }
        
        // Lấy mô tả
        let description = doc.select('.story-description, .description, .summary, .content').text();
        
        // Lấy thể loại và thông tin chi tiết
        let detail = '';
        let genres = [];
        let genreElems = doc.select('.genres a, .tags a, .category a, a[href*="the-loai"]');
        genreElems.forEach(e => {
            genres.push(e.text());
        });
        
        if (genres.length > 0) {
            detail += 'Thể loại: ' + genres.join(', ') + '<br>';
        }
        
        // Lấy thông tin update
        let updateElem = doc.select('.update-time, time, .last-updated');
        if (updateElem.size() > 0) {
            detail += 'Update: ' + updateElem.first().text();
        }
        
        return Response.success({
            name: name,
            cover: cover ? (cover.startsWith('http') ? cover : 'https://www.tvtruyen.com' + cover) : '',
            author: author,
            description: description,
            ongoing: ongoing,
            detail: detail,
            host: "https://www.tvtruyen.com"
        });
    }
    return null;
}