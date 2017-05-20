import * as Tool from '../core/tool';
import * as Selection from 'core/selection';
import * as Key from 'core/key';
import * as Action from 'core/action';

//tools
import blod from 'tools/blod';
import paragraph from 'tools/paragraph';
import underline from 'tools/underline';
import pre from 'tools/pre';

Tool.register([
    blod,
    underline,
    paragraph,
    pre,
]);

let rootEl: Element;

export function init(el: Element) {
    rootEl = el;
    el.setAttribute('contenteditable', '');

    el.addEventListener('keyup', (ev: KeyboardEvent) => {
        checkEmpty();
        if (Key.IsKey(ev, [Key.KeyCode.Left, Key.KeyCode.Up, Key.KeyCode.Right, Key.KeyCode.Down])) {
            cursorMoved();
        }
    });
    el.addEventListener('mouseup', (ev) => {
        cursorMoved();
    });
    el.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (Key.IsKey(ev, Key.KeyCode.Z, true)) {
            Action.undo();
            ev.preventDefault();
            ev.stopPropagation();
        }
        else if (Key.IsKey(ev, Key.KeyCode.Y, true)) {
            Action.redo();
            ev.preventDefault();
            ev.stopPropagation();
        }
    });
    el.addEventListener('input', (ev) => {
        if (!isComposition) {
            console.log('input ev');
        }
    });
    let isComposition = false;
    el.addEventListener('compositionstart', (ev) => {
        isComposition = true;
    });
    el.addEventListener('compositionend', (ev) => {
        isComposition = false;
        console.log('input ev');
    });
    checkEmpty();
}

function checkEmpty() {
    if (rootEl.innerHTML == '') {
        rootEl.innerHTML = '<p><br></p>';
    }

}

function cursorMoved() {
    console.log(document.getSelection());
    console.log(Selection.Current());
}

export function getData() {
    let data = [];
    for (let i = 0, l = rootEl.childNodes.length; i < l; i++) {
        let node = rootEl.childNodes[i];
        if (node.nodeType === 1) {
            let tool = Tool.MatchBlockTool(<Element>node);
            let result = tool.getData(<Element>node);
            data.push(result);
        }
    }
    return data;
}

export function excuCommand(token: string) {
    let tool = Tool.matchActionTool(token);
    if (tool) {
        tool.redo();
    }
}