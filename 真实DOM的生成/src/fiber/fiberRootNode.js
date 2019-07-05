/**
 * React为每个dom容器创建一个了一个Fiber容器FiberRoot，FiberRoot 保存了当前fiber树，以及dom容器等顶级元素
 * @param containerInfo
 * @constructor
 */
function FiberRootNode(containerInfo) {
    // 当前fiber树的顶级节点
    this.current = null;
    // 当前dom树的顶级容器节点，即传入ReactDOM.render的第二个参数container
    this.containerInfo = containerInfo;
}