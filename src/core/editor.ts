import * as Util from 'core/util';
import { Tools, InlineTool, BlockTool } from 'core/tools';
import { Events } from 'core/events';
import { Cursor } from 'core/cursor';
import { Actions, IActionStep } from 'core/action';
import { Buttons } from 'core/buttons';
import * as UI from 'default/index';

import './polyfill';

//inlines
import 'tools/break';
import 'tools/link';
import 'tools/blod';
import 'tools/italic';
import 'tools/underline';
import 'tools/strike';
import 'tools/super';
import 'tools/sub';
//blocks
import 'tools/paragraph';
import 'tools/pre';
import 'tools/header';
import 'tools/horizontal';
import 'tools/quote';
import 'tools/list';
//extends
import 'tools/align';
import 'tools/row-tip';

export class Editor {
    options: EE.IEditorOptions;
    tools: Tools;
    events: Events;
    cursor: Cursor;
    actions: Actions;
    buttons: Buttons;
    defaultUI: UI.DefaultUI;

    ownerDoc: Document = document;
    rootEl: HTMLElement;

    private _snapshot: EE.PageSnapshot = {};
    rows: string[] = [];
    constructor(el: HTMLElement, options?: EE.IEditorOptions) {
        let defaultOptions: EE.IEditorOptions = {
            tools: 'all',
            defaultUI: true,
            inline: false,
            toolbars: [
                'paragraph', 'h1', 'pre',
                '|', 'bold', 'italic', 'underline', 'strike', 'sup', 'sub',
                '|', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
                '|', 'link', 'hr', 'blockquote', 'ol', 'ul']
        };

        this.options = Util.Extend(defaultOptions, options || {});
        this.rootEl = el;

        //init functions
        this.events = new Events(this);
        this.cursor = new Cursor(this);
        this.actions = new Actions(this);
        this.buttons = new Buttons(this);
        this.tools = new Tools(this);

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

        //do tools init func;
        this.tools.init();

        //init page data
        setTimeout(() => {
            this.parseData();
            //check empty
            if (this.isEmpty()) {
                // this.interNewRow();
            }

            this.rootEl.click();
            this.rootEl.focus();
            this.cursor.restore();
        }, 300);
    }

    initContentEditable(el: HTMLElement) {
        this.rootEl = el;
        this.rootEl.setAttribute('contenteditable', '');
        this.rootEl.classList.add('ee-view');
    }

    isEmpty() {
        if (this.rows.length === 0) {
            return true;
        }
        else if (this.rows.length === 1) {
            return this._snapshot[this.rows[0]].text.length === 0;
        }
        else {
            return false;
        }
    }

    /** 解析文档数据 */
    parseData(step?: IActionStep) {
        let newList: string[] = [];
        let newSnapshot: EE.PageSnapshot = {};
        Util.NodeListForEach(this.rootEl.querySelectorAll('[data-row-id]'), (el, index) => {
            let rowid = el.getAttribute('data-row-id');
            if (newList.indexOf(rowid) >= 0) {
                el.setAttribute('data-row-id', Util.RandomID());
            }
            let tool = this.tools.matchBlockTool(el);
            if (tool) {
                let block = tool.readData(el);
                newList.push(block.rowid);
                newSnapshot[block.rowid] = block;
                if (step) {
                    let old = this._snapshot[block.rowid];
                    if (!old) {
                        step.rows.push({
                            to: block,
                            insert: el.previousElementSibling ? el.previousElementSibling.getAttribute('data-row-id') : undefined
                        });
                    }
                    else {
                        if (!Util.DeepCompare(old, block)) {
                            step.rows.push({
                                from: old,
                                to: block
                            });
                        }
                        delete this._snapshot[block.rowid];
                    }
                }
            }
        });
        if (step) {
            for (let id in this._snapshot) {
                let index = this.rows.indexOf(id);
                step.rows.push({
                    from: this._snapshot[id],
                    insert: this.rows[index - 1]
                });
            }
        }
        this.rows = newList;
        this._snapshot = newSnapshot;
    }

    getData() {
        let pageData: EE.IPage = {
            rows: this.rows.map(id => Util.Extend({}, this._snapshot[id]) as EE.IBlock)
        };
        return pageData;
    }

    setData(data: EE.IBlock[]) {
        this.rootEl.innerHTML = '';
        let list = data.forEach(block => {
            if (!block.pid) {
                let tool = this.tools.matchToken(block.token) as BlockTool;
                if (tool) {
                    this.rootEl.appendChild(tool.render(block));
                }
            }
        });
        console.log('load data success');
    }

    findRowData(rowid: string) {
        return this._snapshot[rowid];
        // return this._pageData.rows.find(r => r.rowid === rowid);
    }

    findRowIndex(rowid: string) {
        return this.rows.indexOf(rowid);
    }

    findRowElement(rowid: string) {
        return this.rootEl.querySelector(`[data-row-id="${rowid}"]`) as HTMLElement;
    }

    lastRow() {
        let lastId = this.rows[this.rows.length - 1];
        return this._snapshot[lastId];
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

    eachRow(rows: string[], func: (block: EE.IBlock, index?: number) => void) {
        let inRange = false;
        for (let i = 0, l = this.rows.length; i < l; i++) {
            var id = this.rows[i];
            if (rows.indexOf(id) >= 0) {
                func && func(this._snapshot[id], i);
            }
        }
    }

    refreshRow(block: EE.IBlock) {
        let tool = this.tools.matchToken(block.token) as BlockTool;
        if (tool) {
            let newEl = tool.render(block);
            let oldEl = this.findRowElement(block.rowid);
            if (oldEl) {
                oldEl.parentNode.replaceChild(newEl, oldEl);
            }
            else {
                return newEl;
            }
        }
    }

    insertRow(target: Element, insertId: string, before = false) {
        let insertEl = this.findRowElement(insertId);
        if (before) {
            insertEl.parentNode.insertBefore(target, insertEl);
        }
        else {
            if (insertEl.nextElementSibling) {
                insertEl.parentNode.insertBefore(target, insertEl.nextElementSibling);
            }
            else {
                insertEl.parentNode.appendChild(target);
            }
        }
    }

    removeRow(rowid: string) {
        let el = this.findRowElement(rowid);
        if (el) {
            el.remove();
        }
    }
}