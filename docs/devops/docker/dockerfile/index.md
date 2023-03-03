# dockerfile 详解

Dockerfile 是用于构建镜像的文本，由一行行指令语句组成，支持以 # 开头的注释行

## FROM

指定基础镜像，且必须为 Dockerfile 中的第一条指令。想在同一 Dockerfile 中创建多个镜像时，可使用多个。语法如下：

```dockerfile
FROM <image>
FROM <image>:<tag>
```

`<tag>` 为可选项，默认值为 latest

如不以任何镜像为基础，则写法为：`FROM scratch`，此时接下去的指令将以第一层存在

:::tip 提示
srcatch 是一个虚拟概念，表示一个空白镜像

不以任何系统为基础，直接将可执行文件复制进镜像的做法并不罕见，如 swarm、coreos/etcd。Linux 下静态编译的程序无需其他操作为其提供运行时支持，所需的一切库都在可执行文件里了，使用 scratch 作为基础，可以使镜像的体积更小巧
:::

## RUN

指定 docker build 过程中执行的命令。有以下两种格式：

```dockerfile
# shell 格式
RUN <command>

# exec 格式
RUN ["executable", "param1", "param2", ...]
```

- shell 格式中的 `<command>` 通常为 shell 命令，以 `/bin/sh -c` 来执行

- exec 格式指定一个 JSON 数组，其中的 `<executable>` 为要执行的命令，后面的
  `<paramN>` 为透传的选项或参数。此格式默认不以 `/bin/sh -c` 来执行，因此诸如变量、通配符等替换操作将不会进行，若要执行的命令依赖于此类 shell 特性，可改为下面形式：
  ```dockerfile
  RUN ["/bin/bash", "-c", "<executable>", "<param1>", ...]
  ```

:::tip 提示
DockerFile 的每个指令都会创建一个新层。RUN 指令也不例外，每次新创建一层，再在其上执行命令，完毕后提交这一层的修改，构成新的镜像

UnionFS 有最大层数限制，如 AUFS 不能超过 127 层（之前为 42 层）。因而对于一些编译、安装、更新等操作，无需分成好几层来操作，这样会使得镜像非常臃肿。拥有非常多的层，不仅增加了构建部署时间，也很容易出错

可使用 && 符号将多个命令隔开，使其先后执行。此时一个 RUN 指令可能变得非常长，为了 DockerFile 的可阅读性，可用 \ 进行换行操作

有时还需在 RUN 指令结尾处添加清理工作的命令，删除诸如那些为了编译构建而下载，缓存的文件。镜像是多层存储，每层存储的东西无法在下一层删除，会一直跟随着镜像。因此在镜像构建时，一定要确保每层只添加真正需要的东西，任何无关的东西都应被清理
:::

## CMD

与 RUN 指令相似，也具有 shell 和 exec 两种格式

Docker 不是虚拟机，容器就是进程，则在后者启动时就需指定运行的程序及参数。CMD 即用于指定容器默认的主进程启动命令

在运行时可设置 CMD 指令来代替镜像设置中的命令，例如 Ubuntu 默认的 CMD 是 `/bin/bash`，当用命令 `docker run -it ubuntu` 创建并启动一个容器时会直接进入 bash；也可在运行时指定运行别的命令，如 `docker run -it ubuntu cat /etc/os-release`，这就用 `cat /etc/os-release` 命令代替了默认的 `/bin/bash` 命令，输出了系统版本信息

实例：若想在启动容器时，在控制台中输出 Hello Docker! 则可在 Dockerfile 中这样写：

```dockerfile
FROM ubuntu
CMD echo "Hello Docker!"
```

接着构建一个镜像 ubuntu:v1.0 并以此为基础创建并启动一个容器，如下：

```sh
docker run -it ubuntu:v1.0
```

这样就会在控制台中输出 Hello Docker! 注意如使用 shell 格式，则实际命令会被包装成 `sh -c` 的参数形式执行。上面的 CMD 指令实际执行时会变成：

