import * as Util from './util';
import { Editor } from './editor';


export interface ICustomEventMap {
    [name: string]: IHandlerObj[];
}

export interface IHandlerObj {
    name: string;
    listener: CommonListener;
    selector?: string;
}

export type CommonListener = (ev: Event, ...args: any[]) => any;

export class Events {
    private _customEvents: ICustomEventMap = {};
    private _domEvents: { 0: string; 1: Element | Document; 2: any; }[] = [];

    constructor(private editor: Editor) {

    }

    init() {
        this._attachEditableEvents(this.editor.rootEl);

        //custom
        this.on('$input', (ev) => {
            this.editor.cursor.update(ev);
            console.log('input');
            this.editor.getData();
        });
    }

    on(name: string, listener: CommonListener, selector?: string) {
        if (!this._customEvents[name]) {
            this._customEvents[name] = [];
        }
        let list = this._customEvents[name];
        list.push({
            name: name,
            listener: listener,
            selector: selector
        });
    }

    off(name: string, listener: CommonListener) {

    }

    trigger(name: string, ev: Event, ...args: any[]) {
        console.log(`trigger event [${name}]`);
        if (!this._customEvents[name]) {
            this._customEvents[name] = [];
        }
        let list = this._customEvents[name];
        for (let i = 0, l = list.length; i < l; i++) {
            let handler = list[i];
            if (handler.selector) {
                let target = this._querySelector(handler.selector, ev)
                if (target) {
                    handler.listener && handler.listener(ev, target, ...args);
                }
            }
            else {
                handler.listener && handler.listener(ev, ...args);
            }
        }
    }

    private _querySelector(selector: string, ev: Event) {
        if (ev && ev.target) {
            let nodes = this.editor.rootEl.querySelectorAll(selector);
            for (let i = 0, l = nodes.length; i < l; i++) {
                let node = nodes[i];
                if (ev.target === node) {
                    return node;
                }
                else if (node.contains(ev.target as Node)) {
                    return node;
                }
            }
        }
        return undefined;
    }

    destroy() {
        this._removeAll();
    }

    private _attachEditableEvents(root: Element) {
        this.attach('input', root, this._input.bind(this));
        this.attach('compositionstart', root, this._compositionstart.bind(this));
        this.attach('compositionend', root, this._compositionend.bind(this));
        this.attach('click', root, this._click.bind(this));
        this.attach('keydown', root, this._keydown.bind(this));
        this.attach('keyup', root, this._keyup.bind(this));
        this.attach('touchend', root, this._touchend.bind(this));
        this.attach('mouseup', root, this._mouseup.bind(this));
        this.attach('paste', root, (ev) => {
            ev.preventDefault();
        });
    }

    attach(name: string, el: Element | Document, listener: any) {
        el.addEventListener(name, listener);
        this._domEvents.push([name, el, listener]);
    }

    remove(name: string, el: Element | Document, listener?: any) {
        let event = this._domEvents.find(e => e[0] === name && e[1] === el && (!listener || e[3] === listener));
        if (event) {
            event[1].removeEventListener(event[0], event[2]);
        }
    }

    private _removeAll() {
        for (let i = 0, l = this._domEvents.length; i < l; i++) {
            let event = this._domEvents[i];
            event[1].removeEventListener(event[0], event[2]);
        }
    }

    //input event
    private _timer: number;
    private _input(ev: Event) {
        if (!this._isComposition) {
            if (this._timer) clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                this.trigger('$input', ev);
            }, 300);
        }
    }

    //composition
    private _isComposition = false;
    private _compositionstart(ev: Event) {
        this._isComposition = true;
    }
    private _compositionend(ev: Event) {
        this._isComposition = false;
        this.trigger('$input', ev);
    }


    //click
    private _click(ev: MouseEvent) {
        this.trigger('$click', ev);
    }

    //keydown
    private _keydown(ev: KeyboardEvent) {
        let prevent = false;
        //enter
        switch (Util.GetKeyCode(ev)) {
            case EE.KeyCode.ENTER:
                if (!Util.IsShiftKey(ev)) {
                    this.editor.actions.doEnter(ev);
                    this.trigger('$enter', ev);
                }
                break;
            case EE.KeyCode.DELETE:
                this.editor.actions.doBackspace();
                break;
            case EE.KeyCode.BACKSPACE:
                this.editor.actions.doBackspace();
                break;
            case EE.KeyCode.Z:
                if (Util.IsMetaCtrlKey(ev)) {
                    //undo
                    // this.editor.actions.undo();
                    prevent = true;
                }
                break;
            case EE.KeyCode.Y:
                if (Util.IsMetaCtrlKey(ev)) {
                    //redo
                    prevent = true;
                }
            case EE.KeyCode.A:
                if (Util.IsMetaCtrlKey(ev)) {
                    setTimeout(() => {
                        this.editor.cursor.update(ev);
                    });
                }
                break;
            case EE.KeyCode.Up:
            case EE.KeyCode.Left:
            case EE.KeyCode.Down:
            case EE.KeyCode.Right:
                if (!Util.IsMetaCtrlKey(ev)) {
                    setTimeout(() => {
                        this.editor.cursor.update(ev);
                    });
                }
                break;
        }
        if (prevent) {
            ev.preventDefault();
        }
    }

    private _keyup(ev: KeyboardEvent) {
        // this.editor.cursor.update(ev);
    }

    private _touchend(ev: TouchEvent) {
        setTimeout(() => {
            this.editor.cursor.update(ev);
        });
    }

    private _mouseup(ev: MouseEvent) {
        setTimeout(() => {
            this.editor.cursor.update(ev);
        });
    }
}