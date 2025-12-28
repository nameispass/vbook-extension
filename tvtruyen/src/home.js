const BASE_URL = "https://www.tvtruyen.com";

function execute() {
    return Response.success([
        {title: "Truyện hot", script: "gen.js", input: BASE_URL + "/the-loai/tat-ca/truyen-hot.html"},
        {title: "Truyện độc quyền", script: "gen.js", input: BASE_URL + "/the-loai/tat-ca/vip.html"},
        {title: "Truyện mới cập nhật", script: "gen.js", input: BASE_URL + "/the-loai/tat-ca/truyen-moi.html"},
        {title: "Truyện đã hoàn thành", script: "gen.js", input: BASE_URL + "/the-loai/tat-ca/truyen-full.html"},
    ]);
}
