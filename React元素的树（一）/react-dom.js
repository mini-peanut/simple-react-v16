const registrationNames = ['onClick'];

function render (reactElement, container) {
    const Component = reactElement.type;
    const inst = new Component();
    inst.parent = container;

    let children = inst.render();
    children = Array.isArray(children) ? children : [children]
    children.map(item => container.appendChild(renderChildren(item)))
}

function renderChildren(node) {
    const {type, props} = node;
    const dom = document.createElement(type);

    _.entries(props).map(([key, value]) => {
        if (key === 'children') {
            Array.isArray(value)
                ? value.map(child => appendChild(dom, child))
                : appendChild(dom, value)
        }
        else if (registrationNames.includes(key)) {
            let eventType = key.slice(2).toLocaleLowerCase();
            dom.addEventListener(eventType, value);
            dom.setAttribute([key], value)
        }
        else {
            dom.setAttribute(key, value)
        }
    });

    return dom
}

function appendChild(parent, childNode) {
    if (['string', 'number'].some(val => typeof childNode === val)) {
        parent.textContent = childNode
    } else {
        parent.appendChild(renderChildren(childNode))
    }
}

const ReactDOM = {
    render
};
