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
                this.interNewRow();
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
        let el = this.rootEl.querySelector(`[data-row-id="${rowid}"]`);
        return el as HTMLElement;
    }

    lastRow() {
        return this._pageData.rows[this._pageData.rows.length - 1];
    }

    interNewRow(rowid?: string, after?: boolean) {
        let newRow = this.ownerDoc.createElement(this.tools.rowTool.selectors[0]);
        let newId = Util.RandomID();
        let block: EE.IBlock = {
            rowid: newId,
            text: '',
            level: this.tools.rowTool.level,
            token: this.tools.rowTool.token,
            inlines: {}
        };
        newRow.setAttribute('data-row-id', newId);
        newRow.innerHTML = '<br>';
        if (!rowid) {
            this.rootEl.appendChild(newRow);
            this._pageData.rows.push(block);
        }
        else {
            let index = rowid ? this._pageData.rows.findIndex(r => r.rowid === rowid) : this._pageData.rows.length;
            let el = this.rootEl.querySelector(`[data-row-id="${rowid}"]`);
            if (after) {
                if (el.nextSibling) {
                    this.rootEl.insertBefore(newRow, el.nextSibling);
                    this._pageData.rows.splice(index + 1, 0, block);
                }
                else {
                    this.rootEl.appendChild(newRow);
                    this._pageData.rows.push(block);
                }
                this.cursor.moveTo({
                    rows: [newId],
                    start: 0,
                    end: 0
                });
            }
            else {
                this.rootEl.insertBefore(newRow, el);
                this._pageData.rows.splice(index, 0, block);
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

    eachRow(rows: string[], func: (block: EE.IBlock) => void) {
        let inRange = false;
        for (let i = 0, l = this._pageData.rows.length; i < l; i++) {
            var row = this._pageData.rows[i];
            if (rows.indexOf(row.rowid) >= 0) {
                func && func(row);
            }
        }
    }

    reloadRow(rowid: string) {
        let index = this._pageData.rows.findIndex(r => r.rowid === rowid);
        let el = this.findRowElement(rowid);
        if (index >= 0 && el) {
            let tool = this.tools.matchBlockTool(el);
            if (tool) {
                let block = tool.readData(el);
                this._pageData.rows.splice(index, 1);
                return block;
            }
        }
    }

    renderRow(block: EE.IBlock) {
        let tool = this.tools.matchToken(block.token) as BlockTool;
        let newEl = tool.render(block);
        let oldEl = this.findRowElement(block.rowid);
        oldEl.parentNode.replaceChild(newEl, oldEl);
    }
}