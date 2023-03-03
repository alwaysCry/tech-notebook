# CURL 使用总结

## 指定请求方法

-X 选项指定 HTTP 请求的方法, 例如：

```bash
curl -X POST localhost
```

## 指定 cookie

- -b 选项指定请求的 cookie, 例如

```bash
curl -b 'foo1=bar1;foo2=bar2' localhost
```

也可后接文件路径来指定 cookie 内容，格式参照 -c 时写入的内容

- -c 选项指定在**响应**时将 cookie 写入到指定文件中, 例如：

```bash
curl -c cookies.txt localhost
```

## 添加请求头

-H 选项用于指定请求头，例如

```bash
curl -H 'Content-Type: application/json' localhost
```

## 携带请求体

-d 选项用于指定请求的 body，例如

```bash
curl -d 'name=penn&love=carousel' localhost
```

此时方法默认为 POST，并携带请求头 _Content-Type: application/x-www-form-urlencoded_

也可后接前缀 @ + 文件路径。注意，若要携带 JSON，需手动设置请求头 _Content-Type: application/json_, 例如：

```bash
curl -d @./package.json -H 'Content-Type: application/json' localhost
```

## 上传二进制文件

-F 选项用于指定上传二进制文件, 默认携带请求头 _Content-Type: multipart/form-data_, 例如:

```bash
curl -F 'file=@photo.png' localhost
```

可额外指定上传文件的 MIME 类型和文件名, 如下:

```bash
curl -F 'file=@./photo.png;type=image/png;filename=me.png' localhost
```

可一次上传多个文件，只需多个 -F 选项即可，例如：

```bash
curl -F 'file=@photo.png' -F 'file=@photo2.png' localhost
```
