

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