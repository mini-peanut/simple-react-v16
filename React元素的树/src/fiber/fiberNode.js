/**
 *
 * @param tag 定义fiber的类型。它在协调算法中用于确定需要完成的工作，工作取决于React元素的类型，为简化，仅介绍以下三个fiber类型
 *    - ClassComponent: 表示用户自定义的 class 组件的 fiber，
 *    - HostRoot:       表示根节点的 fiber，即调用ReactDOM.render时传入的第二个参数 container。
 *    - HostComponent:  表示原生节点的 fiber，如<div>
 *
 * @param pendingProps  已从 React 元素中的新数据更新并且需要应用于子组件或 DOM 元素的 props。
 * @constructor
 */
function FiberNode (tag, pendingProps) {
    /**
     * tag 定义fiber的类型。它在调和算法中用于确定需要完成的工作，为简化，仅介绍以下三个fiber类型
     *    - ClassComponent: 表示用户自定义的 class 组件的 fiber，
     *    - HostRoot:       表示根节点的 fiber，即调用ReactDOM.render时传入的第二个参数 container。
     *    - HostComponent:  表示原生节点的 fiber，如<div>
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
     * 每一个节点也都有“双生子”，也同样分为current和workInprogress节点，它们通过alternate连接起来
     * 也就是说current.alternate等于workInProgress，而workInprogress.alternate即current
     */
    this.alternate = null;

    /**
     * 已从 React 元素中的新数据更新并且需要应用于子组件或 DOM 元素的 props。
     */
    this.pendingProps = pendingProps;
    /**
     * 在前一个渲染中用于创建输出的 Fiber 的 props
     */
    this.memoizedProps = null;

    /**
     *  return，child 和 sibling 这三个属性构造了一颗fiber树，其中
     *  return  为父节点
     *  child   为该fiber的第一个子节点，注意是第一个
     *  sibling 为该fiber的下一个兄弟节点
     */
    this.return = null;
    this.child = null;
    this.sibling = null;
}