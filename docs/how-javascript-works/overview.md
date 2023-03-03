---
date: 2022-09-15
---

# 关于引擎、运行时和堆栈的概述

原文：[How JavaScript works: inside the V8 engine + 5 tips on how to write optimized code](https://blog.sessionstack.com/how-javascript-works-inside-the-v8-engine-5-tips-on-how-to-write-optimized-code-ac089e62b12e)

## JavaScript 引擎（The JavaScript Engine）

V8 引擎被用在 chrome 和 Node.js 中，简单示意如下：

![](https://miro.medium.com/max/1050/1%2AOnH_DlbNAPvB9KLxUCyMsA.png)

其有两个主要组成部分：

- 堆（Memory Heap）：内存分配发生之处
- 调用栈（Call Stack）：代码执行时的栈帧(stack frames)所在

## 运行时（The Runtime）

诸如 DOM、AJAX、setTimeout 等 WEB API 由浏览器提供（与...共同构成了运行时?）

## 调用栈（The Call Stack）

JavaScript 是单线程的语言，意味着其只有一个调用栈，一次只能做一件事
而调用栈是一个用于记录程序执行位置的数据结构：当开始执行某一函数时，其被放置在栈顶；而当函数返回时，其从栈顶中弹出
例如，观察以下代码：

```js
function multiply(x, y) {
	return x * y;
}

function printSquare(x) {
	var s = multiply(x, x);
	console.log(s);
}

printSquare(5);
```

当引擎开始执行此代码时，调用栈仍是空的，接着将按照以下步骤：

![](https://miro.medium.com/max/945/1%2AYp1KOt_UJ47HChmS9y7KXw.png)

以上的每条记录被称为一个栈帧（Stack Frame）
这也正是抛出异常时构建栈记录（stack trace）的方式 —— 基本就是异常发生时的调用栈状态。观察以下代码：

```js
function foo() {
	throw new Error("SessionStack will help you resolve crashes :)");
}

function bar() {
	foo();
}

function start() {
	bar();
}

start();
```

假设以上代码位于 foo.js 中。当其在 Chrome 中执行时，以下栈记录（stack trace）将被产生：

![](https://miro.medium.com/max/684/1%2AT-W_ihvl-9rG4dn18kP3Qw.png)

**栈溢出（blowing the stack）**，尤其容易发生在调用递归函数且无终止条件的情况下：执行的每个步骤，同样的函数被添加到栈顶，如此往复。例如以下代码：

```js
function foo() {
	foo();
}

foo;
```

![](https://miro.medium.com/max/945/1%2AAycFMDy9tlDmNoc5LXd9-g.png)

最终到达最大限制后，浏览器抛出以下错误，

![](https://miro.medium.com/max/521/1%2Ae0nEd59RPKz9coyY8FX-uw.png)

总的来说，（编写）单线程下执行的代码会较为容易，开发者不必处理那些多线程复杂场景下会出现的问题，如死锁（deadlock）；但同样也有局限，比如执行耗时任务时该如何处理？

## 并发和事件循环（Concurrency & the Event Loop）

当浏览器执行耗时任务(如复杂的图像转换）时会引发阻塞（block），即在调用栈中仍有函数在执行时，浏览器无法做其他任何事（诸如渲染等），这对 app 的流畅（fluid）UI 造成了影响  
另外当调用栈中执行任务数过多时，可能会长时间无响应，多数浏览器都会将此作错误上报（raising an error），并询问用户是否要终止该页面

![](https://miro.medium.com/max/624/1%2AWlMXK3rs_scqKTRV41au7g.jpeg)

此类问题的解决方式便是异步回调（asynchronous callback）

## 深入 V8 引擎 + 优化代码的 5 个建议

原文：[How JavaScript works: inside the V8 engine + 5 tips on how to write optimized code](https://blog.sessionstack.com/how-javascript-works-inside-the-v8-engine-5-tips-on-how-to-write-optimized-code-ac089e62b12e)

JavaScript 引擎的具体实现既可以是一个标准的解释器，也可以是一个将 JavaScript 代码编译为某种形式字节码（bytecode）的实时编译器
以下为一些流行的 JavaScript 引擎：

- V8：open source, developed by Google, written in C++
- Rhino：managed by the Mozilla Foundation, open source, developed entirely in Java
- SpiderMonkey：the first JavaScript engine, which back in the days powered Netscape Navigator, and today powers Firefox
- JavaScriptCore：open source, marketed as Nitro and developed by Apple for Safari
- KJS：KDE’s engine originally developed by Harri Porten for the KDE project’s Konqueror web browser
- Chakra (JScript9)：Internet Explorer
- Chakra (JavaScript)：Microsoft Edge
- Nashorn, open source as part of OpenJDK, written by Oracle Java Languages and Tool Group
- JerryScript：is a lightweight engine for the Internet of Things.

其中 V8 引擎由 Google 开发并开源，其以 C++ 写成，被用于 Chrome 和 Node.js 运行时中。出于执行性能考虑，V8 通过实现 JIT（Just-In-Time）编译器（compiler）直接将 JavaScript 代码转换为机器码，而非使用解释器。V8 不产生字节码或任何形式的中间码

V8 在 5.9 版本发布前（发布于 2017 年初）使用了两个编译器：

- full-codegen：一个简单、快速的编译器，用以生成简单、（执行）相对较慢的机器码
- Crankshaft：一个更复杂（Just-In-Time）的优化编译器以生成高度优化的机器码

V8 引擎也在内部使用了多个线程：

- 主线程获取代码，编译并执行
- 一个单独的编译线程，用于在主线程保持执行时优化代码
- 一个分析器线程（Profiler thread），告知运行时哪些方法耗费了大量时间，使 Crankshaft 能将其优化
- 几个用于垃圾收集器（Garbage Collector）清理内存（sweep）的线程

首次执行 JavaScript 代码时，fill-codegen 直接将解析后的代码转换为机器码，使后者能尽快被执行。
当代码运行一段时间后，分析器（Profiler）收集到足够数据以确定优化哪个方法
接着，Crankshaft 在另一个线程中开始优化，其将 JavaScript 抽线语法树（abstract syntax tree）转换为高层级的 SSA（static single-assignment）表示，也被称为 Hydrogen，并尝试优化该 Hydrogen 图（graph）。多数优化在此层级完成

## 内联化（Inlining）

第一个优化是内联尽可能多的代码。内联是将函数体直接插入到其被调用点的过程，该步骤使后续优化措施更加有效

![](https://miro.medium.com/max/691/0%2ARRgTDdRfLGEhuR7U.png)

## 隐藏类型（Hidden class）

JavaScript 是基于原型（prototype-based）的语言：没有类型，对象通过克隆来创建；JavaScript 也是一门动态编程语言，意味着可在对象实例化后轻松删减其属性

大多数 JavaScript 解释器使用即将于哈希函数的字典结构来存储对象属性值在内存中的位置，该结构使得在 JavaScript 中检索属性值的操作比在 Java 或 C# 等非动态语言中更耗费计算量（computationally expensive）
在 Java 中，所有对象属性均在编译前确定其对象布局且无法在运行时被动态删减，因此属性值或指向这些属性的指针可被存储在一片连续的内存块中并且彼此间由固定的偏移，偏移的长度可由属性类型被轻松确定。而这无法发生在 JavaScript 中，因其可在运行时改变对象属性

正因为使用字典来查找对象属性在内存中的位置非常低效，V8 使用了不同方法代替：隐藏类。隐藏类的运作类似 Java 等语言中使用的固定对象布局（classes），除了其在运行时被创建。例如：

```js
function Point(x, y) {
	this.x = x;
	this.y = y;
}
var p1 = new Point(1, 2);
```

当执行到 `new Point(1,2)` 时，V8 会创建一个隐藏类 C0

![](https://miro.medium.com/max/945/1%2ApVnIrMZiB9iAz5sW28AixA.png)

此时 Point 对象尚未被定义属性，所以 C0 暂时是空的

当执行到 Point 函数内的 `this.x = x` 时，V8 会基于 C0 创建第二个隐藏类 C1，用于描述属性 x 在内存中的位置（相对于对象指针）。在此例中，x 被存储在偏移位（offset） 0，意味着在内存中将 Point 对象视为连续缓存区时，其第一个偏移位将对应属性 x。V8 同样会将 point 对象的隐藏类从 C0 更新到 C1

![](https://miro.medium.com/max/945/1%2AQsVUE3snZD9abYXccg6Sgw.png)

<small>每当新属性被添加到对象时，老的隐藏类指向会被转换为新的（update with a transition path to the new hidden class）。隐藏类转换（hidden class transition）的重要性在于：保证以相同方式创建的对象能共享隐藏类，有添加了相同属性的，则保证前者们得到同一个新隐藏类及随附的所有优化代码</small>

当执行到 `this.y = y` 时，以上过程又会重复一遍。新隐藏类 C2 被创建，类型转换：当属性 y 被添加到 Point 对象时，后者的隐藏类从 C1 更新到 C2

![](https://miro.medium.com/max/945/1%2AspJ8v7GWivxZZzTAzqVPtA.png)

隐藏类转换受属性添加顺序的影响。观察以下代码：

```js
function Point(x, y) {
	this.x = x;
	this.y = y;
}

var p1 = new Point(1, 2);
p1.a = 5;
p1.b = 6;

var p2 = new Point(3, 4);
p2.b = 7;
p2.a = 8;
```

以上例子中，p1 和 p2 并不共享隐藏类，由于二者 a、b 属性添加的顺序不同，因此不同类型转换为二者生成不同的隐藏类。再此类情况下，最好以相同顺序初始化动态属性，以便隐藏类的复用

## 内联缓存（inline caching）

V8 引入的另一项动态类型语言优化技术，被称为内联缓存，其依赖于一项观察结果：对相同方法的重复调用倾向于发生在同一类型对象上。对该技术的深入解析可参见[此文](https://github.com/sq/JSIL/wiki/Optimizing-dynamic-JavaScript-with-inline-caches)

本文将探讨内联缓存的总体概念（考虑到读者可能没时间过完上述深入解析）

其工作原理在于：V8 持久化（maintain）了近期函数调用中实参对象的类型缓存，并假设接下去的函数调用仍将用到该类型的对象。若该假设正确，则可绕过获取该对象属性的过程（参见上文，获取动态语言对象属性值非常消耗，因而 V8 使用了隐藏类优化），而使用之前查找其隐藏类时缓存的信息

隐藏类和内联缓存两概念相关联的点在于：每当在特定对象上调用方法时，V8 都要在其隐藏类型上执行查找来确定相应方法属性的偏移（offset）。在对同一隐藏类上相同方法做两次调用后，后续 V8 将不再对其进行查找，而是简单地将该属性偏移添加到对象指针本身。后续对该方法的所有调用，V8 假设该隐藏类不再变化，并利用先前查找中缓存的偏移直接跳转到指定属性的内存地址上，这极大提升了执行效率

内联缓存也是同类型对象共享相同隐藏类的原因。若创建的两个相同对象有不同的隐藏类（如前例中提到的），V8 将无法使用内联缓存，因为虽然此二者类型相同，但各自的隐藏类为其属性指定了不同的偏移

![](https://miro.medium.com/max/945/1%2AiHfI6MQ-YKQvWvo51J-P0w.png)
<small>此二对象基本相同，但属性 a、b 以不同顺序创建</small>

## 编译为机器码（Compilation to machine code）

一旦 Hydrogen 图优化完成，Crankshaft 将其降为一个低层级的表述，被称为 Lithium

Lithium 在最后被编译为机器码，接着 OSR（on-stack replacement）开始发生。在开始编译并优化高耗时方法前，该方法可能正在被执行，V8 不会忘记已（缓慢）执行过的部分，而让优化后的代码重新执行一遍，而是转换所有的上下文（stack、register）以便可在执行过程中就切换到优化后的版本。这是一项非常复杂的任务，要考虑到除其他优化外，V8 在最初已将代码内联化。V8 并非唯一能够执行此操作的引擎

有一个被称为 deoptimization 的保障措施来做相反的转换以回滚到之前非优化版本代码，以防引擎所作的假设（参考前文）不再成立

## 垃圾收集（Garbage collection）

关于垃圾收集，V8 使用传统的标记-清除（nark-and-sweep）法来清理内存。标记阶段会中止 JavaScript 的运行，为控制 GC 成本并使执行更加稳定，V8 使用增量标记法（incremental marking）：不遍历整个堆（walking the whole Heap），而试图标记每个可能的对象，这只会遍历部分堆，接着恢复正常执行。下一个 GC 点将会从上次堆遍历中止处开始。这使得执行中的暂停非常短暂，先前也提及，清理阶段是在独立线程中执行的

## Ignition and TurboFan

随着 V8 5.9 版本在 2017 年早期的发布，一条新的执行管线被引入。在现实 JavaScript 应用中，该管线取得了更大的性能提升和显著的内存节省

该管线建立在 Ignition —— V8 的解释器，以及 TurboFan —— V8 最新的优化编译器上

你可从 [这里](https://v8.dev/blog/launching-ignition-and-turbofan) 查看 V8 团队关于此专题的博文

自 V8 5.9 版本发布后，full-codegen 和 Crankshaft （自 2010 年开始使用）已不再被用于 JavaScript 的执行，原因在于 V8 团队要努力跟进新的 JavaScript 语言功能以及为这些功能所做的优化

这意味着接下来 V8 将更简单和更具结构可维护性

![](https://miro.medium.com/max/864/0%2ApohqKvj9psTPRlOv.png)

这些提升只是开始，新的 Ignition 和 TurboFan 管线将会为未来的优化铺平道路，使得未来几年内 JavaScript 的性能继续提升，并缩减 V8 在 Chrome 和 Node.js 中的覆盖面

最后，有一些关于编写良好优化的 JavaScript 代码的提示和建议。虽然可以轻易从上文中推导出来，但为方便期间，以下是一些总结：

## 如何编写优化的 JavaScript

1. **对象属性的顺序**：为了使隐藏类和随后的优化代码能被共享，总是以相同顺序初始化对象属性
2. **动态属性**：在对象实例化后再添加属性会导致隐藏类改变并减慢之前为隐藏类所优化的方法，所以要在对象构造函数中为其所有属性赋值
3. **方法**：重复执行相同方法的代码会比一次执行多个不同方法的代码更快（因为内联缓存）
4. **数组**：避免使用非递增数字键的稀疏数列，没有足够元素的稀疏数组本质是一个哈希表（hash table），访问其中的元素成本更昂贵。同样的，避免预分配长数组，最好是随着使用而递增。最后，不要删除数组中的元素，这会让键稀疏
5. **标记值**：V8 使用 32 位来表示对象和数字，用 1 位来标识是对象（flag=1）还是整数（flag =0），后者也被称为 SMI（SMall Integer）因为其只有 31 位。若数字大于 31 位 ，V8 会将其装箱：先转为浮点数（double），再创建一个新对象来放置将该数字。尽可能使用 31 位有符号数字以避免昂贵的装箱操作
