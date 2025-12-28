// Script tìm kiếm truyện trên TVTruyen
// Trả về mảng object: {name, cover, link, author, description}
function search_tvtruyen() {
    const results = [];
    document.querySelectorAll('.list-stories .story-item').forEach(item => {
        results.push({
            name: item.querySelector('.story-title')?.innerText.trim(),
            cover: item.querySelector('img')?.src,
            link: item.querySelector('a')?.href,
            author: item.querySelector('.story-author')?.innerText.trim(),
            description: item.querySelector('.story-summary')?.innerText.trim()
        });
    });
    return results;
}
