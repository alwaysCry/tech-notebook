# Docker 基础操作

## 安装并启用

### CentOS 安装 Docker

```sh
# 更新源
yum -y update
# 安装docker
yum -y install docker
# 查看docker版本
docker info
# 启动 docker，设置开机自启
systemctl start docker
systemctl enable docker
```

## 常用命令之容器命令

### PS 命令

语法：

```sh
Usage:  docker ps [OPTIONS]

List containers

Options:
  -a, --all             显示所有容器（默认显示正在运行）
  -f, --filter filter   根据提供的条件过滤输出
      --format string   使用Go模板的漂亮打印容器
      --help            打印使用
  -n, --last int        显示最后创建的n个容器（包括所有状态）（默认值为-1）
  -l, --latest          显示最新创建的容器（包括所有状态）
      --no-trunc        不要截断输出
  -q, --quiet           仅显示数字ID
  -s, --size            显示总文件大小
```

实例：

```sh
# 显示所有容器
docker ps -a

# 过滤
docker ps -af name='centos7'

# 只显示id
docker ps -aq

# 组合：查询容器中 name 为 centos7 的，且只显示id
docker ps -aqf name='centos7'
```

### run —— 运行容器

语法：

```sh
Usage:  docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

Run a command in a new container

Options:

  -d, --detach                                在后台运行容器并打印container ID
  -i, --interactive                           保持STDIN打开，即使未连接
  -p, --publish list                          将容器的端口发布到主机（默认值[]）
  -P, --publish-all                           将所有公开端口发布到随机端口
      --restart string                        容器退出时应用的重新启动策略（默认为“否”）
      --name string                           为容器指定一个名称
  -t, --tty                                   分配一个伪TTY
```

实例：

```sh
# 后台运行容器，打开 STDIN 并分配一个伪 TTY
docker run -dit nginx

# 设定名字
docker run -dit --name nginx_named nginx

# -p 指定端口，将容器内的 80 端口暴露在主机的 8080 端口上
docker run -dit --name nginx -p 8080:80 nginx

# -P 指定随机端口（主机端口，32768起，根据docker版本或有所变化）
docker run -dit --name nginx_P -P nginx
```

### rm —— 删除容器

语法：

```sh
Usage:  docker rm [OPTIONS] CONTAINER [CONTAINER...]

Remove one or more containers

Options:
  -f, --force     Force the removal of a running container (uses SIGKILL)
      --help      Print usage
  -l, --link      Remove the specified link
  -v, --volumes   Remove the volumes associated with the container
```

实例：

```sh
# 删除容器，若在运行中则需先将其停止，否则报错
docker rm nginx

# 强制删除容器
docker rm -f nginx_P
```

## 常用命令之镜像命令

### 概览

```sh
[root@base ~]# docker image --help

Usage:  docker image COMMAND

Manage images

Options:
      --help   Print usage

Commands:
  build       从Dockerfile构建映像
  history     显示image的历史
  import      从压缩文件中导入内容以创建文件系统映像
  inspect     显示一个或多个image的详细信息
  load        从tar存档文件或STDIN加载映像
  ls          image列表
  prune       删除未使用的image
  pull        从注册表中提取映像或存储库
  push        将映像或存储库推入注册表
  rm          删除一个或多个image
  save        保存一个或多个image到tar存档(默认流到STDOUT)
  tag         创建指向SOURCE_IMAGE的标签TARGET_IMAGE

Run 'docker image COMMAND --help' for more information on a command.
```

### ls —— 镜像列表

语法：

```sh
Usage:  docker image ls [OPTIONS] [REPOSITORY[:TAG]]

List images

Aliases:
  ls, images, list

Options:
  -a, --all             显示所有图像(默认隐藏中间图像)
      --digests         显示摘要
  -f, --filter filter   根据提供的条件过滤输出
      --format string   使用Go模板打印漂亮的图片
      --help            打印使用
      --no-trunc        不截断输出
  -q, --quiet           只显示数字id
```

实例：

```sh
# -a 列出所有镜像
docker image ls -a
# images —— 等同于 image ls -a
docker images

# -q 只显式数字 id
docker image ls -q
```

### rm —— 删除镜像

语法：

```sh
Usage:  docker image rm [OPTIONS] IMAGE [IMAGE...]

Remove one or more images

Aliases:
  rm, rmi, remove

Options:
  -f, --force      强制移除image
      --help       Print usage
      --no-prune   Do not delete untagged parents
```

实例：

```sh
# -f 删除镜像
docker image rm -f 7e989

# rmi —— 等同于 image rm
docker rmi b692
```

### build —— 从 Dockerfile 构建镜像

语法（常用）:

```sh
Usage:  docker image build [OPTIONS] PATH | URL | -

Build an image from a Dockerfile

Options:
      --build-arg list             设置构建时变量(默认[])
      --cache-from stringSlice     将镜像视为缓存源
      --cgroup-parent string       可选父容器cgroup
      --compress                   使用gzip压缩构建上下文
      --cpu-period int             限制CPU CFS(完全公平调度程序)周期
      --cpu-quota int              限制CPU CFS(完全公平调度程序)配额
  -c, --cpu-shares int             CPU份额(相对权重)
      --cpuset-cpus string         允许执行的cpu(0-3、0、1)
      --cpuset-mems string         允许执行的MEMs (0- 3,0,1)
      --disable-content-trust      跳过图像验证(默认为true)
  -f, --file string                Dockerfile的名称(默认为'PATH/Dockerfile')
      --force-rm                   总是删除中间容器
      --help                       Print usage
      --isolation string           容器隔离技术
      --label list                 设置image的元数据(默认[])
  -m, --memory string              内存限制
      --memory-swap string         交换限制等于内存加上交换:'-1'来启用无限交换
      --network string             在构建期间为RUN指令设置网络模式(默认为"default")
      --no-cache                   在构建映像时不使用缓存
      --pull                       总是尝试拉出更新版本的image
  -q, --quiet                      关闭构建输出并在成功时打印image ID
      --rm                         在成功构建后移除中间容器(默认为true)
      --security-opt stringSlice   安全选项
      --shm-size string            “/dev/shm”的大小，默认为64MB
  -t, --tag list                   以' Name:tag'格式命名和可选的标记(default [])
      --ulimit ulimit              Ulimit选项(默认[])
  -v, --volume list                设置构建时绑定挂载(默认[])
```

实例：

```sh
[root@base ~]# cat Dockerfile
FROM centos:7

RUN yum install -y openssh-server sudo
RUN sed -i 's/UsePAM yes/UsePAM no/g' /etc/ssh/sshd_config

#RUN useradd admin
#RUN echo "admin:admin" | chpasswd
RUN echo "root:123456" | chpasswd
#RUN echo "admin ALL=(ALL)    ALL" >> /etc/sudoers

RUN ssh-keygen -t dsa -f /etc/ssh/ssh_host_dsa_key
RUN ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key

RUN mkdir /var/run/sshd
EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]

# 根据当前目录下的 Dockerfile 构建名为 ssh-server 的镜像
[root@base ~]# docker image build -t ssh-server .

# 根据 ssh-server 镜像运行容器，并将容器内的22端口暴露到主机的10022端口上
docker run -dit --name sshd -p 10022:22 ssh-server
```
