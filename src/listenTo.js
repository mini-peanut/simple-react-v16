function listenTo(registrationName, mountAt) {
    const listeningSet = getListeningSetForElement(mountAt);
    const dependencies =  [registrationName];

    for (let i = 0; i < dependencies.length; i++) {
        const dependency = dependencies[i];
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
                    const isMediaEvent = mediaEventTypes.indexOf(dependency) !== -1;
                    if (!isMediaEvent) {
                        trapBubbledEvent(dependency, mountAt);
                    }
                    break;
            }
            listeningSet.add(dependency);
        }
    }
}

export function isListeningToAllDependencies(registrationName, mountAt) {
    const listeningSet = getListeningSetForElement(mountAt);
    const dependencies = registrationNameDependencies[registrationName];

    for (let i = 0; i < dependencies.length; i++) {
        const dependency = dependencies[i];
        if (!listeningSet.has(dependency)) {
            return false;
        }
    }
    return true;
}