```dockerfile
CMD ["sh", "-c", "echo", "Hello Docker!"]
```

由于一些命令在加上 `sh -c` 后可能发生意外错误，因此在 Dockerfile 中使用 CMD 指令时，更推荐使用 exec 格式

最后，通过 `docker run` 指定的待执行命令可覆盖 RUN 指令。例如有如下 Dockerfile

```dockerfile
FROM ubuntu
CMD ["echo", "Hello Docker!"]
```

再将其构建为镜像 ubuntu:v1.1，接着以此镜像为基础创建并启动一个容器，如下：

```sh
docker run -it ubuntu:v1.1 cat /etc/os-release
```

则容器中只会执行 `cat /etc/os-release`，即输出系统版本信息

## COPY

COPY 指令将指定路径下的文件或目录复制到镜像内新一层的指定路径下，格式为：

```
COPY <源路径> ... <目标路径>
```

原路径可以为多个，或是通配符（其规则只需满足 GO 语言 `filepath.Math` 规则），如下：

```dockerfile
COPY ./test1.py ./test2.py /test/
COPY ./t*.py /test/
COPY ./test?.py /test/
```

目标路径可为容器内的绝对路径，或工作目录下的相对路径，后者通过 WORKDIR 指令来指定。目标路径也无需事先创建，Docker 会自动创建所需的文件目录

另外 COPY 指令也会复制文件（或整个目录）的所有元数据，如读、写、指定全选、时间变更等

## ADD

ADD 指令与 COPY 的格式和性质基本一致，不过在后者基础上增加了一些功能，如源路径可为 URL，Docker 会自动将 URL 对应文件下载到目标路径下。例如：

```dockerfile
ADD http://192.168.0.89:5000/test.py /test/
```

使用 `docker build` 构建镜像，再用 `docker run` 创建并启动容器，会发现在根目录下的 test 文件夹下有了 test.py 文件。如果源路径是本地的一个 tar 压缩文件时，ADD 指定在复制到目录路径下会自动将其进行解压，如下

————————————————
版权声明：本文为 CSDN 博主「玉米丛里吃过亏」的原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/y472360651/article/details/81289141

<!-- :::warning 注意
若包含参数则一定要用双引号，而非单引号。原因是参数传递后，docker 解析的是一个 JSON array
:::

## ENTRYPOINT——为容器指定默认运行程序

功能与 CMD 指令类似，用于为容器指定默认运行程序，从而使得前者像是一个单独的可执行程序

些 Dockerfile 时, ENTRYPOINT 或者 CMD 指令会自动覆盖之前的 ENTRYPOINT 或者 CMD 指令。即 ENTRYPOINT 或者 CMD 指令只能写一条，如果写了多条，那么，ENTRYPOINT 或者 CMD 都只有最后一条生效。

在 Docker 镜像运行时, 用户也可以在命令行指定具体命令, 覆盖在 Dockerfile 里的命令。

与 CMD 不同的是，由 ENTRYPOINT 启动的程序不会被 docker run 命令行指定的参数所覆盖，而且，这些命令行参数会被当作参数传递给 ENTRYPOINT 指令指定的程序，不过，docker run 命令的--entrypoint 选项的参数可覆盖 ENTRYPOINT 指令指定的程序。

其语法如下：

# exec 格式（推荐）

ENTRYPOINT ["executable", "param1", "param2"]

# shell 格式

ENTRYPOINT command param1 param2
第一种就是可执行文件加参数。与 CMD 指令一样，ENTRYPOINT 也更加推荐使用 exec 格式。

第二种就是 shell 格式。

样例：

FROM ubuntu
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/\*
ENTRYPOINT ["curl", "-s", "http://ip.cn"]

# 将其构建成镜像 ubuntu:v1.2，下面我们创建并启动容器：

docker run -it ubuntu:v1.2

# 将会在控制台输出我们相应的公网 IP 信息！

# 此时，如果我们还需要获取 HTTP 头信息时，我们可以这样：

