

/** 获取指定长度的随机ID */
export function randomID(lenght: number = 6) {
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

export function findParend(current: Node, match: (node: Element) => boolean) {
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

export function findElementParent(current: Node) {
    return findParend(current, (node) => {
        return node.nodeType === 1;
    }) as Element;
}

export function findBlockParent(current: Node) {
    return findParend(current, (node) => {
        return node.nodeType === 1 && (<Element>node).hasAttribute('data-row-id');
    }) as Element;
}