const FunctionComponent = 0; // JavaScript函数组件
const ClassComponent = 1;    // ES6的class组件
const HostRoot = 5;     // 顶层fiber节点
const HostComponent = 7;

/**
 * React.Component上会挂载isReactComponent这个属性
 * 当我们的class组件继承React.Component的时候，xxx.prototype.isReactComponent就是true
 */
function shouldConstruct(Component) {
    const prototype = Component.prototype;
    return !!(prototype && prototype.isReactComponent);
}

function createFiberFromTypeAndProps ({type, props}) {
    /**
     * 先根据type判断这是一个什么类型的组件
     * class组件的type是其构造函数，hostComponent的type是标签类型，如<div></div>的type是‘div’
     */
    let fiberTag;

    if (_.isString(type)) {
        fiberTag = HostComponent
    }

    if (_.isFunction(type) && shouldConstruct(type)) {
        fiberTag = ClassComponent
    }

    const fiber = new FiberNode(fiberTag, props);
    fiber.type = type;

    return fiber
}