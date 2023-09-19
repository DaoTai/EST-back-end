# Giải thích các gói babel: Babel là 1 compiler JS

_Dependencies_
**@babel/runtime**: Tái sử dụng (tránh lặp) code sau khi đã build xong hết code ở production vì babel đôi khi sẽ compile ra các code giống nhau giữa các file

_DevDependencies_
**@babel/core**: Gói core cơ bản của babel, dùng để chạy bất kỳ config của babel
**@babel/cli**: Compile các files từ command
**@babel/node**: Là 1 CLI tương tự Node CLI, dùng để compile tương thích các setting của Babel Preset và Babel Plugins
**@babel/preset-env**: Là 1 smart preset tự động dùng version JS mới nhất mà ko cần khai báo cụ thể từng phiên bản
**@babel/plugin-transform-runtime**: Plugin cho phép babel tái sử dụng lại code của chính nó để giảm size code

**babel-plugin-module-resolver**: Plugin Babel để thêm trình phân giải mới cho mô-đun của bạn khi biên dịch mã bằng Babel. Plugin này cho phép bạn thêm các thư mục "root" mới chứa các mô-đun của bạn. Nó cũng cho phép bạn thiết lập bí danh tùy chỉnh cho các thư mục, tệp cụ thể hoặc thậm chí các mô-đun npm khác. => Dùng để config absolute path dựa vào file .babelrc và jsonconfig.json

# Cookie

res.cookie("refreshToken", refreshToken, {
httpOnly: true, // Flags the cookie to be accessible only by the web server.
secure: false, // Marks the cookie to be used with HTTPS only.
sameSite: "strict", //Value of the “SameSite” Set-Cookie attribute
});
