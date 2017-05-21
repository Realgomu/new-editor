import * as Util from './util';
import { Tools } from './tool';
import { Selection } from './selection';
import { Actions } from './action';

//tools
import 'tools/blod';
import 'tools/paragraph';
import 'tools/underline';
import 'tools/pre';

export class Editor implements EE.IEditor {
    options: EE.IEditorOptions;
    tools: Tools;
    selection: Selection;
    actions: Actions;

    ownerDoc: Document = document;
    rootEl: HTMLElement;
    constructor(el: HTMLElement, options?: EE.IEditorOptions) {
        let defaultOptions: EE.IEditorOptions = {
            tools: 'all'
        };

        this.options = defaultOptions;
        this.rootEl = el;

        //init functions
        this.tools = new Tools(this);
        this.selection = new Selection(this);
        this.actions = new Actions(this);

        //init events
        this._initEvents();

        setTimeout(() => {
            this.rootEl.click();
            this.selection.restoreCursor();
        }, 300)
    }

    private _initEvents() {
        this.rootEl.setAttribute('contenteditable', '');

        this.rootEl.addEventListener('keyup', (ev: KeyboardEvent) => {
            this._checkEmpty();
            if (Util.IsKey(ev, [EE.KeyCode.Left, EE.KeyCode.Up, EE.KeyCode.Right, EE.KeyCode.Down])) {
                this._cursorMoved();
            }
        });
        this.rootEl.addEventListener('mouseup', (ev) => {
            setTimeout(() => {
                this._cursorMoved();
            });
        });
        this.rootEl.addEventListener('touchend', (ev) => {
            this._cursorMoved();
        });
        this.rootEl.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (Util.IsKey(ev, EE.KeyCode.Z, true)) {
                this.actions.undo();
                ev.preventDefault();
                ev.stopPropagation();
            }
            else if (Util.IsKey(ev, EE.KeyCode.Y, true)) {
                this.actions.redo();
                ev.preventDefault();
                ev.stopPropagation();
            }
        });
        this.rootEl.addEventListener('input', (ev) => {
            if (!isComposition) {
                console.log('input ev');
            }
        });
        let isComposition = false;
        this.rootEl.addEventListener('compositionstart', (ev) => {
            isComposition = true;
        });
        this.rootEl.addEventListener('compositionend', (ev) => {
            isComposition = false;
            console.log('input ev');
        });
        this.rootEl.addEventListener('focus', (ev) => {
            console.log('focus');
        })
        this._checkEmpty();
    }

    private _checkEmpty() {
        if (this.rootEl.outerText == '' || this.rootEl.childNodes.length === 0) {
            this.rootEl.innerHTML = `<p data-row-id="${Util.RandomID()}"><br></p>`;
        }
    }

    private _cursorMoved() {
        this.selection.updateCurrent();
        console.log(this.selection.lastPos);
    }

    getData() {
        let data = [];
        for (let i = 0, l = this.rootEl.childNodes.length; i < l; i++) {
            let node = this.rootEl.childNodes[i];
            if (node.nodeType === 1) {
                let tool = this.tools.matchBlockTool(<Element>node);
                let result = tool.getData(<Element>node);
                data.push(result);
            }
        }
        return data;
    }

    excuCommand(token: string) {
        let tool = this.tools.matchActionTool(token);
        if (tool) {
            tool.redo();
        }
    }
}