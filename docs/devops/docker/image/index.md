# 镜像

## 获取镜像

`docker pull` 命令用于从仓库获取镜像，格式（也可参见 `docker pull --help`，下同）：

```sh
$ docker pull [选项] [Registry 地址[:端口号]/]仓库名[:标签]
```

- Registry 地址：格式一般为 `<域名/IP>[:端口号]`，默认为 Docker Hub(docker.io)

- 仓库名：两段式名称 `<用户名>/<软件名>`。对于 Docker Hub 可省略用户名，默认官方镜像

镜像会一层层下载，过程输出每层 ID 前 12 位，结束后再输出镜像完整 sha256 摘要（digest）确保一致性

## 运行镜像

`docker run` 命令以指定镜像为基础运行容器，常用选项如下：

- `-it`： `-i` 表示交互式操作，`-t` 表示终端
- `--rm`：表示容器退出后将被删除。默认下退出的容器不会立即删除，除非手动 `docker rm`

<!--
ubuntu:18.04：这是指用 ubuntu:18.04 镜像为基础来启动容器。
bash：放在镜像名后的是 命令，这里我们希望有个交互式 Shell，因此用的是 bash

进入容器后，我们可以在 Shell 下操作，执行任何所需的命令。这里，我们执行了 cat /etc/os-release，这是 Linux 常用的查看当前系统版本的命令，从返回的结果可以看到容器内是 Ubuntu 18.04.1 LTS 系统。

最后我们通过 exit 退出了这个容器。
 -->

## 列出镜像

`docker image ls` 命令用于列出已下载镜像，包含列：仓库名、标签、镜像 ID、创建时间、占用空间。其中：镜像 ID 为镜像唯一标识，但一个镜像可对应多个标签

### 镜像体积

上面的所占空间与 Docker Hub 的镜像大小不同：后者是压缩后的体积；而前者为镜像下载到本地后的磁盘空间占用（即展开后的各层所占空间总和）

另外，`docker image ls` 列表中的镜像体积总和并非所有镜像的实际硬盘消耗。由于 Docker 镜像是多层存储结构，可继承、复用，因而不同镜像可能因使用相同基础镜像而拥有共同的层。由于 Docker 使用 Union FS，相同层只需保存一份，因此实际硬盘占用空间可能比列表镜像大小总和要小的多

`docker system df` 命令用于概览镜像、容器、数据卷所占空间

### 虚悬镜像（dangling image）

一种无仓库名和标签（均为 `<none>`）的特殊镜像，通常可随意删除。存在原因有以下：

- 原本正常镜像，在官方（因维护）重新发布同一版本且用户重新 `docker pull` 后，被取消名称

- `docker build` 重新构建同名同版本镜像，旧镜像被取消名称

`docker image ls -f dangling=true` 命令用于专门显示此类镜像

`docker image prune` 用于删除此类镜像

### 中间层镜像

为加速镜像构建、重复利用资源，Docker 会利用中间层镜像

`docker image ls` 默认只列出顶层镜像，可通过 `-a` 列出包含中间层镜像在内的所有镜像。此时出现的无标签镜像不同于虚悬镜像，很多都是中间层镜像，是其它镜像的依赖，不应被删除（会导致上层镜像因依赖丢失而出错）

由于相同层只存一遍，只要删除完依赖其的镜像，这些中间层镜像就会被连带删除

### 列出部分镜像

`docker image ls` 默认列出所有顶层镜像，若只希望列出特定部分，可通过如下参数：

- 根据仓库名列出镜像，如：`docker image ls ubuntu`
- 列出特定镜像（即指定仓库名和标签），如：`docker image ls ubuntu:18.04`
- 借助过滤器参数 `--filter` 或 `-f`，如：
  - 列出 `mongo:3.2` 后获取的镜像：`docker image ls -f since=mongo:3.2`，若将 `since` 换成 `before` 则表示之前
  - 根据镜像构建时定义的 LABEL 来过滤：`docker image ls -f label=com.example.version=0.1`

### 以特定格式显示

- `docker image ls` 默认输出完整表格，但若仅需要 ID（如列出所有虚悬镜像 ID 并交由 `docker image rm` 为参数来删除），便可用 `-q` 选项指定

