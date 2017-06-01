import * as Util from 'core/util';
import { Tools, InlineTool, BlockTool } from 'core/tools';
import { Events } from 'core/events';
import { Cursor } from 'core/cursor';
import { Actions } from 'core/action';
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

    private _pageData: EE.IPage = { rows: [] };
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
            this.getData();
            this.setData(this._pageData.rows);
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
        return this._pageData.rows.length === 0;
    }

    getData() {
        let rows: EE.IBlock[] = [];
        Util.NodeListForEach(this.rootEl.children, (node: Element) => {
            let tool = this.tools.matchBlockTool(node);
            if (tool) {
                tool.readData(node, rows);
            }
        });
        this._pageData.rows = rows;
        return this._pageData;
    }

    setData(data: EE.IBlock[] = this._pageData.rows) {
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
        return this._pageData.rows.find(r => r.rowid === rowid);
    }

    findRowIndex(rowid: string) {
        return this._pageData.rows.findIndex(r => r.rowid === rowid);
    }

    findRowElement(rowid: string) {
        return this.rootEl.querySelector(`[data-row-id="${rowid}"]`) as HTMLElement;
    }

    lastRow() {
        return this._pageData.rows[this._pageData.rows.length - 1];
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
        for (let i = 0, l = this._pageData.rows.length; i < l; i++) {
            var row = this._pageData.rows[i];
            if (rows.indexOf(row.rowid) >= 0) {
                func && func(row, i);
            }
        }
    }

    reloadRow(rowid: string, refresh: boolean = false) {
        let index = this._pageData.rows.findIndex(r => r.rowid === rowid);
        let el = this.findRowElement(rowid);
        if (index >= 0 && el) {
            let tool = this.tools.matchBlockTool(el) as BlockTool;
            if (tool) {
                let block = tool.readData(el);
                this._pageData.rows.splice(index, 1, block);
                if (refresh) {
                    let newEl = tool.render(block);
                    let oldEl = this.findRowElement(block.rowid);
                    oldEl.parentNode.replaceChild(newEl, oldEl);
                    this.cursor.restore();
                }
                return block;
            }
        }
    }

    refreshRow(block: EE.IBlock, index?: number) {
        let tool = this.tools.matchToken(block.token) as BlockTool;
        let newEl = tool.render(block);
        let oldEl = this.findRowElement(block.rowid);
        if (oldEl) {
            let index = this.findRowIndex(block.rowid);
            this._pageData.rows.splice(index, 1, block);
            oldEl.parentNode.replaceChild(newEl, oldEl);
        }
        else if (index >= 0) {
            this._pageData.rows.splice(index, 0, block);
            if (block.pid) {
                let parent = this.findRowData(block.pid);
                this.refreshRow(parent);
            }
            else {
                let insert = this.rootEl.children.item(index);
                this.rootEl.insertBefore(newEl, insert);
            }
        }
    }

    insertNewRow(newRow: Element, rowid: string, after = true, insertEl = false) {
        let tool = this.tools.matchBlockTool(newRow) as BlockTool;
        if (tool) {
            let block = tool.readData(newRow);
            let index = this.findRowIndex(rowid);
            if (after) {
                this._pageData.rows.splice(index + 1, 0, block);
            }
            else {
                this._pageData.rows.splice(index, 0, block);
            }
            if (insertEl) {
                let targetEl = this.findRowElement(rowid);
                if (!after) {
                    targetEl.parentNode.insertBefore(newRow, targetEl);
                }
                else {
                    if (targetEl.nextElementSibling) {
                        targetEl.parentNode.insertBefore(newRow, targetEl.nextElementSibling);
                    }
                    else {
                        targetEl.parentNode.appendChild(newRow);
                    }
                }
            }
            return block;
        }
    }

    removeRow(rowid: string) {
        let index = this.findRowIndex(rowid);
        let el = this.findRowElement(rowid);
        el.remove();
        this._pageData.rows.splice(index, 1);
    }

    removeRows(startIndex: number, length: number, removeEl: boolean = false) {
        this._pageData.rows.splice(startIndex, length);
        if (removeEl) {

        }
    }
}