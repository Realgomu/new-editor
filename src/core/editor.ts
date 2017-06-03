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
    blockTree: EE.IBlockNode = {
        depth: 0,
        index: 0,
        pid: '',
        rowid: '',
        children: []
    };
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
        if (this.blockTree.children.length === 0) {
            return true;
        }
        else if (this.blockTree.children.length === 1) {
            return this.blockMap[this.blockTree.children[0].rowid].text.length === 0;
        }
        else {
            return false;
        }
    }

    readNode(el: Element, pid: string, depth: number) {
        let rowid = '';
        let children: HTMLCollection;
        let node: EE.IBlockNode;
        if (el === this.rootEl) {
            children = this.rootEl.children;
        }
        else {
            let tool = this.tools.matchBlockTool(el);
            if (tool) {
                rowid = el.getAttribute('data-row-id');
                //检查rowid是否重复
                if (!rowid || this.blockMap[rowid]) {
                    el.setAttribute('data-row-id', Util.RandomID());
                }
                //读取节点数据，并插入map中
                let block = tool.readData(el);
                block.pid = pid;
                this.blockMap[block.rowid] = block;
                rowid = block.rowid;
                if (tool.blockType !== EE.BlockType.Leaf) {
                    children = tool.getChildrenElements(el);
                }
            }
        }
        node = {
            depth: depth,
            rowid: rowid,
            pid: pid,
            children: []
        };
        if (children && children.length > 0) {
            Util.NodeListForEach(children, (child, index) => {
                let childNode = this.readNode(child, node.rowid, ++depth);
                childNode.index = index;
                if (childNode) {
                    node.children.push(childNode);
                }
            })
        }
        return node;
    }

    /** 解析文档数据,生成快照 */
    snapshot(step?: IActionStep) {
        this.blockTree.children = [];
        this.blockMap = {};
        this.readNode(this.rootEl, '', 0);
        if (step) {
            step.map = Util.Extend({}, this.blockMap) as EE.IBlockMap;
            step.tree = Util.Extend([], this.blockTree) as EE.IBlockNode;
        }
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
        let last = this.blockTree.children[this.blockTree.children.length - 1];
        while (last.children && last.children.length > 0) {
            last = last.children[last.children.length - 1];
        }
        return this.blockMap[last.rowid];
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