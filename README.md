<h1 align="center">simple-react-v16</h1>
<div align="center">
  learning by doing，通过实现一个简单的react-v16来学习react
</div>

## 🌱背景
很多同学都尝试学习过源码，背后的原因多种多样，有兴趣驱动，技术驱动，坑驱动，或者只是想获得一份比较满意的offer。

另外有很重要的一点是，**这些机制的内部实现从工程角度来看也具有广泛的吸引力。源码中有如此丰富的知识可以帮助我们成长为更好的开发者。**

而上来直接啃源码会稍稍有些难度，所以有些同学会去先去看一些源码解析的文章，然而最有效的方法莫过于learning by doing，通过逐步实现react来学习

## 🙊提示
**主要针对web端：** 目前react是拆分成了多个package，因为只针对web端，所以会重点分析react，react-dom，react-reconciler这三个包

**文中代码做了很多简化:** 去掉了一些错误处理，性能分析（Profiler API），服务器端渲染等等我不关心的功能，因为这对从来没有深入过 React 源码的同学来说过于复杂。

**可能与源码差异较大:** 为了方便理解，有时候会来一些简单粗暴的实现，在之后会纠正过来

## 🚣方法
[费曼学习法](https://wiki.mbalib.com/wiki/%E8%B4%B9%E6%9B%BC%E5%AD%A6%E4%B9%A0%E6%B3%95)

> 费曼学习法的灵感源于诺贝尔物理奖获得者理查德•费曼（Richard Feynman），运用费曼技巧,你只需花上20分钟就能深入理解知识点,而且记忆深刻,难以遗忘。

## 📜目录

1. [React元素](React元素/README.md)
2. [React组件](React组件/README.md)
3. [React元素的树](React元素的树/README.md)
4. [React调和工作](React调和工作/Readme.md)

## 📚资料
- [inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react](https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e): 译文 [深入React fiber架构及源码](https://zhuanlan.zhihu.com/p/57346388)
- [the-how-and-why-on-reacts-usage-of-linked-list-in-fiber](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7): 译文 [如何以及为什么React Fiber使用链表遍历组件树
](https://zhuanlan.zhihu.com/p/54196962)
