import { updateContainer, createContainer } from 'reconciler'

const ReactDOM = {
    render (reactElement, container) {
        let root = container._reactRootContainer;
        if (!root) {
            root = container._reactRootContainer = createContainer(container)
        }
        updateContainer(reactElement, root)
    }
};
