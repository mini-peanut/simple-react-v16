## 构建React元素的树（一）

我们先来回顾一下 [上一节](../实现ReactDOM.render/README.md) 最后提到的一个问题

> 如果组件有一个状态改变了，是否要将整个应用重新渲染一遍？能否精准找到需要修改的dom，然后再进行性能消耗最小的更新呢？

要想实现这个功能，我们需要**两颗更加完善的树**，一棵树叫**current**，表示目前页面的状态，另一棵树叫**workInProgress**，在它身上，保存着即将应用到页面的更新

树由节点构成，这个节点被称之为fiber，这个fiber非常强大，其包含了React元素的作用，生命周期方法和渲染方法，以及应用于组件子元素的diffing算法等相关内容，同时提供了一种跟踪，调度，暂停和中止工作的便捷方式。

嗯，等一下

![](../assets/black.jpeg)

好吧，我知道这样很难理解，我们一步一步来，首先，作为一种数据结构，到底长什么样子呢，我挑选了一些目前我认为很有必要知道的一些属性罗列了下来

```js
function FiberNode (tag, pendingProps) {
  /**
  * 节点可以是自定义组件<HelloWorld>，原生节点<div>。也可以是根节点HostRoot
  * 因此fiber也有不同的类型，用tag表示，为简化，只支持ClassComponent，HostRoot，HostComponent三个类型，其中
  * ClassComponent表示用户自定义的 class 组件的 fiber，
  * HostRoot表示根节点的 fiber，即调用ReactDOM.render时传入的第二个参数 container。
  * HostComponent表示原生节点的 fiber，如<div>
  */
  this.tag = tag
  
  /** 
  * 原生节点的type是标签类型，如div的type就是'div'
  * 根节点的type是null
  * class组件的type是它的构造函数
  */
  this.type = null
  
  /**
  * 原生节点的stateNode是其真实dom
  * 根节点的stateNode是FiberRoot的实例，FiberRoot我们等一会讲
  * class组件的stateNode是组件类的实例
  */
  this.stateNode = null
  
  /**
  * return，child 和 sibling 这三个属性构造了一颗fiber树。如下图
  */
  this.return = null
  this.child = null
  this.sibling = null
  
  /**
  * 前面说过，我们需要有两棵树进行比对，事实上，每一个节点都有“双生子”，也同样分为current节点和workInprogress节点， 它们通过alternate连接起来，
  * 也就是说current.alternate等于workInProgress，而workInprogress.alternate即current
  */
  this.alternate = null
}
```
![](../assets/fiberTreeNodes.png)

ok，现在我们就可以依据createElement返回的数据来创建fiber树了么？

![](../assets/kedaya.jpg)


未完待续….
