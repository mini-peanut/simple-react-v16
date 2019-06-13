import { REACT_ELEMENT_TYPE } from "./ReactSymbols";

const hasOwnProperty = Object.prototype.hasOwnProperty;

const ReactElement = function(type, key, ref, self, source, owner, props) {
    return {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: REACT_ELEMENT_TYPE,

        // Built-in properties that belong on the element
        type: type,
        key: key,
        ref: ref,
        props: props,
    };
};

/**
 * Create and return a new ReactElement of the given type.
 * See https://reactjs.org/docs/react-api.html#createelement
 */
export function createElement(type, config, children) {
    let propName;

    // Reserved names are extracted
    const props = {};

    let key = null;
    let ref = null;
    let self = null;
    let source = null;

    if (config != null) {
        // Remaining properties are added to a new props object
        for (propName in config) {
            if (hasOwnProperty.call(config, propName)) {
                props[propName] = config[propName];
            }
        }
    }

    // Children can be more than one argument, and those are transferred onto
    // the newly allocated props object.
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
        props.children = children;
    } else if (childrenLength > 1) {
        const childArray = Array(childrenLength);
        for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
        }
        props.children = childArray;
    }

    // Resolve default props
    if (type && type.defaultProps) {
        const defaultProps = type.defaultProps;
        for (propName in defaultProps) {
            if (props[propName] === undefined) {
                props[propName] = defaultProps[propName];
            }
        }
    }

    return ReactElement(
        type,
        key,
        ref,
        self,
        source,
        ReactCurrentOwner.current,
        props,
    );
}
