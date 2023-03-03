# npm vs yarn vs pnpm

## yarn 与 npm

npm 2.x 时，modu_modules 中依赖包同样拥有自身的 modu_modules ，即 node_modules 嵌套，所造成的致命问题是可能会超出 windows 文件最长路径（260 字符）

而 yarn 和后续的 npm3.x 采取了平铺所有嵌套依赖于第一层的方式。当然若包存在多个版本，则后面的版本还是会存在于自身 node_modules 下，即嵌套

另外，yarn 和 npm 也都实现了锁定依赖版本的功能，即 yarn.lock 和 package-lock.json

当然平铺依赖也存在幽灵依赖和浪费磁盘空间的问题

:::tip 提示

- 幽灵依赖：依赖包平铺的原因，导致未声明在 dependencies 内的依赖，依旧可在代码中被引入
- 浪费磁盘空间：同名不同版本的包只会提升其中一个，其余的即便有被不同包同时依赖，也只会分别存在于各自 node_modules 下

:::

## pnpm 的处理方式

安装依赖时，pnpm 首先将包下载至全局 store（已存在版本的包不会重复下载），并从后者**硬链**接至虚拟 store（[项目根目录]/node_modules/.pnpm）内，再软链接至项目 node_modules 中；而包与包之间的依赖关系则通过软链接组织

官方原理图如下：

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/326a2090786e4d16b2d6fce25e876680~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

而 pnpm 节省磁盘空间的优点正是在于一个包全局只保存一份，剩下的都是软硬连接；其次是快，通过链接的方式而非复制
