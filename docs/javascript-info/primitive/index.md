# 基本类型概述

- JS 有 7 种基本类型：string、number、boolean、null、undefined、symbol、bigint

- 除 null 和 undefined 外均有相应对象包装器（构造函数）：String、Number、Boolean、Symbol、BigInt

:::warning 注意

**不推荐**用 new 调用包装器，这将得到一个对象；但可不带 new 调用，即显式类型转换

```js
typeof new Number(0); // "object"
```

:::

## number 类型

以 64 位格式 [IEEE-754](https://en.wikipedia.org/wiki/IEEE_754) （双精度浮点数，52 位用于数字， 11 位用于小数点位置，1 位用于符号）存储。除常规数字还包括`Infinity`（因数字很大而溢出）、`-Infinity`（同理）、`NaN`（对其任何运算都返回`NaN`）

- 编写数字时可用下划线 \_ 为数字间分隔符（增加可读性，会被引擎忽略）；也可在数字后附加字母 e 并指定零的个数（缩短数字）。例如：

  ```js
  let billion = 1000000000;
  // 可写为
  billion = 1_000_000_000;
  // 还可写为，等价于 1 * 1000000000（9个0）
  billion = 1e9;

  // 同理
  let mcs = 0.000001;
  // 可写为，等价于 1 / 1000000（6个0）
  mcs = 1e-6;
  ```

- 还可以二（0b 前缀）、八（0o 前缀）、十六（0x 前缀）进制形式编写数字。例如：

  ```js
  0xff; // 255
  0xff; // 255 大小写不限
  0b11111111; // 255
  0o377; // 255
  ```

- 直接在数字上调用方法要使用两个点以避免与小数点混淆。如 `123456..toString()`

- `num.toString(base)`方法将数字转为 base（2-36，默认 10）进制形式**字符串**。例如：

  ```js
  let num = 255;
  num.toString(16); // "ff"
  num.toString(2); // "11111111"
  ```

- 用`+`或`Number(value)`转数字时，若入参不完全为数字则返回 NaN；而 parseInt 与 parseFloat 函数可从字符串中**读取数字直到无法继续**，例如：

  ```js
  +"100px"; // NaN
  parseInt("100px"); // 100
  parseFloat("12.5em"); // 12.5
  parseInt("12.3"); // 12（只返回整数部分）
  parseFloat("12.3.4"); // 12.3

  // 若开头就无法继续，则返回NaN
  parseInt("a123"); // NaN
  ```

- `parseInt(str, radix)`还可通过第二个参数（可选，不超过 36）指定基数，以将不同进制字符串解析为数字。例如：

  ```js
  parseInt("0xff", 16); // 255
  parseInt("ff", 16); // 255 (无0x也有效)
  ```

- 关于数字的舍入

  - 舍入为整数的常用方法：

    - `Math.floor`，向下舍入，如：`3.1 => 3`、`-1.1 => -2`

    - `Math.ceil`，向上舍入，如：`3.1 => 4`、`-1.1 => -1`

    - `Math.round`，向最近整数舍入，如：`3.1 => 3`、`3.6 => 4`、`3.5 => 4`

    - `Math.trunc`（IE 不支持），移除小数点后内容：`3.1 => 3`、`-1.1 => -1`

  - 舍入到小数点后 n 位：

    - 乘除法，例如：

    ```js
    let num = 1.23456;
    Math.round(num * 100) / 100; // 1.23456 -> 123.456 -> 123 -> 1.23
    ```

    - 使用`num.toFixed(n)`方法（四舍五入，返回字符串），小数部分不足将以 0 补齐

- 使用**小数**（运算）时会损失精度。二进制确保 2 的整数次幂为除数时能正常工作，而 10 为除数则不能。因而类似 0.1、0.2 在二进制中实际为无限循环小数，无法被精确存储（类似`1/3`之于十进制）。IEEE-754 格式会将数字舍入到最接近的可能数字但精度损失依旧存在

  - 主要影响到运算方面，如：

  ```js
  0.1 + 0.2 === 0.3; // false
  0.1 + 0.2; // 0.30000000000000004
  (0.1).toFixed(20); // 0.10000000000000000555
  ```

  - 乘/除法虽可减少误差但不能完全消除，如：

  ```js
  (0.28 * 100 + 0.14 * 100) / 100; // 0.4200000000000001
  ```

  - 可借助`num.toFixed(n)`对结果进行舍入，但此操作也会受到影响（主要在四舍五入时）。如：

  ```js
  (6.35).toFixed(20); // 6.34999999999999964473
  // 因而导致
  (6.35).toFixed(1); // 6.3（而非6.4）
  ```

  - 另外当存储数字的 52 位不够时，也会出现精度损失（截断）。如：

  ```js
  9999999999999999; // 10000000000000000
  ```

  - 解决方法为使小数转为更接近整数或无精度损失的形式，参与运算后再对结果做转回。如：

  ```js
  // 63.5无精度损失，因其小数部分0.5为1/2，即：6.35 -> 63.5 -> 64(rounded) -> 6.4
  Math.round(6.35 * 10) / 10; // 6.4
  (Math.round(0.28 * 100) + Math.round(0.14 * 100)) / 100; // 0.42
  ```

  - 另外在处理小数时避免相等性检查，如：

  ```js
  // 无限循环
  let i = 0;
  while (i !== 10) {
  	i += 0.2;
  }
  // 可改为
  i = 0;
  while (i < 11) {
  	i += 0.2;
  	if (i > 9.8 && i < 10.2) break;
  }
  ```

- Infinity（-Infinity）和 NaN 为特殊数字，相关要点：

  - NaN 甚至不等于其自身，因而可用`isNaN(value)`函数来检查。后者先将入参转为数字，再测试其是否为 NaN，例如：

  ```js
  NaN === NaN; // false
  isNaN(NaN); // true
  isNaN("str"); // true
  ```

  - `isFinite(value)`函数将入参转为数字，再检查其是否为 NaN/Infinity/-Infinity，不是则返回 true。常被用于验证字符串值是否为常规数字

  ```js
  isFinite("15"); // true
  isFinite("str"); // false
  isFinite(Infinity); // false
  ```

- 内建方法`Object.is`除以下两种边缘情况外均与`===`相同：

  - `Object.is(NaN, NaN) // true`

  - `Object.is(0, -0) // false` 技术上正确，二者内部数字符号位不同

### bigInt 类型

用于表示任意长度**整数**（number 类型无法安全表示大于`2^53-1`或小于`-2^53-1`的整数，会出现精度问题），可用以下方式创建：

- 字面量方式：在整数字后加`n`，如：`12345678901234567890n`

- 调用`BigInt`函数，如：`BigInt("12345678901234567890")`

注意点：

- bigInt 不支持同 number 的数学运算，应先显式转换（注意转后者可能出现截断），但可同后者进行比较运算

- bigInt 不支持一元加法，仅可借助`Number()`来转为 number

- bigInt 支持同类型间的运算符常规数学运算（注意除法结果可能被舍入），所有结果均为 bigInt

- 布尔运算类似 number，除`1n`为假，其余均为真

- polyfill 参见[JSBI](https://github.com/GoogleChromeLabs/jsbi)

### string 类型

字符串使用 UTF-16 编码，部分罕见字符以代理对（即 UTF-16 扩展字符）形式出现，占 4 字节（长度为 2） 。可包裹于单/双引号或反引号中

- 反引号允许通过`${…}`嵌入表达式，且允许字符串跨行

- 单/双引号则允许嵌入以`\`（也称转义字符）开头的特殊字符

  | 字符                 | 描述                                                          |
  | -------------------- | ------------------------------------------------------------- |
  | `\n`                 | 非 Windows 换行符                                             |
  | `\r`                 | Windows 文本中`\r\n`表示一个换行符                            |
  | `\'`,`\"`            | 单/双引号字符                                                 |
  | `\\`                 | 反斜杠字符                                                    |
  | `\t`                 | 制表符                                                        |
  | `\b`,`\f`,`\v`       | 退格、换页、垂直标签（仅为兼容性，现已不使用）                |
  | `\xXX`               | utf-8 字符，如`\x7A`为`z`                                     |
  | `\uXXXX`             | utf-16 字符，如`\u00A9`为版权符号`©`                          |
  | `\u{X...}`（1-6 位） | utf-32 字符（一些罕见字符用两个 Unicode 字符编码，占 4 字节） |

字符串操作不多赘述，要点如下：

- 获取指定位置字符：

  - `str[pos]`，若未找到字符返回`undefined`，不识别代理对

  - `str.charAt(pos)`，若未找到字符返回空字符串，不识别代理对

- 获取指定位置字符的 utf16 数字值：

  - `str.prototype.charCodeAt(pos)`，不识别代理对

  - `str.prototype.codePointAt(pos)`，若 pos 为代理对起始位置，则返回其对应 utf32 值

- 根据数字值获取（对应 unicode 单字符）字符串：

  - `String.fromCharCode(code)`，支持 utf-16

  - `String.fromCodePoint(code)`，兼容 utf-16/32

- 字符串为可迭代，能识别代理对，因而转数组时推荐`Array.from`或解构`[...str]`，而非`split`方法（不识别）

## symbol 类型

Symbol 值表示唯一标识符，通常用作属性的键，使其隐藏而防止意外使用或重写。可分为：

- 本地 Symbol：通过`Symbol([description])`方式创建，description 为可选描述。描述相等并不意味其值相等，例如：

  ```js
  let id1 = Symbol("id");
  let id2 = Symbol("id");
  id1 === id2; // false
  ```

- 全局 Symbol：位于全局注册表内，以其描述为键，通过`Symbol.for(description)`方式创建/读取。例如：

  ```js
  let id1 = Symbol.for("id"); // 若不存在则创建
  let id2 = Symbol.for("id"); // 再次读取，可能在代码的另一位置
  id1 === id2; // true

  // 可通过 Symbol.keyFor 获取全局 Symbol 的键（即其描述）
  let globalSymbol = Symbol.for("name");
  let localSymbol = Symbol("name");
  Symbol.keyFor(globalSymbol); // name
  Symbol.keyFor(globalSymbol) === globalSymbol.description; // true
  Symbol.keyFor(localSymbol); // undefined（该方法只适用于全局Symbol）
  ```

- 系统 Symbol：语言内置的 Symbol，诸如`Symbol.hasInstance、Symbol.iterator、Symbol.toPrimitive`等。用于改变对象的内建行为，具体[参见](https://tc39.github.io/ecma262/#sec-well-known-symbols)

Symbol 具有以下特点：

- 所有 Symbol 都具有 description 属性

- 不会被自动（隐式）转为字符串，需手动调用其 toString 方法。强行隐式转换会报错，例如：

  ```js
  let id = Symbol("id");
  id + ""; // Uncaught TypeError: Cannot convert a Symbol value to a string
  ```

- 在对象字面量中使用 Symbol 要用方括号将其括起

- Symbol 属性在`for...in`与`Object.keys(obj)`中会被忽略；但在`Object.assign`则不会

<!-- - `Object.getOwnPropertySymbols(obj)`获取对象的所有 Symbol 属性；或`Reflect.ownKeys(obj)`获取对象包含 Symbol 在内的所有键 -->
