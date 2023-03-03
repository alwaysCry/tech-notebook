# 内存管理以及如何处理 4 类常见内存泄露问题

原文: [memory management + how to handle 4 common memory leaks](https://blog.sessionstack.com/how-javascript-works-memory-management-how-to-handle-4-common-memory-leaks-3f28b94cfbec)

## 总览

一些语言，像 C，拥有低层级的内存管理元语如 `malloc()` 和 `free()`。开发者使用这些元语来从操作系统中显式分配和释放内存

而 JavaScript 在创建“事物”（如对象、字符串...）时分配内存并在它们不再被使用时自动释放，后者被称为垃圾收集（garbage collection）。这个看似自动释放资源的机制实质是造成混乱的原因：给与 JavaScript （和其他高级语言）开发者一个能不用关心内存管理的错误印象。这是一个巨大的错误

即使在使用高级语言时，开发者也应理解内存管理（至少是一些基础）。有时自动内存管理会存在问题（如垃圾收集器的 bug 或实现上的局限），为了能正确处理（这些问题），开发者应理解到这点（或以最小的代价和技术债来做取舍）

## 内存生命周期（Memory life cycle）

无论使用什么编程语言，内存声明周期总是非常相似的：

![](https://miro.medium.com/max/945/1%2AslxXgq_TO38TgtoKpWa_jQ.png)

以下是周期中的每一步所发生事情的概述：

- 分配内存（allocate memory）：操作系统分配内存以供程序使用，在低级语言（如 C）中，这是由程序员操控的显式操作；而在高级语言中，（语言）会帮你处理
- 使用内存（use memory）：这是程序使用先前所分配内存的阶段。当在代码中使用分配的变量时，也正是进行读写操作的时候
- 释放内存（Release memory）：该阶段是释放整块内存使其变得再度可用的时机。同分配内存操作一样，该操作在低级语言中是显式的

为了对调用栈（call stack）和内存堆（memory heap）有一个快速的总览，可参见[此专题的第一篇博文](https://blog.sessionstack.com/how-does-javascript-actually-work-part-1-b0bacc073cf)

## 什么是内存

在直接跳到 JavaScript 中的内存前，先简要讨论什么是内存以及它是如何工作的

在硬件层面，计算机内存由大量的触发器（flip flop）构成，每个触发器包含一些晶体管并能够存储 1 位（bit）。每个触发器可由唯一标识符被寻址，因而可被读取和重写。因此从概念上讲，可将整个计算机内存视为一个由位构成的可供读写的巨大数组

作为人类，我们并不擅长用位来思考和算术，而是将其组成更大的群体来表示数字。8 位被称为 1 比特（byte），在比特之上还有字（有时是 16 位，有时是 32 位）

内存中存储着许多东西：

1. 所有变量及所有程序所用到的数据
2. 程序代码，包括操作系统的

尽管编译器和操作系统共同处理了大部分的内存管理工作，但还是建议多深入表面看看

当编译代码时，编译器会检查原始数据类型并提前计算所需的内存量，所需的数目会被分配给调用栈空间（call stack space）中的程序。变量被分配的空间被称为栈空间，因为当函数被调用时，其内存会被添加到现有内存的顶部；而当函数终止时，它们又会以 LIFO（last-in, first-out） 的顺序被移除。例如，考虑以下声明：

```C
int n; // 4 bytes
int x[4]; // array of 4 elements, each 4 bytes
double m; // 8 bytes
```

则编译器可立即得出该代码需要 `4 + 4 * 4 + 8 = 28 bytes`

:::tip
编译器就是这样处理整数和浮点数大小的，约 20 年前，整数一般是 2 字节，浮点数是 4 字节，当前代码则无需参照此字节大小
:::

编译器会（额外）插入（insert）一些代码，后者与操作系统互动以获取足够大小的栈以存储变量（注：这句话响应了上文中编译器和操作系统共同处理大部分内存管理的论述）

在上述示例中，编译器知道每个变量的确切内存地址。事实上，每当写入变量 n 时，后者都会在内部被转换为“内存地址 4127963”之类的东西

同样是上述示例，若尝试去访问 x[4]，则实际可能访问了变量 m 相关数据 —— 前者在数组 x（最后一个元素是 x[3]）中并不存在，最终可能读取（或覆盖了）m 的一些位。这必然会对程序的执行造成意想不到的后果

![](https://miro.medium.com/max/945/1%2A5aBou4onl1B8xlgwoGTDOg.png)

当函数相互调用时，每个（函数）都会获取到属于自己部分的栈，其中除存有全体局部变量外，还有一个计数器（counter）记录着当前的执行位置。当函数结束时，其内存块会释放而留作他用

## 动态分配（Dynamic allocation）

然而，也有可能在编译期无法确定一个变量需要多大内存，例如以下代码：

```C
int n = readInput(); // reads input from the user
...
// create an array with "n" elements
```

此处，编译器无法在编译期确定数组需要多大内存 —— 其取决于使用者提供的值，因此无法在栈上分配空间，相反，需要由程序在运行期按正确数量显式地向操作系统申请。后者的内存是从堆空间分配的。

静态/动态分配内存的差异总结如下：

![](https://miro.medium.com/max/945/1%2AqY-yRQWGI-DLS3zRHYHm9A.png)

要完全理解动态内存分配是如何工作的，需要花更多时间了解指针（pointer），这可能与本文主题有些偏离...

## JavaScript 中的内存分配

现在解释内存分配是如何在 JavaScript 中工作的

JavaScript 将开发者从手动分配内存的责任中释放出来 —— 前者会自己在声明变量时完成

```js
var n = 374; // allocates memory for a number
var s = "sessionstack"; // allocates memory for a string

var o = {
	a: 1,
	b: null,
}; // allocates memory for an object and its contained values

var a = [1, null, "str"]; // (like object) allocates memory for the array and its contained values

function f(a) {
	return a + 3;
} // allocates a function (which is a callable object)

// function expressions also allocate an object
someELement.addEventListener(
	"click",
	function () {
		someELement.style.backgroundColor = "blue";
	},
	false
);
```

一些函数调用的返回也导致变量分配

```js
var d = new Date() // allocates a Date object
vat e = document.createElement('div') // allocates a DOM element
```

方法也是如此

```js
var s1 = "sessionstack";
var s2 = s1.substr(0, 3); // s2 is a new string
// Since strings are immutable,
// JavaScript my decide to not allocate memory,
// but just store the [0,3] range

var a1 = ["str1", "str2"];
var a2 = ["str3", "str4"];
var a3 = a1.concat(a2);
// new array with 4 elements being
// the concatenation of a1 and a2 elements
```

## JavaScript 中的内存使用

在 JavaScript 中对内存的使用基本指读取和写入，包括：读写变量或对象属性、或给函数传参

## 不再需要内存时将其释放

大多数内存管理问题发生在此阶段

了解被分配的内存在何时不再被需要是最难的，通常需要开发者去指出并将其释放

高级语言嵌入（embed）了垃圾收集器，用于跟踪内存的分配和使用以找出其不再被需要的时机，并自动将其释放。不幸的是，这是个近似的过程，确定某块内存是否被需要的主要问题是[不可判定](http://en.wikipedia.org/wiki/Decidability_%28logic%29)（无法由算法解决）

大多数垃圾回收器会收集那些不再被访问的内存，比如（理想情况）引用后者的所有变量均不在（内存寻址）范围内。但只有低于近似值（under-approximation）内存空间可被回收，因为仍可能会有(内存寻址)范围的内变量在引用该内存，导致该内存无法被再次分配

## 垃圾收集

鉴于找出不再被使用内存的不可判定性，垃圾回收器实现了一个有限的解决方案。本节将会阐述必要的概念来理解垃圾回收算法及其局限

## 内存引用（Memory references）

垃圾回收算法依赖的主要概念是引用

在内存管理的场景中，若可通过一个变量访问另一个变量（可以是隐式或显式的），则可说前者引用了后者。
