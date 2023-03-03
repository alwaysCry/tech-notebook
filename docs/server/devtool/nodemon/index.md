# 关于 nodemon

nodemon 可用于替代 node 命令启动应用，并透传脚本参数。例如应用脚本以参数方式获取 host 和 port:

```
nodemon ./server.js localhost 8080
```

所有来自 nodemon 的输出都带有 `[nodemon]` 前缀，而应用自身的标准/错误输出与往常一致

如命令中未指定应用脚本路径，则 nodemon 会尝试从 package.json 的 main 属性中获取

## 关于重启

nodemon 会监听工作目录下的变化并重启运行中（现在也包含优雅退出的）的进程

另外也可在 nodemon（启动后的）交互模式下键入 rs + 回车来手动重启

## 关于配置文件

nodemon 默认读取**工作目录**（即启动 nodemon 时所在的目录）或 home 目录下的 nodemon.json 为配置文件，当然也可在命令行以 `--config <file>` 形式指定。优先级如下：

命令行指定 > 本地配置 > 全局配置

也可在 package.json 的 nodemonConfig 中配置，但优先级仅高于全局配置

## 常用情形及配置

**以下例举命令行选项，配置文件中对应配置项可[参见](https://github.com/remy/nodemon/blob/master/doc/sample-nodemon.md)**

### 处理非 node 脚本

nodemon 根据应用脚本后缀执行相应的命令。对于非 node 脚本，除[默认配置](https://github.com/remy/nodemon/blob/master/lib/config/defaults.js)的外，还可通过以下两种方式指定：

- 通过 `--exec` 选项指定，如 `nodemon --exec "python -v" ./app.py`。注意若命令中包含选项，则需用引号包裹

- 在配置文件中设置映射关系，例如以下将使 nodemon 使用 perl 命令执行 pl 后缀文件

  ```json
  {
  	"execMap": {
  		"pl": "perl"
  	}
  }
  ```

### 指定监听目录

nodemon 默认监听当前工作目录及以下，可通过`--watch`选项手动指定，如：

```
nodemon --watch app --watch libs app/server.js
```

此时 nodemon **只**监听`./app`和`./libs`，及其子目录

此外 nodemon 还支持 glob 模式，当然 glob pattern 必须以引号包裹，例如 `--watch './lib/*'`

### 指定监听文件后缀

nodemon 默认监听指定目录中 `.js`、`.mjs`、`.coffee`、`.litcoffee`、`.json` 后缀文件

若借助 -exec (或 execMap) 指定了非 node 脚本，则同后缀文件也会被监听

另外还可通过`-e`/`--ext`选项来扩展，如：

```
nodemon -e pug,geojson
```

### 忽略指定文件

默认下 nodemon 会忽略对 .git、node_modules、 bower_components、.nyc_output、coverage、.sass-cache 目录的监听，还可通过`--ignore`选项来**扩展**（若要覆写则[可参见](https://github.com/remy/nodemon/blob/master/faq.md#overriding-the-underlying-default-ignore-rules)）：

- 忽略指定目录，如：`nodemon --ignore lib/ --ignore tests/`
- 忽略指定文件，如：`nodemon --ignore lib/app.js`
- 根据 pattern 来指定（注意引号包裹），如：`nodemon --ignore 'lib/*.js'`。注意 patterns 需要能匹配到完整的绝对路径，如：`nodemon --ignore '**/test/**'`合法，而`nodemon --ignore '*/test/*'`不合法

### TODO

...