- `--digests` 用于在输出列表中额外增加摘要列

<!--
如 `docker image ls --format "{{.ID}}: {{.Repository}}"` 命令会直接列出镜像结果，只包含镜像ID和仓库名

`docker image ls --format "table {{.ID}}\t{{.Repository}}\t{{.Tag}}"` 自定义列的同时于默认格式以下等距展示，且有标题行
 -->

## 删除本地镜像

`docker image rm` 命令用于删除本地镜像，格式：

```sh
$ docker image rm [选项] <镜像1> [<镜像2> ...]
```

`<镜像>` 可对应长/短镜像 ID、镜像名（`<仓库名>:<标签>`形式）或镜像摘要

### Untagged 和 Deleted

观察删除命令的输出会发现删除行为分为：Untagged 和 Deleted、、

由于镜像唯一标识是其 ID 和摘要，而一个镜像可有多个标签（表现为 `docker image ls` 输出不同标签但相同 ID 的行）。因而使用命令删除镜像等价于删除某个标签 -> 镜像映射，即 Untagged，若还有别的标签指向该镜像，则 Delete 行为并不发生。所以 `docker image rm` 并非一定会删除镜像，可能仅是取消了某个标签

当镜像所有标签都被摘除，就会触发删除行为。镜像是多层存储结构，删除时会从上层往基础层方向依次判断：若某层被其他镜像依赖，则不会被删除（有时会发现删除层数与 `docker pull` 看到的层数不一致）

此外还需注意容器对镜像的依赖，若有用该镜像启动的容器存在（即使并未运行），则同样不可删除该镜像。容器以镜像为基础，再加一层容器存储层，因此若该镜像被容器所依赖，则删除必然会导致故障。应该先将对应容器删除，再删除镜像

### docker image ls 配合删除

可用 `docker image ls -q` 配合 `docker image rm` 来批量删除镜像，例如：

```sh
# 删除仓库名为 redis 的镜像
$ docker image rm $(docker image ls -q redis)

# 删除所有在 mongo 前获取的镜像
$ docker image rm $(docker image ls -q -f before=mongo:3.2)
```

## 利用 commit 理解镜像构成

`docker commit` 仅用于一些特殊场合，如被入侵后保存现场等，但不要用于定制镜像，后者应使用 Dockerfile 完成

镜像是容器的基础，每次执行 `docker run` 时候都会指定某镜像作为容器运行的基础。在之前例子所使用的都是来自 Docker Hub 的镜像，而当后者无法满足需求时，就需要定镜像

这里以定制一个 Web 服务器为例讲解镜像是如何构建的：

```sh
$ docker run --name webserver -d -p 80:80 nginx
```

此命令用 nginx 镜像启动容器，命名为 webserver，并且映射了 80 端口。可直接用浏览器并看到默认 Nginx 欢迎页

若希望修改欢迎页内容，可用 `docker exec` 命令以交互式终端方式进入容器，执行 bash 命令修改其内容：

```sh
$ docker exec -it webserver bash
root@3729b97e8226:/# echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
root@3729b97e8226:/# exit
exit
```

刷新浏览器会发现内容已改变。修改容器内文件即改动了容器存储层，可通过 `docker diff` 命令看到具体改动

定制好变化后若希望将其存为新镜像，可使用 `docker commit` 命令，语法：`docker commit [选项] <容器ID或容器名> [<仓库名>[:<标签>]]`

运行容器时（若不使用卷）任何对文件的修改记录于容器存储层。该命令即在原有镜像基础上叠加容器存储层构成新镜像，运行后者即拥有原容器最后的文件变化。例如：

```sh
$ docker commit \
    --author "Tao Wang <twang2218@gmail.com>" \
    --message "修改了默认网页" \
    webserver \
    nginx:v2
sha256:07e33465974800ce65751acc279adc6ed2dc5ed4e0838f8b86f0c87aa1795214
```

其中 `--author` 指定修改作者，`--message` 记录本次修改的内容（与 git 相似），也可省略

可通过 `docker image ls` 看到此新定制的镜像：

