// Script lấy nội dung chương truyện từ TVTruyen
// Trả về object: {name, content}
function chap_tvtruyen() {
    return {
        name: document.querySelector('.chapter-title')?.innerText.trim(),
        content: document.querySelector('.chapter-content')?.innerHTML.trim()
    };
}
