function execute() {
    return Response.success([
        {title: "Truyện hot", input: "https://www.tvtruyen.com/the-loai/tat-ca/truyen-hot.html", script: "gen.js"},
        {title: "Truyện độc quyền", input: "https://www.tvtruyen.com/the-loai/tat-ca/vip.html", script: "gen.js"},
        {title: "Truyện đã hoàn thành", input: "https://www.tvtruyen.com/the-loai/tat-ca/truyen-full.html", script: "gen.js"},
        {title: "Truyện mới cập nhật", input: "https://www.tvtruyen.com/the-loai/tat-ca/truyen-moi.html", script: "gen.js"}
    ]);
}