<h1 align="center"> 构建React元素的树（一）</h1>
先来回顾一下 [上一节](../React组件/README.md) 最后提到的一个问题

> 如果组件有一个状态改变了，是否要将整个应用重新渲染一遍？能否精准找到需要修改的dom，然后再进行性能消耗最小的更新呢？

要想实现这个功能，我们需要**两颗更加完善的树**，一棵树叫**current**，表示目前页面的状态，另一棵树叫**workInProgress**，它身上，保存着即将应用到页面的状态

树由节点构成，这个节点被称之为fiber，作为一种数据结构，可以先看看人家长什么样子，我挑选了一些目前我认为很有必要知道的一些属性罗列了下来
## Fiber节点
```js
/**
 *
 * @param tag 定义fiber的类型。它在调和算法中用于确定需要完成的工作，工作取决于React元素的类型，为简化，仅介绍以下三个fiber类型
 *    - ClassComponent: 表示用户自定义的 class 组件的 fiber，
 *    - HostRoot:       表示根节点的 fiber，即调用ReactDOM.render时传入的第二个参数 container。
 *    - HostComponent:  表示原生节点的 fiber，如<div>
 *
 * @param pendingProps  已从 React 元素中的新数据更新并且需要应用于子组件或 DOM 元素的 props。
 * @constructor
 */
function FiberNode (tag, pendingProps) {
    /**
     * 参照params参数定义
     */
    this.tag = tag;
    /**
     * 原生节点的type是标签类型，如div的type就是'div'
     * 根节点的type是null
     * class组件的type是它的构造函数
     */
    this.type = null;

    /**
     * 原生节点的stateNode是其真实dom
     * 根节点的stateNode是FiberRoot的实例，FiberRoot我们等一会讲
     * class组件的stateNode是组件类的实例
     */
    this.stateNode = null;

    /**
     * 前面说过，我们需要有两棵树进行比对，事实上，每一个节点都有“双生子”，也同样分为current节点和workInprogress节点， 它们通过alternate连接起来，
     * 也就是说current.alternate等于workInProgress，而workInprogress.alternate即current
     */
    this.alternate = null;

    /**
     * 参照params参数定义
     */
    this.pendingProps = pendingProps;
    /**
     * 在前一个渲染中用于创建输出的 Fiber 的 props
     */
    this.memoizedProps = null;

    /**
     * return，child 和 sibling 这三个属性构造了一颗fiber树
     */
    /**
     * 该fiber的父节点
     * @type {null}
     */
    this.return = null;
    /**
     * 该fiber的第一个子节点，注意是第一个
     * @type {null}
     */
    this.child = null;
    /**
     * 该fiber的下一个兄弟节点
     * @type {null}
     */
    this.sibling = null;
}
```
React为每个React元素创建了一个fiber node，并且因为我们有一个这些**元素的树**，所以我们将拥有一颗fiber node树
![](../assets/fiberTreeNodes.png)



## Fiber容器

React为每个dom容器创建一个了一个Fiber容器FiberRoot，FiberRoot 保存了当前fiber树，以及dom容器等顶级元素

```js
function FiberRootNode(containerInfo) {
  	// 当前fiber树的顶级节点
    this.current = null;
  	// 当前dom树的顶级容器节点，即传入ReactDOM.render的第二个参数container
    this.containerInfo = containerInfo;
}
```

## 构建Fiber树
### 创建根节点

现在，我们开始创建fiber树。建树，先从根节点建起。fiber 树以特殊类型的fiber节点（HostRoot）开始。它在内部创建并充当最顶层组件的父级

```js
const ClassComponent = 2;
const HostRoot = 5;
const HostComponent = 7;
/**
 * @param containerInfo 真实dom容器
 * @returns {FiberRootNode}
 */
function createFiberRoot (containerInfo) {
    /**
     * 创建fiber容器，注意这是一个容器而并非一个fiber，root.current才是fiber
     */
    const root = new FiberRootNode(containerInfo);
    /**
     * 创建顶层fiber节点，HostRoot
     */
    const uninitializedFiber = new FiberNode(HostRoot);

    /**
     * 将fiber树的顶层节点赋予Fiber容器的current属性
     */
    root.current = uninitializedFiber;
    /**
     * 根据构造函数FiberNode中的注释，可知顶层fiber节点的stateNode是FiberRoot的实例，赋予之
     */
    uninitializedFiber.stateNode = root;

    return root
}
```

