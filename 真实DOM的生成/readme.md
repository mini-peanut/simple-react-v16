<h1 align="center">React协调机制</h1>
通过上一节，我们创建了一颗Fiber树，但也由此引发了一系列问题，比如

- 创建的是current树，workInProgress树在哪？如何创建的？
- 创建之后又是如何进行对比分析得出差异的呢
- 得到差异后又是如何应用到dom上的呢
- ......

而这些工作都统一由React的协调机制（reconciliation）来完成，而具体的过程是怎么样的呢？

![](../assets/listen-to-me.jpg)

首先我们来了解另外一棵树，workInProgress的创建过程

## 创建工作树

当 React 遍历 `current` 树时，对于每个**现有的**Fiber 节点，React 会[创建](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiber.js#L381)一个构成 `workInProgress` 树的备用节点，这一节点会使用 render 方法返回的 React 元素中的数据来创建。处理完更新并完成所有相关工作后，React 将准备好的备用树刷新到屏幕。一旦这个 `workInProgress` 树在屏幕上呈现，它就会变成 `current` 树。

对于workInProgress的创建过程，源代码在[createWorkInProgress](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiber.js#L381)，我们来实现一个简单的版本

```js
function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate
  
  if (workInProgress === null) {
    workInProgress = new FiberNode(current.tag, pendingProps)
   
    // 这里将current树和workInProgress连接起来
    workInProgress.alternate = current
    current.alternate = workInProgress
  }
  
  // 将current树上的一些属性赋值到workInProgress上
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  // ...
  
  return workInProgress
}
```

可以看到，其实就是创建一个fiber节点后，将current树的属性依次赋值过去，然后通过alternate属性将两棵树连接起来，

在项目最开始的时候，current树是空的，我们基于current树创建一颗同样是空的workInProgress树，然后这再使用 render 方法返回的 React 元素中的数据来更新workInProgress树



## dom树与fiber树的创建时机

现在我们我们已经创建了两颗fiber树，但是dom树的创建过程与时机却不太了解，fiber与真实dom的关系是怎样的呢，我们以这样一段jsx为例子，先来看看dom和fiber的创建时机是怎样的

```js
render() {
  return [
    <button key="b1" id="b1" onClick={_ => this.handleClick()}>点击按钮+1</button>,
  	<div key="b2" id="b2"><span id="c1"><b id="d1">{this.state.count}</b></span></div>,
    <div key="b3" id="b3"><span id="c2">{this.state.count}</span></div>
  ]
}
```

react-dom.development.js在9012行createElement 方法中执行创建dom的操作，在22961行执行创建fiber的操作，我们分别在以下位置打印以下信息将流程梳理出来

```js
9012:  console.log('createElement: ', type, props)
22967: console.log('createFiber: ', element.type, element.props);
```

最终得到结果

```js
createFiber:  ƒ ClickCounter(props)
// 为所有子节点创建fiber
createFiber:  button {id: "b1", onClick: ƒ, children: "点击按钮+1"}
createFiber:  div {id: "b2", children: {…}}
createFiber:  div {id: "b3", children: {…}}

// 从第一个子节点往下走，有子元素创建fiber，没子元素创建真实dom
createElement:  button {id: "b1", onClick: ƒ, children: "点击按钮+1"}

// c1 fiber -> d1 fiber -> d1 element -> c1 elment -> b2 element
createFiber:  span {id: "c1", children: {…}}
createFiber:  b {id: "d1", children: 0}
createElement:  b {id: "d1", children: 0}
createElement:  span {id: "c1", children: {…}}
createElement:  div {id: "b2", children: {…}}

// c2 fiber -> c2 element -> b3 element
createFiber:  span {id: "c2", children: 0}
createElement:  span {id: "c2", children: 0}
createElement:  div {id: "b3" children: {…}}
```

根据上面可知，我们从上到下遍历节点，第一步先为所有的子节点创建fiber节点，第二步，从第一个子节点开始向下遍历，有子元素创建fiber，没子元素创建真实dom

react将这些真实dom节点挂载到stateNode上面，所以，当我们这一遍流程走完，fiber树构建完成后，所有的HostComponent节点上都有真实dom

**我们来接下来实现一下这个功能**

我们将每一个fiber的创建过程叫做一个单元，每创建完成一个单元，返回下一个单元的指针，这样我们就可以通过循环来完成这个功能

```js
let nextUnitOfWork = null

// 通过访问最顶端的HostRoot的fiber node来探索fiber tree
function renderRoot (root) {
  if (nextUnitOfWork === null) {
    // 首先创建workInProgress树
    nextUnitOfWork =  createWorkInProgress(root.current, null)
  }

  workLoop()
  
  root.finishedWork = root.current.alternate
}

```

**所有fiber节点都在[work loop](https://github.com/facebook/react/blob/f765f022534958bcf49120bf23bc1aa665e8f651/packages/react-reconciler/src/ReactFiberScheduler.js%23L1136)中实现**，每次循环都处理一个单元，并返回下一个单元的指针，然后继续处理下一个单元，举个例子，当b2节点往下遍历，遍历到d1时，d1的child为null，这个时候，代表b2这个节点完成了子孙节点的fiber树构建工作，这个时候，调用 ```completeUnitOfWork``方法，从d1开始，自下而上构建dom树，最后到达b2节点时，b2节点的dom树和fiber都构建完成，返回b3节点的指针，继续b3节点的子孙dom的构建工作

```js
function workLoop() {
  while (nextUnitOfWork !== null) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
}

function performUnitOfWork (workInProgress) {
  const current = workInProgress.alternate
  let next = null
  // 以b2为例，beginWork只会返回b2的子孙节点，b2的兄弟节点，由completeUnitOfWork返回
  next = beginWork(current, workInProgress, nextRenderExpirationTime)
  if (next === null) {
    next = completeUnitOfWork(workInProgress)
  }
  return next
}
```

我们看一下这个beginWork，beginWork做的事情就是自上到下构建fiber 树，为了容易理解，我们这里只实现HostComponent的工作方式，主要的实现逻辑再上一节，比较复杂，忘记的话可以再回去温故一遍

```js
function beginWork (current, workInProgress) {
  updateHostComponent(current, workInProgress)
}

function shouldSetTextContent: (props) => {
  return typeof props.children === 'string' || typeof props.children === 'number'
}
function updateHostComponent (current, workInProgress, renderExpirationTime) {
  const nextProps = workInProgress.pendingProps
  let nextChildren = nextProps.children
  const isDirectTextChild = shouldSetTextContent(nextProps)
  
  // textNode节点，说明已经到底了
  if (isDirectTextChild) {
    nextChildren = null
  }
  // reconcileChildren上一节做过详细的解释，不明白的可以回到上一节温故一下
  reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime)
  return workInProgress.child
}
```

接下来就是这个completeUnitOfWork，这个方法，自底向上构建dom节点，并依附在fiber上，来简单实现一下

```js
// 首先这个workInprogress是最底端的fiberNode，例如相对于b2的那一枝，到这里workInprogress就是底部的d1
function completeUnitOfWork (workInProgress) {
    while (true) {
      const current = workInProgress.alternate
      const returnFiber = workInProgress.return
      const siblingFiber = workInProgress.sibling
      
      // completeWork就是生成真实dom，然后挂载到fiber的stateNode上，然后
      completeWork(current, workInProgress)

      if (siblingFiber !== null) {
        return siblingFiber
      } 
      else if (returnFiber !== null) {
        workInProgress = returnFiber
        continue
      } 
      else {
        return null
      }
  }
}
```

这里面逻辑就是，从底部开始，一步步生成dom，然后返回下一个节点的指针，接下来实现一下completeWork

```js
// 为了简单理解，这里也只针对hostComponent
function completeWork (current, workInProgress) {
  const newProps = workInProgress.pendingProps
  const type = workInProgress.type
  const _instance = createInstance(type, newProps, workInProgress)
  appendAllChildren(_instance, workInProgress)
  finalizeInitialChildren(_instance, newProps)
  workInProgress.stateNode = _instance
  
  return null
}

function createInstance: (type, props, internalInstanceHandle) => {
  const domElement = document.createElement(type)
  domElement.internalInstanceKey = internalInstanceHandle
  domElement.internalEventHandlersKey = props
  return domElement
}

function appendAllChildren (parent, workInProgress) {
  let node = workInProgress.child
  while (node !== null) {
    if (node.tag === HostComponent) {
      parent.appendChild(node.stateNode)
    } else if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }
    if (node ===  workInProgress) {
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return
      }
      node = node.return
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}
```