docker run -it ubuntu:v1.2 -i
CMD 与 ENTRYPOINT 的异同点
这俩命令非常想，而且还可以配合使用。

相同点：

只能写一条，如果写了多条，那么只有最后一条生效。
容器启动时才运行，运行时机相同。
不同点：

ENTRYPOINT 不会被运行的 command 覆盖，而 CMD 则会被覆盖。
如果我们在 Dockerfile 中同时写了 ENTRYPOINT 和 CMD，并且 CMD 指令不是一个完整的可执行命令，那么 CMD 指定的内容将会作为 ENTRYPOINT 的参数。如下所示：
FROM ubuntu
ENTRYPOINT ["rm", "docker2"]
CMD ["-rf"]
它真正执行的命令将会是：rm docker2 -rf。

如果我们在 Dockerfile 种同时写了 ENTRYPOINT 和 CMD，并且 CMD 是一个完整的指令，那么它们两个会互相覆盖，谁在最后谁生效。如下所示：
FROM ubuntu
ENTRYPOINT ["top", "-b"]
CMD ls -al
那么将执行 ls -al,top -b 不会执行。

下表显示了针对不同的 ENTRYPOINT/CMD 进行组合后执行的命令：

No ENTRYPOINT ENTRYPOINT exec_entry p1_entry ENTRYPOINT [“exec_entry”, “p1_entry”]
虽然这 2 个指令功能类似，但是这两个指令不是互斥的. 在很多情况下, 你可以组合 ENTRYPOINT 和 CMD 指令, 提升最终用户的体验。同时我们从上表也发现在使用 SHELL 去执行 ENTRYPOINT 时，ENTRYPOINT 会无视从 CMD 传来的任何参数，所以 CMD 只传参数是无效的。

组合 ENTRYPOINT 和 CMD 指令的最佳实践：
组合使用 ENTRYPOINT 和 CMD 命令式, 确保你一定用的是 exec 表示法. 如果有其中一个用的是 shell 表示法, 或者一个是 shell 表示法, 另一个是 exec 表示法, 你永远得不到你预期的效果。只有当 ENTRYPOINT 和 CMD 都用 exec 表示法, 才能得到预期的效果。
COPY-复制文件或者目录到容器里指定路径
从上下文目录中复制文件或者目录到容器里指定路径。

语法格式如下：

COPY [--chown=<user>:<group>] <src>... <dest>
COPY [--chown=<user>:<group>] ["<src>",... "<dest>"]
参数说明：

[--chown=:] ：可选参数，用户改变复制到容器内文件的拥有者和属组。
<源路径> ：源文件或者源目录，这里可以是通配符表达式，其通配符规则要满足 Go 的 filepath.Match 规则。例如：COPY hom\* /mydir/，COPY hom?.txt /mydir/。源路径必须是 build 上下文中的路径，不能是其父目录中的文件。如果源路径是目录，则其内部文件或子目录会被递归复制，但源路径目录自身不会被复制。如果指定了多个源路径，或在源路径中使用了通配符，则目标路径必须是一个目录，且必须以/结尾。
<目标路径> ：容器内的指定路径，建议为目标路径使用绝对路径，否则，COPY 指令则以 WORKDIR 为其起始路径；如果目标路径事先不存在，它将会被自动创建，这包括其父目录路径。
样例：

# 复制宿主机文件 index.html 到容器/data/html/index.html

COPY index.html /data/html/index.html

# 复制宿主机 data 目录下文件（包括子目录）到容器/data/目录下，并不会复制目录本身

COPY data /data/
ADD-复制文件或者目录到容器里指定路径
ADD 指令和 COPY 的使用类似 （同样需求下，官方推荐使用 COPY） ，功能也类似。除此之外，ADD 还支持使用 TAR 文件和 URL 路径，并且会将 tar 压缩文件（gzip, bzip2 以及 xz 格式）解压缩，如果指定的是 url，会从指定的 url 下载文件放到目录中（ 如果 url 下载的文件为 tar 文件，则不会展开）。

