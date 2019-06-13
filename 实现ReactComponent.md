## 实现ReactComponent

通过[上一节](./实现ReactElement.md)我们知道，元素构成组件，那么组件又是什么呢，这一节我们主要讨论以下几点

- 什么是react组件
- react组件有什么功能
- react组件是如何被创建的

### 什么是react组件

来自官网的定义

> 组件，从概念上类似于 JavaScript 函数。它接受任意的入参（即 “props”），并返回用于描述页面展示内容的 React 元素。

精简一下，就是，react组件是函数，接收入参并返回元素，用代码表示就是

```js
const HelloWorld = _ => <div>Hello world!</div>
```

那么，HelloWorld就是一个组件，就是这么简单

### react组件有什么功能

首先需要知道的是，react组件分为函数式组件和class组件，它们的最大的区别在于，函数式组件没有**内部状态**，没有**生命周期**，而class组件有

对于函数式组件，其实就是定义一个函数，根据入参返回一堆react元素就行了，这里并不需要react额外处理什么

而class组件会有以下这些功能

1. 继承React.Component或者React.PureComponent的组件会拥有一个setState方法，调用这个函数后会改变组件的state值，并触发真实dom更新
2. 有生命周期方法，在组件的各个阶段依次执行

### react组件是如何被创建的

#### 实现setState

我们先来看第一点

> 继承React.Component的组件或者React.PureComponent的组件会拥有一个setState方法，调用这个函数后会改变组件的state值，并触发真实dom更新

我们以以下这个组件作为例子

```js
class AddCount extends React.component {
  state = {count: 1},
  addCount = _ => this.setState({count: this.state.count + 1})
  render () {
    return (
      <>
        <div>{this.state.count}</div>
        <button onClick={this.addCount}>+1</button>
      </>
    )
  } 
}
```

点击按钮，调用this.setState，改变state的值，并且页面的dom随之更新

首先setState肯定是React.component的原型方法，我们不可能凭空调用它，现在我们根据以上功能，来实现一个简单的React.Component

```js
function Component(props) {
  this.props = props;
}
Component.prototype.setState = function(partialState) {
  this.state = {...this.state, ...partialState}
};
```

这样，状态是改变了，怎么更新dom呢？

![](./lesson2/assets/楞住.png)


嗯，有同学会说，调用render，然后将返回的元素转成真实dom，直接插入到父元素就ok了呗，so easy！

很好，but，这里有几个问题

1. 如何确定真实dom中的父元素
2. 如果组件有一个状态改变了，是否要将整个应用重新渲染一遍？能否精准找到需要修改的dom，然后再进行性能消耗最小的更新呢？



思考两分钟后，我们发现


1. react元素提供的属性中并没有parent，无法直接找到父元素
2. 必须要有两棵树来进行差异分析，才能够精确定位需要修改的地方，而这个我们目前也没有

![](./lesson2/assets/陷入沉思.jpg)



不要灰心，正所谓凯撒的归凯撒，上帝的归上帝，这一块我们先搁下，暂时交由react-dom模块去处理，我们目前所需要知道的是，怎么和react-dom连接起来呢？它们之前有个桥梁

**这个桥梁，就是this**

第一次实例化的时候，实例化的结果就是组件内使用的this，我们将封装成的虚拟dom节点，以及相关的更新机制挂载上去

```js
const inst = new AddCount() // 实例化
// 给实例挂载上虚拟dom节点fiber，注意这个fiber是有parent属性的
inst._reactInternalFiber = fiber
// 给实例挂上相应的更新机制
inst.updater = {
  enqueueSetState (inst, payload) {
      // 根据自身实例获取当前组件的虚拟dom节点 fiber
      const fiber = inst._reactInternalFiber
      
      // 创建一次更新
      const update = createUpdate()
      update.payload = payload
    
      // 将更新和当前的fiber入队列
      enqueueUpdate(fiber, update)
      // 执行更新
      scheduleWork(fiber, expirationTime)
  }
}
```
当调用setState的时候，setState就可以直接通过this.updater.enqueueSetState来更新dom

```js

/**
* 调用setState的时候，直接取updater里的enqueueSetState方法，传入this和待更新的state，触发更新
*/
Component.prototype.setState = function(partialState) {
  this.updater.enqueueSetState(this, partialState)
};

```

#### 实现生命周期

根据上面可知，生命周期必然也是react-dom控制的，因此只要在自身组件上写好生命周期函数，到了相应的时间点，react-dom 通过之前传入的this 找到这个组件对应的生命周期函数，直接调用就可以了，具体细节，我们在后面讲到react-dom的时候再详谈

[文中代码链接](./lesson2/ReactComponent.js)

[上一节：实现ReactElement](./实现ReactElement.md) [下一节：构建虚拟DOM树](./构建虚拟DOM树.md)

