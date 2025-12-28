// Script lấy danh sách thể loại truyện từ TVTruyen
// Trả về mảng object: {name, link}
function genre_tvtruyen() {
    const genres = [];
    document.querySelectorAll('.genre-list a').forEach(a => {
        genres.push({
            name: a.innerText.trim(),
            link: a.href
        });
    });
    return genres;
}
