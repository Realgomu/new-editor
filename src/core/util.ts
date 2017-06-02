

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

/** 遍历dom节点 */
export function TreeWalker(
    doc: Document,
    root: Element,
    func: (current: Element | Text) => void,
    onlyText: boolean = false
) {
    let watchToShow = onlyText ? NodeFilter.SHOW_TEXT : NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT;
    let walker = document.createTreeWalker(root, watchToShow, null, false);
    let pos = 0;
    while (walker.nextNode()) {
        let current = walker.currentNode;
        func && func(current as Element | Text);
    }
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

/** 向dom中插入需要渲染的子节点 */
export function InsertRenderTree(doc: Document, root: HTMLElement, insert: EE.IRenderNode) {
    if (root && insert) {
        let walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (walker.nextNode() && insert) {
            let leftText = walker.currentNode as Text;
            let current = leftText.$renderNode;
            let left: EE.IRenderNode;
            let center: EE.IRenderNode;
            let right: EE.IRenderNode;
            if (insert.end <= current.end) {
                center = insert;
                insert = undefined;
            }
            else if (insert.start <= current.end && insert.end > current.end) {
                center = {
                    tag: insert.tag,
                    start: insert.start,
                    end: current.end
                };
                insert.start = current.end;
            }
            else {
                continue;
            }
            let collapsed = center.start === center.end;
            if (collapsed) {
                //如果该节点是闭合节点
                let el = CreateRenderElement(doc, center);
                if (center.start === current.start) {
                    leftText.parentNode.insertBefore(el, leftText);
                }
                else if (center.start === current.end) {
                    leftText.parentNode.appendChild(el);
                }
                else {
                    //切分当前text节点
                    let split = leftText.splitText(center.start - current.start);
                    leftText.parentNode.insertBefore(el, split);
                }
            }
            else {
                //如果不是闭合节点
                let centerText = leftText;
                if (center.start > current.start) {
                    //切分左边
                    left = {
                        tag: '',
                        start: current.start,
                        end: center.start,
                    };
                    centerText = leftText.splitText(center.start - current.start);
                    leftText.$renderNode = left;
                }
                if (center.end < current.end) {
                    //切分右边
                    right = {
                        tag: '',
                        start: center.end,
                        end: current.end,
                    };
                    let rightText = centerText.splitText(center.end - center.start);
                    rightText.$renderNode = right;
                }
                centerText.$renderNode = center;
                let el = CreateRenderElement(doc, center);
                leftText.parentNode.replaceChild(el, centerText);
                el.appendChild(centerText);
            }
        }
    }
}

/** 根据render node创建dom元素 */
export function CreateRenderElement(doc: Document, node: EE.IRenderNode) {
    if (!node.tag) {
        //创建text节点
        let text = doc.createTextNode(node.content);
        if (node.start !== undefined || node.end !== undefined) {
            //删除缓存的content信息
            delete node.content;
            //在dom上记录位置信息
            text.$renderNode = node;
        }
        return text;
    }
    else {
        let el = doc.createElement(node.tag);
        //如果有text则添加一个text元素
        if (node.content && node.start !== node.end) {
            let text = doc.createTextNode(node.content);
            text.$renderNode = {
                tag: '',
                start: node.start,
                end: node.end,
                text: node.content
            };
            el.appendChild(text);
        }
        if (node.start !== undefined || node.end !== undefined) {
            //删除缓存的content信息
            delete node.content;
            //在dom上记录位置信息
            el.$renderNode = node;
        }
        //设置attr
        for (let name in node.attr) {
            el.setAttribute(name, node.attr[name]);
        }
        //children
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                el.appendChild(CreateRenderElement(doc, child));
            });
        }
        return el;
    }
}

export function CreateEmptyNode(doc: Document) {
    let el = doc.createElement('div');
    el.innerHTML = '&#8203;';
    return el.lastChild;
}

export function MathSelector(el: Element, selector: string) {
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
                newList.push({ start: inline.start, end: start, data: inline.data });
                newList.push({ start: end - offset, end: inline.end - offset, data: inline.data });
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