<h1 align="center">React协调机制</h1>

通过上一节，我们创建了一颗Fiber树，但也由此引发了一系列问题，比如

- 创建的是current树，workInProgress树在哪？
- workInProgress树是何时创建的，如何创建的？
- 创建之后又是如何进行对比分析得出差异的呢
- 得到差异后又是如何应用到dom上的呢
- ......

而这些工作都统一由React的协调机制（reconciliation）来完成，而具体的过程是怎么样的呢？

![](../assets/listen-to-me.jpg)

## workInProgress树的创建过程

首先，workInProgress树是基于current树来创建的，所以自然是需要等到current树创建完事之后，再创建，源码在[createWorkInProgress](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiber.js#L381)中，我们这里还是来一段简单的

还是用一段代码来说明

```js
/**
* @param current current树
* @param pendingProps 即将要更新的属性，最开始创建dom的时候，这个就是react元素的props
* @returns {*|FiberNode}
*/
function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate
  
  if (workInProgress === null) {
    workInProgress = new FiberNode(current.tag, pendingProps)
    
    // 下面这些属性，赋予一次就够了，所以不放到if的外层
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode
    
    // 这里将current树和workInProgress连接起来
    workInProgress.alternate = current
    current.alternate = workInProgress
  }
  
  // 将current树上的一些属性赋值到workInProgress上
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  workInProgress.sibling = current.sibling
  
  return workInProgress
}
```

未完待续.......
