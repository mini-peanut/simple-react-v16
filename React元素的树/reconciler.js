const FunctionComponent = 0; // JavaScript函数组件
const ClassComponent = 1;    // ES6的class组件
const IndeterminateComponent = 2; // 目前还不知道是JavaScript函数还是ES6的class
const HostRoot = 5;     // 顶层fiber节点
const HostComponent = 7;

let nextUnitOfWork = null;
let shouldTrackSideEffects = true;
/**
 *
 * @param tag 定义fiber的类型。它在调和算法中用于确定需要完成的工作，工作取决于React元素的类型，为简化，仅介绍以下三个fiber类型
 *    - ClassComponent: 表示用户自定义的 class 组件的 fiber，
 *    - HostRoot:       表示根节点的 fiber，即调用ReactDOM.render时传入的第二个参数 container。
 *    - HostComponent:  表示原生节点的 fiber，如<div>
 *
 * @param pendingProps  已从 React 元素中的新数据更新并且需要应用于子组件或 DOM 元素的 props。
 * @constructor
 */
function FiberNode (tag, pendingProps) {
    /**
     * 参照params参数定义
     */
    this.tag = tag;
    /**
     * 原生节点的type是标签类型，如div的type就是'div'
     * 根节点的type是null
     * class组件的type是它的构造函数
     */
    this.type = null;

    /**
     * 原生节点的stateNode是其真实dom
     * 根节点的stateNode是FiberRoot的实例，FiberRoot我们等一会讲
     * class组件的stateNode是组件类的实例
     */
    this.stateNode = null;

    /**
     * 前面说过，我们需要有两棵树进行比对，事实上，每一个节点都有“双生子”，也同样分为current节点和workInprogress节点， 它们通过alternate连接起来，
     * 也就是说current.alternate等于workInProgress，而workInprogress.alternate即current
     */
    this.alternate = null;

    /**
     * 参照params参数定义
     */
    this.pendingProps = pendingProps;
    /**
     * 在前一个渲染中用于创建输出的 Fiber 的 props
     */
    this.memoizedProps = null;

    /**
     * return，child 和 sibling 这三个属性构造了一颗fiber树
     */
    /**
     * 该fiber的父节点
     * @type {null}
     */
    this.return = null;
    /**
     * 该fiber的第一个子节点，注意是第一个
     * @type {null}
     */
    this.child = null;
    /**
     * 该fiber的下一个兄弟节点
     * @type {null}
     */
    this.sibling = null;
}

/**
 * React为每个dom容器创建一个了一个Fiber容器FiberRoot，FiberRoot 保存了当前fiber树，以及dom容器等顶级元素
 * @param containerInfo
 * @constructor
 */
function FiberRootNode(containerInfo) {
    /**
     * 当前fiber树的顶级节点
     * @type {null}
     */
    this.current = null;

    /**
     * 当前dom树的顶级容器节点，即传入ReactDOM.render的第二个参数container
     */
    this.containerInfo = containerInfo;
}

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

function updateFiberRoot (element, root) {
    /**
     * 获取当前树，目前只有一个根节点
     */
    const current = root.current;

    /**
     * 遍历React元素树生成fiber树
     */
    reconcileChildFibers(current, element)
}

/**
 *
 * @param returnFiber 父节点的fiber
 * @param newChild 子节点react元素
 * @returns {*}
 */
function reconcileChildFibers(returnFiber, newChild) {
    const childArray = Array.isArray(newChild) ? newChild : [newChild];
    return reconcileChildrenArray(returnFiber, childArray)
}

/**
 * 遍历children，生成fiber
 * @param returnFiber
 * @param childArray
 * @returns {FiberNode}
 */
function reconcileChildrenArray(returnFiber, childArray) {
    let resultingFirstChild = null;
    let previousNewFiber = null;
    let newIdx = 0;

    for (; newIdx < childArray.length; newIdx++) {
        let _newFiber = createChild(returnFiber, childArray[newIdx]);

        /**
         * 我们需要返回的时returnFiber的第一个子节点
         */
        if (resultingFirstChild === null) {
            resultingFirstChild = _newFiber
        }
        /**
         * 如果有多个child，则给前一个fiber设置sibling属性指向当前fiber
         */
        else {
            previousNewFiber.sibling = _newFiber
        }
        previousNewFiber = _newFiber
    }
    return resultingFirstChild
}

function createChild (returnFiber, newChild) {
    if (typeof newChild === 'object' && newChild !== null) {
        let created = createFiberFromTypeAndProps(newChild);
        created.return = returnFiber;
        return created
    }
    return null
}

function beginWork (current, workInProgress, renderExpirationTime) {
    const Component = workInProgress.type;
    const unresolvedProps = workInProgress.pendingProps
    switch (workInProgress.tag) {
        case ClassComponent: {
            return updateClassComponent(current, workInProgress, Component, unresolvedProps, renderExpirationTime)
        }
        case HostRoot: {
            return updateHostRoot(current, workInProgress, renderExpirationTime)
        }
        case HostComponent: {
            return updateHostComponent(current, workInProgress, renderExpirationTime)
        }
        default:
            throw new Error('unknown unit of work tag')
    }
}

ReactDOM.createFiberTree = createFiberTree;
