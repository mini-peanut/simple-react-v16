/**
 * 根据react元素来创建fiber
 * @param type
 * @param props
 * @returns {FiberNode}
 */
function createFiberFromTypeAndProps ({type, props}) {
    /**
     * 先根据type判断这是一个什么类型的组件
     * class组件的type是其构造函数，hostComponent的type是标签类型，如<div></div>的type是‘div’
     */
    let fiberTag = IndeterminateComponent;

    if (_.isFunction(type) && shouldConstruct(type)) {
        fiberTag = ClassComponent
    }

    if (_.isString(type)) {
        fiberTag = HostComponent
    }
    /**
     * 根据fiberTag创建fiber
     */
    const fiber = new FiberNode(fiberTag, props);
    fiber.type = type;

    return fiber
}
