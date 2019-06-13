# simple-react-v16
learning by doing，通过实现一个简单的react-v16来学习react

## 背景
很多同学都尝试学习过源码，背后的原因多种多样，有兴趣驱动，技术驱动，坑驱动，也有的是想获得一份比较满意的offer，因为如今很多面试官都喜欢问一些技术的实现原理。

而上来直接啃源码会稍稍有些难度，所以有些同学会去先去看一些源码解析的文章，然而优秀的文章少之又少，个人推崇的方法是learning by doing，通过逐步实现react来学习

## 提示
目前react是拆分成了多个package，以web为例，主要会用到react，react-dom和react-reconciler，native端会用到react-native等等，我们这个项目主要针对web端，即重点分析react，react-dom，react-reconciler这三个包

本文中的代码基本是react源码，只是做了一些简化，去掉了一些错误处理，性能分析（Profiler API），服务器端渲染等等我不关心的功能，因为这对从来没有深入过 React 源码的同学来说过于复杂。

## 目标

阅读源码之前，我们可以先定一个目标，阅读到什么地步

我个人认为，对任何知识的掌握程度取决于能说出来的程度，说不出来的知识并不属于你，因此，每过一段时间，检验自己有没有掌握到新知识到一个方式就是，想想自己能不能说出新东西来

所以目标很容易量化，关上电脑，能自个讲上20分钟（不灌水）就算过关

## 目录

1. [实现React.createElement](./实现ReactElement.md)
1. [实现React.Component](./实现ReactComponent.md)
