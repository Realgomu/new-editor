

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

export function NodeTreeWalker(root: Element, func: (start: number, current: Element | Text, end?: number) => void, cbtext = false) {
    let filter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT;
    let walker = document.createTreeWalker(root, filter);
    let pos = 0;
    while (walker.nextNode()) {
        let current = walker.currentNode;
        let lenght = current.textContent.length;
        if (current.nodeType === 1) {
            //element node
            if (!cbtext) {
                func && func(pos, <Element>current, pos + lenght);
            }
        }
        else if (current.nodeType === 3) {
            if (cbtext) {
                func && func(pos, <Element>current, pos + lenght);
            }
            pos += lenght;
        }
    }
}

export function FindParend(current: Node, match: (node: Element) => boolean) {
    if (!match) {
        match = (node: Element) => {
            return node.hasAttribute('contenteditable');
        };
    }
    let target: Element;
    if (current.nodeType === 1) {
        target = current as Element;
    }
    else if (current.nodeType === 3) {
        target = current.parentElement;
    }
    else {
        return undefined;
    }
    while (!match(target) && target.nodeType !== Node.DOCUMENT_NODE) {
        target = target.parentElement;
    }
    return target;
}

export function FindElementParent(current: Node) {
    return FindParend(current, (node) => {
        return node.nodeType === 1;
    }) as Element;
}

export function FindBlockParent(current: Node) {
    return FindParend(current, (node) => {
        return node.nodeType === 1 && (<Element>node).hasAttribute('data-row-id');
    }) as Element;
}

export function FindLastNode(current: Node) {
    while (current.lastChild) {
        current = current.lastChild;
    }
    return current;
}

// http://stackoverflow.com/a/11752084/569101
const isMac = (window.navigator.platform.toUpperCase().indexOf('MAC') >= 0);

export function IsKey(event: KeyboardEvent, code: number | number[], metaCtrl: boolean = false) {
    let key = GetKeyCode(event);
    let same = false;
    if (code instanceof Array) {
        same = code.indexOf(key) >= 0;
    }
    else {
        same = code === key;
    }
    if (metaCtrl) {
        return IsMetaCtrlKey(event) && same;
    }
    else {
        return same;
    }
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

/** 深度比较对象全等 */
export function DeepCompare(x, y) {
    var i, l, leftChain, rightChain;

    function compare2Objects(x, y) {
        var p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }

        // Compare primitives and functions.     
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }

        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }

        if (x.constructor !== y.constructor) {
            return false;
        }

        if (x.prototype !== y.prototype) {
            return false;
        }

        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }

        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            } else if (typeof y[p] !== typeof x[p]) {
                return false;
            }

            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    if (arguments.length < 1) {
        return true; //Die silently? Don't know how to handle such case, please help...
        // throw "Need two or more arguments to compare";
    }

    for (i = 1, l = arguments.length; i < l; i++) {

        leftChain = []; //Todo: this can be cached
        rightChain = [];

        if (!compare2Objects(arguments[0], arguments[i])) {
            return false;
        }
    }

    return true;
}

export function InsertRenderTree(root: EE.IRenderNode, insert: EE.IRenderNode) {
    if (root.tag && root.children.length > 0) {
        let newChildren: EE.IRenderNode[] = [];
        for (let i = 0, l = root.children.length; i < l; i++) {
            let child = root.children[i];
            let left: EE.IRenderNode;
            let center: EE.IRenderNode;
            let right: EE.IRenderNode;
            if (insert && insert.end <= child.end) {
                center = insert;
                if (child.tag) {
                    InsertRenderTree(child, center);
                    newChildren.push(child);
                    insert = undefined;
                    continue;
                }
                else {
                }
            }
            else if (insert && insert.start <= child.end && insert.end > child.end) {
                center = {
                    tag: insert.tag,
                    start: insert.start,
                    end: child.end,
                    children: []
                };
                if (child.tag) {
                    InsertRenderTree(child, center);
                    insert.start = child.end;
                    newChildren.push(child);
                    continue;
                }
                else {
                }
            }
            else {
                newChildren.push(child);
                continue;
            }
            let collapsed = center.start === center.end;
            if (center.start > child.start) {
                left = {
                    tag: '',
                    start: child.start,
                    end: center.start,
                    children: []
                };
            }
            if (center.end < child.end) {
                right = {
                    tag: '',
                    start: center.end,
                    end: child.end,
                    children: []
                };
            }
            if (!collapsed) {
                center.children = [{
                    tag: '',
                    start: center.start,
                    end: center.end,
                    children: []
                }];
            }
            if (left && left.start !== left.end) newChildren.push(left);
            newChildren.push(center);
            if (right && right.start !== right.end) newChildren.push(right);
        }
        root.children = newChildren;
    }
    return root;
}

export function createElementByRenderTree(doc: Document, root: EE.IRenderNode, content: string) {
    let render = (node: EE.IRenderNode) => {
        if (!node.tag) {
            let str = content.substring(node.start, node.end);
            return doc.createTextNode(str);
        }
        else {
            let el = doc.createElement(node.tag);
            node.children.forEach(child => {
                el.appendChild(render(child));
            });
            for (let name in node.attr) {
                el.setAttribute(name, node.attr[name]);
            }
            return el;
        }
    }
    return render(root);
}