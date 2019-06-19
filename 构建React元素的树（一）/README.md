## 构建React元素的树（一）

我们先来回顾一下 [上一节](../实现ReactDOM.render/README.md) 最后提到的一个问题

> 如果组件有一个状态改变了，是否要将整个应用重新渲染一遍？能否精准找到需要修改的dom，然后再进行性能消耗最小的更新呢？

要想实现这个功能，我们需要**两颗更加完善的树**，一棵树叫**current**，表示目前页面的状态，另一棵树叫**workInProgress**，它身上，保存着即将应用到页面的状态

树由节点构成，这个节点被称之为fiber，作为一种数据结构，可以先看看人家长什么样子，我挑选了一些目前我认为很有必要知道的一些属性罗列了下来

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
  * 前面说过，我们需要有两棵树进行比对，事实上，每一个节点都有“双生子”，也同样分为current节点和workInprogress节点， 它们通过alternate连接起来，
  * 也就是说current.alternate等于workInProgress，而workInprogress.alternate即current
  */
  this.alternate = null
  
  /**
  * return，child 和 sibling 这三个属性构造了一颗fiber树
  */
  this.return = null
  this.child = null
  this.sibling = null
}
```
React为每个React元素创建了一个fiber node，并且因为我们有一个这些**元素的树**，所以我们将拥有一颗fiber node树
![](../assets/fiberTreeNodes.png)

需注意的是根元素，除fiber中的属性外，还需要一些额外的属性，简化之后如下，我们通过实例化下面的构造函数来得到相关属性

```js
function FiberRootNode(containerInfo) {
  	// 当前fiber节点
    this.current = null;
  	// 根DOM节点， 即传入ReactDOM.render的第二个参数container
    this.containerInfo = containerInfo;
}
```

现在，我们来实现一下，根据react元素的树，来创建fiber node 树。建树，先从根节点建起。

```js
const ClassComponent = 2;
const HostRoot = 5;
const HostComponent = 7;

function createFiberRoot (containerInfo) {
  /**
  * 创建根fiber的实例，注意root并非一个fiber，root.current才是fiber
  */
  const root = new FiberRootNode(containerInfo);
  /**
  * 创建根fiber节点
  */
  const uninitializedFiber = new FiberNode(HostRoot);
  
  /**
  * 由构造函数FiberRootNode的注释，可知current代表着当前的fiber节点，赋予之
  */
  root.current = uninitializedFiber
  /**
  * 根据构造函数FiberNode中的注释，可知根fiber节点的stateNode是FiberRoot的实例，赋予之
  */
  uninitializedFiber.stateNode = root
  
  return root
}
```

未完待续….