```sh
$ docker image ls nginx
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
nginx               v2                  07e334659748        9 seconds ago       181.5 MB
nginx               1.11                05a60462f8ba        12 days ago         181.5 MB
nginx               latest              e43d811ce2f4        4 weeks ago
```

还可用 `docker history` 查看镜像内的历史记录，相较于 `nginx:latest` 可发现新增了刚刚提交的一层

```sh
$ docker history nginx:v2
IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
07e334659748        54 seconds ago      nginx -g daemon off;                            95 B                修改了默认网页
e43d811ce2f4        4 weeks ago         /bin/sh -c #(nop)  CMD ["nginx" "-g" "daemon    0 B
<missing>           4 weeks ago         /bin/sh -c #(nop)  EXPOSE 443/tcp 80/tcp        0 B
<missing>           4 weeks ago         /bin/sh -c ln -sf /dev/stdout /var/log/nginx/   22 B
<missing>           4 weeks ago         /bin/sh -c apt-key adv --keyserver hkp://pgp.   58.46 MB
<missing>           4 weeks ago         /bin/sh -c #(nop)  ENV NGINX_VERSION=1.11.5-1   0 B
<missing>           4 weeks ago         /bin/sh -c #(nop)  MAINTAINER NGINX Docker Ma   0 B
<missing>           4 weeks ago         /bin/sh -c #(nop)  CMD ["/bin/bash"]            0 B
<missing>           4 weeks ago         /bin/sh -c #(nop) ADD file:23aa4f893e3288698c   123 MB
```

运行新镜像：

```sh
docker run --name web2 -d -p 81:80 nginx:v2
```

访问可见结果，其内容与上面修改后的一样

<!-- 至此，我们第一次完成了定制镜像，使用的是 docker commit 命令，手动操作给旧的镜像添加了新的一层，形成新的镜像，对镜像多层存储应该有了更直观的感觉。 -->

`docker commit` 命令虽可较直观地帮助理解镜像分层存储的概念，但实际环境中并不会这样使用：

1. 即使最简单操作也会导致大量无关内容被添加或修改，遑论安装包、编译构建等，这将导致镜像臃肿（观察`docker diff webserver` ，除 `/usr/share/nginx/html/index.html` 外，还有许多文件也被涉及）

2. 此外，`docker commit` 意味着对镜像的黑箱操作，生成了黑箱镜像（别人很难知道执行过什么命令、如何生成该镜像，甚至制作人自己过后也会忘记具体操作）。此类镜像通常难以维护

3. 且镜像的之前层是不发生改变的，任何修改仅局限于当前层的标记、添加、修改（回顾镜像分层存储概念）。使用 `docker commit` 制作镜像，以及后期再修改，每一次都会让镜像更臃肿

## 使用 Dockerfile 定制镜像

镜像的定制实际就是定制每层所添加的配置、文件。若可将每层修改、安装、构建、操作的命令都写入一个脚本，用其来构建镜像，则之前提及的问题都会解决。该脚本即 Dockerfile

Dockerfile 是一个文本文件，其中包含了一条条的指令(Instruction)，每一条构建一层，因而每条指令的内容，就是描述该层应如何构建

还定制 nginx 镜像为例，这次使用 Dockerfile 来定制：在空白目录中建立名为 Dockerfile 的文件：

```sh
$ mkdir mynginx
$ cd mynginx
$ touch Dockerfile
```

其内容为：

```docker
FROM nginx
RUN echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
```

### FROM 指定基础镜像

所谓定制镜像，即以一个镜像为基础，在其上进行定制（就像之前运行了一个 nginx 容器再进行修改一样），基础镜像必须指定，而 FROM 即指定基础镜像。Dockerfile 中 FROM 必须是第一条指令

Docker Hub 上有很多高质量官方镜像：

- 有可直接使用的服务类镜像，如 nginx、redis、mongo、mysql、httpd、php、tomcat 等
- 也有方便开发、构建、运行各种语言应用的镜像，如 node、openjdk、python、ruby、golang 等
- 还提供了一些更为基础的操作系统镜像，如 ubuntu、debian、centos、fedora、alpine 等，提供了更广阔的扩展空间

