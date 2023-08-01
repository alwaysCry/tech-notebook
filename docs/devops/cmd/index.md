# 常用命令

:::tip 注意
shell builtin 与部分核心命令不在此列
:::

## awk

`awk '[<statement>] {<action>} [<statement>] {<action>}...' <filename>`：主要用于按记录（由记录分隔符决定）处理分段（由字段分隔符决定）文本内容，后者可从标准输入（默认）或指定文件中读取

`awk`后跟随以`''`包裹一系列规则，后者以空格或换行符分隔。规则包含可选的 statement 和以`{}`包裹 action，若 statement 存在则将决定紧随的 action 是否执行

以下为部分内置变量：

- `$1`、`$2`、`$3`...：表示当前记录中的各个字段

- `$0`：表示该记录自身

- `NF`：表示该记录的字段总数

- `NR`：表示该记录的序号

- `FS`：表示当前指定的字段分隔符，默认为空格

- `RS`：表示当前指定的记录分隔符，默认为换行符

- `FILENAME`：表示当前处理的文件名，若从标准输入中读取则值为`-`

一些要点：

- 若 action 中包含多个语句，则须以`;`分隔

- action 中声明的自定义变量在所有语句中可用

- action 中可使用 print/printf 将相关内容标准输出

- statement 中分别以`==`和`!=`表示相等和不等

- statement 和 action 中表示字面量的文本字符须以`""`包裹，数字则不用

- 可通过`awk 'BEGIN {FS=<delimeter>} ...'`方式修改字段分隔符，等价于指定`-F <delimeter>`选项。注意`BEGIN`关键字不可省略

- 同理，可通过`awk 'BEGIN {RS=<delimeter>} ...'`方式修改记录分隔符

一些用例：

- `last -n 5 | awk '{print $1 "\t" $3}'`

- `last -n 5 | awk '{print $1 "\t lines:" NR "\t columns:" NF}'`

- `awk '{FS=":"} $3<10 {print $1 "\t" $3} /etc/passwd'`

- `awk 'BEGIN {FS=":"} $3<10 {print $1 "\t" $3}' /etc/passwd`

- ```bash
  cat pay.txt | \
      awk 'NR==1 {printf "%10s %10s %10s %10s %10s\n",$1,$2,$3,$4,"Total"}
      NR>=2 {total=$2+$3+$4; printf "%10s %10d %10d %10d %10.2f\n",$1,$2,$3,$4,total}'
  ```

## cat(concatenate)

`cat [<file...>]`：用于将标准输入（默认）或指定文件内容标准输出

- `-b`：显示行数，空行不编号

- `-n`：显示行数，空行也编号

- `-E`：每行末尾处显示`$`

## cut

`cut`：将标准输入**按行**做字段（列）/字符截取，并标准输出。用例如下：

- 以`:`为分隔点截取列：

  - 截取第 1 列：`cat /etc/passwd | cut -d ':' -f 1`

  - 截取第 1、第 3 列：`cat /etc/passwd | cut -d ':' -f 1,3`

  - 截取第 1-3 列：`cat /etc/passwd | cut -d ':' -f 1-3`

- 每行截取第 12 字以后内容：`export | cut -c 12-`

由于其仅支持单字符分隔符，遇到形如多个空格分隔时建议用 awk 代替

## chmod(change mode)

`chmod <mod> <file...>`：更改文件权限

- 不同权限的数字表示分别为：`r`->`4`，`w`->`2`，`x`->`1`，`-`->`0`

- 可用三者之和表示一类用户的完整权限，如：`rwx`->`4+2+1`->`7`，`r--`->`4+0+0`->`4`。因而`chmod 755 test.sh`即表示将 test.sh 的权限设为为`rwxr-xr-x`

## df(Disk Free)

`df [<file>...]`：输出指定文件系统的磁盘使用量，默认显示全部

- `-h`：以可读单位形式输出

- `-t <filesystem_type>`：只输出指定类型文件系统

- `-T`：额外列出文件系统类型

## du(Disk Usage)

`du [<file>...]`：输出指定文件（默认当前目录）的存储占用，若为目录则将递归其子目录

- `-h`：已可读单位形式输出

- `-a`：递归子目录时显示所有文件的大小

- `-s`：处理目录时不向下递归。如 `du -s /*` 输出根目录下所有一级子目录的大小

- `-S`：仅输出非目录文件的大小

## echo

`echo <argument...>`：将指定字符或变量值标准输出。默认结尾附加换行符，且不支持反斜杠转义

- `-n`：结尾不附加换行符

