/**
 * 我们第一步首先要创建一个fiber容器，然后每次有状态变化就去更新它，开始的时候，我们需要将我们整个应用都插入进去
 *
 * @param reactElement react元素
 * @param container dom容器
 * @returns {FiberRootNode}
 */
function createFiberTree (reactElement, container) {
    //
    let root = container._reactRootContainer;

    if (!root) {
        root = container._reactRootContainer = createFiberRoot(container)
    }

    // 2. 用reactElement去更新容器
    updateFiberRoot(reactElement, root);

    return root

}