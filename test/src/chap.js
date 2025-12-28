function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        let content = "";
        let selectors = [".chapter-content", ".content", "article", "div"];
        
        // Tìm phần tử chứa nội dung có nhiều text nhất
        for (let j = 0; j < selectors.length; j++) {
            let elements = doc.select(selectors[j]);
            for (let i = 0; i < elements.size(); i++) {
                let elem = elements.get(i);
                let html = elem.html();
                if (html && html.length > 200) {
                    content = html;
                    break;
                }
            }
            if (content) break;
        }
        
        if (!content) {
            content = "<p>Nội dung đang được cập nhật...</p>";
        }
        
        // Làm sạch đơn giản
        content = content.replace(/<script[^>]*>.*?<\/script>/gi, '');
        content = content.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
        
        return Response.success({
            content: content,
            next: null,
            prev: null,
            host: "https://www.tvtruyen.com"
        });
    }
    return null;
}