[文中代码链接](./index.html) | [下一节](../React组件/README.md)
<h1 align="center">React元素</h1>

大家都知道，组件由元素构成，我们这一节主要讨论以下两点

- 什么是react元素
- react元素被创建的过程是怎样的

## 准备工作

为了方便调试，我们需要在我们的[html文件](./index.html)中添加几个包

```html
<script src="../assets/react.development.js"></script>
<script src="../assets/react-dom.development.js"></script>
<script src="../assets/lodash.min.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.js"></script>
<script>
	// 这里放react，react-dom的实现代码：我们叫其开发区
</script>
<script type="text/babel">
	// 这里放我们的测试代码: 我们叫其测试区
</script>
```

当我们需要测试自己写的功能时，将react和react-dom这两个包注释掉，将开发区注释打开

当我们需要查看react已实现的功能时，将react和react-dom这两个包注释打开，将开发区注释掉

## 什么是react元素

我们首先来看官方的定义

> 元素是构成 React 应用的最小块 它描述了你在屏幕上想看到的内容。
>
> ```js
> const element = <h1>Hello, world</h1>
> ```
>
> 与浏览器的 DOM 元素不同，React 元素是创建开销极小的普通对象。React DOM 会负责更新 DOM 来与 React 元素保持一致。

可以知道 ```<h1>Hello, world</h1>``` 这一段其实就是一个react元素，表面上看它像一个dom，但注意其中有一句是，**React 元素是创建开销极小的普通对象**，再精简一下就是  **React 元素是对象**

## react元素的创建过程
这个时候，有些朋友就有点懵了，这对象怎么长得和其他的不太一样啊，我们js的对象不是 一对花括号吗？ 

我们可以打开这个[文件](./index.html)，在测试区输入```console.log(<h1 className="hello">Hello, world</h1>)``` ，看看结果是什么

```js
{type:"div",key:null,props:{className:"hello",children:"hello world"}}
```

原来，果真是一个对象，但这个对象是babel直接生成的么，我们打开[babel的官网](https://babeljs.io/repl/#?babili=false&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=GYVwdgxgLglg9mABACwKYBt1wBQEpEDeAUIogE6pQhlIA8AJjAG6IToCGAzpwHLsC2qALwByNJjgiAfAAkMWRAHc4ZdPQCEtAPSMmUgNxEAvkSA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react&prettier=false&targets=&version=7.4.5&externalPlugins=)来转一下试试

```js
const hello = React.createElement("div", { className: "hello" }, "Hello world!");
```

原来，中间还经过了react接手了一下，babel将type，key，props等等其他属性作为参数，调用React.createElement来创建了这个对象

我们这一节，就是简单来实现一下React.createElement，这一段非常简单，大家可以自己先试试.

```js
const React = {
  createElement (type, config, ...children) {
    let props = {};

    // 将第二个参数config和第三个参数children合并成一个
    if (config !== null) {
      props = _.defaultsDeep({}, config);
    }
    if (children.length >= 1) {
      props.children = children.length === 1 ? children[0] : children
    }

    return {
	type: type,
	props: props
    };
  }
}
```

