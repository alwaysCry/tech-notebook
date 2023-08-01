# Git

<!--
TODO：git config
TODO：git show
TODO：了解：Git hook、Git支持的数据传输协议
TODO：了解 Git 别名
 -->

## 基本概念

- **blob**：数据对象，Git 以此形式存储文件内容，以 SHA-1 唯一标识

- **树对象（tree**）：相当于目录，引用着 blob 与其他树对象，以 SHA-1 唯一标识

- **提交（commit）**：提交对象的简称，包含指向（根目录）树对象的指针及一些元数据（提交者、提交信息、提交时间...）。可理解为工作目录的一个快照，以 SHA-1 唯一标识（即`git log`时所见）

<!-- TODO：完善其概念 -->

- **分支（branch）**：对提交的命名引用，始终指向所在提交链上的最近一次提交；而**活动分支（active branch）**，即当前所在分支，由特殊指针 HEAD 指向（**后者也能直接指向一个提交**）

  - 关于分支合并：

    - 若合入分支是当前分支的**直接后继**，则 Git 将直接后移指针，即所谓 fast-forward（快进）

    - 否则 Git 会找到此二分支的末端提交，连同其共同的祖先提交，尝试做简单三角合并。若成功则自动生成一个新提交（合并提交），后者拥有两个父提交

    - 若二者存在对同一处的修改，则需手动合并冲突（可通过`git status`找出存在冲突的文件），并对相应文件使用`git add`标记为已解决，最后手动创建合并提交

  - 可通过显式推送将本地分支推动至远程仓库

  - 远程分支在本地的引用称为**远程跟踪分支**，以`<remote>/<branch>`形式命名，无法在本地直接更新，只能通过网络同步。可手动合入本地分支

  - 基于远程跟踪分支检出本地分支将使后者（跟踪分支）与前者（上游分支）进行关联

    <!-- - 基于其建立本地分支，即：`git checkout -b <local_branch> <remote>/<remote_branch>`，后者即所谓跟踪分支， -->

- **仓库（repository）**：本质是一系列提交的集合

- **暂存区（staging area）**：或称索引（index），用于**注册**修改（**本质是注册而非暂存**）以待一并提交

- **工作目录（working dir）**：或称工作树（working tree），关联着一个仓库，即一般理解的“项目”

## 大体原则

