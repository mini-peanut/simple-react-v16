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
 * class组件会继承自React.Component组件，而React.Component上会挂载isReactComponent这个属性
 * 所以如果你写了一个class组件ClickCounter，访问ClickCounter.prototype.isReactComponent会得到true
 */
function shouldConstruct(Component) {
    const prototype = Component.prototype;
    return !!(prototype && prototype.isReactComponent);
}

function createFiberTree (reactElement, container) {
    // 1. 创建fiber容器
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
     * 之前说过必须要有两颗树才可以对比，所以现在我们再基于current创建一棵树，workInProgress
     */
    const nextUnitOfWork = createWorkInProgress(current, null);

    /**
     * 自上而下，遍历react元素树节点，为每一个节点添加child，return，sibling属性，构建fiber树
     * @type {null}
     */
    while (nextUnitOfWork !== null) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }

    return root
}

/**
 *
 * @param current
 * @param pendingProps
 * @returns {*|FiberNode}
 */
function createWorkInProgress(current, pendingProps) {
    let workInProgress = current.alternate;

    if (workInProgress === null) {
        workInProgress = new FiberNode(current.tag, pendingProps);
        /**
         * workInProgress树通过alternate属性连接上current树
         */
        workInProgress.alternate = current;
    }

    workInProgress.type = /*         */current.type;
    workInProgress.stateNode = /*    */current.stateNode;
    workInProgress.child = /*        */current.child;
    workInProgress.memoizedProps = /**/current.memoizedProps;
    workInProgress.updateQueue = /*  */current.updateQueue;
    workInProgress.sibling = /*      */current.sibling;

    /**
     * 同上，current树通过alternate属性连接上workInProgress树，两棵树通过这个属性互相连接起来
     * @type {FiberNode}
     */
    current.alternate = workInProgress;

    return workInProgress
}

/**
 * @param workInProgress 父节点
 * @returns {FiberNode} 子节点
 */
function performUnitOfWork (workInProgress) {
    const current = workInProgress.alternate;
    let next = null;
    next = beginWork(current, workInProgress, nextRenderExpirationTime);
    // if (next === null) {
    //     next = completeUnitOfWork(workInProgress)
    // }
    return next
}

/**
 * 根据tag的类型，不断构建子节点
 * @param current 当前树
 * @param workInProgress 工作树
 * @returns {FiberNode|*}
 */
function beginWork (current, workInProgress) {
    workInProgress.expirationTime = NoWork;
    const Component = workInProgress.type;
    const unresolvedProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
        case ClassComponent: {
            return updateClassComponent(current, workInProgress, Component, unresolvedProps)
        }
        case HostRoot: {
            return updateHostRoot(current, workInProgress)
        }
        // case HostComponent: {
        //     return updateHostComponent(current, workInProgress)
        // }
        default:
            throw new Error('unknown unit of work tag')
    }
}

function updateHostRoot (current, workInProgress) {
    const updateQueue = workInProgress.updateQueue;
    const prevState = workInProgress.memoizedState;
    const prevChildren = prevState !== null ? prevState.element : null;
    processUpdateQueue(workInProgress, updateQueue);
    const nextState = workInProgress.memoizedState;
    const nextChildren = nextState.element;
    if (nextChildren === prevChildren) {
        cloneChildFibers(workInProgress);
        return workInProgress.child
    }
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child
}

function processUpdateQueue (workInProgress, queue) {
    // Iterate through the list of updates to compute the result.
    let update = queue.firstUpdate;
    let resultState = queue.baseState;
    while (update !== null) {
        resultState = getStateFromUpdate(update, resultState);
        update = update.next
    }
    queue.baseState = resultState;
    queue.firstUpdate = queue.lastUpdate = null;
    workInProgress.expirationTime = NoWork;
    workInProgress.memoizedState = resultState
}

function getStateFromUpdate (update, prevState) {
    const partialState = update.payload
    if (partialState === null || partialState === undefined) {
        // Null and undefined are treated as no-ops.
        return prevState
    }
    // Merge the partial state and the previous state.
    return Object.assign({}, prevState, partialState)
}

ReactDOM.createFiberTree = createFiberTree;
