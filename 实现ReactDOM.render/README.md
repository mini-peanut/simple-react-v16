## 实现ReactDOM.render

通过[上一节](../实现React.createElement/README.md)我们简单实现了React.createElement这个Api。元素构成组件，我们这一节主要探讨React组件以及如何将react组件的内容渲染到页面上

### 什么是react组件

来自官网的定义

> 组件，从概念上类似于 JavaScript 函数。它接受任意的入参（即 “props”），并返回用于描述页面展示内容的 React 元素。

精简一下，就是，react组件是函数，定义组件的方式可以是JavaScript函数和ES6的class，我们这一节主要探讨一下class组件的实现

```jsx
class ClickCounter extends Component{
    constructor(props) {
        super(props);
        this.state = {count: 0};
        this.handleClick = this.handleClick.bind(this);
	console.log('constructor')
    }

    handleClick() {
        this.setState((state) => {
            return {count: state.count + 1};
        });
    }

    render() {
        return [
            <button key="1" onClick={this.handleClick}>Update counter</button>,
            <span key="2">{this.state.count}</span>
        ]
    }
    
    componentDidMount () {
    	console.log('componentDidMount')
    }
    componentDidUpdate () {
    	console.log('componentDidUpdate')
    }
}

ReactDOM.render(<ClickCounter />, document.getElementById('app'))
```

还是老样子，我们打开[index.html]('.index/html')将开发区的内容注释掉，将react和react-dom的注释打开，将上面这段代码放入测试区，查看结果，可以看到以下功能

1. render中的内容被渲染到了页面上，控制台依次输出constructor,  componentDidMount
3. 点击按钮后页面count加1，控制台依次输出addCount, componentDidUpdate

### class组件的创建过程

#### # 将render中的内容渲染到页面上

先来看第一点，这个很简单，实例化AddCount，调用render获取子节点元素，递归创建dom，插入到div#app上，就可以了，这一段大家可以先行自己实现一遍

以下是我的版本

```js
function render (reactElement, container) {
  const Component = reactElement.type;
  
  // 实例化
  const inst = new Component();
  
  // 将父节点挂载到实例上，方便后续调用
  inst.parent = container;
  
  // 调用render获取子节点元素
  const children = inst.render();
  
  // 递归创建dom，插入到div#app上， 
  // renderChildren的具体代码在lesson2/index.html中查看
  container.appendChild(renderChildren(children))
  
  // 执行生命周期方法compoenntDidMount
  if (inst.componentDidMount) {
    inst.componentDidMount.call(inst)
  }
}
```

到这一步，我们将react和react-dom的链接注释掉，测试这一段代码是否能实现功能1

#### # 点击按钮后页面count加1，控制台依次输出addCount, componentDidUpdate。

能看见的流程是，点击按钮后应该触发addCount方法，继而触发setState方法，setState方法改变状态，同时更新界面内容

首先是触发addCount方法，如何触发呢？onClick并不是原生dom的事件，因此事件这一块需要单独处理

```js
function renderChildren(node) {
  const {type, props} = node;
  const dom = document.createElement(type);
  
  // 定义驼峰的事件，由于我们目前只用到onClick，所以只加这一个
  const registrationNames = ['onClick'];
  
  _.entries(props).map(([key, value]) => {
    if (registrationNames.includes(key)) {
    
      // onClick再转为click，监听之
      // 有同学说这不就是脱裤子放屁？当然不是了，具体原因后面再谈，先可以自己多想想
      let eventType = key.slice(2).toLocaleLowerCase();
      dom.addEventListener(eventType, value);
    }
    // other statement
  });

  return dom
}
```

接下来是**setState方法改变状态，同时更新界面内容**

有同学会说，先改变状态，继续调用render，然后将返回的元素转成真实dom，直接插入到父元素就ok了呗，so easy！如下

```js
function Component(props) {
  this.props = props
}
Component.prototype.setState = function (partialState) {
  this.state = {
    ...this.state,
    ...partialState
  };
  this.parent.innerHTML = '';
  this.parent.appendChild(renderChildren(this.render()));
};
```

很好，but，如果组件有一个状态改变了，是否要将整个应用重新渲染一遍？能否精准找到需要修改的dom，然后再进行性能消耗最小的更新呢？

![](../assets/陷入沉思.jpg)

预知后事如何，请看[下一节：构建虚拟DOM树](../构建虚拟DOM树（一）/README.md)


[文中代码链接](index.html)

[上一节：实现ReactElement](../实现React.createElement/README.md)   


