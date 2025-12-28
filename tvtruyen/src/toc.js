// Script lấy mục lục truyện từ TVTruyen
// Trả về mảng object: {name, link}
function toc_tvtruyen() {
    const chapters = [];
    document.querySelectorAll('.chapter-list a').forEach(a => {
        chapters.push({
            name: a.innerText.trim(),
            link: a.href
        });
    });
    return chapters;
}
