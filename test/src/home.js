function execute() {
    return Response.success([
        {title: "Truyện mới cập nhật", input: "truyen-moi", script: "gen.js"},
        {title: "Truyện hot", input: "truyen-hot", script: "gen.js"},
        {title: "Truyện đề cử", input: "truyen-de-cu", script: "gen.js"},
        {title: "Truyện full", input: "truyen-full", script: "gen.js"}
    ]);
}