## 实现React.createElement

大家都知道，组件由元素构成，react的元素叫做react-element，我们这一节主要讨论以下几点

- 什么是react元素
- react元素被创建的过程是怎样的
- react元素是什么时候被创建的

### 什么是react元素

我们首先来看官方的定义

> 元素是构成 React 应用的最小块 它描述了你在屏幕上想看到的内容。
>
> ```js
> const element = <h1>Hello, world</h1>
> ```
>
> 与浏览器的 DOM 元素不同，React 元素是创建开销极小的普通对象。React DOM 会负责更新 DOM 来与 React 元素保持一致。

可以知道 ```<h1>Hello, world</h1>``` 这一段其实就是一个react元素，表面上看它像一个dom，但注意其中有一句是，**React 元素是创建开销极小的普通对象**，再精简一下就是  

**React 元素是对象**

这个时候，有些朋友就有点懵了，这对象怎么长得和其他的不太一样啊，我们js的对象不是 一对花括号吗？ 

事实上，这只是一个障眼法，```<h1>Hello, world</h1>```，这一段是jsx，jsx经过编译过后，就是一个对象，大概长成下面这样

```js
const element = {
  $$typeof: Symbol.for('react.element'),
  type: 'h1',
  props: {
    children: 'Hello, world'
  }
}
```

总结一下就是

**react-element是构成 React 应用的最小块，具体来讲就是像上面一样的一个对象**

### react元素被创建的过程是怎样的

既然我们知道了react-element是一个对象，那么它是被怎么创建的呢，创建对象的方式有很多种，Object.create, 通过对象字面量，new等等，react是通过调用函数createReactElement来返回的，如下

```js
const createElement = function(props) {
  // 对props做一些处理，返回下面这样一个对象
    return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        props: props
    };
};
```

### react元素是什么时候被创建的

前面我们知道，react-element是jsx经过编译过后产生的对象，那么这一步是怎么完成的呢？我们还是以```<h1>Hello, world</h1>```举例，事实上，这一段经过babel编译过后生成的是

```js
React.createElement("h1", null, "Hello world!");
```

调用了createElement这个方法后就生成了我们前面看到的js对象

```js
const element = {
  $$typeof: Symbol.for('react.element'),
  type: 'h1',
  props: {
    children: 'Hello, world'
  }
}
```



[文中代码链接](./lesson1/ReactElement.js)

[下一节](./实现ReactComponent.md)

