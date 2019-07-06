const EVENT_POOL_SIZE = 10;

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
const EventInterface = {
    type: null,
    target: null,
    // currentTarget is set when dispatching; no use in copying it here
    currentTarget: function() {
        return null;
    },
    eventPhase: null,
    bubbles: null,
    cancelable: null,
    timeStamp: function(event) {
        return event.timeStamp || Date.now();
    },
    defaultPrevented: null,
    isTrusted: null,
};

function functionThatReturnsTrue() {
    return true;
}

function functionThatReturnsFalse() {
    return false;
}

/**
 * 合成事件由事件插件分派，通常是响应一个顶级事件委托处理程序。 这些系统通常应该使用池来减少垃圾的频率收集。
 * 系统应检查“是否持久”，以确定事件被分派后应释放到池中。用户需要一个持久化事件应该调用“persist”。
 * 合成事件(和子类)实现DOM Level 3 events API by规范浏览器怪癖。子类不一定要实现DOM接口;
 * 自定义特定于应用程序的事件也可以子类化它。
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {*} targetInst Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @param {DOMEventTarget} nativeEventTarget Target node.
 */
function SyntheticEvent(
    dispatchConfig,
    targetInst,
    nativeEvent,
    nativeEventTarget,
) {
    this.dispatchConfig = dispatchConfig;
    this._targetInst = targetInst;
    this.nativeEvent = nativeEvent;

    const Interface = this.constructor.Interface;
    for (const propName in Interface) {
        if (!Interface.hasOwnProperty(propName)) {
            continue;
        }
        const normalize = Interface[propName];
        if (normalize) {
            this[propName] = normalize(nativeEvent);
        } else {
            if (propName === 'target') {
                this.target = nativeEventTarget;
            } else {
                this[propName] = nativeEvent[propName];
            }
        }
    }

    const defaultPrevented =
        nativeEvent.defaultPrevented != null
            ? nativeEvent.defaultPrevented
            : nativeEvent.returnValue === false;
    if (defaultPrevented) {
        this.isDefaultPrevented = functionThatReturnsTrue;
    } else {
        this.isDefaultPrevented = functionThatReturnsFalse;
    }
    this.isPropagationStopped = functionThatReturnsFalse;
    return this;
}

Object.assign(SyntheticEvent.prototype, {
    preventDefault: function() {
        this.defaultPrevented = true;
        const event = this.nativeEvent;
        if (!event) {
            return;
        }

        if (event.preventDefault) {
            event.preventDefault();
        } else if (typeof event.returnValue !== 'unknown') {
            event.returnValue = false;
        }
        this.isDefaultPrevented = functionThatReturnsTrue;
    },

    stopPropagation: function() {
        const event = this.nativeEvent;
        if (!event) {
            return;
        }

        if (event.stopPropagation) {
            event.stopPropagation();
        } else if (typeof event.cancelBubble !== 'unknown') {
            // The ChangeEventPlugin registers a "propertychange" event for
            // IE. This event does not support bubbling or cancelling, and
            // any references to cancelBubble throw "Member not found".  A
            // typeof check of "unknown" circumvents this issue (and is also
            // IE specific).
            event.cancelBubble = true;
        }

        this.isPropagationStopped = functionThatReturnsTrue;
    },

    /**
     * We release all dispatched `SyntheticEvent`s after each event loop, adding
     * them back into the pool. This allows a way to hold onto a reference that
     * won't be added back into the pool.
     */
    persist: function() {
        this.isPersistent = functionThatReturnsTrue;
    },

    /**
     * Checks if this event should be released back into the pool.
     *
     * @return {boolean} True if this should not be released, false otherwise.
     */
    isPersistent: functionThatReturnsFalse,

    /**
     * `PooledClass` looks for `destructor` on each instance it releases.
     */
    destructor: function() {
        const Interface = this.constructor.Interface;
        for (const propName in Interface) {
                this[propName] = null;
        }
        this.dispatchConfig = null;
        this._targetInst = null;
        this.nativeEvent = null;
        this.isDefaultPrevented = functionThatReturnsFalse;
        this.isPropagationStopped = functionThatReturnsFalse;
        this._dispatchListeners = null;
        this._dispatchInstances = null;
    },
});

SyntheticEvent.Interface = EventInterface;

/**
 * Helper to reduce boilerplate when creating subclasses.
 */
SyntheticEvent.extend = function(Interface) {
    const Super = this;

    const E = function() {};
    E.prototype = Super.prototype;
    const prototype = new E();

    function Class() {
        return Super.apply(this, arguments);
    }
    Object.assign(prototype, Class.prototype);
    Class.prototype = prototype;
    Class.prototype.constructor = Class;

    Class.Interface = Object.assign({}, Super.Interface, Interface);
    Class.extend = Super.extend;
    addEventPoolingTo(Class);

    return Class;
};

addEventPoolingTo(SyntheticEvent);


function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
    const EventConstructor = this;
    if (EventConstructor.eventPool.length) {
        const instance = EventConstructor.eventPool.pop();
        EventConstructor.call(
            instance,
            dispatchConfig,
            targetInst,
            nativeEvent,
            nativeInst,
        );
        return instance;
    }
    return new EventConstructor(
        dispatchConfig,
        targetInst,
        nativeEvent,
        nativeInst,
    );
}

function releasePooledEvent(event) {
    const EventConstructor = this;
    event.destructor();
    if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
        EventConstructor.eventPool.push(event);
    }
}

function addEventPoolingTo(EventConstructor) {
    EventConstructor.eventPool = [];
    EventConstructor.getPooled = getPooledEvent;
    EventConstructor.release = releasePooledEvent;
}

export default SyntheticEvent;