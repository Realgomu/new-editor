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

    private _page: EE.IPage;
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
            this.getData();
            //check empty
            if (this._page.rows.length === 0) {
                this.interNewRow();
            }

            this.rootEl.click();
            this.rootEl.focus();
        }, 300);
    }

    initContentEditable(el: HTMLElement) {
        this.rootEl = el;
        this.rootEl.setAttribute('contenteditable', '');
        this.rootEl.classList.add('ee-view');
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
        this._page = {
            rows: data
        };
        return this._page;
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

    getRowData(rowid: string) {
        return this._page.rows.find(r => r.rowid === rowid);
    }

    getRowIndex(rowid: string) {
        return this._page.rows.findIndex(r => r.rowid === rowid);
    }

    getRowElement(rowid: string) {
        let index = this._page.rows.findIndex(r => r.rowid === rowid);
        if (index >= 0) {
            let el = this.rootEl.querySelector(`[data-row-id="${rowid}"]`);
            return el;
        }
    }

    interNewRow(rowid?: string, after?: boolean) {
        let newRow = this.ownerDoc.createElement(this.tools.rowTool.selectors[0]);
        let newId = Util.RandomID();
        let block: EE.IBlock = {
            rowid: newId,
            text: '',
            type: this.tools.rowTool.type,
            token: this.tools.rowTool.token,
            inlines: {}
        };
        newRow.setAttribute('data-row-id', newId);
        newRow.innerHTML = '<br>';
        if (!rowid) {
            this.rootEl.appendChild(newRow);
            this._page.rows.push(block);
        }
        else {
            let index = rowid ? this._page.rows.findIndex(r => r.rowid === rowid) : this._page.rows.length;
            let el = this.rootEl.querySelector(`[data-row-id="${rowid}"]`);
            if (after) {
                if (el.nextSibling) {
                    this.rootEl.insertBefore(newRow, el.nextSibling);
                    this._page.rows.splice(index + 1, 0, block);
                }
                else {
                    this.rootEl.appendChild(newRow);
                    this._page.rows.push(block);
                }
                this.selection.moveTo({
                    start: { rowid: newId, pos: 0 },
                    end: { rowid: newId, pos: 0 }
                });
            }
            else {
                this.rootEl.insertBefore(newRow, el);
                this._page.rows.splice(index, 0, block);
            }
        }
        return newId;
    }

    isRowElement(el: Element, bottom: boolean = false) {
        if (!el.hasAttribute('data-row-id')) {
            return undefined;
        }
        else {
            if (!bottom || el.querySelector('[data-row-id]')) {
                return el.getAttribute('data-row-id');
            }
            else {
                return undefined;
            }
        }
    }

    eachRow(from: string, to: string, func: (block: EE.IBlock) => void) {
        let inRange = false;
        for (let i = 0, l = this._page.rows.length; i < l; i++) {
            var row = this._page.rows[i];
            if (from === row.rowid) {
                func(row);
                inRange = true;
                if (from === to) break;
            }
            else if (to === row.rowid) {
                func(row);
                inRange = false;
            }
            else if (inRange) {
                func(row);
            }
        }
    }

    MergeInlines(list: EE.IInline[], add?: EE.IInline) {
        let newList: EE.IInline[] = [];
        add && newList.push(add);
        list.forEach(item => {
            let merge = newList.find(m => (m.start === item.end) || (m.end === item.start));
            if (merge) {
                if (merge.start === item.end - 1) {
                    merge.start = item.start;
                }
                else if (merge.end === item.start + 1) {
                    merge.end = item.end;
                }
            }
            else {
                newList.push(item);
            }
        });
        return newList;
    }

    renderRow(block: EE.IBlock) {
        let tool = this.tools.matchToken(block.token) as EE.IBlockTool;
        let newEl = tool.render(block);
        let oldEl = this.getRowElement(block.rowid);
        oldEl.parentNode.replaceChild(newEl, oldEl);
    }
}