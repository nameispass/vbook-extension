function execute() {
    return Response.success([
        {title: "Truyện mới cập nhật", input: "https://www.tvtruyen.com/the-loai/tat-ca/truyen-moi.html", script: "gen.js"},
        {title: "Truyện hot", input: "https://www.tvtruyen.com/the-loai/tat-ca/truyen-hot.html", script: "gen.js"},
        {title: "Truyện full", input: "https://www.tvtruyen.com/the-loai/tat-ca/truyen-full.html", script: "gen.js"},
        {title: "Truyện VIP", input: "https://www.tvtruyen.com/the-loai/tat-ca/vip.html", script: "gen.js"}
    ]);
}