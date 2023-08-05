# Git

<!--
TODO：git config
TODO：git show
TODO：了解：Git hook、Git支持的数据传输协议
 -->

## 原则

- 提交不可变，更改存储库的唯一方式是创建新的提交

- 任何已提交的都可恢复。甚至在已删除分支中，或以`--amend`选项覆盖的提交（[参见](https://git-scm.com/book/zh/v2/ch00/_data_recovery)）。未提交的不在此列

## 概念

- 暂存（stage）：将文件的当前快照存于本地仓库，为其计算 SHA-1 校验和并添加至暂存区

- 暂存区（staging area）：或称索引（index），用于暂存文件快照的校验和以待一并提交

- 仓库（repository）：本质是一系列快照的集合

- 工作目录（working dir）：或称工作树（working tree），即一般理解的“项目”，与 git 本地仓库关联

- blob：文件快照的保存形式，以 SHA-1 校验和唯一标识

- 树对象（tree）：相当于目录，引用着 blob 与其他树对象，以 SHA-1 校验和唯一标识

- 提交（commit）：可视为工作目录的一个快照，以 SHA-1 校验和唯一标识（即`git log`时所见）。包含指向根目录树对象的指针及一些元数据（提交者、提交信息、提交时间...）

<!-- 其下所有未忽略文件均为以下状态之一：

  - 未跟踪（untracked），可通过`git add`命令转为已暂存

  - 已跟踪（tracked），又可分为：

    - 暂存（staged）

    - 已修改（modified） -->

- 分支（branch）：对提交的命名引用，始终指向所在提交链上的最近一次提交

- 活动分支（active branch）：即当前所在分支，由 HEAD 指针指向（后者也能指向一个提交）

- 分离头状态（'detached HEAD' state）：HEAD 指针通常与分支指针指向同一处，若该“绑定”状态被打破（如进行了以下操作），即变为分离头状态

  - `git checkout <tag>|<commit>|<remote>/<branch>`

  该状态下新建的提交将处于游离状态，须通过`git checkout -c <new-branch>`将前者检出至新分支

- 远程跟踪分支（remote-tracking branch）：远程分支在本地的引用，以`<remote>/<branch>`形式命名。无法直接移动而只能通过网络同步，可手动合入本地分支，也可被指定为后者的“上游分支”

- 关于分支合并：

  - 若合入分支是当前分支的直接后继，则将直接后移指针，即所谓快进（fast-forward）

  - 否则 Git 会找到此二分支的末端提交，连同二者共同的祖先提交，尝试做简单三角合并。若成功则自动生成一个新提交（合并提交），后者拥有两个父提交

  - 若二者存在对同一处的修改，则需手动合并冲突（可通过`git status`找出存在冲突的文件），并对相应文件使用`git add`标记为已解决，最后手动创建合并提交

## XXX

通常有两种获取 Git 仓库的方式：

- 远程克隆：`git clone <url>`，会克隆服务器中指定仓库的几乎所有数据，部分服务器钩子（hook）除外

## 常用配置

Git 具有以下配置文件，按优先级从高到低分别对应`git config`命令的不同选项：

- `.git/config`：仓库级配置，对应默认或`--local`选项（须在对应工作目录下）

- `~/.gitconfig`或`~/.config/git/config`：用户级配置（适用其所有仓库），对应`--global`选项

- `/etc/gitconfig`：系统级配置（含所有用户），对应`--system`选项

### 设置默认编辑器

按优先级高到低：

- 通过`git config core.editor`设置

- 通过环境变量`EDITOR`指定

### 设置命令别名

若完整指令过长，可为其设置别名：`git config --global alias.<alias> <command>`。注，此处`<command>`须省略`git`前缀

## 基本操作

### git init

`git init`：为当前工作目录初始化 git 本地仓库，并创建起始分支（默认为 master）

### git add

`git add <file>`：暂存指定文件，`<file>`为目录则递归处理其下所有文件。此外：

- 未跟踪文件将被跟踪

- 有冲突的文件将标记为已解决

### git status

`git status`：概览工作目录下各文件的状态

- `-s/--short`：紧凑化输出，以下列标记对应不同状态（红/绿色分别表示未注册/已注册至暂存区）：

  - `??`：新增的未跟踪文件

  - `A`：新跟踪的文件

  - `M`：有修改内容的文件

  - `AM`：新跟踪且之后又有修改内容的文件

  - `D`：被删除的文件

  - `R`：被重命名（移动）的文件

### git commit

`git commit [<file>]`：默认提交暂存区内的所有记录；若指定`<file>`则仅提交该文件，后者未暂存则先自动暂存。该操作将先启动默认文本编辑器，待退出后以其中输入（忽略注释）为提交信息执行提交

- `-m <message>`：指定提交信息（不启动编辑器）

- `-a`：自动暂存所有被改动文件及删除操作，一并提交。未跟踪文件不在此列

- `--amend`：修补提交，即本次将以优先覆盖形式与前次提交合并

### git rm

`git rm <pattern>`：默认只能删除已跟踪但未暂存的文件

- `-r`：当遇到目录时开启递归删除

- `-f/--force`：已暂存的文件也将被删除（暂存区的相应快照将被替换为删除记录）

- `--cached`：在暂存区中为该文件增加一条删除记录，工作目录中不变（相当于将其转为未跟踪状态）

### git restore

`git restore <file>`：将工作目录中的指定文件还原为其最近一次快照

- `--staged`：撤销其在暂存区中注册的快照

### git mv

`git mv <src> <dest>`：移动（重命名）文件，相当于依次执行了：`mv <src> <dest>`、`git rm <src>`、`git add <dest>`

### git log

`git log [<commit>...]`：按时间降序列出自指定提交（默认当前所在提交）向下的提交链

- 命令参数要点：

  - `<commit>`可为提交哈希、分支名、或`HEAD`

  - 若`<commit>`以`^`开头，则自其以下的提交链将被排除

  - `git log ^<commit1> <commit2>`可简写为`git log <commit1>..<commit2>`

- 限制输出长度：

  - `-<N>`：仅列出最近的 N 条

  - `-S`：列出增减了指定字符内容的提交

  - `--grep=<pattern>`：列出包含指定说明的提交

  - `--since/--after=<date>`：列出指定时间（`yyyy-MM-dd hh:mm:ss`，下同）之后的提交

  - `--until/--before=<date>`：列出指定时间之前的提交

  - `--author=<pattern>`：列出指定作者的提交

  - `--no-merges`：排除合并类型的提交

- 定制输出内容/格式：

  - `--oneline`：等价于`--pretty=oneline --abbrev-commit`

  - `--abbrev-commit`：仅输出提交哈希的头几位而非完整 40 位

  - `-p/--patch`：展示每次提交引入的差异

  - `--stat`：附带每次提交的简略统计信息

## 标签管理

Git 支持两种标签：

- 轻量标签（lightweight）：仅是对某特定提交的引用

- 附注标签（annotated）：包含打标者用户名、邮箱、日期和标签信息，可用 GPG（GNU Privacy Guard）签名并验证

<!-- TODO：了解checkout 标签，及其副作用：“分离头指针” -->

### 列出标签

`git tag [-l] [<pattern>...]`：列出已有标签

### 创建标签

`git tag <tagname> [<commit>]`：为指定提交（默认为 HEAD 指向）创建轻量标签

- `-a`：创建附注标签

- `-m <msg>`：在创建附注标签时指定标签信息（不启动编辑器）

### 推送标签至远程仓库

标签不会随`git push`推送至远程仓库，必须手动推送：

- 推送指定标签：`git push <remote> <tagname>`

- 推送所有未推送的标签：`git push <remote> --tags`

### 删除标签

同理，删除本地标签也不会影响远程仓库

- 删除指定标签：`git tag -d <tagname>`

- 删除远程仓库中的指定标签：`git push <remote> --delate=<tagname>`

## 远程仓库

### 克隆远程仓库

`git clone <url>`：将指定远程仓库克隆至本地，默认简写名 origin，其所有分支都将在本地被引用为远程跟踪分支。默认情况下后者当中的活动分支将被检出为当前活动分支，同时成为其“上游分支”

- `-o/--origin=<name>`：指定远程仓库的简写名

- `-b/--branch=<branch>`：指定要检出的远程跟踪分支

### 列出远程仓库

`git remote`：列出所有远程仓库，仅输出其简写

- `-v`：以详细形式输出，包含 fetch/push 操作对应的 URL

### 查看远程仓库信息

`git remote show <remote>`：列出指定远程仓库的详细信息，包括其 fetch/push URL，相关远程跟踪分支等

### 添加远程仓库

`git remote add <remote-name> <url>`：添加远程仓库并指定其简写

### 重命名远程仓库

`git remote rename <old-name> <new-name>`：修改指定远程仓库简写名，注意这也将改变所有相关远程跟踪分支名

### 移除远程仓库

`git remote remove <remote>`：移除指定远程仓库，所有与其相关的远程跟踪分支也将被删除

### 从远程仓库中拉取

`git pull`：拉取远程仓库中所有的新提交，<!-- TODO -->

## 分支管理

### 列出分支

`git branch --list <pattern>...`：列出所有匹配的本地分支

- `-r/--remotes`：只列出远程跟踪分支

- `-a/--all`：同时列出本地分支和远程跟踪分支

- `--contains=[<commit>]`：只列出包含指定提交（默认 HEAD 指向）的

- `--no-contains=[<commit>]`：只列出不含指定提交（默认 HEAD 指向）的

- `--merged=[<branch>]`：只列出已合入指定分支（默认当前活动分支）的（也可指定提交，下同）

- `--no-merged=[<branch>]`：只列出未合入指定分支（默认当前活动分支）的

- `-v`：附加分支中最新提交的哈希和提交说明，及其与对应上游分支（若有）的领先/落后情况

- `-vv`：`-v`的基础上附加对应的上游分支名（若有）

### 检出分支

`git branch <branch>`：基于当前活动分支检出新分支

### 移除分支

`git branch -d <branch>...`：移除指定分支。若其未曾被合入其余分支中，将警告并中止

- `-D <branch>`：强制移除指定分支

### 切换分支

`git checkout <branch>`：切换到指定分支。若目标分支不存在，但存在同名远程跟踪分支，则先基于后者检出同名本地分支并设置跟踪

- `-b`：若目标分支与同名远程跟踪分支均不存在，则先基于当前活动分支检出

### 合并分支

`git merge <branch>`：将目标分支合入当前活动分支中

### 指定上游分支

`git branch {-u <upstream>|--set-upstream-to=<upstream>} [<branch>]`：为指定分支（默认当前活动分支）设置上游分支

### 更新远程跟踪分支

`git fetch <remote>`：拉取指定远程仓库（默认当前活动分支上游所在的仓库）下所有的新提交，更新相关远程跟踪分支及标签

- `--all`：拉取所有远程仓库的

### 更新当前活动分支

`git pull`：更新当前活动分支的上游分支，并将其合入前者

## 贮藏

### 列出贮藏

- `git stash list`：按从新到旧列出栈中所有贮藏

### 推送至贮藏区

`git stash push`：将**已跟踪文件**中的未提交修改移至栈中，**清空暂存区**，工作目录被还原为所在提交的初始状态

- `--keep-index`：只贮藏未注册改动，暂存区不变（工作区被还原为最近注册时状态）

- `--include-untracked`：包含未跟踪文件

### 移除贮藏

- `git stash drop [<stash>]`：移除指定贮藏（默认最新的）

### 取回贮藏

`git stash apply [<stash>]`：将指定贮藏（默认最新的）应用回当前工作目录（可位于不同分支，当然也可能产生合并冲突）。默认**不恢复**暂存区

- `--index`：尝试恢复暂存区

`git stash branch <branch-name> [<stash>]`： 直接在当前工作目录应用贮藏内容可能导致冲突。该命令从指定贮藏（默认最新）被创建时**所在提交中检出分支**，并在其上应用贮藏内容。同时该贮藏自身将被移除
