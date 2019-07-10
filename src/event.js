import SyntheticEvent from './SyntheticEvent'

const TOP_CLICK = 'click';

const interactiveEventTypeNames = [[TOP_CLICK, 'click']];
const eventTypes = {};
const topLevelEventsToDispatchConfig = {};

const _assign = Object.assign;

function addEventTypeNameToConfig(_ref, isInteractive) {
    const topEvent = _ref[0], event = _ref[1];

    const capitalizedEvent = event[0].toUpperCase() + event.slice(1);
    const onEvent = 'on' + capitalizedEvent;

    const type = {
        phasedRegistrationNames: {
            bubbled: onEvent,
            captured: onEvent + 'Capture'
        },
        dependencies: [topEvent],
        isInteractive: isInteractive
    };
    eventTypes[event] = type;
    topLevelEventsToDispatchConfig[topEvent] = type;
}

interactiveEventTypeNames.forEach(function (eventTuple) {
    addEventTypeNameToConfig(eventTuple, true);
});

const SimpleEventPlugin = {
    eventTypes: eventTypes,

    isInteractiveTopLevelEventType: function (topLevelType) {
        const config = topLevelEventsToDispatchConfig[topLevelType];
        return config !== undefined && config.isInteractive === true;
    },

    extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
        const dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
        if (!dispatchConfig) {
            return null;
        }
        if (topLevelType && nativeEvent.button === 2) {
            return null;
        }
        const event = SyntheticMouseEvent.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
        accumulateTwoPhaseDispatches(event);
        return event;
    }
};

const SyntheticMouseEvent = SyntheticEvent.extend({});

const injection = {
    /**
     * @param {array} InjectedEventPluginOrder
     * @public
     */
    injectEventPluginOrder: injectEventPluginOrder,

    /**
     * @param {object} injectedNamesToPlugins Map from names to plugin modules.
     */
    injectEventPluginsByName: injectEventPluginsByName
};

function injectEventPluginsByName(injectedNamesToPlugins) {
    let isOrderingDirty = false;
    for (let pluginName in injectedNamesToPlugins) {
        if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
            continue;
        }
        let pluginModule = injectedNamesToPlugins[pluginName];
        if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== pluginModule) {
            (function () {
                if (!!namesToPlugins[pluginName]) {
                    {
                        throw ReactError('EventPluginRegistry: Cannot inject two different event plugins using the same name, `' + pluginName + '`.');
                    }
                }
            })();
            namesToPlugins[pluginName] = pluginModule;
            isOrderingDirty = true;
        }
    }
    if (isOrderingDirty) {
        recomputePluginOrdering();
    }
}


injection.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin
});

const PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
const elementListeningSets = new PossiblyWeakMap();

function getListeningSetForElement(element) {
    let listeningSet = elementListeningSets.get(element);
    if (listeningSet === undefined) {
        listeningSet = new Set();
        elementListeningSets.set(element, listeningSet);
    }
    return listeningSet;
}

addEventPoolingTo(SyntheticEvent);

export function ensureListeningTo (mountAt, registrationName) {
    var listeningSet = getListeningSetForElement(mountAt);
    var dependencies = registrationNameDependencies[registrationName];

    for (var i = 0; i < dependencies.length; i++) {
        var dependency = dependencies[i];
        if (!listeningSet.has(dependency)) {
            switch (dependency) {
                case TOP_SCROLL:
                    trapCapturedEvent(TOP_SCROLL, mountAt);
                    break;
                case TOP_FOCUS:
                case TOP_BLUR:
                    trapCapturedEvent(TOP_FOCUS, mountAt);
                    trapCapturedEvent(TOP_BLUR, mountAt);
                    // We set the flag for a single dependency later in this function,
                    // but this ensures we mark both as attached rather than just one.
                    listeningSet.add(TOP_BLUR);
                    listeningSet.add(TOP_FOCUS);
                    break;
                case TOP_CANCEL:
                case TOP_CLOSE:
                    if (isEventSupported(getRawEventName(dependency))) {
                        trapCapturedEvent(dependency, mountAt);
                    }
                    break;
                case TOP_INVALID:
                case TOP_SUBMIT:
                case TOP_RESET:
                    // We listen to them on the target DOM elements.
                    // Some of them bubble so we don't want them to fire twice.
                    break;
                default:
                    // By default, listen on the top level to all non-media events.
                    // Media events don't bubble so adding the listener wouldn't do anything.
                    var isMediaEvent = mediaEventTypes.indexOf(dependency) !== -1;
                    if (!isMediaEvent) {
                        trapBubbledEvent(dependency, mountAt);
                    }
                    break;
            }
            listeningSet.add(dependency);
        }
    }
}