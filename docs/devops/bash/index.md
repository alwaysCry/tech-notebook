# bash 总结

Shell 是一个程序，位于`硬件 <- 操作系统核心(kernel) <- 系统呼叫(system call) <- 应用程序(包括 shell)`的最外层，因而得名。用户通过 Shell 操作应用程序，后者调用系统核心完成所需工作

当前系统中安装的 Shell 被记录于`/etc/shells`，可在`/etc/passwd`中为每个用户设置其登录后默认使用的，Bash Shell 是目前最常用的。

<!-- 主要提供以下功能：

- 指令记录，在 shell 中按上/下键即可找到前/后一个输入的指令；本次登录前执行过的指令记录在 ~/.bash_history 文件里，而本次登录后的则存在内存中

- 指令与路径补全

- 指令别名（alias）

- 工作控制、前景背景控制（job control, foreground, background）

- 程序化脚本 (shell script)

- 通配符展开（wildcard）
 -->

 <!-- 
 TODO：详解 chomd 命令 
 TODO：详解 env 命令
 -->

## 启动

根据不同的启动方式，Shell 可分为：

- **login shell**，对应登录后默认启动的 Shell。依次执行以下初始化脚本：

  - `/etc/profile`（全局配置。会随系统更新而更新，不建议直接修改）

  - `/etc/profile.d`目录内的所有 Shell 脚本（可在此新增脚本以修改全局配置）

  - `~/.bash_profile`（当前用户个人配置，常通过其间接执行`~/.bashrc`）

- **non-login shell**，对应手动启动的 Shell（如执行`bash`命令）。依次执行以下初始化脚本：

  - `/etc/bash.bashrc`（全局配置）

  - `~/.bashrc`（当前用户个人配置。注意启动非交互式 Shell 时**不会调用**）

### bash

`bash [<file>]`：默认启动一个交互式子 Shell。若指定了脚本，则启动一个非交互式子 Shell，并在此环境中执行该脚本

- `-l` / `--login`：以 login shell 形式启动

- `--noprofile`：启动时跳过所有配置脚本

- `--norc`：启动交互式 Shell 时跳过`~/.bashrc`

- `--rcfile <file>`：启动交互式 Shell 时以指定脚本替代`~/.bashrc`

- `-n`：检查指定脚本是否存在语法错误，但不执行

<!-- - `-v`：执行每行语句前，都先将其打印 -->

- `-x`: 执行每条命令前，都先将其打印

### source

`source`：可简写为`.`，用于在**当前**Shell 执行脚本（相较`bash`命令在子 Shell 中执行），常用于：

- 重载配置文件

- 在当前 Shell 中加载外部库

### sh

`sh [<file>]`：本质是一个不同版本系统下指向不同 Shell 可执行文件的软链接。为遵循 POSIX，其规则通常比 bash 更苛刻。**非不得已不建议使用**

### exit

`exit`：以指定返回码（默认为最后执行命令的返回码）退出当前 Shell，常用值如下：

- `0`：正常退出

- `1`：通用错误

- `126`：无权限

- `127`：未找到命令

<!-- 如果脚本被信号N终止，则退出值为128 + N。简单来说，只要退出值非0，就认为执行出错。 -->

## 环境设置

### 相关命令

- `set`：从属于 POSIX，默认输出当前 Shell 所有的环境变量和函数。其所有选项均可用于`bash`命令

  - `-u` / `-o nounset`（`+u`关闭）：若用到不存在变量将以返回码 1 终止执行

  - `-x` / `-o xtrace`（`+x`关闭）：执行每条命令前都先将其打印

  - `-e` / `-o errexit`（`+e`关闭）：执行脚本时若有命令失败则以返回码 127 直接退出

  - `-o pipefail`：管道命令中若有子命令失败则整个命令将失败（但不中断）

  - `-E`：<!-- TODO -->

  - `-f` / `-o noglob`（`+f`关闭）：不扩展文件名通配符

  - `-o noclobber`：防止重定向运算符`>`覆盖已经存在的文件

- `shopt`：Bash 特有命令，默认输出所有参数的开关状态

  - `-s <option>`：开启指定选项

  - `-u <option>`：关闭指定选项

  - `-q <option>`：查询指定选项状态，返回码`0`表示开启，`1`表示关闭

  - 选项解析：

    - histappend：退出当前 Shell 时将其操作历史**追加**至历史文件中，若关闭则后者将被整个替换。默认开启

