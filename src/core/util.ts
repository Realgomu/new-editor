

/** 获取指定长度的随机ID */
export function RandomID(lenght: number = 6) {
    let key = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < lenght; i++) {
        let count = key.length;
        result += key[Math.floor(Math.random() * count)];
    }
    return result;
}

function isObject(value) { return value !== null && typeof value === 'object'; }
function isFunction(value) { return typeof value === 'function'; }
function isDate(value) { return toString.call(value) === '[object Date]'; }
function isRegExp(value) { return toString.call(value) === '[object RegExp]'; }
var isArray = Array.isArray;
function isElement(node) {
    return !!(node &&
        (node.nodeName  // We are a direct element.
            || (node.prop && node.attr && node.find)));  // We have an on and find method part of jQuery API.
}
/** extend func */
function baseExtend(dst: any, objs: any[], deep = true) {
    for (var i = 0, ii = objs.length; i < ii; ++i) {
        var obj = objs[i];
        if (!isObject(obj) && !isFunction(obj)) continue;
        var keys = Object.keys(obj);
        for (var j = 0, jj = keys.length; j < jj; j++) {
            var key = keys[j];
            var src = obj[key];

            if (deep && isObject(src)) {
                if (isDate(src)) {
                    dst[key] = new Date(src.valueOf());
                } else if (isRegExp(src)) {
                    dst[key] = new RegExp(src);
                } else if (src.nodeName) {
                    dst[key] = src.cloneNode(true);
                } else if (isElement(src)) {
                    dst[key] = src.clone();
                } else {
                    if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
                    baseExtend(dst[key], [src], true);
                }
            } else {
                dst[key] = src;
            }
        }
    }
    return dst;
}
var slice = [].slice;
export function Extend(dst, ...args: any[]) {
    return baseExtend(dst, slice.call(arguments, 1));
}

export function NodeListForEach<T extends Node>(nodes: NodeListOf<T>, func: (node: T, index: number) => void) {
    if (nodes && nodes.length > 0) {
        for (let i = 0, l = nodes.length; i < l; i++) {
            func && func(nodes[i], i);
        }
    }
}

export function FindParent(target: Element, match: (el: Element) => boolean) {
    if (!match) {
        match = (el: Element) => {
            return el.nodeType === Node.DOCUMENT_NODE;
        };
    }
    while (!match(target)) {
        target = target.parentElement;
    }
    return target;
}

export function NearestElement(node: Node) {
    if (node.nodeType === 3) {
        return node.parentNode as Element;
    }
    else {
        return node as Element;
    }
}

// http://stackoverflow.com/a/11752084/569101
const isMac = (window.navigator.platform.toUpperCase().indexOf('MAC') >= 0);

export function IsKey(event: KeyboardEvent, code: number | number[]) {
    let key = GetKeyCode(event);
    if (code instanceof Array) {
        return code.indexOf(key) >= 0;
    }
    else {
        return code === key;
    }
}

export function IsShiftKey(event: KeyboardEvent) {
    return event.shiftKey;
}

export function IsAltKey(event: KeyboardEvent) {
    return event.altKey;
}

export function IsMetaCtrlKey(event: KeyboardEvent) {
    if ((isMac && event.metaKey) || (!isMac && event.ctrlKey)) {
        return true;
    }

    return false;
}

export function GetKeyCode(event: KeyboardEvent) {
    var keyCode = event.which;

    // getting the key code from event
    if (null === keyCode) {
        keyCode = event.charCode !== null ? event.charCode : event.keyCode;
    }

    return keyCode;
}

export function CreateRenderElement(doc: Document, renderNode: EE.IRenderNode) {
    let el = doc.createElement(renderNode.tag);
    //设置attr
    for (let name in renderNode.attr) {
        el.setAttribute(name, renderNode.attr[name]);
    }
    //children
    if (renderNode.children && renderNode.children.length > 0) {
        renderNode.children.forEach(child => {
            el.appendChild(CreateRenderElement(doc, child));
        });
    }
    return el;
}

export function CreateEmptyNode(doc: Document) {
    let el = doc.createElement('div');
    el.innerHTML = '&#8203;';
    return el.lastChild;
}

export function MatchSelector(el: Element, selector: string) {
    let match = false;
    let patterns = selector.split('.');
    if (!selector || patterns.length === 0) {
        return false;
    }
    for (let i = 0, l = patterns.length; i < l; i++) {
        if (i === 0) {
            if (patterns[i] !== '*' && el.tagName.toLowerCase() !== patterns[i].toLowerCase()) {
                return false;
            }
        }
        else {
            if (!el.classList.contains(patterns[i])) {
                return false;
            }
        }
    }
    return true;
}

export function BlockDelete(block: EE.IBlock, start: number, end: number) {
    let offset = end - start;
    let newObj = Extend({}, block) as EE.IBlock;
    newObj.text = block.text.substring(0, start) + block.text.substring(end, block.text.length);
    for (let key in block.inlines) {
        let newList = [];
        newObj.inlines[key].forEach(inline => {
            if (inline.end <= start) {
                newList.push(inline)
            }
            else if (inline.start < start && inline.end <= end) {
                inline.end = start;
                newList.push(inline);
            }
            else if (inline.start < start && end < inline.end) {
                newList.push({ start: inline.start, end: start });
                newList.push({ start: end - offset, end: inline.end - offset });
            }
            else if (start <= inline.start && inline.end <= end) {

            }
            else if (start <= inline.start && end < inline.end) {
                inline.start = end - offset;
                inline.end = inline.end - offset;
                newList.push(inline);
            }
            else if (end <= inline.start) {
                inline.start -= offset;
                inline.end -= offset;
                newList.push(inline);
            }
        });
        newObj.inlines[key] = newList;
    }
    return newObj;
}

export function DeepCompare(a, b) {
    if (!a || !b) {
        return false;
    }
    let keys = Object.keys(a).concat(Object.keys(b));
    for (let key of keys) {
        let obj = a[key];
        if (obj instanceof Array) {
            if (!(b[key] instanceof Array)) {
                return false;
            }
            else if (!DeepCompare(obj, b[key])) {
                return false;
            }
        }
        else if (obj instanceof Object) {
            if (!(b[key] instanceof Object)) {
                return false;
            }
            else if (!DeepCompare(obj, b[key])) {
                return false;
            }
        }
        else if (obj instanceof Date) {
            if (!(b[key] instanceof Date)) {
                return false;
            }
            else if (obj.getTime() === b[key].getting()) {
                return false;
            }
        }
        else if (obj instanceof Function) {
            //ignore function
        }
        else if (obj !== b[key]) {
            return false;
        }
    }
    return true;
}

export function NodeIndex(parent: Node, child: Node) {
    for (let i = 0, l = parent.childNodes.length; i < l; i++) {
        if (parent.childNodes[i] === child) {
            return i;
        }
    }
    return -1;
}