- `-e`：支持反斜杠转义

## find

`find [<start-path>...] [<expr>...]`：用指定表达式逐个评估起始路径（默认当前目录）下的所有文件，并返回最终结果为 true 的文件路径。后者是相对还是绝对的取决于起始路径的相对/绝对情况

表达式可分为：option、test、action，彼此间以操作符串联。无操作符则等同于`-a`

### 操作符

以下操作符按优先级从高到低排列：

- `\( <expr>... \)`：注意此处括号须被转义，且与内部表达式间留有空格

- `-not <expr>`：取反

- `<expr1> -a <expr2>`：表示和

- `<expr1> -o <expr2>`：表示或，前一个表达式为 true 时后一个不再执行

### option

总返回 true，并将影响当前指令的整体执行。`-daystart`、`-L`、`-regex-type`除外，后者仅影响指定在其之后的 test 的执行。常用 option 如下：

`-L`：后续的测试以及打印均针对软链接指向的文件，默认仅针对软链接本身

`-mount`：将挂载盘从查找范围中排除

### test

用于逐个测试（匹配）起始路径下的所有文件，满足则返回 true，否则返回 false。常用 test 如下：

- `-mtime {+|-}<n>`：上一次内容更新距今超过/少于 n\*24 小时（atime、ctime 同理）

- `-newer <filepath>`：内容比指定文件更早更新（anewer、cnewer 同理）

- `-user <uname>`：属于指定用户（用户名或 ID）

- `-nouser`：不属于任何用户

- `-group <gname>`：属于指定组（组名或组 ID）

- `-nogroup`：不属于任何组

- `-name <pattern>`：其名称（basename）匹配指定模式

- `-path <pattern>`：其路径匹配指定模式，注意该路径是相对还是绝对的取决于起始路径的相对/绝对情况

- `-type <char>`：指定文件类型，对应关系如下

  - `f`：普通文件

  - `d`：目录

  - `l`：链接

  - `b`：块设备

  - `c`：字节设备

  - `s`：sockets

  - `p`：FIFO

- `-size {+|-}<n>`：文件大小大于/小于指定数值。可用单位如下：

  - `c`：byte

  - `w`：2-byte

  - `b`：默认单位，512-byte

  - `k`：Kb

  - `M`：Mb

  - `G`：Gb

### action

为当前评估结果为 true 的文件执行指定操作，返回 true 或 false 取决于具体 action。常用 action 如下：

- `-exec <command> \;`：将该文件按占位符`{}`代入指定指令中执行，注意以`\;`收尾。若执行成功则返回 true

- `-prune`：若该文件为目录，则不在其下继续展开。必返回 true

### 实例

- 找出`root/.vscode-server`目录下的名为`machineid`的文件，且后者确定不在其`bin`和`extensions`子目录中：

  ```bash
  find /root/.vscode-server \( \
  -path '/root/.vscode-server/bin' -o \
  -path '/root/.vscode-server/extensions' \
  \) -prune -o -name machineid -print
  ```

## grep

`grep <pattern> [<file>...]`：使用正则从标准输入（默认）或指定文件中找出含匹配字符的行，并标准输出。常用选项：

- `-i`：忽略大小写

- `-E`：支持扩展正则表达式

- `-e/--regexp=<pattern>`：当存在多个 pattern 时须以该选项来指定每一个；或当 pattern 以`-`开头时使用，以避免歧义

- `-f <regexp-file>`：从指定文件中读取正则表达式，可存在多个

- `-x`：需要整行被匹配

- `-w`：需要（两个词边界之间的）整词被精准匹配，

- `-v`：反向选择

- `-n`：输出时附带行号

- `-r`：遇到目录时（默认不能搜索目录）递归搜索其下的全部文件内容。软链接默认被忽略，除非其在参数中被显式指定

- `-R`：同`-r`，但软链接也将被处理

- `-l`：仅输出包含匹配行文件的文件名

- `-h`：搜索多文件时不连同相应文件名一起输出

- `-c`：只显示包含的匹配行数目

- `-B <n>`：连同匹配行的前 n 行一起输出

- `-A <m>`：连同匹配行的后 m 行一起输出

用例如下：

- 连带匹配行的前 2 行后 3 行一起输出：`grep 'sys' -B 2 -A 3 /etc/passwd`

## head

`head <file>...`：输出指定文本文件的前 10 行

- `-n <num>`：指定截取行数

## ln(link)

`ln <source> <target>`：为指定文件创建硬链接

- `-s`：创建软链接

## less

分页显示文本内容（`man`命令即调用其来展示说明文件）。相关操作：

