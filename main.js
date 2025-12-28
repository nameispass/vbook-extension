const baseUrl = "https://www.tvtruyen.com";

function detail(url) {
    return Response.success({
        name: "Test TvTruyen",
        author: "Unknown",
        host: baseUrl
    });
}

function toc(url) {
    return Response.success([{name: "Chương 1", url: url}]);
}

function chap(url) {
    return Response.success("Nội dung đang cập nhật...");
}

function search(key, page) {
    return Response.success([]);
}