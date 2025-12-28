function execute() {
    let response = fetch("https://www.tvtruyen.com");
    if (response.ok) {
        let doc = response.html();
        
        // Tìm các link thể loại
        let el = doc.select('a[href*="/the-loai/"], a:contains(Thể loại)');
        const data = [];
        
        el.forEach(e => {
            let href = e.attr('href');
            let text = e.text();
            
            if (href && text && text !== 'Thể loại' && !text.includes('Tất cả')) {
                data.push({
                    title: text.trim(),
                    input: href.startsWith('http') ? href : 'https://www.tvtruyen.com' + href,
                    script: "gen.js"
                });
            }
        });
        
        // Nếu không tìm thấy, thêm thể loại mặc định
        if (data.length === 0) {
            data.push(
                {title: "Tiên hiệp", input: "https://www.tvtruyen.com/the-loai/tien-hiep.html", script: "gen.js"},
                {title: "Kiếm hiệp", input: "https://www.tvtruyen.com/the-loai/kiem-hiep.html", script: "gen.js"},
                {title: "Ngôn tình", input: "https://www.tvtruyen.com/the-loai/ngon-tinh.html", script: "gen.js"},
                {title: "Đô thị", input: "https://www.tvtruyen.com/the-loai/do-thi.html", script: "gen.js"},
                {title: "Xuyên không", input: "https://www.tvtruyen.com/the-loai/xuyen-khong.html", script: "gen.js"}
            );
        }
        
        return Response.success(data);
    }
    return null;
}