## 变量

Shell**变量名区分大小写，且值均为字符串**。可分为：

  <!-- TODO printenv (可用于打印环境变量)与 env -->

- 环境变量：由 Shell 环境预定义，变量名均为大写，默认将被子 Shell 继承。常见的有：
  <!-- TODO
  IFS：词与词之间的分隔符，默认为空格
  BASHOPTS：当前 Shell 的参数，可以用shopt命令修改
  LANG：字符集以及语言编码，比如zh_CN.UTF-8
  SHELLOPTS：启动当前 Shell 的set命令的参数，参见《set 命令》一章
  TERM：终端类型名，即终端仿真器所用的协议
  EDITOR：默认文本编辑器
  -->

  - `BASHPID`：当前 **BASH 进程**的 PID

  - `HOME`：用户主目录

  - `HOSTNAME`：主机名

  - `PS1`：Shell 提示符

  - `PS2`：输入多行命令时的次要 Shell 提示符

  - `PWD`：当前工作目录

  - `RANDOM`：一个 0-32767 的随机数

  - `SHELL`：当前使用的 shell 程序

  - `UID`：当前用户 ID

  - `USER`：当前用户名

- 本地变量：由用户定义，默认仅当前 Shell 中可用
  <!-- TODO set 可显示所有变量 -->

- 特殊变量：其值由 Shell 提供，用户无法对其赋值。常见的有：

  - `?`：上一命令的返回码，非 0 表示失败

  - `$`：当前 Shell 的进程 ID

  - `_`：上一命令的最后一个参数

  - `!`：上一**后台执行命令**的进程 ID

  - `-`：当前 Shell 的启动参数

  - `0`：当前 Shell 的名称，或脚本名（在脚本中读取时）

  <!-- TODO @和# 参见脚本章节 -->

### 创建（赋值）变量

`VARIABLE=[value]`，要点如下：

- 变量名须仅由字母、数字、下划线组成，且首字母不能为数字

- 等号两边不能有空格

- 变量值中若包含空格，需整体包裹在引号中

- 可借助`declare`、`readonly`命令实现额外功能（参见下文）

### 变量取值

`$VARIABLE`或`${VARIABLE}`，后者适用于变量名与其他字符相连时

- 取值变量不存在默认将输出空字符而非报错。可通过`set -u`改变

- 若变量值自身也是一个变量名，可通过`${!VARIABLE}`语法获取最终的值

- 取值时其中的连续空格（制表符、换行符）将被合并为一，要保持原格式须将其包裹在双引号中读取`"$VARIABLE"`

### 变量删除

可通过以下方法：

- `unset`命令，`unset VARIABLE`

- 将其设为空字符，`VARIABLE=''`或直接`VARIABLE=`

### 变量取默认值

可用以下方法确保变量取值不为空：

- 变量非空则返回其值，否则返回默认值：`${VARIABLE:-DEFAULT}`

- 变量非空则返回其值，否则将其设为默认值并返回：`${VARIABLE:=DEFAULT}`

- （用于测试变量是否存在，类似于存在则返回 1）变量非空则返回设定值，否则返回空：`${VARIABLE:+VALUE}`

- （用于防止变量未定义）变量非空则返回其值，否则中止（脚本）执行并标准错误输出`VARIABLE:MESSAGE`或`parameter null or not set`（`MESSAGE`未提供）：`${VARIABLE:?MESSAGE}`

### 获取变量长度

`${#<varname>}`

### 提取子串

`${<varname>:<offset>:<length>}`，即从起始位置`OFFSET`（从 0 开始）向后提取`LENGTH`长度的子串。要点：

- 不改变原始变量

- `OFFSET`可为负值，表示起始位置从末尾开始算起。注意负数前须有空格，以免与`${VARIABLE:-DEFAULT}`语法混淆

- `LENGTH`可省略，表示提取到末尾；也可为负值，表示从末尾往前排除并返回剩下的

### 搜索和替换

