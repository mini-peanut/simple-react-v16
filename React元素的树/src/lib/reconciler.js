let nextUnitOfWork = null;

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
    console.log(container)
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

        if (siblingFiber !== null) {
            return siblingFiber
        } else if (returnFiber !== null) {
            current = returnFiber
        } else {
            return null
        }
    }
}

function createChild (returnFiber, newChild) {
    if (typeof newChild === 'object' && newChild !== null) {
        let created = createFiberFromTypeAndProps(newChild);
        created.return = returnFiber;

        return created
    }
    return null
}