### 创建子节点

接下来根据createElement返回的数据来创建fiber，react源码在[createFiberFromTypeAndProps](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L414)中，我们可以来实现一个简单版本，将主干逻辑梳理出来

```js
/**
* class组件会继承自React.Component组件，而React.Component上会挂载isReactComponent这个属性
* 所以如果你写了一个class组件ClickCounter，访问ClickCounter.prototype.isReactComponent会得到true
*/
function shouldConstruct(Component: Function) {
  const prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

const FunctionComponent = 0; // JavaScript函数组件
const ClassComponent = 1;    // ES6的class组件
const IndeterminateComponent = 2; // 目前还不知道是JavaScript函数还是ES6的class
const HostComponent = 5;     // 原生dom组件

function createFiberFromTypeAndProps (type, props) {
  /**
  * 先根据type判断这是一个什么类型的组件
  * class组件的type是其构造函数，hostComponent的type是标签类型，如<div></div>的type是‘div’
  */
  let fiberTag = IndeterminateComponent
  
  if (_.isFunction(type) && shouldConstruct(type)) {
    fiberTag = ClassComponent
  }
  
  if (_.isString(type)) {
    fiberTag = HostComponent
  }
  /**
  * 根据fiberTag创建fiber
  */
  const fiber = new FiberNode(fiberTag, props)
  fiber.type = type
  
  return fiber
}
```

### 构建Fiber树

现在我们能够创建根节点和子节点了，需要做的就是遍历react元素的树，使用fiber节点上的以下属性：child，sibling和return来构成一个fiber node的linked list(链表)

这里我们需要知道几个知识点

#### 调和（reconciliation）

React是一个用于构建UI的JavaScript库，其[核心](https://link.zhihu.com/?target=https%3A//medium.freecodecamp.org/what-every-front-end-developer-should-know-about-change-detection-in-angular-and-react-508f83f58c6a)是跟踪组件状态变化并将更新到view上。在React中，我们将此过程视为调和**reconciliation**

#### 工作 (work)

React会在**调和**期间执行各种活动。例如，以下是React在上面这个程序中第一次渲染和状态更新之后执行的高级操作：

1. 更新state中的count属性
2. 检索并比较ClickCounter子组件以及props
3. 更新span元素的props

同时，在调和期间，还会执行其他活动包括[调用生命周期方法](https://link.zhihu.com/?target=https%3A//reactjs.org/docs/react-component.html%23updating)或[更新引用](https://link.zhihu.com/?target=https%3A//reactjs.org/docs/refs-and-the-dom.html)。所有这些活动在fiber架构中统称为“work”。

**work类型通常取决于React元素的类型**。例如，对于class组件，React需要创建实例，而不是为function组件执行此操作。

#### 开始工作（beginWork）

由于我们只重点研究ClassComponent，HostRoot，HostComponent这三个fiber类型，所以我们也只需实现这三个不同类型的work就可以了

```js
/**
 * 根据tag的类型，不断构建子节点
 * @param current 当前树
 * @param workInProgress 工作树
 * @returns {FiberNode|*}
 */
function beginWork (current, workInProgress) {
    workInProgress.expirationTime = NoWork;
    const Component = workInProgress.type;
    const unresolvedProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
        case ClassComponent: {
            return updateClassComponent(current, workInProgress, Component, unresolvedProps)
        }
        case HostRoot: {
            return updateHostRoot(current, workInProgress)
        }
        case HostComponent: {
            return updateHostComponent(current, workInProgress)
        }
        default:
            throw new Error('unknown unit of work tag')
    }
}
```

在下一节，我们重点讲一下这三个work的实现

[上一节：React组件](../React组件/README.md)