- 空格/Page down：向下翻页

- Page up：向上翻页

- `/`：向下搜索

- `?`：向上搜索

- `n`：跳转到下一匹配字符所在行

- `N`：调转到上一匹配字符所在行

- `g`：跳转到第一行

- `G`：跳转到末尾行

- `q`：退出

## nl(number of lines)

`nl [<file...>]`：将标准输入（默认）或指定文件附加行号后标准输出，类似于`cat -n`

- `-l <num>`：将指定数目的空行计为一行

## locate

`locate <pattern...>`：快速查找文件，其本质为查询`/var/lib/mlocate`目录下的数据库文件，相比 find 更快但存在滞后性。该数据库文件会定期更新，也可执行 updatedb 来手动更新

- `-i`：忽略大小写差异

- `-c`：不输出文件名，仅输出匹配的文件数量

- `-l <num>`：限制输出条数

- `-r <regexp>`：指定正则表达式

## printf(print and format)

`printf <format> <argument...>`：C 语言风格占位符的格式化输出。不支持从标准输入或文件中获取内容，需要时可与`` ` ` ``或`$()`配合使用。以下为部分用例：

<!-- 注意 printf 会以空白符（包括换行符）分隔的字符段填充占位符，未使用的字符段会被交由下一次 printf，因而需要在[FORMAT]末尾手动添加换行符（\n） -->

- `printf '%s\t %s\t %s\t %s\t %s\t\n' %(cat printf.txt)`

  - `%s`将被依次替换为 printf.txt 中以空白符（含换行符）分隔的字符段

  - `\t`会让输出尽可能列对齐，但不能保证（如当某一字符段特别长时）

- `printf '%10s %5i %5i %5i %8.2f\n' $(cat printf.txt | grep -v Name)`

  - `%[-]10s`表示输出宽度为 10，`-`表示左对齐，否则右对齐，不足会以空格符填充

  - `%[-]5i`表示以整数形式按宽度 5 输出，其余同上

  - `%[-]8.2f`表示以浮点数形式输出，总宽度为 8，小数点后保留 2 位

- `%b`会使字符段中的转义生效

## sed（stream editor）

`sed <expression>`：用于过滤和替换文本，后者可从标准输入（默认）或指定文件中读取，并将处理后的内容标准输出。expression 建议用单引号包裹，支持正则表达式。常用选项：

- `-e <expression>`：存在多个 expression 时需要该选项来指定每一个，以避免歧义

- `-n`：只输出新生成的行，包括用于插入、替换或复制后粘贴（`p`）的

- `-i [<suffix>]`：直接修改原文件而非标准输出，若提供可选后缀则会将原文件以该后缀做备份

用例如下：

- 删除第 2-5 行：`cat /etc/passwd | sed '2,5d'`

- 从第 2 行删除到末尾：`cat /etc/passwd | sed '2,$d'`

- 在第 2 行后插入一行：`cat /etc/passwd | sed '2a drink tea'`

- 在第 2 行前插入一行：`cat /etc/passwd | sed '2i drink tea'`

- 在第 2 行后插入多行：`cat /etc/passwd | sed '2i drink tea\ndrink coffee'`

- 将第 2-5 行替换为指定内容：`cat /etc/passwd | sed '2,5c No 2-5 line'`

- 只输出第 5-7 行：`cat /etc/passwd | sed -n '5,7p'`

- 删除所有注释行（替换为空字符）：`cat /etc/man_db_conf | sed 's/#.*$//g'`

- 删除所有空行：`cat /etc/man_db.conf | sed 's/#.*$//g' | sed '/^$/d'`

- 将每行末尾的`.`替换为`!`：`cat regular_express.txt | sed 's/\.$/\!/g'`

- 在文件末尾添加一行：`sed -i '$a #This is a test' regular_express.txt`

## sort

`sort [<file>...]`：对标准输入（默认）或指定文件按行做排序，默认按首字母/数字顺序（相同则比较下一个）。常用选项：

- `-f`：忽略大小写差异

- `-b`：忽略开头的空白符

- `-r`：反向排序

- `-c`：仅检查内容是否已按照顺序排列

- `-u`：排序完成后相同行仅出现一次

- `-k`：指定排序时依据的首字符所在列的序号，默认即首列

- `-t <delimeter>`：指定列分隔符，默按空白符分列

- `-h`：按可读计量单位为依据排序（如 1K、1G 等）

- `-n`：按数值大小进行排序

一些用例：

- 指定`:`为分列符，以第 3 列数值大小为依据进行排序：`sort -t ':' -k 3 -n /etc/passwd`