- Git 中几乎任何**已提交**的改动都可恢复，甚至于已删除分支中的或以`--amend`选项覆盖的提交（[参见](https://git-scm.com/book/zh/v2/ch00/_data_recovery)）。当然未提交的改动不在其中

## XXX

通常有两种获取 Git 仓库的方式：

- 本地初始化：在项目根目录下执行`git init`

- 远程克隆：`git clone <url>`，会克隆服务器中指定仓库的几乎所有数据，部分服务器钩子（hook）除外

工作目录（working dir）或称工作树（working tree），可理解为“项目”，即与 Git 仓库关联，其下每一文件均为以下状态之一：

- 未跟踪（untracked），可通过`git add`命令转为已暂存

- 已跟踪（tracked），又可分为：

  - 暂存（staged）

  - 已修改（modified）

## 基本设置

- Git 具有以下配置文件，按优先级从高到低分别对应`git config`命令的不同选项：

  - `.git/config`：仓库级配置，对应默认或`--local`选项（须在对应工作目录下）

  - `~/.gitconfig`或`~/.config/git/config`：用户级配置（适用其所有仓库），对应`--global`选项

  - `/etc/gitconfig`：系统级配置（含所有用户），对应`--system`选项

- 设置默认编辑器，按优先级高到低：

  - 通过`git config core.editor`设置

  - 由 Shell 环境变量`EDITOR`指定

- 设置命令别名：若完整命令过长，可考虑为其设置别名，如：`git config --global alias.[alias] [commit]`。注：此处`[commit]`无`git`开头

## 常用命令

### git add

`git add <file>`：将指定文件添加至（待）下一次提交中，`<file>`为目录则递归处理其下所有文件。根据文件的不同状态：

- 未跟踪文件将被跟踪

- 将已跟踪文件的改动注册至暂存区

- 将有冲突的文件标记为已解决

### git status

`git status`：概览工作目录下各文件的状态

- `-s/--short`：紧凑化输出，以下列标记对应不同状态（红/绿色分别表示未注册/已注册至暂存区）：

  - `??`：新增的未跟踪文件

  - `A`：新跟踪的文件

  - `M`：有修改内容的文件

  - `AM`：新跟踪且之后又有修改内容的文件

  - `D`：被删除的文件

  - `R`：被重命名（移动）的文件

- `git commit [<file>|]`：启动默认文本编辑器，待退出后以其中输入（忽略注释）为说明信息执行提交。若指定`<file>`（且其已跟踪）则注册其所有改动后一并提交，否则只提交暂存区内的所有改动

  - `-m`：直接附带说明信息（不启动编辑器）

  - `-a`：自动注册所有被改动的**已跟踪**文件，一并提交（跳过`git add`步骤）

  - `--amend`：修补提交，即本次将以优先覆盖形式与前次提交合并

- `git rm <file>`：默认删除**已跟踪且未注册改动**的文件，可以 glob
  模式匹配

  - `-r`：指定目录以递归删除

  - `-f`/`--fore`：已注册改动文件的也将被删除（其注册于暂存区的改动将替换为已删除）

  - `--cached`：仅在暂存区中将文件注册删除，工作目录中仍保留（如一些本该`.gitignore`的文件）

- `git mv <src> <dest>`：移动（重命名）文件，相当于依次执行了：`mv <src> <dest>`、`git rm <src>`、`git add <dest>`

- `git log [<commit>...]`：按时间降序列出自指定提交（默认当前所在提交）向下的提交链

  - 符号规则：

    - `<commit>`可为提交哈希、分支名、或`HEAD`

    - 若`<commit>`以`^`开头，则自其以下的提交链将被排除

    - `git log ^<commit1> <commit2>`可简写为`git log <commit1>..<commit2>`

  - 限制输出长度：

    - `-<N>`：仅列出最近的 N 条

    - `-S`：列出增减了指定字符内容的提交

    - `--grep`：列出包含指定说明的提交

    - `--since`/`--after`：列出指定时间（`yyyy-MM-dd hh:mm:ss`，下同）之后的提交

    - `--until`/`--before`：列出指定时间之前的提交

    - `--author`：列出指定作者的提交

    - `--no-merges`：排除合并类型的提交

  - 定制输出内容/格式：

    - `--oneline`：等价于`--pretty=oneline --abbrev-commit`

    - `--abbrev-commit`：仅输出提交哈希的头几位而非完整 40 位

    - `-p/--patch`：展示每次提交引入的差异

    - `--stat`：附带每次提交的简略统计信息

- `git restore <file>`：默认撤销指定文件**未注册**的改动（**工作树中文件将被还原至前一次注册时**）

  - `--staged`：撤销暂存区中**已注册**的改动（**工作树中文件不变**）

- `git remote`：列出远程仓库

  - `-v`：以更详细形式列出

- `git remote add <remote_name> <url>`：添加远程仓库

### 标签管理

Git 支持两种标签：

- 轻量标签（lightweight）：仅是对某特定提交的引用

- 附注标签（annotated）：包含打标者用户名、邮箱、日期和标签信息，可用 GPG（GNU Privacy Guard）签名并验证

注意：

- 标签不会随`git push`推送至远程，必须显式指定<!-- TODO：参见 -->

- 删除标签同理<!-- TODO：参见 -->

- <!-- TODO：了解checkout 标签，及其副作用：“分离头指针” -->

相关命令：

- `git tag [-l] [<pattern...>]`：列出已有标签

- `git tag <tag_name> [<commit_hash>]`：创建轻量级标签，默认给 HEAD 所指提交

  - `-a`：创建附注标签

  - `-m <msg>`：直接指定附注信息（不启动编辑器）

- `git tag -d <tag_name>...`：删除指定标签

### 分支管理

- `git branch --list <pattern>...`：列出所有匹配 pattern 的**本地分支**

  - `-r | --remotes`：只列出远程分支

  - `-a | --all`：同时列出本地和远程分支

  - `--contains [<commit>]`：只列出**包含**指定提交（默认 HEAD 指向）的分支

  - `--no-contains [<commit>]`：只列出**不含**指定提交（默认 HEAD 指向）的分支

  - `--merged [<branch_name>]`：只列出已合入指定分支（默认当前）的分支（也可指定提交，下同）

  - `--no-merged [<branch_name>]`：只列出未合入指定分支（默认当前）的分支

- `git branch <branch_name>`：创建新分支

- `git branch -d <branch_name>...`：删除指定分支

- `git checkout <branch_name>`：切换到另一分支

  - `-b`：若目标分支不存在，则先创建

- `git merge <branch_name>`：将当前分支与目标分支合并

### 贮藏

- `git stash push`：将**已跟踪文件**中的未提交修改移至栈中，**清空暂存区**，工作目录被还原为所在提交的初始状态

  - `--keep-index`：只贮藏未注册改动，暂存区不变（工作区被还原为最近注册时状态）

  - `--include-untracked`：包含未跟踪文件

- `git stash list`：按从新到旧列出栈中所有贮藏

- `git stash drop [<stash>]`：移除指定贮藏（默认最新的）

- `git stash apply [<stash>]`：将指定贮藏（默认最新的）应用回当前工作目录（可位于不同分支，当然也可能产生合并冲突）。默认**不恢复**暂存区

  - `--index`：尝试恢复暂存区

- `git stash stash <branch_name> [<stash>]`： 直接在当前工作目录应用贮藏内容可能导致冲突。该命令从指定贮藏（默认最新）被创建时**所在提交中检出分支**，并在其上应用贮藏内容。同时该贮藏自身将被移除