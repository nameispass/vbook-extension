function execute(url) {
    let res = fetch(url);
    if (res.ok) {
        let doc = res.html();
        let data = [];
        
        // Chỉ chọn thẻ 'a' nằm trong khu vực danh sách chương
        // TVTruyen thường cấu trúc là .list-chapter li a hoặc #list-chapter .row a
        let listContainer = doc.select(".list-chapter, #list-chapter, .list-chapters");
        let links = listContainer.select("a");

        for (let i = 0; i < links.size(); i++) {
            let link = links.get(i);
            let href = link.attr("href");
            let text = link.text().trim();

            if (href && text) {
                data.push({
                    name: text,
                    url: fixUrl(href),
                    host: "https://www.tvtruyen.com"
                });
            }
        }

        // TVTruyen thường xếp chương Mới nhất lên đầu, cần đảo ngược lại để đọc từ đầu
        // Nếu trang web xếp từ 1->1000 rồi thì bỏ dòng .reverse() này đi
        if (data.length > 0) {
             // Kiểm tra logic đảo ngược: nếu chương đầu tiên trong list là chương lớn, thì đảo ngược
             let firstChap = extractChapterNumber(data[0].name);
             let lastChap = extractChapterNumber(data[data.length - 1].name);
             if (firstChap > lastChap) {
                 data.reverse();
             }
        }

        return Response.success(data);
    }
    return null;
}

function extractChapterNumber(chapterName) {
    let match = chapterName.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

function fixUrl(url) {
    if (!url || url === "") return "";
    if (url.startsWith("http")) return url;
    return "https://www.tvtruyen.com" + (url.startsWith("/") ? url : "/" + url);
}