可在其中寻找一个最符合的作为基础镜像进行定制

除了选择现有镜像为基础镜像外，Docker 还存在一个名为 scratch 的特殊镜像，其为虚拟概念，表示一个空白的镜像。以其为基础镜像意味着不以任何镜像为基础，接下来的指令将作为镜像第一层

不以任何系统为基础，直接将可执行文件复制进镜像的做法并不罕见，Linux 下静态编译的程序无需操作系统提供运行时支持，所需的一切库都已在可执行文件内，因此直接 FROM scratch 会让镜像体积更小。使用 Go 开发的应用很多会使用这种方式制作镜像，这也是有人认为 Go 是特别适合容器微服务架构的语言的原因之一

### RUN 执行命令

RUN 指令用于执行命令行命令。是最常用的指令之一，其格式有两种：

- shell 格式：`RUN <命令>`，就像直接在命令行中输入一样，如：

  ```docker
  RUN echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
  ```

- exec 格式：`RUN ["可执行文件", "参数 1", "参数 2", ...]`，类似函数调用的格式

但不要每个命令对应一个 RUN，Dockerfile 中每个指令都会建立一层，RUN 也不例外，每个 RUN 新建一层，在其上执行这些命令，结束后 commit 该层的修改构成新镜像。这样创建了多层镜像，让很多运行时不需要的东西都被装进镜像里，比如编译环境、更新的软件包等等。结果就是产生非常臃肿、多层的镜像，即增加了构建部署的时间，也很容易出错

Union FS 有最大层数限制，如 AUFS 不得超过 127 层

推荐的 Dockerfile 写法类似如下：

```docker
FROM debian:stretch

RUN set -x; buildDeps='gcc libc6-dev make wget' \
    && apt-get update \
    && apt-get install -y $buildDeps \
    && wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz" \
    && mkdir -p /usr/src/redis \
    && tar -xzf redis.tar.gz -C /usr/src/redis --strip-components=1 \
    && make -C /usr/src/redis \
    && make -C /usr/src/redis install \
    && rm -rf /var/lib/apt/lists/* \
    && rm redis.tar.gz \
    && rm -r /usr/src/redis \
    && apt-get purge -y --auto-remove $buildDeps
```

上述所有命令只有一个目的：编译、安装 redis 可执行文件。这只是一层的事情，因而仅使用一个 RUN 指令，借助 && 将所需的各命令串联起来。在撰写 Dockerfile 时要经常提醒自己：不是在写 Shell 脚本，而是在定义每一层该如何构

这里为了格式化还进行了换行。Dockerfile 支持 Shell 中行尾添加 \ 的命令换行方式，以及行首 # 进行注释的格式。良好的格式，如换行、缩进、注释等，会让维护、排障更为容易

还可看到最后添加了清理相关的命令，删除为编译构建所需的软件，清理了所有下载、展开的文件，也清理了 apt 缓存文件<!-- 。这是很重要的一步，之前说过镜像是多层存储，每一层的东西并不会在下一层被删除，会一直跟随着镜像。因此镜像构建时，一定要确保每一层只添加真正需要添加的东西，任何无关的东西都应该清理掉。 -->

### 构建镜像

回到定制的 nginx 镜像的例子，在 Dockerfile 文件所在目录执行：

```sh
$ docker build -t nginx:v3 .
Sending build context to Docker daemon 2.048 kB
Step 1 : FROM nginx
 ---> e43d811ce2f4
Step 2 : RUN echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
 ---> Running in 9cdc27646c7b
 ---> 44aa4490ce2c
Removing intermediate container 9cdc27646c7b
Successfully built 44aa4490ce2c
```

命令输出结果可清晰看到镜像的构建过程。在 Step 2 中，RUN 指令启动容器 9cdc27646c7b，执行所要求的命令，最后提交了这一层 44aa4490ce2c，随后删除了所用到的容器 9cdc27646c7b

`docker build` 命令即用于镜像构建，格式：

```sh
docker build [选项] <上下文路径/URL/->
```

这里指定了最终镜像的名称 `-t nginx:v3`，可像之前那样来运行，其结果和 nginx:v2 一样
