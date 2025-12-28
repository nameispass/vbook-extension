// Script lấy danh sách trang mục lục truyện từ TVTruyen
// Trả về mảng object: {page, link}
function page_tvtruyen() {
    const pages = [];
    document.querySelectorAll('.pagination a').forEach(a => {
        pages.push({
            page: a.innerText.trim(),
            link: a.href
        });
    });
    return pages;
}
