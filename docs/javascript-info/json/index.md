# JSON 概述

JSON（JavaScript Object Notation）是表示值和对象的通用格式。JS 中相关方法：`JSON.stringify`、`JSON.parse`

## JSON.stringify(value[, replacer, space])

该方法用于序列化 JSON 字符串，除对象和数组外，入参还支持原始类型中的 string、number、boolean、null。如：

```js
JSON.stringify(1); // '1'
JSON.stringify("test"); // '"test"'
JSON.stringify(true); // 'true'
JSON.stringify(null); // 'null'
// 不支持的类型
JSON.stringify(() => {}); // undefined
JSON.stringify(undefined); // undefined
JSON.stringify(Symbol()); // undefined
JSON.stringify(BigInt(1)); // Uncaught TypeError
```

### 默认转换特性

- 以 symbol 类型为键的属性将被忽略（即使指定了 replacer）

- 对于 undefined、function、symbol 类型，若为属性值则忽略该属性；若为数组元素则视同 null；若直接转换则返回 undefined

- NaN、Infinity（-Infinity）被视同 null

- number、string、boolean 的包装对象被视同其原始类型

- Date 对象被转换为相应字符（因其实现了 toJSON 方法）

- 出现 BigInt 类型的值会抛错

- 出现对象循环引用会抛错

- 除普通对象/数组外的对象（内建对象、Map/Set/WeakMap/WeakSet 等），只转换其可枚举属性

### 调整转换流程

方法第二个参数 replacer（可选）可为数组或函数形式：

- 若传入数组，则只处理名称位于其中的属性（包含深层嵌套及数组项）

- 若传入函数，则其会在处理每个键值对（包含深层嵌套及数组项）时被调用，接受键、值为入参，返回值将**代替实际键值被转换**，若返回 undefined 则忽略该属性

### 格式化

方法第三个参数 space（可选）用于调整格式化的缩进相关：

- 默认无缩进

- 若传入数字则用以指定缩进的空格数

- 若传入字符串则以此替代空格作为缩进字符

### 自定义序列化方法

类似 Date，可为对象添加 toJSON 方法，则后者的返回值将作为序列化的实际结果

## JSON.parse(str, [reviver])

该方法用于将 JSON 字符串反序列化，第二个参数作为可选函数将为每个键值对调用。传入序列化结果中应出现的键和值，若有返回值则替代后者，若无（undefined）则忽略该属性
