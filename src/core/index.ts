
interface IRange {
    el: string;
    start: number;
    end: number;
}

export function editorRun() {
    let el = document.querySelector('.text-editor > p');
    console.log(['block', { text: el.textContent }]);
    let ranges = _createRanges(el);
    console.log(ranges);

    let html = _renderBlock(el.textContent, ranges);
    console.log(html);
}

function _createRanges(element: Element): IRange[] {
    let treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_ALL);
    let pos = 0;
    let list = [];
    while (treeWalker.nextNode()) {
        let current = treeWalker.currentNode;
        if (current.nodeType < 3) {
            list.push({
                el: current.nodeName.toLowerCase(),
                start: pos,
                end: pos + current.textContent.length
            });
        }
        else if (current.nodeType === 3) {
            pos += current.nodeValue.length;
        }
    }
    return list;
}

function _renderBlock(text: string, ranges: IRange[]) {
    let list = {};
    ranges.forEach(r => {
        if (list[r.start] === undefined) {
            list[r.start] = '';
        }
        list[r.start] += `<${r.el}>`;
        if (list[r.end] === undefined) {
            list[r.end] = '';
        }
        list[r.end] = `</${r.el}>` + list[r.end];
    });
    console.log(list);
    let lastPos = 0;
    let html = '';
    for (let key in list) {
        let pos = parseInt(key);
        if (pos > lastPos) {
            html += text.substr(lastPos, pos - lastPos);
        }
        html += list[pos];
        lastPos = pos;
    }
    html += text.substr(lastPos, text.length - lastPos);
    return html;
}