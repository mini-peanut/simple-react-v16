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
 *
 * @param current
 * @param workInProgress
 * @param Component
 * @param nextProps
 * @returns {*}
 */
function updateClassComponent(current, workInProgress, Component, nextProps) {
    let shouldUpdate;
    if (current === null) {
        constructClassInstance(workInProgress, Component, nextProps);
        mountClassInstance(workInProgress, Component, nextProps);
        shouldUpdate = true
    } else {
        shouldUpdate = updateClassInstance(current, workInProgress, Component, nextProps)
    }
    return finishClassComponent(current, workInProgress, shouldUpdate, renderExpirationTime)
}

function updateClassInstance (current, workInProgress, ctor, newProps) {
    const instance = workInProgress.stateNode
    const oldProps = workInProgress.memoizedProps
    instance.props = oldProps
    const oldState = workInProgress.memoizedState
    let newState = instance.state = oldState
    let updateQueue = workInProgress.updateQueue
    if (updateQueue !== null) {
        processUpdateQueue(
            workInProgress,
            updateQueue
        )
        newState = workInProgress.memoizedState
    }
    if (oldProps === newProps && oldState === newState) {
        return false
    }
    const getDerivedStateFromProps = ctor.getDerivedStateFromProps
    if (typeof getDerivedStateFromProps === 'function') {
        applyDerivedStateFromProps(workInProgress, getDerivedStateFromProps, newProps)
        newState = workInProgress.memoizedState
    }
    const shouldUpdate = checkShouldComponentUpdate(workInProgress, newProps, newState)
    if (shouldUpdate) {
        if (typeof instance.componentDidUpdate === 'function') {
            workInProgress.effectTag |= Update
        }
    }
    instance.props = newProps
    instance.state = newState
    return shouldUpdate
}

function finishClassComponent (current, workInProgress, shouldUpdate, renderExpirationTime) {
    if (!shouldUpdate) {
        cloneChildFibers(workInProgress)
    } else {
        const instance = workInProgress.stateNode;
        const nextChildren = instance.render();
        reconcileChildren(current, workInProgress, nextChildren, renderExpirationTime);
        memoizeState(workInProgress, instance.state);
        memoizeProps(workInProgress, instance.props)
    }
    return workInProgress.child
}

function reconcileChildren (current, workInProgress, nextChildren, renderExpirationTime) {
    if (current === null) {
        shouldTrackSideEffects = false;
        workInProgress.child = reconcileChildFibers(workInProgress, null, nextChildren, renderExpirationTime)
    } else {
        shouldTrackSideEffects = true;
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderExpirationTime)
    }
}

function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
    if (newChild) {
        const childArray = Array.isArray(newChild) ? newChild : [newChild];
        return reconcileChildrenArray(returnFiber, currentFirstChild, childArray, expirationTime)
    } else {
        return null
    }
}

function reconcileChildrenArray (returnFiber, currentFirstChild, newChildren, expirationTime) {
    let resultingFirstChild = null;
    let previousNewFiber = null;
    let oldFiber = currentFirstChild;
    let newIdx = 0;
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx ++) {
        let newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime);
        if (shouldTrackSideEffects) {
            if (oldFiber && newFiber.alternate === null) {
                deleteChild(returnFiber, oldFiber);
                newFiber.effectTag = Placement
            }
        }
        if (resultingFirstChild === null) {
            resultingFirstChild = newFiber
        } else {
            previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber;
        oldFiber = oldFiber.sibling
    }
    if (oldFiber === null) {
        for (; newIdx < newChildren.length; newIdx++) {
            let _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime);
            if (shouldTrackSideEffects && _newFiber.alternate === null) {
                _newFiber.effectTag = Placement
            }
            if (resultingFirstChild === null) {
                resultingFirstChild = _newFiber
            } else {
                previousNewFiber.sibling = _newFiber
            }
            previousNewFiber = _newFiber
        }
        return resultingFirstChild
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
