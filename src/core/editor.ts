import * as Util from './util';
import { Tools } from './tools';
import { Events } from './events';
import { Selection } from './selection';
import { Actions } from './action';
import * as UI from 'default/index';

import './polyfill';

//tools
import 'tools/break';
import 'tools/link';
import 'tools/blod';
import 'tools/italic';
import 'tools/underline';
import 'tools/strike';
import 'tools/super';
import 'tools/sub';
import 'tools/paragraph';
import 'tools/pre';
import 'tools/header';

export class Editor implements EE.IEditor {
    options: EE.IEditorOptions;
    tools: Tools;
    events: Events;
    selection: Selection;
    actions: Actions;
    defaultUI: UI.DefaultUI;

    ownerDoc: Document = document;
    rootEl: HTMLElement;
    constructor(el: HTMLElement, options?: EE.IEditorOptions) {
        let defaultOptions: EE.IEditorOptions = {
            tools: 'all',
            defaultUI: true,
            inline: false,
            toolbars: ['pre', 'h1', 'h2', '|', 'bold', 'italic', 'underline', 'strike', '|']
        };

        this.options = Object.assign(defaultOptions, options || {});
        this.rootEl = el;

        //init functions
        this.tools = new Tools(this);
        this.events = new Events(this);
        this.selection = new Selection(this);
        this.actions = new Actions(this);

        //init ui
        if (this.options.defaultUI) {
            this.defaultUI = new UI.DefaultUI(this);
            this.defaultUI.init(el);
        }
        else {
            this.initContentEditable(el);
        }

        //init events
        this.events.init();

        setTimeout(() => {
            let data = this.getData();
            this.loadData(data);

            this.rootEl.click();
            this.selection.restoreCursor();
            this._cursorMoved();
        }, 300);
    }

    initContentEditable(el: HTMLElement) {
        this.rootEl = el;
        this.rootEl.setAttribute('contenteditable', '');
        this.rootEl.classList.add('ee-view');
    }

    private _initEvents() {
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
                // this.actions.undo();
                ev.preventDefault();
            }
            else if (Util.IsKey(ev, EE.KeyCode.Y, true)) {
                // this.actions.redo();
                ev.preventDefault();
            }
        });
        let _timer: number;
        this.rootEl.addEventListener('input', (ev) => {
            if (!isComposition) {
                if (_timer) clearTimeout(_timer);
                _timer = setTimeout(() => {
                    this._cursorMoved();
                }, 500);
            }
        });
        let isComposition = false;
        this.rootEl.addEventListener('compositionstart', (ev) => {
            isComposition = true;
        });
        this.rootEl.addEventListener('compositionend', (ev) => {
            isComposition = false;
            this._cursorMoved();
        });
        this.rootEl.addEventListener('focus', (ev) => {
            console.log('focus');
        });
        this._checkEmpty();
    }

    private _checkEmpty() {
        if (this.rootEl.outerText == '' || this.rootEl.childNodes.length === 0) {
            this.rootEl.innerHTML = `<p data-row-id="${Util.RandomID()}"><br></p>`;
        }
    }

    private _cursorMoved() {
        this.selection.updateCurrent();
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

    loadData(data: EE.IBlock[]) {
        this.rootEl.innerHTML = '';
        let list = data.forEach(block => {
            let tool = this.tools.matchToken(block.token) as EE.IBlockTool;
            this.rootEl.appendChild(tool.render(block));
        });
        console.log('load data success');
    }

    excuCommand(token: string, ...args: any[]) {
        let tool = this.tools.matchActionTool(token);
        if (tool) {
            tool.redo(args);
        }
    }
}