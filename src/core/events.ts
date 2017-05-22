import * as Util from './util';

export class Events {
    private _customEvents: EE.ICustomEventMap = {};
    private _domEvents: { 0: string; 1: Element; 2: any; }[] = [];

    constructor(private editor: EE.IEditor) {

    }

    init() {
        this._attachEditableEvents(this.editor.rootEl);

        //custom
        this.on('$input', (editor, ev) => {
            editor.selection.updateCurrent();
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
                    handler.listener && handler.listener(this.editor, ev, ...args);
                }
            }
            else {
                handler.listener && handler.listener(this.editor, ev, ...args);
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
            else {
                let parent = Util.FindParend(ev.target as Element, (parent) => {
                    return parent === node;
                });
                return !!parent;
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

    private _timer: number;
    private _input(ev: Event) {
        if (!this._isComposition) {
            if (this._timer) clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                this.trigger('$input', ev);
            }, 500);
        }
    }

    private _isComposition = false;
    private _compositionstart(ev: Event) {
        this._isComposition = true;
    }
    private _compositionend(ev: Event) {
        this._isComposition = false;
        this.trigger('$input', ev);
    }

    private _click(ev: MouseEvent) {
        this.trigger('$click', ev);
    }
}