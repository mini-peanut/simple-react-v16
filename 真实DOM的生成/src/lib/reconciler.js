let nextUnitOfWork = null;
let isBatchingUpdates = false;
let isDispatchControlledEvent = false;

function Updater() {
    this.payload = null;
    this.next = null;
}

function UpdateQueue(baseState) {
    this.baseState = baseState;
    this.firstUpdate = null;
    this.lastUpdate = null;
}

function createContainer (containerInfo) {
    // 步骤1
    const root = new FiberRootNode(containerInfo);

    // 步骤2
    const uninitializedFiber = new FiberNode(HostRoot);
    root.current = uninitializedFiber;

    // 步骤3
    uninitializedFiber.stateNode = root;

    return root
}

function updateContainer (element, container) {
    const current = container.current;

    const update = new Updater();
    update.payload = {element};

    const queue = current.updateQueue = new UpdateQueue();
    queue.firstUpdate = queue.lastUpdate = update;

    nextUnitOfWork = current;

    workLoop();

    // 现在我们可以打印一下container看看生成的fiber树
    console.log(container);

    completeRoot(current.child)
}

function workLoop () {
    while (nextUnitOfWork !== null) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
}

function performUnitOfWork (current) {
    let next = beginWork(current);
    if (next === null) {
        next = completeUnitOfWork(current)
    }

    /**
     * 依次打印出next，结果是
     * ClickCounter -> button#b1 -> div#b2 -> span#c1 -> b#d1 -> span#c2 -> div#b3 -> span#c3 -> null
     */
    if (next && typeof next.type === "function") {
        console.log('next', (next.type + '').match(/function ([^(]+)\(/)[1]);
    }
    else {
        console.log('next', next ? next.type + '#' + next.pendingProps.id : next);
    }

    return next
}

function beginWork (current) {
    const Component = current.type;
    switch (current.tag) {
        case ClassComponent: {
            return updateClassComponent(current, Component)
        }
        case HostRoot: {
            return updateHostRoot(current)
        }
        case HostComponent: {
            return updateHostComponent(current)
        }
        default:
            throw new Error('unknown unit of work tag')
    }
}

function updateHostComponent (current) {
    const nextProps = current.pendingProps;
    let nextChildren = nextProps.children;

    if (['string', 'number'].includes(nextProps)) {
        nextChildren = null
    }
    reconcileChildren(current, nextChildren);
    return current.child
}

function updateClassComponent(current, ctor) {
    const instance =  new ctor();
    current.stateNode = instance;

    const nextChildren = instance.render();

    reconcileChildren(current, nextChildren);

    return current.child
}

function updateHostRoot(current) {
    const updateQueue = current.updateQueue;
    const nextState = updateQueue.firstUpdate.payload;
    const nextChildren = nextState.element;

    reconcileChildren(current, nextChildren);

    return current.child
}

function reconcileChildren(current, nextChildren) {
    const childArray = Array.isArray(nextChildren) ? nextChildren : [nextChildren];
    current.child = reconcileChildrenArray(current, childArray)
}

function reconcileChildrenArray(returnFiber, childArray) {
    let resultingFirstChild = null;
    let previousNewFiber = null;
    let newIdx = 0;

    for (; newIdx < childArray.length; newIdx++) {
        let _newFiber = createChild(returnFiber, childArray[newIdx]);

        if (resultingFirstChild === null) {
            resultingFirstChild = _newFiber
        }
        else {
            previousNewFiber.sibling = _newFiber
        }
        previousNewFiber = _newFiber
    }
    return resultingFirstChild
}


/**
 * 自底向上
 * @param current
 * @returns {*|null|FiberNode|*}
 */
function completeUnitOfWork(current) {
    while (true) {
        const returnFiber = current.return;
        const siblingFiber = current.sibling;

        completeWork(current);
        if (siblingFiber !== null) {
            return siblingFiber
        } else if (returnFiber !== null) {
            current = returnFiber
        } else {
            return null
        }
    }
}

function completeWork (current) {
    const newProps = current.pendingProps;

    switch(current.tag) {
        case ClassComponent: {
            break
        }
        case HostRoot: {
            break
        }
        case HostComponent: {
            const type = current.type;

            // 生成dom实例
            const _instance = document.createElement(type);

            // 给dom也挂上fiber节点，用于后续给dom绑定事件，事件触发时
            // 我们可以通过event.target获取到真实dom，之后可以通过这个属性获取到相应的fiber
            _instance.internalInstanceKey = current;
            _instance.internalEventHandlersKey = newProps;

            // 插入子元素
            appendAllChildren(_instance, current);

            // 挂载上属性props
            finalizeInitialChildren(_instance, newProps);

            // 将dom挂载在current.stateNode上
            current.stateNode = _instance;
            break
        }
        default: {
            throw new Error('Unknown unit of work tag')
        }
    }

    return null
}

function appendAllChildren (parent, current) {
    let node = current.child;
    while (node !== null) {
        if (node.tag === HostComponent) {
            parent.appendChild(node.stateNode)
        } else if (node.child !== null) {
            node.child.return = node;
            node = node.child;
            continue
        }
        // 从下往上走，走到了current这一层就退出
        if (node ===  current) {
            return
        }
        // 没有兄弟节点，继续往上走，一直走到current这一层，退出
        while (node.sibling === null) {
            if (node.return === null || node.return === current) {
                return
            }
            node = node.return
        }
        // 有兄弟节点，兄弟节点接起任务继续往上走
        node.sibling.return = node.return;
        node = node.sibling
    }
}

function finalizeInitialChildren (domElement, props) {
    Object.keys(props).forEach(propKey => {
        const propValue = props[propKey];
        if (propKey === 'children') {
            if (typeof propValue === 'string' || typeof propValue === 'number') {
                domElement.textContent = propValue
            }
        } else if (propKey === 'style') {
            const style = domElement.style;
            Object.keys(propValue).forEach(styleName => {
                let styleValue = propValue[styleName];
                style.setProperty(styleName, styleValue)
            })
        } else if (propKey === 'className') {
            domElement.setAttribute('class', propValue)
        } else {
            const propValue = props[propKey];
            domElement.setAttribute(propKey, propValue)
        }
    })
}

function createChild (returnFiber, newChild) {
    if (typeof newChild === 'object' && newChild !== null) {
        let created = createFiberFromTypeAndProps(newChild);
        created.return = returnFiber;

        return created
    }
    return null
}

function completeRoot(finishedWork) {
    const parentFiber = getHostParentFiber(finishedWork);
    console.log(parentFiber)
    const parent = parentFiber.stateNode.containerInfo;
    let node = finishedWork;
    while (true) {
        if (node.tag === HostComponent) {
            parent.appendChild(node.stateNode)
        } else if (node.child !== null) {
            node.child.return = node;
            node = node.child;
            continue
        }
        if (node === finishedWork) {
            return
        }
        while (node.sibling === null) {
            if (node.return === null || node.return === finishedWork) {
                return
            }
            node = node.return
        }
        node.sibling.return = node.return;
        node = node.sibling
    }
}

function getHostParentFiber(fiber) {
    let parent = fiber.return;
    while (parent !== null) {
        if (isHostParent(parent)) {
            return parent
        }
        parent = parent.return
    }
}

function isHostParent(fiber) {
    return fiber.tag === HostComponent || fiber.tag === HostRoot
}