其语法格式如下：

ADD [--chown=<user>:<group>] <src>... <dest>
ADD [--chown=<user>:<group>] ["<src>",... "<dest>"]
样例：

ADD /data/src/nginx-1.14.0.tar.gz /data/src/

# 构建镜像

docker build -t nginx:v1.1 .

# 创建容器

docker run --rm --name nginx -it nginx:v1.1 ls /data/src

# 我们可以发现已经解压了 nginx-1.14.0.tar.gz 文件

LABEL-为镜像指定标签
为镜像指定标签，其格式为：

LABEL <key1>=<value1> <key2>=<value2> ...
LABEL 后面是键值对，多个键值对以空格进行隔开，如果 value 中包含空格，请使用""将 value 进行圈起来。

# 如果太长需要换行的话，则使用\符号

LABEL name=test \
 description="a container is used to test"
我们可以使用 docker inspect 命令，来查看镜像的标签：

docker inspect --format '{{json .Config.Labels}}' test | python3 -m json.tool
其中，“test”为容器名称，”python3 -m json.tool“为将其格式化为 JSON 输出。

MAINTAINER-指定生成镜像的作者名称
用于指定生成镜像的作者名称，其格式为：

MAINTAINER <name>
MAINTAINER 指令已经被弃用，可以使用 LABEL 指令进行替代，样例如下：

LABEL maintainer='Stephen Chow'
说明：
LABEL 会继承基础镜像中的 LABEL，如遇到 key 相同，则值覆盖。
EXPOSE-为容器打开指定要监听的端口以实现与外部通信
用于为容器打开指定要监听的端口以实现与外部通信，这个只是声明，真正要暴露这个端口需要再构建容器的时候使用"-P"选项。其格式为：

EXPOSE <port> [<port>/<protocol>...]
示例：

EXPOSE 80/tcp
EXPOSE 80/udp
如果想使得容器与主机的端口有映射关系，需要在启动容器时指定-P.

# 这里的“-P”选项是关键，在启动容器的使用使用-P，

# Docker 会自动分配一个端口和转发指定的端口，

# 使用-p 可以具体指定使用哪个本地的端口来映射对外开放的端口。

docker run --rm --name nginx -itd -P nginx:v1.4
ENV-设置环境变量
设置环境变量，无论是接下来的指令（如 ENV、ADD、COPY 等，其调用格式为$variable_name或${variable_name}），还是在容器中运行的程序，都可以使用这里定义的环境变量。

它有两种语法格式，如下所示：

ENV <key> <value>

ENV <key>=<value> ...
两者的区别就是第一种是一次设置一个，第二种是一次设置多个。

示例：

ENV word hello
RUN echo $word
注意：
如果你想通过CMD或者ENTRYPOINT指令的exec格式来打印环境，就像下面这样：
CMD ["echo", $MODE]
CMD ["echo", "$MODE"]
这样都是不能正确输出环境变量的值的，你可以改成 exec 格式来执行 shell 命令，如下所示：
CMD ["sh", "-c", "echo $MODE"]
如此，就能正确输出环境变量的值了！
ARG-设置环境变量
构建参数 ARG 和 ENV 指令一样，都是设置环境变量。不过作用域不一样。ARG 设置的环境变量仅对 Dockerfile 内有效，也就是说只有 docker build 的过程中有效，构建好的镜像内不存在此环境变量。即在将来容器运行时是不会存在这些环境变量的。但是不要因此就用 ARG 来保存密码之类的信息，因为通过 docker history 还是能够看得到的。

ARG 构建命令在 docker build 中可以用 --build-arg <参数名>=<值> 来覆盖。

语法格式如下：

ARG <参数名>[=<默认值>]
示例：

FROM ubuntu:16.04
ARG app="python-pip"
RUN apt-get update && apt-get install -y $app && rm -rf /var/lib/apt/lists/\*

# 我们可以定义多个参数

FROM busybox
ARG user1
ARG buildno

# 也可以给参数一个默认值

