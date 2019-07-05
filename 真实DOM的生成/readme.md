<h1 align="center">真实DOM的生成</h1>
通过上一节，我们了解了创建一颗Fiber树的过程，但是却不知道这颗fiber树是如何生成真实dom且应用到页面上的

之前提到过，HostComponent类型的fiber节点，stateNode属性上挂载着这个fiber对应的真实DOM节点，实际上，在生成fiber树的时候，会一并生成真实DOM节点，然后再挂载上去，这一节主要来完善一下这个功能

换句话来说，主要是完善一下completeUnitOfWork这个函数，首先看一下上一节的实现

```js
function completeUnitOfWork(current) {
    while (true) {
        const returnFiber = current.return;
        const siblingFiber = current.sibling;
      
        if (siblingFiber !== null) {
            return siblingFiber
        } else if (returnFiber !== null) {
            current = returnFiber
        } else {
            return null
        }
    }
}
```

简单来讲，就是到达底部时，往上走，如果发现了兄弟节点，就返回兄弟节点，否则继续往上走，在这个过程中，我们可以从底部一直向上构建dom树, 下面是完整的completeUnitOfWork

```js
function completeUnitOfWork(current) {
    while (true) {
        const returnFiber = current.return;
        const siblingFiber = current.sibling;
      
      	completeWork(current）

        if (siblingFiber !== null) {
            return siblingFiber
        } else if (returnFiber !== null) {
            current = returnFiber
        } else {
            return null
        }
    }
}

function compeleteWork(current) {
  
}
```





