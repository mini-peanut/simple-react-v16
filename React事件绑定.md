<h1 align="center">React事件绑定</h1>
React自己实现了一套高效的事件注册，存储，分发和重用逻辑，在DOM事件体系基础上做了很大改进，减少了内存消耗，简化了事件逻辑，并最大化的解决了IE等浏览器的不兼容问题。与DOM事件体系相比，它有如下特点

1. React组件上声明的事件最终绑定到了document这个DOM节点上，而不是React组件对应的DOM节点。故只有document这个节点上面才绑定了DOM原生事件，其他节点没有绑定事件。这样简化了DOM原生事件，减少了内存开销
2. React以队列的方式，从触发事件的组件向父组件回溯，调用它们在JSX中声明的callback。也就是React自身实现了一套事件冒泡机制。我们没办法用event.stopPropagation()来停止事件传播，应该使用event.preventDefault()
3. React有一套自己的合成事件SyntheticEvent，不同类型的事件会构造不同的SyntheticEvent
4. React使用对象池来管理合成事件对象的创建和销毁，这样减少了垃圾的生成和新对象内存的分配，大大提高了性能

那么这些特性是如何实现的呢，下面和大家一起一探究竟。

首先看一下React事件系统框图

![image-20190706174510830](./assets/React事件绑定-2.png)



这上面有几个主要的模块

- ReactEventListener：负责事件的注册。
- ReactEventEmitter：负责事件的分发。
- EventPluginHub：负责事件的存储及分发。
- Plugin：根据不同的事件类型构造不同的合成事件。

这里有一个[动画](https://www.lzane.com/tech/react-event-system-and-source-code/#%E4%BA%8B%E4%BB%B6%E8%A7%A6%E5%8F%91)，应该对理解有写帮助。看完之后，我们来看看代码上的实现

第一步就是注册了，注册时机我想不用多说，和挂载props同一时间做的，很显然，绑定事件也是作为props的一部分，看看我们上一节处理这个过程的函数

```js
function finalizeInitialChildren (domElement, props) {
    Object.keys(props).forEach(propKey => {
        const propValue = props[propKey];
        if (propKey === 'children') {
            if (typeof propValue === 'string' || typeof propValue === 'number') {
                domElement.textContent = propValue
            }
        } else if (propKey === 'style') {
        // ...other else if
    })
}
```

上一节细心的朋友可能会发现，这里并没有对事件的处理和绑定，我们这一节就来加上

```js
const STYLE = 'style';
const HTML = '__html';

function setInitialDOMProperties(
  tag: string,
  domElement: Element,
  rootContainerElement,
  nextProps,
  isCustomComponentTag,
) {
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }
    const nextProp = nextProps[propKey];
    if (propKey === STYLE) {
      setValueForStyles(domElement, nextProp);
      // 这里省略n多个else if
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey);
      }
    }
  }
}
```

这里我们针对不同类型的组件，都是调用了trapBubbledEvent这个方法去捕捉冒泡事件，然后传入各自的类型，接下来看看trapBubbledEvent的实现，



```js
function ensureListeningTo () {
  const listeningSet = getListeningSetForElement(mountAt);
  const dependencies = registrationNameDependencies[registrationName];

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    if (!listeningSet.has(dependency)) {
      switch (dependency) {
        case TOP_SCROLL:
          trapCapturedEvent(TOP_SCROLL, mountAt);
          break;
        case TOP_FOCUS:
        case TOP_BLUR:
          trapCapturedEvent(TOP_FOCUS, mountAt);
          trapCapturedEvent(TOP_BLUR, mountAt);
          // We set the flag for a single dependency later in this function,
          // but this ensures we mark both as attached rather than just one.
          listeningSet.add(TOP_BLUR);
          listeningSet.add(TOP_FOCUS);
          break;
        case TOP_CANCEL:
        case TOP_CLOSE:
          if (isEventSupported(getRawEventName(dependency))) {
            trapCapturedEvent(dependency, mountAt);
          }
          break;
        case TOP_INVALID:
        case TOP_SUBMIT:
        case TOP_RESET:
          // We listen to them on the target DOM elements.
          // Some of them bubble so we don't want them to fire twice.
          break;
        default:
          // By default, listen on the top level to all non-media events.
          // Media events don't bubble so adding the listener wouldn't do anything.
          const isMediaEvent = mediaEventTypes.indexOf(dependency) !== -1;
          if (!isMediaEvent) {
            trapBubbledEvent(dependency, mountAt);
          }
          break;
      }
      listeningSet.add(dependency);
    }
  }
}
```





