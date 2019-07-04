function Component(props) {
    this.props = props
}
Component.prototype.setState = function (partialState) {
    this.updater.enqueueSetState(this, partialState)
};
const createElement = function(type, config, ...children) {
    let props = {};

    // 将第二个参数config和第三个参数children合并成一个
    if (config !== null) {
        props = _.defaultsDeep({}, config);
    }

    if (children.length >= 1) {
        props.children = children.length === 1 ? children[0] : children
    }

    return {
        type: type,
        props: props
    };
};
const React = {
    Component,
    createElement
};
