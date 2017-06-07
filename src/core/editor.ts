//polyfill
import './polyfill';

//
import * as Util from 'core/util';
import { Tools, InlineTool, BlockTool } from 'core/tools';
import { Events } from 'core/events';
import { Cursor } from 'core/cursor';
import { Actions, IActionStep } from 'core/action';
import { Buttons } from 'core/buttons';
import * as UI from 'default/index';

export * from 'core/tools';
export * from 'core/buttons';

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
import 'tools/image';
//extends
import 'tools/align';
import 'tools/row-tip';
import 'tools/math';

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
    blockTree: EE.IBlockNode;
    constructor(el: HTMLElement, options?: EE.IEditorOptions) {
        let defaultOptions: EE.IEditorOptions = {
            tools: 'all',
            defaultUI: true,
            inline: false,
            toolbars: [
                'paragraph', 'h1', 'pre',
                '|', 'bold', 'italic', 'underline', 'strike', 'sup', 'sub',
                '|', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
                '|', 'hr', 'blockquote', 'ol', 'ul',
                '|', 'link', 'image', 'math']
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
            //check empty
            if (this.rootEl.children.length === 0) {
                this.rootEl.innerHTML = '';
                this.rootEl.appendChild(this.tools.createNewRow());
            }
            this.snapshot();

            this.rootEl.click();
            this.rootEl.focus();
            this.cursor.restore();
            this.actions.doAction();
        }, 300);
    }

    initContentEditable(el: HTMLElement) {
        this.rootEl = el;
        this.rootEl.setAttribute('contenteditable', 'true');
        this.rootEl.classList.add('ee-view');
    }

    createRootElement() {
        return this.renderElement({
            tag: 'div',
            attr: {
                'class': 'ee-view',
                'contenteditable': 'true',
            }
        });
    }

    isEmpty() {
        if (this.blockTree.children.length === 0) {
            return true;
        }
        else if (this.blockTree.children.length === 1) {
            return this.blockMap[this.blockTree.children[0].rowid].block.text.length === 0;
        }
        else {
            return false;
        }
    }

    private _readNode(el: Element, pid: string) {
        let children: HTMLCollection;
        let node: EE.IBlockNode = {
            rowid: '',
            pid: pid,
            children: []
        };
        if (el === this.rootEl) {
            children = this.rootEl.children;
        }
        else {
            let tool = this.tools.matchBlockTool(el);
            if (tool) {
                let rowid = el.getAttribute('data-row-id');
                //检查rowid是否重复
                if (!rowid || this.blockMap[rowid]) {
                    el.setAttribute('data-row-id', Util.RandomID());
                }
                //检查是否是空元素
                if (tool.blockType === EE.BlockType.Leaf && el.innerHTML == '') {
                    el.innerHTML = '<br>';
                }
                //读取节点数据，并插入map中
                let block = tool.readData(el);
                node.rowid = block.rowid;
                node.block = block;
                this.blockMap[block.rowid] = node;
                if (tool.blockType === EE.BlockType.Wrapper) {
                    children = this.childrenElements(el);
                }
            }
        }

        if (children && children.length > 0) {
            Util.NodeListForEach(children, (child, index) => {
                let childNode = this._readNode(child, node.rowid);
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
        this.blockMap = {};
        this.blockTree = this._readNode(this.rootEl, '');
        if (step) {
            step.map = Util.Extend({}, this.blockMap) as EE.IBlockMap;
            step.tree = Util.Extend([], this.blockTree) as EE.IBlockNode;
        }
    }

    reload() {
    }

    setData(data: EE.IBlock[]) {
        // this.rootEl.innerHTML = '';
        // let list = data.forEach(block => {
        //     if (!block.pid) {
        //         let tool = this.tools.matchToken(block.token) as BlockTool;
        //         if (tool) {
        //             this.rootEl.appendChild(tool.render(block));
        //         }
        //     }
        // });
        // console.log('load data success');
    }

    findBlockNode(rowid: string): EE.IBlockNode {
        return this.blockMap[rowid];
    }

    findBlockElement(rowid: string) {
        if (rowid) {
            return this.rootEl.querySelector(`[data-row-id="${rowid}"]`) as HTMLElement;
        }
        else {
            return this.rootEl;
        }
    }

    lastLeafBlock(): EE.IBlock {
        let last = this.blockTree.children[this.blockTree.children.length - 1];
        while (last && last.children && last.children.length > 0) {
            last = last.children[last.children.length - 1];
        }
        return this.blockMap[last.rowid].block;
    }

    isBlockElement(el: Element, bottom: boolean = false) {
        if (!el.hasAttribute('data-row-id')) {
            return undefined;
        }
        else {
            if (!bottom || !el.querySelector('[data-row-id]')) {
                return el.getAttribute('data-row-id');
            }
            else {
                return undefined;
            }
        }
    }

    removeElement(row: string | HTMLElement) {
        if (typeof row === 'string') {
            row = this.findBlockElement(row);
        }
        let tagName = row.parentElement.tagName.toLowerCase();
        if (tagName === 'li') {
            //对于列表，同时删除li
            row.parentElement.remove();
        }
        else {
            row.remove();
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

    childElement(parent: Element, index: number) {
        let child = parent.children[index];
        let tagName = parent.tagName.toLowerCase();
        if (tagName === 'ol' || tagName === 'ul') {
            return child.firstElementChild;
        }
        else {
            return child;
        }
    }

    childrenElements(parent: Element) {
        let tagName = parent.tagName.toLowerCase();
        if (tagName === 'ol' || tagName === 'ul') {
            return parent.querySelectorAll('[data-row-id]') as any;
        }
        else {
            return parent.children;
        }
    }

    /** 创建新element并删除老的 */
    refreshElement(block: EE.IBlock) {
        let tool = this.tools.matchToken(block.token) as BlockTool;
        let oldEl = this.findBlockElement(block.rowid);
        let newEl = tool.render(block);
        if (oldEl) {
            if (tool.blockType !== EE.BlockType.Leaf) {
                while (oldEl.children.length > 0) {
                    newEl.appendChild(oldEl.firstElementChild);
                }
            }
            oldEl.parentNode.replaceChild(newEl, oldEl);
        }
        return newEl;
    }

    insertElement(parent: Element, child: Element, index: number = 0) {
        let tagName = parent.tagName.toLowerCase();
        if (tagName === 'ol' || tagName === 'ul') {
            //对于列表，插入新节点时，增加li
            let li = this.renderElement({ tag: 'li' });
            li.appendChild(child);
            child = li;
        }
        let target = parent.children[index];
        if (target) {
            parent.insertBefore(child, target);
        }
        else {
            parent.appendChild(child);
        }
    }

    findInlineNode(rowid: string, selector: string, start: number, end: number): EE.IInlineNode {
        let rowEl = this.findBlockElement(rowid);
        let pos: number = 0;
        let targetEl: Element;
        this.treeWalker(rowEl, (node) => {
            let length = node.textContent.length;
            if (node.nodeType === 1) {
                if (Util.MatchSelector(node as Element, selector) && pos <= start && end <= pos + length) {
                    targetEl = node as Element;
                    start = pos;
                    end = pos + length;
                }
            }
            else if (node.nodeType === 3) {
                pos += length
            }
        });
        // Util.TreeWalker(
        //     this.ownerDoc,
        //     rowEl,
        //     (node) => {
        //         let length = node.textContent.length;
        //         if (node.nodeType === 1) {
        //             if (Util.MatchSelector(node as Element, selector) && pos <= start && end <= pos + length) {
        //                 targetEl = node as Element;
        //             }
        //         }
        //         else if (node.nodeType === 3) {
        //             pos += length
        //         }
        //     }
        // );
        if (targetEl) {
            return {
                rowid: rowid,
                start: start,
                end: end,
                el: targetEl as HTMLElement,
            };
        }
        else {
            return undefined;
        }
    }

    treeWalker(root: Element, func: (current: Element | Text) => void, onlyText: boolean = false) {
        let watchToShow = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT;
        let skipNodes = ['svg'];
        let filter = {
            acceptNode: (node) => {
                if (node.nodeType === 1 && skipNodes.findIndex(s => Util.MatchSelector(node as Element, s)) >= 0) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
        let walker = document.createTreeWalker(root, watchToShow, filter, false);
        while (walker.nextNode()) {
            let current = walker.currentNode;
            if (!onlyText || current.nodeType === 3) {
                func && func(current as Element | Text);
            }
        }
    }

    renderElement(renderNode: EE.IRenderNode) {
        return Util.CreateRenderElement(this.ownerDoc, renderNode);
    }
}