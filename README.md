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

## 🚣技巧
[learning-by-doing](https://en.wikipedia.org/wiki/Learning-by-doing_(economics))
> 边做边学是经济学理论中的一个概念，生产力是通过实践、自我完善和小创新来实现的。肯尼斯•阿罗在他的内生增长理论设计中使用了“边做边学”的概念来解释创新和技术变革的影响。

项目中的每个文件夹都有可以跑起来的index.html文件，读者可以先注释掉，自己实现一遍，来加深印象

[费曼学习法](https://wiki.mbalib.com/wiki/%E8%B4%B9%E6%9B%BC%E5%AD%A6%E4%B9%A0%E6%B3%95)
> 费曼学习法的灵感源于诺贝尔物理奖获得者理查德•费曼（Richard Feynman），运用费曼技巧,你只需花上20分钟就能深入理解知识点,而且记忆深刻,难以遗忘。

拿出笔记本，当能够通过简单的话语从头到尾写出一个从未了解过源码的人可以理解的想法的时候，就代表已经很深入地理解了这个概念

## 📜目录

1. [React元素](React元素/README.md)
2. [React组件](React组件/README.md)
3. [React元素的树](React元素的树/README.md)
4. [React调和工作](React调和工作/Readme.md)

## 📚资料
- [inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react](https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e): 译文 [深入React fiber架构及源码](https://zhuanlan.zhihu.com/p/57346388)
- [the-how-and-why-on-reacts-usage-of-linked-list-in-fiber](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7): 译文 [如何以及为什么React Fiber使用链表遍历组件树
](https://zhuanlan.zhihu.com/p/54196962)
