# 基本概念

Docker 三个基本概念：镜像（Image）、容器（Container）、仓库（Repository）

## 镜像

Linux 系统分内核与用户空间，内核启动后会挂载 root 文件系统提供用户空间支持，Docker 镜像即相当于一个 root 文件系统。如官方镜像 `ubuntu:18.04` 包含完整 Ubuntu 18.04 最小系统的 root 文件系统

镜像是一个特殊文件系统，除提供容器运行时所需的程序、库、资源、配置等文件外，还包含为运行时准备的一些配置参数如匿名卷、环境变量、用户等。但**不包含**任何动态数据，其内容在构建后不变

### 分层存储

因包含完整 root 文件系统（往往体积庞大），docker 在设计时利用 Union FS 技术将镜像设计为分层存储架构。严格而言镜像并非如 ISO 般的打包文件，而是一个概念，实际由多层文件系统联合组成

镜像会一层层构建，前一层为后一层的基础，每层构建完即不再改变，后一层上任何改变只发生在当前层。如：删除前一层文件，实际仅在当前层标记该文件已删除，最终容器运行时虽看不到后者，但其实际会一直跟随镜像。因此在构建镜像时需额外小心，每层尽量只包含需要的东西，其余的都应在该层构建结束前清理掉

分层存储特征还使镜像复用、定制更为容易。甚至可以先前构建镜像为基础层，再进一步添加新层以构建新镜像

## 容器

镜像与容器的关系如同类与实例：前者为静态定义，后者为运行时实体。容器可被创建、启动、停止、删除、暂停等

容器实质为进程。但与宿主进程不同，容器进程运行于**独立命名空间**，可拥有自己的 **root 文件系统**、**网络配置**、**进程空间**、**用户 ID 空间**，就像在独立于宿主的系统下。因而应用在容器中运行比直接在宿主中更安全，而隔离特性也容易让人混淆容器与虚拟机

容器运行时以镜像为基础层，在其上创建容器存储层。后者生命周期与容器一致，容器消亡时随之消亡，其中信息也会随之丢失

按 Docker 最佳实践要求，容器不应向其存储层写入任何数据，后者应保持无状态化，所有文件写入操作都应使用数据卷（Volume）或绑定宿主目录（或网络存储）。数据卷生命周期独立于容器，容器删除或重新运行后不会丢失数据

## Docker Registry

Docker Registry 即一个集中存储、分发镜像的服务，可包含多个仓库（Repository），后者又可包含多个标签（Tag），每个标签对应一个镜像

通常一个仓库会包含同一软件不同版本（标签）的镜像，可通过`<仓库名>:<标签>`格式指定具体镜像，无标签则视为 latest

_以 Ubuntu 镜像为例：ubuntu 为仓库名，`ubuntu:16.04`或`ubuntu:18.04`为具体版本镜像；若忽略标签，则视为 `ubuntu:latest`_

仓库名常为二段路径形式，如`jwilder/nginx-proxy`：前者为 Registry 用户名，后者为软件名（非绝对，取决于具体 Docker Registry 服务）

### 公有 Registry

开放，允许用户免费上传、下载公开镜像的 Registry 服务，可能提供收费服务供用户管理私有镜像

最见的有：官方 [Docker Hub](https://hub.docker.com/)（即默认 Registry，拥有大量高质量[官方镜像](https://hub.docker.com/search?q=&type=image&image_filter=official)）、Red Hat 的 [Quay.io](https://quay.io/repository/)、Google 的 [Google Container Registry](https://cloud.google.com/container-registry/)（Kubernetes 镜像即使用该服务）、GitHub 的 [ghcr.io](https://docs.github.com/cn/packages/working-with-a-github-packages-registry/working-with-the-container-registry)、[网易云镜像服务](https://c.163.com/hub#/m/library/)、[DaoCloud 镜像市场](https://hub.daocloud.io/) 、[阿里云镜像库](https://www.aliyun.com/product/acr?source=5176.11533457&userCode=8lx5zmtu)等

国内的 Docker Hub 镜像（Registry Mirror）（加速器）：[阿里云加速器](https://www.aliyun.com/product/acr?source=5176.11533457&userCode=8lx5zmtu)、[DaoCloud 加速器](https://www.daocloud.io/mirror#accelerator-doc)等

### 私有 Registry

用户也可搭建私有 Registry，如使用官方的 [Docker Registry](https://hub.docker.com/_/registry/) 镜像<!-- TODO：会在私有仓库一节详细介绍 -->（提供 [Docker Registry API](https://docs.docker.com/registry/spec/api/) 的服务端实现，支持 docker 命令但不含图形界面及镜像维护、用户管理、访问控制等高级功能）

此外还有一些三方软件（实现 Docker Registry API，甚至提供用户界面及一些高级功能）如：[Harbor](https://github.com/goharbor/harbor) 、[Sonatype Nexus](https://vuepress.mirror.docker-practice.com/repository/nexus3_registry.html)
