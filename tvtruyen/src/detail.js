// Script lấy thông tin chi tiết truyện từ TVTruyen
// Trả về object: {name, cover, author, status, genres, description}
function detail_tvtruyen() {
    return {
        name: document.querySelector('.story-title')?.innerText.trim(),
        cover: document.querySelector('.story-cover img')?.src,
        author: document.querySelector('.story-author')?.innerText.trim(),
        status: document.querySelector('.story-status')?.innerText.trim(),
        genres: Array.from(document.querySelectorAll('.story-genres a')).map(a => a.innerText.trim()),
        description: document.querySelector('.story-summary')?.innerText.trim()
    };
}
