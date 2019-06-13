// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.

const hasSymbol = typeof Symbol === 'function' && Symbol.for;

export const REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
