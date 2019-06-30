<h1 align="center"> React副作用 </h1>

React副作用（effect），我们以程序员的视角来看这两个东西。

所谓[副作用](https://zh-hans.reactjs.org/docs/hooks-overview.html#effect-hook)，其实也是fiber，它会通过一个属性effectTag来标识是那种类型的副作用，其枚举值源码在[这里](https://github.com/facebook/react/blob/504576306461a5ff339dc99691842f0f35a8bf4c/packages/shared/ReactSideEffectTags.js)查看，这里就挑几个作为示例

```js
const NoEffect = /*              */ 0b000000000000;	// 0
const PerformedWork = /*         */ 0b000000000001; // 1

const Placement = /*             */ 0b000000000010; // 2
const Update = /*                */ 0b000000000100; // 4
const PlacementAndUpdate = /*    */ 0b000000000110; // 6
const Deletion = /*              */ 0b000000001000; // 8
```

读者同学可能会发现，这个值好像和长得有点特殊，为什么是用二进制来表示？细心发现，这里每一个1的位置都不一样，其实，这里是用了一种[复合类型方案的设计](https://segmentfault.com/a/1190000016284033)，每个1的位置代表了一种属性，组合起来就代表了多种属性，通过使用位运算，能够使我们很快地对副作用进行增删改查

React 处理更新非常迅速，为了达到这种水平的性能，它采用了一些有趣的技术。**其中之一是构建具有副作用的 Fiber 节点的线性列表，从而能够快速遍历。**遍历线性列表比树快得多，并且没有必要在没有副作用的节点上花费时间。

Dan Abramov 为副作用列表提供了一个类比。他喜欢将它想象成一棵圣诞树，「圣诞灯」将所有有效节点捆绑在一起。为了使这个可视化，让我们想象如下的 Fiber 节点树，其中标亮的节点有一些要做的工作。我们将需要做的任务通过一根线串起来，等到真正要执行的时候，我们从a1开始，将任务一个接一个地拿出来做

![](/Users/huax/workspace/simple-react-v16/assets/patchEffect.png)

React通过firstEffect指针来确定列表的起始位置，之后通过nextEffect属性将每个effect连接在一起，如下

![](/Users/huax/workspace/simple-react-v16/assets/effect-list.png)



effect是如何生成的呢？当我们拿当前树和工作树对比的时候，首先会得知道是什么

当我们某一个节点发生改变的时候，我们先判断firstEffect有没有值，如果没有，