FROM busybox
ARG user1=someuser
ARG buildno=1

# 如果我们给 ARG 定义了参数默认值，那么当 build 镜像时，如果没有指定参数值，将会使用这个默认值。

WORKDIR-指定工作目录
用于为 Dockerfile 中所有的 RUN、CMD、ENTRYPOINT、COPY 和 ADD 指令设定工作目录。用 WORKDIR 指定的工作目录，会在构建镜像的每一层中都存在。（WORKDIR 指定的工作目录，必须是提前创建好的）。

docker build 构建镜像过程中的，每一个 RUN 命令都是新建的一层。只有通过 WORKDIR 创建的目录才会一直存在。

在 Dockerfile 文件中，WORKDIR 指令可出现多次，其路径也可以为相对路径，不过，它的路径是相对此前一个 WORKDIR 指令指定的路径。另外，WORKDIR 也可调用由 ENV 指定定义的变量。

格式：

WORKDIR <工作目录路径>
样例：

WORKDIR /var/log

# 解析环境变量

ENV DIRPATH /path
WORKDIR $DIRPATH

# 也可以设置多次

WORKDIR /a
WORKDIR b
WORKDIR c
RUN pwd

# pwd 执行的结果是/a/b/c

VOLUME-定义匿名数据卷
定义匿名数据卷，可实现挂载功能，可以将内地文件夹或者其他容器中得文件夹挂在到这个容器中。在启动容器时忘记挂载数据卷，会自动挂载到匿名卷。

作用：

避免重要的数据，因容器重启而丢失，这是非常致命的。（容器使用的是 AUFS，这种文件系统不能持久化数据，当容器关闭后，所有的更改都会丢失。）
避免容器不断变大。
语法格式如下：

VOLUME ["<路径 1>", "<路径 2>"...]
VOLUME <路径>
在启动容器 docker run 的时候，我们可以通过 -v 参数修改挂载点。

样例：

# 定义一个匿名卷

FROM ubuntu:16.04
VOLUME /data

# 定义多个匿名卷

FROM ubuntu:16.04
VOLUME ["/data", "/command"]
这里的/data 和/command 目录在容器运行时会自动挂载为匿名卷，任何向/data 和/command 目录中写入的信息都不会记录进容器存储层，从而保证了容器存储层的无状态化！容器匿名卷目录指定可以通过 docker run 命令中指定-v 参数来进行覆盖。

USER-指定执行后续命令的用户和用户组
用于指定执行后续命令的用户和用户组，这里只是切换后续命令执行的用户（用户和用户组必须提前已经存在）。在 USER 命令之前可以使用 RUN 命令创建需要的用户。

默认情况下，容器的运行身份为 root 用户。

语法格式如下：

# 可以指定用户名或者 UID，组名或者 GID

USER <user>[:<group>]
USER <UID>[:<GID>]
USER 指令还可以在 docker run 命令中使用-u 参数进行覆盖。

样例：

RUN groupadd -r docker && useradd -r -g docker docker

USER docker
ONBUILD-用于延迟构建命令的执行
用于延迟构建命令的执行。简单的说，就是 Dockerfile 里用 ONBUILD 指定的命令，在本次构建镜像的过程中不会执行（假设镜像为 test-build）。当有新的 Dockerfile 使用了之前构建的镜像 FROM test-build ，这时执行新镜像的 Dockerfile 构建时候，会执行 test-build 的 Dockerfile 里的 ONBUILD 指定的命令。

ONBUILD 是一个特殊的指令，它后面跟着的是其他指令，比如 COPY、RUN 等，而这些命令在当前镜像被构建时，并不会被执行。只有以当前镜像为基础镜像去构建下一级镜像时，才会被执行。

Dockerfile 中的其他指令都是为了构建当前镜像准备的，只有 ONBUILD 指令是为了帮助别人定制而准备的。

语法格式如下：

ONBUILD <其他指令>
样例：