## split

`split [<file> [<prefix>]]`：对标准输入（默认）或指定文件内容做分割，默认以 1000 行为基准。分割出的文件位于**当前**目录下并以可选的 prefix 为命名前缀

- `-b <size>`：按指定字节大小分割，也可使用 k、m 等单位

- `-l <num>`：按指定行数分割

## tee

`tee <file>`：主要用于在命令管道中做分叉重定向，即标准输入在被转发至标准输出的同时，也被重定向至指定文件

- `-a`：指定为追加模式

一些用例：

- `last | tee ./last | sort`

## touch

`touch <file...>`：若文件已存在则更新其 atime/ctime/mtime，否则创建相应空文件

- `-c/--no-create`：不创建任何文件

- `-a`：仅更新 atime

- `-m`：仅更新 mtime

- `-d | --date=<string>`：将变更时间设置为指定时间点，如`touch -d "2 days ago" <file...>`。注意 ctime 无法被设置，仅能被更新为当前（`cp -a`同理）

## tar

`tar <sourcefile...>`：用于打包或解包

- `-c`：执行打包

- `-x`：执行解包

- `-t`：仅列出包中所含文件

- `-f <file>`：指定待创建 / 解开 / 检查的 tar 包（或 tar 压缩包）

- `-z`：打包后用 gzip 进一步压缩（`.tar.gz`），或解包（或检查，下同）前先用 gzip 解压缩

- `-j`：打包后用 bzip2 进一步压缩（`.tar.bz2`），或解包前先用 bzip2 解压缩

- `-J`：打包后用 xz 进一步压缩（`.tar.xz`），或解包前先用 xz 解压缩

- `-p`：打包时保留文件的原有属性和权限

- `-P`：打包时保留文件的完整路径（无论在任何目录下解包，文件都将在原本位置创建）

- `-C <dir>`：解包时将内容置于指定目录下

- `--exclude=<pattern>`：解包时跳过匹配文件

- `-v`：输出详细信息

## tail

`tail <file>...`：输出指定文本文件的末 10 行

- `-n <num>`：指定截取行数

- `-f/--follow[={name|descriptor}]`：执行后不退出，每当内容变更时输出最新内容

  - `descriptor`：默认值，即使文件被重命名/删除也继续监听

  - `name`：发生上述情况将做出响应

- `-F`：等价于`--follow=name`

## tr(transform)

`tr <set1> [<set2>]`：删除/替换标准输入中的匹配字符，并标准输出。set 中可使用通配符

- `-d`：存在于第一个 set 中的字符都将被删除

- `-s`：存在于第一个 set 中的字符都将做相邻去重

一些用例：

- 大写转小写：`cat /etc/passwd | tr [a-z] [A-Z]`

- 删除所有数字：`cat /etc/passwd | tr -d [0-9]`

- 去除行间空行（即相邻换行符去重）：`car ~/.bashrc | tr -s '\n'`

## uniq

`uniq [<file>]`：将标准输入（默认）或指定文件做相邻行去重，并标准输出。非相邻行建议先用 sort 排序。常用选项：

- `-i`：忽略大小写差异

- `-c`：仅输出相同行数统计信息

## wc(world count)

`wc [<file...>]`：用于对标准输入（默认）或指定文件内容做计数统计，依次输出行/词/字符统计

- `-l`：仅输出行统计

- `-w`：仅输出词统计

- `-m`：仅输出字符统计

## which

`which <cmd-name>`：查找命令文件（不含 shell builtin），本质为根据环境变量`PATH`中的路径搜索相应可执行文件名

- `-a`：输出所有找到的同名文件

## xargs(extended arguments)

`xargs <command>`：将标准输入内容按分隔符（默认为空白符，含空格、Tab、换行）分段后整体作为参数交给指定 command 执行

- `-n <num>`：指定单次交付的分段数，此时 command 将按批次执行多次

- `-d <delimeter>`：指定分隔符，只能为单个字符

- `-E <eof-str>`：指定 EOF 行，处理到该行时将 xargs 将结束执行。不可与`-d`同时使用

- `-0`：标准输入将完全按字面值解析（即反斜杠转义失效），xargs 将以 null character 为分隔符处理前者，因而标准输入提供方须提供此类机制（如 find 命令需要附加`-print0`）。常用于批量删除文件时文件名中含空白符的情况

一些用例：

- 删除`/tmp`目录下所有以`x x`开头的文件：`find /tmp -print0 -name 'x x*' | xargs -0 rm -f`
