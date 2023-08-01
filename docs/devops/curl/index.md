# curl 总结

## HTTP

- `-X/--request <method>`：指定 HTTP 请求的方法

- `-I/--head`：发送 head 请求，并在响应时输出响应头信息

- `-k`：不检查服务器 SSL 证书是否正确

- `-i/--include`：响应时输出响应头信息

- `-D/--dump-header <file>`：将响应头信息写入到指定文件中

- `-H/--header <header>`：设置请求头，例如：

  ```bash
  curl -H 'Content-Type: application/json' localhost
  ```

- `-A/--user-agent <string>`：指定 User-Agent 请求头，默认为`curl/[version]`

- `-e <location>`：指定 Referer 请求头

- `-L`：跟随重定向（若有）

- `-d/--data <body>`：指定请求数据，默认 POST 请求并带`Content-Type: application/x-www-form-urlencoded`头。注意数据不会被 urlencoded

  - 发送多个键值对时以`&`分隔。例如：

  ```bash
  curl -d 'name=penn&love=carousel' localhost
  ```

  - 指定以 Get 请求。例如：

  ```bash
  # 等价于 curl localhost?page=1&size=10
  curl -G -d 'page=1' -d 'size=10' localhost
  ```

  - 若数据需要被 urlencoded（如其中存在空格），则须以`--data-urlencode`指定。例如：

  ```bash
  curl --data-urlencode 'name=young penn&love=carousel' localhost
  ```

  - 发送 JSON 数据，须额外设置请求头`Content-Type: application/json`。例如：

  ```bash
  curl -d '{"name": "penn"}' -H 'Content-Type: application/json' localhost

  # 从标准输入中读取
  echo '{"name": "penn"}' | curl -d @- -H 'Content-Type: application/json' localhost

  # 从指定JSON文件读取
  curl -d @package.json -H 'Content-Type: application/json' localhost

  # 7.82.0 版本起，可简写为
  curl --json @package.json localhost
  ```

  - 若请求体正好以字符@开头（而非为了读取指定文件），则须用`--data-raw`指定。例如：

  ```bash
  curl --data-raw '@string' localhost
  ```

  - 若请求体需从二进制文件中读取，则建议以`--data-binary`选项指定。例如：

  ```bash
  curl --data-binary @file.zip localhost
  ```

- `-F/--form <name>=<content>`：指定表单提交（或上传文件）, 默认带请求头`Content-Type: multipart/form-data`。

  - 同时指定上传文件的 MIME 类型和文件名:

  ```bash
  curl -F 'file=@./photo.png;type=image/png;filename=me.png' localhost
  ```

  - 一次上传多个文件：

  ```bash
  curl -F 'file=@photo.png' -F 'file=@photo2.png' localhost
  ```

- `-o/--output <file>`：将响应体数据写入（下载）到指定文件中

  - `--no-clobber`：重复文件名将被追加额外数字后缀以作区分，否则将执行覆盖

  - `--remove-on-error`：一旦写入（下载）失败则相关残留文件将被删除

  - `-O/--remote-name`：从 URL 中获取文件名，无需手动设置。例如：

  ```bash
  curl -O http://example.com/file.html
  # 等价于
  curl -o file.html http://example.com/file.html
  ```

  - `-J/--remote-header-name`：使用`Content-Disposition`响应头中指定的文件名（若有），注意后者可能已被 URL-encoded

- `-b <cookies>/<file>`：请求时携带指定 cookie，也可从指定文件中读取。例如：

  ```bash
  curl -b "name=penn" localhost

  # 从指定文件中读取
  curl -b cookies.txt localhost
  ```

  - `-j/--junk-session-cookies`：抛弃 session cookies（即未指定生命周期的 cookie）

- `-c <file>`：将服务器设置的 cookie 写入到指定文件中。例如：

  ```bash
  curl -c cookie-jar.txt localhost

  # 常与 -b 结合使用来模拟浏览器行为
  curl -jb cookies.txt -c cookies.txt localhost
  ```

## 通用选项

- `-v/--verbose`：打印通信过程的详细信息

- `-s/--silent`：不打印错误和进度信息

- `-S/--show-error`：打印错误信息（即使已指定了`-s`），通常与`-s`一起使用意为只打印错误信息

<!-- - `-b` 选项指定请求的 cookie, 例如

```bash
curl -b 'foo1=bar1;foo2=bar2' localhost
```

也可后接文件路径来指定 cookie 内容，格式参照 -c 时写入的内容

- `-c` 选项指定在**响应**时将 cookie 写入到指定文件中, 例如：

```bash
curl -c cookies.txt localhost
``` -->
