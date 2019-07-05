/**
 *
 * @param containerInfo 真实dom容器
 * @returns {FiberRootNode}
 */
function createFiberRoot (containerInfo) {
    /**
     * 创建fiber容器，注意这是一个容器而并非一个fiber，root.current才是fiber
     */
    const root = new FiberRootNode(containerInfo);
    /**
     * 创建顶层fiber节点，HostRoot
     */
    const uninitializedFiber = new FiberNode(HostRoot);

    /**
     * 将fiber树的顶层节点赋予Fiber容器的current属性
     */
    root.current = uninitializedFiber;
    /**
     * 根据构造函数FiberNode中的注释，可知顶层fiber节点的stateNode是FiberRoot的实例，赋予之
     */
    uninitializedFiber.stateNode = root;

    return root
}