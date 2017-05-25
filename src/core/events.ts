import * as Util from './util';
import { Editor } from './editor';

export class Events {
    private _customEvents: EE.ICustomEventMap = {};
    private _domEvents: { 0: string; 1: Element; 2: any; }[] = [];

    constructor(private editor: Editor) {

    }

    init() {
        this._attachEditableEvents(this.editor.rootEl);

        //custom
        this.on('$input', (editor, ev) => {
            editor.selection.update();
            console.log('input');
            editor.getData();
        });
        this.on('$click', (EREditor, ev) => {
            console.log('click link');
        }, 'a');
    }

    on(name: string, listener: EE.CommonListener, selector?: string) {
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

    off(name: string, listener: EE.CommonListener) {

    }

    trigger(name: string, ev: Event, ...args: any[]) {
        if (!this._customEvents[name]) {
            this._customEvents[name] = [];
        }
        let list = this._customEvents[name];
        for (let i = 0, l = list.length; i < l; i++) {
            let handler = list[i];
            if (handler.selector) {
                if (ev && ev.target && this._querySelector(handler.selector, ev)) {
                    handler.listener && handler.listener(this.editor as any, ev, ...args);
                }
            }
            else {
                handler.listener && handler.listener(this.editor as any, ev, ...args);
            }
        }
    }

    private _querySelector(selector: string, ev: Event) {
        let nodes = this.editor.rootEl.querySelectorAll(selector);
        for (let i = 0, l = nodes.length; i < l; i++) {
            let node = nodes[i];
            if (ev.target === node) {
                return true;
            }
            else if (node.contains(ev.target as Node)) {
                return true;
            }
        }
        return false;
    }

    destroy() {
        this._removeAll();
    }

    private _attachEditableEvents(root: Element) {
        this._attach('input', root, this._input.bind(this));
        this._attach('compositionstart', root, this._compositionstart.bind(this));
        this._attach('compositionend', root, this._compositionend.bind(this));
        this._attach('click', root, this._click.bind(this));
        this._attach('keydown', root, this._keydown.bind(this));
        this._attach('keyup', root, this._keyup.bind(this));
        this._attach('touchend', root, this._touchend.bind(this));
        this._attach('mouseup', root, this._mouseup.bind(this));
    }

    private _attach(name: string, el: Element, listener: any) {
        el.addEventListener(name, listener);
        this._domEvents.push([name, el, listener]);
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
            }, 500);
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
                break;
            case EE.KeyCode.BACKSPACE:
                this.editor.actions.doBackspace();
                break;
            case EE.KeyCode.Z:
                if (Util.IsMetaCtrlKey(ev)) {
                    //undo
                    this.editor.actions.undo();
                    prevent = true;
                }
                break;
            case EE.KeyCode.Y:
                if (Util.IsMetaCtrlKey(ev)) {
                    //redo
                    prevent = true;
                }
                break;
        }
        if (prevent) {
            ev.preventDefault();
        }
    }

    private _keyup(ev: KeyboardEvent) {
        this.editor.cursor.update();
    }

    private _touchend(ev: TouchEvent) {
        this.editor.cursor.update();
    }

    private _mouseup(ev: MouseEvent) {
        this.editor.cursor.update();
    }
}