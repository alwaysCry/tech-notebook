# FromData 概述

FormData 对象用于捕获 HTML 表单，可用于 fetch 或其他网络方法，它会被编码并发送，带有 `Content-Type: multipart/form-data`。从服务器角度看就像是普通表单提交

构造函数：`const formData = new FormData([form])`，若提供了 form 元素，则会自动捕获其中字段

## 方法

FormData 对象可迭代，有以下方法：

- `formData.append(name, value)`：根据 name 和 value 添加字段
- `formData.append(name, blob, fileName)`：添加二进制字段值（Blob 或 File），第三个参数为对应文件名
- `formData.delete(name)`：根据 name 移除字段
- `formData.get(name)`：根据 name 获取字段值
- `formData.has(name)`：是否给定 name 的字段

一个表单可包含多个相同 name 的控件。FormData 同理，通过 append 方法可添加多个相同 name 的字段。而另一个 set 方法则不同，会先移除原有 name 字段再添加：

- formData.set(name, value)
- formData.set(name, blob, fileName)