以下语法对字符串进行模式匹配，`PATTERN`中可包含`*`、`?`、`[]`等**通配符**（可参见下文[模式扩展](./#模式扩展-globbing)），且均不改变原始变量。

- 从头开始匹配（模式必须出现在开头，否则无匹配，下同），返回**剩余**部分：`${VARIABLE#PATTERN}`、`${VARIABLE##PATTERN}`（贪婪匹配）

- 从头开始贪婪匹配，将匹配部分替换为指定内容并返回：`${VARIABLE/#PATTERN/REPLACEMENT}`

- 从尾开始匹配（模式必须出现在结尾，否则无匹配，下同），返回**剩余**部分：`${VARIABLE%PATTERN}`、`${VARIABLE%%PATTERN}`（贪婪匹配）

- 从尾开始贪婪匹配，将匹配部分替换为指定内容并返回：`${VARIABLE/%PATTERN/REPLACEMENT}`

- 从前往后**查找**，按贪婪匹配将匹配部分替换为指定内容并返回：`${VARIABLE/PATTERN/REPLACEMENT}`（替换第一个）、`${VARIABLE//PATTERN/REPLACEMENT}`（替换所有）

### 改变大小写（不改变原始变量）

- 转为大写`${VARIABLE^^}`

- 转为小写`${VARIABLE,,}`

### declare

`declare VARIABLE[=VALUE]`：用于声明一些特殊类型变量

- `-a`：声明数组

- `-f <FUNCTION_NAME>`：输出当前 Shell 中指定函数的定义

- `-F`：输出当前 Shell 中的所有函数名

- `-i`：声明整数变量，赋值时可直接进行数学运算。如`declare -i sum=100+200`

- `-l`：变量值将被自动转为小写

- `-u`：变量值将被自动转为大写

- `-r`：声明只读变量（不可再赋值及`unset`）

- `-x`：变量将被导出至子 Shell，且若在子 Shell 中被修改也不会影响父 Shell

- `+x`：取消变量导出

### readonly

`readonly VARIABLE=[VALUE]`：等价于`declare -r`

- `-f`：用于声明只读函数

- `-a`：用于声明只读数组

- `-p`：打印当前 Shell 中所有只读变量

### export

`export VARIABLE[=VALUE]`：将指定变量导出至子 Shell。可在同时创建（或赋值），即等价于`declare -x`

## 数组

数组是包含多个值的变量，特点如下：

- 下标从 0 开始，且**无需**连续

- 数量无上限

### 数组操作

- **创建**，如下：

  ```sh
  # 逐个赋值，方括号内也可为算术表达式
  days[0]=Sun
  days[1]=Mon

  # 一次性赋值
  days=(Sun Mon Tue)
  # 可单独为某个值指定下标
  days=(Sun Mon Tue [5]=Fri Sat) # 此时 Sat 的下标顺延为 6

  # 可使用通配符
  mp3s=( *.mp3 )

  # 可先用 declare 声明，再赋值
  declare -a days
  days=Sun # 此时可不带下标，值默认存于位置0

  # 可用 read 命令将用户输入存入数组
  read -a days
  ```

- **读取单个元素**，如下：

  ```sh
  days=(Sun Mon Tue Wed Thu Fri Sat)

  # 不带下标默认读取位置0
  echo $days # Sun

  # 若指定下标则必须使用大括号
  echo ${days[1]} # Mon
  ```

- **返回所有元素**，如下：

  ```sh
  activities=(swimming "water skiing" canoeing)

  # 特殊索引 @ 、* 均用于返回所有元素，但用法存在不同

  # 若用于 for 循环遍历，则用 @，建议双引号包裹，否则空格符前后将视为两个元素
  for act in "${activities[@]}"; do
    echo "Activity: $act"
  done
  # Activity: swimming
  # Activity: water skiing
  # Activity: canoeing

  # 若要将所有元素作单个字符串返回，则用 *，且必须包裹双引号！
  for act in "${activities[*]}"; do
  echo "Activities: $act"
  done
  # Activity: swimming water skiing canoeing
  ```

- **返回所有元素的下标**

  ```sh
  arr=([5]=a [9]=b [23]=c)

  # 以下两种方式均可返回所有元素的下标
  echo ${!arr[@]} # 5 9 23
  echo ${!arr[*]} # 5 9 23

  # 该语法也可用于 for 循环
  for i in ${!arr[@]}; do
    echo ${arr[i]}
  done
  ```

- **获取数组长度**，如下：

  ```sh
  arr[100]=foo

  # 以下两种方式均可返回数组长度
  echo ${#arr[@]} # 1
  echo ${#arr[*]} # 1

  # 而以下将返回具体元素的字符串长度
  echo ${#arr[100]} # 3
  ```

- **拷贝数组**，如下：

  ```sh
  # 单纯拷贝
  hobbies=("${activities[@]}")

  # 拷贝并追加新元素
  hobbies=("${activities[@]}" diving)
  ```

- **截取数组**，如下：

  ```sh
  food=(apples bananas cucumbers grapes eggs)

  # ${array[@]:position:length} 语法用于截取数组
  echo ${food[@]:1:3} # bananas cucumbers grapes

  # 若省略 length，则截取到末尾
  echo ${food[@]:1} # bananas cucumbers grapes eggs
  ```

- **追加元素**，如下：

  ```sh
  foo=(a b c)

  # 可用赋值运算符 += 将元素追加至数组末尾
  foo+=(d e f)
  echo ${foo[@]} # a b c d e f
  ```

- **删除元素及清空数组**，如下：

  ```sh
  # unset 命令可用于删除元素或清空整个数组
  foo=(a b c d e f)
  unset foo[2]
  echo ${#foo[@]} # 5

  unset foo
  echo ${#foo[@]} # 0

  # 注意将元素置为空值仅相当于隐藏，其本身仍存在
  foo=(a b c d e f)
  foo[1]=''
  echo ${#foo[@]} # 6

  # 同理，将数组赋值为空值实际等价于“隐藏”其第一个元素
  foo=''
  echo ${#foo[@]} # 6
  ```

- **关联数组**（Bash 新版本可用），支持非数字索引，必须通过`declare -A`声明，其余操作相同。如下：

  ```sh
  declare -A colors
  colors["red"]="#ff0000"
  colors["green"]="#00ff00"
  colors["blue"]="#0000ff"
  ```

## 函数

函数是可复用代码片段，且总在**当前 Shell** 执行，优先级高于脚本但低于别名。语法如下：

```sh
# 以下定义方式等价
function fn {
  echo "Hello $1"
}
function fn() {
  echo "Hello $1"
}
fn() {
  echo "Hello $1"
}

# 直接通过函数名调用，参数跟在其后
fn World # Hello World

# 函数内可用 return 命令返回值，可在调用后的下一条命令中通过 $? 获取
function fn {
  return 10
}
fn
echo $? # 10

# 函数内要引用脚本参数变量，须用间接传递的方式
function fn {
  echo "argument 1: $1"
  echo "argument 2: $2"
}
fn $1 $2

# 查看当前 Shell 中所有函数及其定义
declare -f
# 仅输出函数名
declare -F
# 查看单个函数及其定义
declare -f fn

# 删除函数
unset -f fn
```

### 要点总结

- 函数体不可为空

- 函数内具有独立的参数变量，其种类和意义与脚本参数变量一致

- 函数返回码必须为数字

- 函数内声明的变量默认是全局的，可用`local`命令局部变量

## 脚本

为了脚本能被直接（无需通过命令和指定全路径）、顺利地执行，需满足：

- 在第一行执行解释器。以`#!`（也被称为 Shebang）开头，后接解释器路径，如：`#!/bin/bash`

- 位于环境变量`PATH`指定的目录中（可新建`~/bin`目录并加入`PATH`中以专门存放脚本）

- 具有适当的权限，通常为 755 或 700

### 脚本参数

脚本内可通过特殊变量获得其参数，如下：

- `$0`：脚本文件名

- `$1`~`$9`：脚本的第 1 到 9 个参数，之后的参数可以诸如`${10}`的形式获取

- `$#`：参数个数

- `$@`：全部参数，以空格符分隔

- `$*`：全部参数，以环境变量`IFS`的值的第一个字符分隔，默认为空格符

### 操作参数

- 参数遍历，方式如下：

  ```sh
  # for 循环遍历
  # 为正确处理诸如"a b"等自带空格的参数，建议将 $@ 包裹在双引号中
  for i in "$@"; do
    echo $i
  done

  # shift 命令结合 while 遍历
  while [ "$1" != "" ]; do
    echo "当前参数：$1"
    echo "剩余 $# 个参数"
    shift
  done
  ```

  - 参数解析，如下：

  ```sh
  while
  ```

### shift

`shift [<num>]`：用于脚本中，从首位起移除指定数目（默认 1）的参数，并前移后序参数

### getopt

`getopt`：用于在脚本中解析参数（类似的有`getopts`，但只能解析短选项）

- `-o <SHORT_OPTIONS>`或`--options <SHORT_OPTIONS>`，收集短选项及其对应参数。要点如下：

  - 多个短选项可直接相连

  - 若选项有对应参数，则在其后跟一个冒号；若参数可选，跟两个冒号

  例如`getopt -o ab:c::`用于解析`-a -b <argB> -c [<argC>]`

- `-l <LONG_OPTIONS>`或`--longoptions <LONG_OPTIONS>`，收集长选项及其对应参数。要点如下：

  - 多个长选项须用`,`分隔，或多次使用`-l`来收集

  - 若选项有对应参数，则在其后跟一个冒号；若参数可选，跟两个冒号

  例如`getopt -l foo,bar:,baz::`用于解析`--foo --bar <argBar> --baz=[<argBaz>]`

## 命令概述

linux 中的命令可分为：外部命令、Shell 内建命令、命令别名。优先级从高到低如下：

- 以相对或绝对路径执行的命令

- 命令别名（alias）

- 函数

- Shell 内建命令

- 按`$PATH`所列顺序搜索到的命令

相关命令：

- `alias <aliasname>='<statement>'`：设置命令别名，通常是对较长语句进行简写。只在本次登录期间生效，要永久生效建议写入 Shell 初始化文件中

- `unalias <aliasname>`：取消指定的命令别名

- `type <command>`：辨别实际生效的命令

  - `-t`：只输出命令类型：file（外部命令）、builtin（内建命令）或 alias（命令别名）、keyword（Shell 关键字）

  - `-a`：按优先级从高到低列出所有相关命令

### 命令的选项与参数

命令的选项可分为：

- 短选项，以`-`开头，要点如下：

  - 可用一个`-`合并多个短选项，若有跟随参数则属于其中最后一个

  - 对应参数可与选项名连在一起，也可以空白符分隔。若参数是可选的，则只能以前者形式

- 长选项，以`--`开头，要点：

  - 对应参数与选项名可以`=`连接，也可以空白符分隔。若参数是可选的，则只能以前者形式

而参数则可分为：

- 选项参数（option argument），归属于某个选项

- 非选项参数（non-option parameter）

此外：

- 独立存在的`--`用于表示选项/选项参数到此截止，后面全是非选项参数

- `-`开头的也不一定都是短选项，也可能为表示负数的非选项参数

### 命令语句基础

- 换行符会被解释为语句结尾，内容较长时可在结尾追加`\`以实现跨行语句

- 多个语句置于一行时可用`;`分隔（语句结尾时无需）。此时前后命令将依次执行，不论前一命令成功或失败

- 若用`&&`分隔语句，则在前一语句**执行成功**的前提下后一语句才能执行

- 若用`||`分隔语句，则在前一语句**未成功执行**的前提下后一语句才能执行

## 常用快捷键

- `Ctrl + L`：清除屏幕输出，并将当前命令行移至顶部

- `Ctrl + C`：中止当前正在执行的命令

- `Shift + PageUp`：向上滚动屏幕输出

- `Shift + PageDown`：向下滚动屏幕输出

- `Ctrl + U`：从光标位置删除到行首

- `Ctrl + K`：从光标位置删除到行尾

- `Ctrl + D`：关闭当前 Shell 会话

- `↑ / ↓`：向前/向后切换历史命令

## 模式扩展（globbing）

Shell 收到输入指令后会根据空格将之拆分成一个个词元（token），接着扩展其中的特殊字符，之后才做实际调用

这种对特殊字符的扩展称为 globbing（得名于早期 Unix 系统用于保存扩展模板的`/etc/glob`文件），其中有用到通配符的，又称为 wildcard expansion（通配符扩展）
。相比正则表达式，模式扩展出现得更早

Bash 提供以下扩展：

- `~`：将被扩展为当前用户主目录

- 文件名扩展，返回匹配指定模式的**已存在文件**的路径（部分行为可通过`shopt`调整，[参见](./#环境设置)）。通配符如下：

  - `?`：匹配任意单个非空字符

  - `*`：匹配**任意数量**的任意字符。不可跨目录匹配，默认不匹配隐藏文件

  - `**`：匹配任意层子目录（需手动开启）

  - `[...]`：匹配方括号中的任意单个字符

  - `[^...]`或`[!...]`：匹配除方括号中以外的任意单个字符

  - 字符类，匹配相应字符集中的一个，也可在第一个方括号后加`!`以表示取反。如下：

    - `[[:alpha:]]`：英文字母

    - `[[:upper:]]`：大写英文字母

    - `[[:lower:]]`：小写英文字母

    - `[[:digit:]]`：数字

    - `[[:alnum:]]`：英文字母、数字

    - `[[:graph:]]`：英文字母、数字、标点

    - `[[:blank:]]`：空格和 Tab 键

    - `[[:cntrl:]]`：不可打印字符（ASCII 码 0-31）

    - `[[:print:]]`：可打印字符（ASCII 码 32-127）

    - `[[:punct:]]`：标点（除英文字母、数字外的可打印字符）

    - `[[:space:]]`：空格、Tab、LF（10）、VT（11）、FF（12）、CR（13）

    - `[[:xdigit:]]`：16 进制字符

  - 文件名扩展还可搭配量词语法（需手动开启），如下：

    - `?(<pattern>|...)`：匹配最多 1 次

    - `+(<pattern>|...)`：匹配至少 1 次

    - `@(<pattern>|...)`：只匹配 1 次

    - `*(<pattern>|...)`：匹配任意次

    - `!(<pattern>|...)`：取反匹配

- 大括号扩展，具有以下形式：

  - `{...}`：表示将按其中所有值逐个扩展。注意：各个值用`,`分隔，且后者前后不能有空格。实例：

  ```bash
  # 逗号前可以没有值，表示该项为空
  echo a.{,log,bak} # a. a.log a.bak

  # 可相互嵌套
  echo a{A{1,2},B{3,4}}b # aA1b aA2b aB3b aB4b

  # 可与其他模式联用，且优先级最高
  echo /bin/{cat,b*} # 等价于 echo /bin/cat /bin/b*
  ```

<!-- ```` -->

- `{start..end}`：表示按指定连续序列逐个扩展。实例：

  ```bash
  echo {a..c} # a b c

  # 支持逆序
  echo {c..a} # c b a

  # 可嵌套使用
  echo .{mp{3..4},m4{a,b,p,v}} # .mp3 .mp4 .m4a .m4b .m4p .m4v

  # 常用于新建一系列目录
  mkdir {2007..2009}-{01..12}

  # 另一用途为 for 循环
  for i in {1..4}
  do
    echo $i
  done

  # 若无法被展开为连续序列，则将原样输出
  echo {a1..3c} # {a1..3c}
  ```

- `{start..end..step}`：额外指定步长的形式

- 变量扩展：以`$`开头或包裹在`${}`中的词元被视为变量，将被扩展为其对应值。另外`${!<string>*}`或`${!<string>@}`将被扩展为所有以指定字符开头的**变量名**，例如：

  ```bash
  # 所有以S开头的变量名
  echo ${!S*} # SECONDS SHELL SHELLOPTS SHLVL SRANDOM ...
  ```

- 子命令扩展：`$(...)`将被扩展为其内部命令的**标准输出**，且支持嵌套

- 算术扩展：`$((...))`将被扩展其内部**整数运算**的结果，参见[算术运算](./#算术运算)

## 转义

某些字符在 Bash 中有特殊含义（如`$`、`&`、`*`），若只想取其字面意义，则须在其前加`\`转义（`\`自身也是特殊字符）

转义还可表示如下不可打印字符（注意若要输出，须将其置于双引号中，且`echo`命令须附加`-e`选项）：

- `\a`：响铃

- `\b`：退格

- `\n`：换行

- `\r`：回车

- `\t`：制表符

换行符表示命令的结束，将其转义后会被 Bash 当作长度为 0 的空字符，从而将命令写成多行

单引号可保留字符的字面含义，所有特殊字符在其中都会视为普通字符

双引号较单引号宽松，大部分特殊字符会变成普通字符，除`$`、`` ` ``、`\`仍具有特殊含义

## 环境设置

<!-- `set`命令用于修改 Shell 环境的运行参数，即定制环境

执行脚本时，Bash 会创建一个子 Shell 做为其执行环境 -->

```

```
