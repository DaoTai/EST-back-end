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

**cros-env**: cung cấp 1 cách cắt giữa các hđh khác nhau khi thiết lập các biến môi trường vì các biến env có thể thay đổi tuỳ thuộc vào hđh. Mục đích: nhất quán các biến env không bị phụ thuộc vào hđh
# Cookie

res.cookie("refreshToken", refreshToken, {
httpOnly: true, // Flags the cookie to be accessible only by the web server.
secure: false, // Marks the cookie to be used with HTTPS only.
sameSite: "strict", //Value of the “SameSite” Set-Cookie attribute
});

# Flow upload with cloudinary

Lưu file vào trong 1 thư mục với multer => upload cloudinary => xoá file đã lưu trước đó trong thư mục

# OAuth2 (Open Authorization 2.0) là một giao thức xác thực và ủy quyền phổ biến được sử dụng để bảo vệ các tài nguyên và cung cấp quyền truy cập cho người dùng giữa các ứng dụng.

OAuth2 cho phép người dùng cung cấp quyền truy cập cho bên thứ ba mà không cần chia sẻ trực tiếp thông tin đăng nhập nhạy cảm, như mật khẩu. Thay vào đó, OAuth2 sử dụng các mã thông báo (tokens) để đại diện cho quyền truy cập được ủy quyền và xác thực cho các ứng dụng khác.

Quá trình hoạt động của OAuth2 bao gồm các bên sau:

1. Người dùng (Resource Owner): Người dùng cuối cung cấp quyền truy cập cho ứng dụng thứ ba.

2. Ứng dụng yêu cầu quyền truy cập (Client): Ứng dụng muốn truy cập vào tài nguyên hoặc dịch vụ của người dùng.

3. Cung cấp dịch vụ (Authorization Server): Dịch vụ xác thực và ủy quyền, cung cấp mã thông báo (authorization code) cho ứng dụng.

4. Bên thứ ba (Third-party Application): Ứng dụng yêu cầu truy cập tài nguyên của người dùng thông qua quyền ủy quyền từ dịch vụ xác thực.

5. Ứng dụng yêu cầu truy cập tài nguyên (Resource Server): Dịch vụ cung cấp tài nguyên được bảo vệ.

Quá trình xác thực OAuth2 thường bao gồm các bước như sau:

1. Ứng dụng yêu cầu ủy quyền từ người dùng thông qua trình duyệt.

2. Người dùng cung cấp quyền truy cập cho ứng dụng.

3. Ứng dụng nhận được mã thông báo từ dịch vụ xác thực.

4. Ứng dụng sử dụng mã thông báo để trao đổi lấy mã thông báo truy cập (access token).

5. Ứng dụng sử dụng mã thông báo truy cập để truy cập tài nguyên từ dịch vụ cung cấp tài nguyên.

OAuth2 đã trở thành một tiêu chuẩn phổ biến cho việc ủy quyền và xác thực trong các ứng dụng web và di động, cho phép người dùng chia sẻ quyền truy cập một cách an toàn và linh hoạt giữa các ứng dụng khác nhau.
