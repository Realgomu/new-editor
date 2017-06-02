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

    blockMap: EE.IBlockMap = {};
    blockTree: EE.IBlockNode[] = [];
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
            this.snapshot();
            //check empty
            if (this.isEmpty()) {
                // this.interNewRow();
            }

            this.rootEl.click();
            this.rootEl.focus();
            this.cursor.restore();
            this.actions.doInput();
        }, 300);
    }

    initContentEditable(el: HTMLElement) {
        this.rootEl = el;
        this.rootEl.setAttribute('contenteditable', 'true');
        this.rootEl.classList.add('ee-view');
    }

    createRootElement() {
        return Util.CreateRenderElement(this.ownerDoc, {
            tag: 'div',
            attr: {
                'class': 'ee-view',
                'contenteditable': 'true',
            }
        }) as HTMLElement;
    }

    isEmpty() {
        if (this.blockTree.length === 0) {
            return true;
        }
        else if (this.blockTree.length === 1) {
            return this.blockTree[this.blockTree[0].id].text.length === 0;
        }
        else {
            return false;
        }
    }

    readNode(el: Element = this.rootEl, pid: string = undefined) {
        let rowid = el.getAttribute('data-row-id');
        //检查rowid是否重复
        if (this.blockMap[rowid]) {
            el.setAttribute('data-row-id', Util.RandomID());
        }
        let tool = this.tools.matchBlockTool(el);
        if (tool) {
            let block = tool.readData(el);
            let node: EE.IBlockNode = {
                id: block.rowid,
                pid: pid,
                children: []
            };
            this.blockMap[block.rowid] = block;
            if (tool.blockType !== EE.BlockType.Leaf && el.children.length > 0) {
                Util.NodeListForEach(el.children, (child) => {
                    let childNode = this.readNode(child, node.id);
                    if (childNode) {
                        node.children.push(childNode);
                    }
                })
            }
            return node;
        }
    }

    /** 解析文档数据,生成快照 */
    snapshot(step?: IActionStep) {
        this.blockTree = [];
        this.blockMap = {};
        Util.NodeListForEach(this.rootEl.children, (el, index) => {
            let node = this.readNode(el);
            if (node) {
                this.blockTree.push(node);
            }
        });
        if (step) {
            step.map = Util.Extend({}, this.blockMap);
            step.tree = Util.Extend([], this.blockTree);
        }
    }

    getData() {
        // let pageData: EE.IPage = {
        //     rows: this.rows.map(id => Util.Extend({}, this._snapshot[id]) as EE.IBlock)
        // };
        // return pageData;
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

    findBlockData(rowid: string) {
        return this.blockMap[rowid];
    }

    findBlockElement(rowid: string) {
        return this.rootEl.querySelector(`[data-row-id="${rowid}"]`) as HTMLElement;
    }

    lastBlock() {
        let last = this.blockTree[this.blockTree.length - 1];
        while (last.children && last.children.length > 0) {
            last = last.children[last.children.length - 1];
        }
        return this.blockMap[last.id];
    }

    isBlockElement(el: Element, bottom: boolean = false) {
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

    refreshBlock(block: EE.IBlock) {
        let tool = this.tools.matchToken(block.token) as BlockTool;
        if (tool) {
            let newEl = tool.render(block);
            let oldEl = this.findBlockElement(block.rowid);
            if (oldEl) {
                oldEl.parentNode.replaceChild(newEl, oldEl);
            }
            else {
                return newEl;
            }
        }
    }

    insertBlock(target: Element, insert: string | Element, before = false) {
        if (typeof insert === 'string') {
            insert = this.findBlockElement(insert);
        }
        if (insert) {
            if (before) {
                insert.parentNode.insertBefore(target, insert);
            }
            else {
                if (insert.nextElementSibling) {
                    insert.parentNode.insertBefore(target, insert.nextElementSibling);
                }
                else {
                    insert.parentNode.appendChild(target);
                }
            }
        }
        else {
            this.rootEl.appendChild(target);
        }
    }

    removeBlock(rowid: string) {
        let el = this.findBlockElement(rowid);
        if (el) {
            el.remove();
        }
    }
}