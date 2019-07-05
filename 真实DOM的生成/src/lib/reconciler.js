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
    const type = current.type;

    // 生成实例
    const _instance = document.createElement(type);

    // 插入子元素
    appendAllChildren(_instance, current);

    // 挂载上属性props
    finalizeInitialChildren(_instance, newProps);

    // 将dom挂载在current.stateNode上
    current.stateNode = _instance;

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
        } else if (registrationNames.includes(propKey) || propKey === 'onChange') {
            let eventType = propKey.slice(2).toLocaleLowerCase();
            if (eventType.endsWith('capture')) {
                eventType = eventType.slice(0, -7)
            }
            document.addEventListener(eventType, dispatchEventWithBatch)
        } else {
            const propValue = props[propKey];
            domElement.setAttribute(propKey, propValue)
        }
    })
}

/**
 * 绑定事件
 * @param nativeEvent
 * @returns {boolean}
 */
function dispatchEventWithBatch (nativeEvent) {
    const type = nativeEvent.type;
    let previousIsBatchingInteractiveUpdates = isBatchingInteractiveUpdates;
    let previousIsBatchingUpdates = isBatchingUpdates;
    let previousIsDispatchControlledEvent = isDispatchControlledEvent;
    if (type === 'change') {
        isDispatchControlledEvent = true
    }

    isBatchingUpdates = true;

    try {
        return dispatchEvent(nativeEvent)
    } finally {
        isBatchingInteractiveUpdates = previousIsBatchingInteractiveUpdates;
        isBatchingUpdates = previousIsBatchingUpdates;
        if (!isBatchingUpdates && !isRendering) {
            if (isDispatchControlledEvent) {
                isDispatchControlledEvent = previousIsDispatchControlledEvent;
                if (scheduledRoot) {
                    performSyncWork()
                }
            } else {
                if (scheduledRoot) {
                    scheduleCallbackWithExpirationTime(scheduledRoot, scheduledRoot.expirationTime)
                }
            }
        }
    }
}

function getParent(inst) {
    do {
        inst = inst.return;
    } while (inst && inst.tag !== HostComponent);

    if (inst) {
        return inst;
    }
    return null;
}


function dispatchEvent (nativeEvent) {
    let listeners = [];
    const nativeEventTarget = nativeEvent.target || nativeEvent.srcElement;
    const targetInst = nativeEventTarget.internalInstanceKey;
    traverseTwoPhase(targetInst, accumulateDirectionalDispatches.bind(null, listeners), nativeEvent);
    listeners.forEach(listener => listener(nativeEvent))
}

function traverseTwoPhase(inst, fn, arg) {
    const path = [];
    while (inst) {
        path.push(inst);
        inst = getParent(inst);
    }
    let i;
    for (i = path.length; i-- > 0; ) {
        fn(path[i], 'captured', arg);
    }
    for (i = 0; i < path.length; i++) {
        fn(path[i], 'bubbled', arg);
    }
}

function accumulateDirectionalDispatches (acc, inst, phase, nativeEvent) {
    let type = nativeEvent.type;
    let registrationName = 'on' + type[0].toLocaleUpperCase() + type.slice(1);
    if (phase === 'captured') {
        registrationName = registrationName + 'Capture'
    }
    const stateNode = inst.stateNode;
    const props = stateNode.internalEventHandlersKey;
    const listener = props[registrationName];
    if (listener) {
        acc.push(listener)
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