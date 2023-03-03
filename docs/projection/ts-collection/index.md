# TS 要点总结

## 模块与命名空间

TS 1.5 前 module 既可指内部模块，也可指外部模块

自 1.5 起内部模块的概念改称命名空间（不推荐使用）；而外部模块即模块（ES6 模块系统视每个文件为独立模块）。即：

```ts
// 之前
module Math {
  export function add(x,y) { ... }
}
// 之后
namespace Math {
  export function add(x,y) { ... }
}
```

## 是否可将 null/undefined 赋值给其他类型

`tsconfig.json`中默认`strictNullChecks: true`，不能，二者只能赋值给自身或 any 类型；除非将该项设为 false

## never 和 void 的区别

- void 表示无任何类型，可被赋值为 null 或 undefined
- never 表示一个不存在的值

函数返回 void 类型表示无返回值，而返回 never 类型则表示无法正常返回，无法终止或抛出异常

## 元祖越界问题

```ts
const tuple: [string, number] = ["a", 0];
// 越界添加时不报错
tuple.push(1);
// 使用越界项时会报错
console.log(tuple[2]); // Error
```

## 枚举的使用场景和特点

常规代码常有以下问题：

- 可读性差，很难记住数字含义
- 可维护性差，硬编码，后续修改则牵一发动全身

枚举也可分普通枚举和常量枚举。共同点：

- 成员只读
- 成员值默认从 0 自增

不同点：

- 普通枚举成员有多种初始化方式，例如：

  ```ts
  enum Char {
  	// const member(常量成员),编译阶段算出结果
  	a,
  	b = Char.a,
  	c = 1 + 3,

  	// computed member(计算成员),执行阶段算出结果
  	d = Math.random(),
  	e = "123".length,
  	f = 6, // 若紧跟计算成员后，则必须有初始值
  	g,
  }
  ```

- 常量枚举会在编译阶段被删除，不能包含计算成员

  ```ts
  const enum Colors {
  	Red,
  	Yellow,
  	Blue,
  }
  ```

## 可索引类型接口

一般用于约束数组或对象。例如：

```ts
interface StringArray {
	[index: number]: string;
}

interface StringObject {
	[index: string]: string;
}
```

## 函数/混合类型接口

可用函数接口约束函数；而当函数自身拥有属性时，可用混合类型接口描述。例如：

```ts
interface CountPrice {
	(price: number): number;
	discount: number;
}
```

## 函数重载（overload）

即为同一函数提供多个类型定义，适用于接收不同参数并返回不同结果的情况（实际较少使用，一般以联合类型或泛型代替）。例如：

```ts
function fn(val: string): string;
function fn(val: number): number;
function fn(val) {
	if (typeof val === "string") {
		return val;
	} else if (typeof val === "number") {
		return val;
	}
}
```

## 类型保护函数与类型谓词

类型保护函数的返回值是一个类型谓词，语法为`parameterName is Type`，其中 parameterName 为函数的一个形参。例如：

```ts
interface Bird {
	fly();
	layEggs();
}
interface Fish {
	swim();
	layEggs();
}

function isFish(animal: Bird | Fish): animal is Fish {
	return (animal as Fish).swim !== undefined;
}

function behave(animal: Bird | Fish) {
	(animal as Bird).fly(); // animal 默认只获取共有部分，除非类型断言

	if (isFish(animal)) {
		animal.swim();
	} else {
		animal.fly();
	}
}
```

## Pick 返回的是一个包含摘取属性的新接口

```ts
interface Father {
	foo: number;
	bar: string;
	biz: boolean;
}

const son: Pick<Father, "foo" | "biz"> = { foo: 0, biz: true };
```

## exclude 内的模块仍可能被编译器检查

若一文件被模块导入，则无论其是否被 exclude，就会加到编译列表内。因此要真正排除一个文件，还需排除所有对其 import 或使用 /// 指令的文件
