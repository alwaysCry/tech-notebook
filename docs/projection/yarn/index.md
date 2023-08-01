# yarn 总结

<!-- If you are trying to use a CLI tool that has a bin you can access these in your ./node_modules/.bin directory. You can also use the global command:
yarn global add <package...>
-->

## 常用命令

- `yarn add <package...>`：用于安装包并更新 package.json 和 your yarn.lock

  - `<package>`有以下指定形式：

    - `package-name`：从指定的 registry 中安装

    - `file:/path/to/local/folder`：本地目录

    - `file:/path/to/local/tarball.tgz`：本地压缩文件

    - `https://my-project.org/package.tgz`：远程压缩文件

    - `link:/path/to/local/folder`：指向本地目录的软链接（monorepo 环境中可能会用到）

    - `<git remote url>[#<branch/commit/tag>]`：git 远程仓库，可选择性指定分支，提交或 tag

  - `--dev/-D`：以 devDependencies 形式安装

  - `--peer/-P`：以 peerDependencies 形式安装

  - `--optional/-O`：以 optionalDependencies 形式安装

  - `--exact/-E`：安装确切指定的版本，排除任何语义化调整。例如执行`yarn add foo@1.2.3`实际仍可能会安装`1.9.1`版本，而指定该选择则只接受`1.2.3`

- `yarn bin [<executable>]`：默认输出 yarn 放置可执行文件的目录（一般位于`/node_modules/.bin`）；如指定名称，则输出该可执行文件所在路径

- `yarn cache list [--pattern <pattern>]`：输出 yarn 全局缓存的包，可额外指定 pattern 以输出匹配的

- `yarn cache dir`：输出 yarn 全局缓存所在目录

- `yarn cache clean [<module_name...>]`：清空全局缓存或选择性清理指定的包

- `yarn config set <key> <value> [-g|--global]`：设置指定的 config 值

- `yarn config get <key>`：输出指定的 config 值

- `yarn config delete <key>`：删除指定的 config 值

- `yarn config list`：列出当前的 config 配置

- `yarn import`：根据当前项目中的 package-lock.json 或 node_modules（通常由 npm 安装生成）来生成 yarn.lock

- `yarn install`：为项目一次安装所有依赖

  - 若存在 yarn.lock 且其能满足 package.json 所列依赖，则基于前者安装且其将保持不变

  - 若无 yarn.lock 或其不能满足 package.json 所列依赖（如在后者上手动增加了一项依赖），则其优先基于后者安装并将更新前者

  - `--force`：强制（重新）安装

  - `--no-lockfile`：不读取或生成 yarn.lock

  - `--pure-lockfile`：不生成 yarn.lock

  - `--offline`：以离线模式安装

  - `--production[=true|false]`：当环境变量`NODE_ENV`被设为`production`时，yarn 将不会安装 devDependencies 所列包。也可通过该选项指定，此时将抛开环境变量判断

  - `--flat`：每个包将仅安装一个版本，若存在同一包不同版本的依赖，则在安装时将产生提示（prompt）以选择确切版本，后者将被记录于`package.json#resolutions`中

  - `--focus`：将引用到的 workspace 依赖包从 registry 中拉取（prebuild 版本）并浅层安装下当前 node_modules 下，而非以提升并创建软链接的方式。当彼此间存在共同依赖时 yarn 将尽可能做最小化安装，更多细节[参见](https://classic.yarnpkg.com/blog/2018/05/18/focused-workspaces/)。

    - 附加该选项的命令只能在**workspace 子项目**中执行，而不能在非 workspace 项目或 workspaces 项目根目录中

    - 若想回归 workspace 的默认安装模式，只需重新只需`yarn install`

- `yarn list`：输出当前项目的整体依赖树

  - `--depth=depth`：指定层级

  - `--pattern=pattern`：指定要匹配的 pattern

- `yarn pack --filename <filename>`：将当前项目打成一个压缩包（注：不含 node_modules），可额外指定后者的文件名，否则取`package.json#name`

## 实用指南

- 全局命令：不同于 npm，yarn 使用前缀命令`global`搭配相关命令来实现，例如：

  - `yarn global dir` 输出全局 node_modules 所在目录

  - `yarn global bin` 输出 yarn 为全局安装的可执行文件生成软连接的位置（linux 中一般为`/usr/local/bin`），后者可通过`yarn config set prefix <filepath>`来改变

- 更改全局缓存目录：

  - 利用 yarn config 命令，如：`yarn config set cache-folder <path>`

  - 为某条命令单独指定，如：`yarn <command> --cache-folder <path>`

  - 修改相关环境变量，如：`YARN_CACHE_FOLDER=<path> && yarn <command>`

  - 为于 npm 兼容，`.npmrc`中的`cache=<path>`配置也可生效

- 将现有项目从 npm 迁移至 yarn：基于同样的 package.json，yarn 可能生成一颗与 npm 完全不同的逻辑依赖树，所以为防止依赖版本上的一些细微差异，建议先使用 `yarn import`来生成 yarn.lock

- workspaces 模式：在项目下划分不同的 workspaces，每个都拥有自己独立的 package.json，不同 workspace 间可通过软连接相互引用

  - 首先需将各 workspace 目录名添加至外层根目录（即 workspace root）的`package.json#workspaces`数组中，后者也接收 glob 模式（如`package/*`）。并将`package.json#private`设为`true`以防止提交外层根项目

  - 不同 workspace 的共同依赖将被提升至根目录的 node_modules 中

  - 同版本（`package.json#version`）workspaces 间通过软链接相互引用。如 workspaceB 引用了 workspaceA，且后者`package.json#name`为`pkgA`，则根目录下将生成软链接`node_modules/pkgA -> workspaceA`

  - 不同版本的 workspace 依赖包仍只能从 registry 中拉取

  - 可在 yarnrc 中添加`workspaces-experimental false`以禁用 workspace 模式

  - 注意：workspace 目录须为根目录的后代目录，且彼此间不能相互嵌套

  - 须特别注意的错误场景：workspaceA 中引用了未列于 package.json 的依赖 C 且未在开发环境下触发报错（因后者也是 workspaceB 的依赖且被提升），而将其发布后的引用于其他项目则极可能触发错误

  - 若 workspaceA 引用了 workspaceB、workspaceC，则可能导致修改一处代码却需要构建三个包，因而显著减缓构建过程。可通过`yarn install --focus`环境，具体参见上文

  <!-- TODO：https://classic.yarnpkg.com/blog/2016/11/24/offline-mirror/ -->
