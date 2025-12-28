function execute() {
    let response = fetch("https://www.tvtruyen.com");
    if (response.ok) {
        let doc = response.html();
        let el = doc.select(".menu-item a[href*='the-loai'], .nav a[href*='the-loai'], a[href*='/the-loai/']");
        
        const data = [];
        el.forEach(e => {
            let href = e.attr('href');
            if (href) {
                // Lấy phần cuối của URL (slug thể loại)
                let slug = href.split('/').pop();
                if (slug) {
                    data.push({
                        title: e.text(),
                        input: slug,
                        script: "gen.js"
                    });
                }
            }
        });
        
        // Nếu không tìm thấy thể loại, thêm một số thể loại mặc định
        if (data.length === 0) {
            data.push(
                {title: "Truyện tranh", input: "truyen-tranh", script: "gen.js"},
                {title: "Tiên hiệp", input: "tien-hiep", script: "gen.js"},
                {title: "Kiếm hiệp", input: "kiem-hiep", script: "gen.js"},
                {title: "Ngôn tình", input: "ngon-tinh", script: "gen.js"},
                {title: "Đô thị", input: "do-thi", script: "gen.js"}
            );
        }
        
        return Response.success(data);
    }
    return null;
}