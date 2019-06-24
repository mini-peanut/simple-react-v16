<h1 align="center">React协调机制</h1>
通过上一节，我们创建了一颗Fiber树，但也由此引发了一系列问题，比如

- 创建的是current树，workInProgress树在哪？如何创建的？
- 创建之后又是如何进行对比分析得出差异的呢
- 得到差异后又是如何应用到dom上的呢
- ......

而这些工作都统一由React的协调机制（reconciliation）来完成，而具体的过程是怎么样的呢？

![](../assets/listen-to-me.jpg)



## workInProgress树的创建过程

当 React 遍历 `current` 树时，对于每个**现有的**Fiber 节点，React 会创建一个构成 `workInProgress` 树的备用节点，这一节点会使用 render 方法返回的 React 元素中的数据来创建。处理完更新并完成所有相关工作后，React 将准备好一个备用树以刷新到屏幕。一旦这个 `workInProgress` 树在屏幕上呈现，它就会变成 `current` 树。

初次看到这段话的朋友可能会有点蒙圈，但是不要慌，之所以比较难以理解，是因为缺少了一些比较重要的概念，我们一步步来，到文章介绍时再回头看上面这段话，相信能有帮助

## 详细版

> React 会创建一个构成 `workInProgress` 树的备用节点

通过上一节我们知道，current树只负责美美哒地展示就可以了，而workInProgress树相当于是它的一个分身，背地里默默化好妆，最后一下直接应用到current树上，这个过程的源码在[createWorkInProgress](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiber.js#L381)中，我们这里还是来一段简单的

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

<hr />

> 处理完更新并完成所有相关工作后，React 将准备好一个备用树以刷新到屏幕。

相信刚看完这话的时候，就有点蒙圈了，什么叫处理完更新，怎么处理的，又到底什么叫做相关工作，备用树又是怎么刷新到屏幕上的，一系列的问题接踵而至

![](../assets/cute.png)



不要慌，在解释这几个问题之前，我们先了解一个概念，副作用（effect），我们还是以前端程序员的视角来看这两个东西。

所谓[副作用](https://zh-hans.reactjs.org/docs/hooks-overview.html#effect-hook)，可以先简单粗暴地理解为DOM更新，FiberNode中有一个属性effectTag被用来标识是那种类型的副作用，其枚举值源码在[这里](https://github.com/facebook/react/blob/504576306461a5ff339dc99691842f0f35a8bf4c/packages/shared/ReactSideEffectTags.js)查看，这里就挑两个作为示例

```js
const Placement = /*             */ 0b000000000010;
const Update = /*                */ 0b000000000100;
const PlacementAndUpdate = /*    */ 0b000000000110;
```

读者同学可能会发现，这个值好像和长得有点特殊，为什么是用二进制来表示？其实，这里是用了一种[复合类型方案的设计](https://segmentfault.com/a/1190000016284033)，通过使用位运算，能够使我们很快地对副作用进行**增删改查**，有兴趣的朋友可以自己下来详细了解下，这里就不再过多赘述

那我们现在知道了effectTag这两概念，有什么用呢？

用处可大了，事实上副作用也是一个链表，一个链一个，React 处理更新的素对非常迅速，为了达到这种水平的性能，它采用了一些有趣的技术。**其中之一是构建具有副作用的 Fiber 节点的线性列表，从而能够快速遍历。**遍历线性列表比树快得多，并且没有必要在没有副作用的节点上花费时间。

Dan Abramov 为副作用列表提供了一个类比。他喜欢将它想象成一棵圣诞树，「圣诞灯」将所有有效节点捆绑在一起。为了使这个可视化，让我们想象如下的 Fiber 节点树，其中标亮的节点有一些要做的工作。例如，我们的更新导致 `c2` 被插入到 DOM 中，`d2` 和 `c1` 被用于更改属性，而 `b2` 被用于触发生命周期方法。副作用列表会将它们链接在一起，以便 React 稍后可以跳过其他节点：

![](../assets/patchEffect.png)



所以，到这里就好理解了，前面所说的相关工作，其实就在于构建出这么一个线性列表



## Diff过程

怎么做diff呢，我们先来看一下官网的[说法](https://zh-hans.reactjs.org/docs/reconciliation.html#elements-of-different-types)，可以得知两个结论

- 比对不同类型的元素，React 会拆卸原有的树并且建立起新的树
- 当比对两个相同类型的 React 元素，React 会保留 DOM 节点，仅比对及更新有改变的属性。
- 比对同类型的组件元素，组件实例保持不变，调用componentWillReceiveProps()` 和 `componentWillUpdate()方法，接着调用 `render()` 方法，diff 算法将在之前的结果以及新的结果中进行递归



橙色代表有需要更新的节点

这里需要提到的是，React能够非常快速地更新，并且为了实现高性能，它采用了一些有趣的技术。其中之一是构建带有side-effects的fiber节点的线性列表，其具有快速迭代的效果。迭代线性列表比树快得多，并且没有必要在没有side effects的节点上花费时间。

未完待续。。。。