from ubuntu:16.04
WORKDIR /data
ONBUILD RUN mkdir test
STOPSIGNAL
设置将发送到容器以退出的系统调用信号。这个信号可以是一个有效的无符号数字，与内核的 syscall 表中的位置相匹配，如 9，或者是 SIGNAME 格式的信号名，如 SIGKILL。

语法格式如下：

STOPSIGNAL signal
默认的停止信号是 SIGTERM，在 docker stop 的时候会给容器内 PID 为 1 的进程发送这个 signal，通过--stop-signal 可以设置自己需要的 signal，主要的目的是为了让容器内的应用程序在接收到 signal 之后可以先做一些事情，实现容器的平滑退出。如果不做任何处理，容器将在一段时间之后强制退出，会造成业务的强制中断，这个时间默认是 10s。

HEALTHCHECK-容器健康状况检查
用于指定某个程序或者指令来监控 docker 容器服务的运行状态是否正常。

语法格式如下：

# 设置检查容器健康状况的命令

HEALTHCHECK [OPTIONS] CMD <命令>

# 如果基础镜像有健康检查指令，使用这行可以屏蔽掉其健康检查指令

HEALTHCHECK NONE

OPTIONS 参数说明：

–interval=<间隔> ：两次检查的时间间隔，默认为 30s
–timeout=<时长> ：健康检查命令运行超时时间，如果超过这个时间，本次健康检查将会判定为失败，默认为 30s
–retries=<次数> ：当连续失败指定次数之后，则将容器状态视为 unhealthy，默认为 3 次。
--start-period=DURATION：启动时间，默认为 0s， 如果指定这个参数， 则必须大于 0s ；--start-period 为需要启动的容器提供了初始化的时间段， 在这个时间段内如果检查失败， 则不会记录失败次数。 如果在启动时间内成功执行了健康检查， 则容器将被视为已经启动， 如果在启动时间内再次出现检查失败， 则会记录失败次数。
在 CMD 关键字之后的 command 可以是一个 shell 命令（例如： HEALTHCHECK CMD /bin/check-running）或者一个 exec 数组（与其它 Dockerfile 命令相同， 参考 [ENTRYPOINT]）。

该命令的返回值说明了容器的状态， 可能是值为：

0: healthy - 容器健康，可以使用；
1: unhealthy - 容器工作不正常，需要诊断；
2: reserved - 保留，不要使用这个返回值；
当容器的健康状态发生变化时，会生成一个带有新状态的 health_status 事件。

样例：

HEALTHCHECK --interval=5m --timeout=3s \
 CMD curl -f http://localhost/ || exit 1
注意：
和 CMD、NETRYPOINT 一样，HEALTHCHECK 指令只可以出现一次，如果有多个 HEALTHCHECK 指令，那么只有最后一个才会生效！
SHELL-重写 xxx 指令的 shell 格式所使用的默认 shell
SHELL 指令允许重写 xxx 指令的 shell 格式所使用的默认 shell。关于默认的 shell，Linux 是["/bin/sh", "-c"]，Windows 是["cmd", "/S", "/C"]。

SHELL 指令必须在 dockerfile 中以 JSON 格式编写。

SHELL 指令在 Windows 上特别有用，Windows 有两种常用且截然不同的本机 shell：cmd 和 powershell，以及可用的备用 shell，包括 sh。

SHELL 指令可以出现多次。 每条 SHELL 指令都会覆盖所有先前的 SHELL 指令，并影响所有后续指令。

样例：

FROM microsoft/windowsservercore

# Executed as cmd /S /C echo default

RUN echo default

# Executed as cmd /S /C powershell -command Write-Host default

RUN powershell -command Write-Host default

# Executed as powershell -command Write-Host hello

SHELL ["powershell", "-command"]
RUN Write-Host hello

# Executed as cmd /S /C echo hello

SHELL ["cmd", "/S", "/C"]
RUN echo hello
当在 Dockerfile 中使用它们的 shell 格式时，以下指令可能会受到 SHELL 指令的影响：RUN、CMD 和 ENTRYPOINT。

```

```

```

```
 -->
