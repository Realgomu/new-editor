import * as Util from './util';
import { Editor } from './editor';
import * as Tool from 'core/tools';

export interface IActionStep {
    fromCursor?: EE.ICursorPosition;
    toCursor?: EE.ICursorPosition;
    tree?: EE.IBlockNode[];
    map?: EE.IBlockMap;
    log?: any;
}

export class Actions {
    private _queue: IActionStep[] = [];
    private _point: number = -1;
    private _max = 20;
    constructor(private editor: Editor) {

    }

    push(step: IActionStep) {
        console.log(step);
        if (this._queue.length >= this._max) {
            this._queue.shift();
            this._point--;
        }
        //清空point之后的step
        this._queue.splice(this._point + 1, this._queue.length - this._point - 1);
        this._queue.push(step);
        this._point++;
        this.editor.events.trigger('$contentChanged', null);
        if (this._stepCache) {
            this._stepCache = undefined;
        }
    }

    redo() {
        if (this._point + 1 < this._queue.length) {
            let from = this._queue[this._point];
            let to = this._queue[this._point + 1];
            this._calcChanges(from, to);
            this.editor.cursor.moveTo(to.toCursor);
            this._point++;
        }
    }

    undo() {
        if (this._point > 0) {
            let from = this._queue[this._point];
            let to = this._queue[this._point - 1];
            this._calcChanges(from, to);
            this.editor.cursor.moveTo(from.fromCursor);
            this._point--;
        }
    }

    private _calcChanges(from: IActionStep, to: IActionStep) {
        let _render = (node: EE.IBlockNode) => {
            let oldBlock = from.map[node.id];
            let newBlock = to.map[node.id];
            let tool = this.editor.tools.matchToken(newBlock.token) as Tool.BlockTool;
            let el: Element;
            let useOld = true;
            //判断是否使用现在的element
            if (tool.blockType !== EE.BlockType.Leaf) {
                useOld = false;
            }
            else if (!Util.DeepCompare(oldBlock, newBlock)) {
                useOld = false;
            }
            if (useOld) {
                el = this.editor.findBlockElement(node.id);
            }
            if (!el || !useOld) {
                el = tool.render(newBlock);
            }
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    let childEl = _render(child);
                    el.appendChild(childEl);
                });
            }
            return el;
        }
        let cacheList = []
        to.tree.forEach(node => {
            let el = _render(node);
            cacheList.push(el);
        });
        this.editor.rootEl.innerHTML = '';
        cacheList.forEach(el => {
            this.editor.rootEl.appendChild(el);
        });
        this.editor.blockTree = to.tree;
        this.editor.blockMap = to.map;
    }

    private _stepCache: IActionStep;
    doInput() {
        if (!this._stepCache) {
            this._stepCache = {
                fromCursor: this.editor.cursor.current(),
            }
        }
        this.editor.snapshot(this._stepCache);
        this._stepCache.toCursor = this.editor.cursor.update();
        this.push(this._stepCache);
    }

    doEnter(ev: Event) {
        let fromCursor = this.editor.cursor.current();
        if (!this._stepCache) {
            this._stepCache = {
                fromCursor: fromCursor,
            }
        }
        let rowid = fromCursor.rows[0];
        let current = this.editor.findBlockData(rowid);
        let enterTool = this.editor.tools.matchToken(current.token) as Tool.IEnterBlockTool;
        if (fromCursor.atEnd) {
            ev.preventDefault();
            let useCommand = false;
            if (!fromCursor.collapsed) {
                this.editor.ownerDoc.execCommand('delete');
                useCommand = true;
            }
            //在下面插入一行
            let newRow = enterTool.createNewRow();
            let newId = newRow.getAttribute('data-row-id');
            this.editor.insertBlock(newRow, rowid, false);
            let toCursor = this.editor.cursor.moveTo({
                rows: [newId],
                start: 0,
                end: 0,
                atEnd: true,
            });
            if (!useCommand) {
                this.editor.snapshot(this._stepCache);
                this._stepCache.toCursor = toCursor;
                this.push(this._stepCache);
            }
        }
        else if (fromCursor.atStart) {
            ev.preventDefault();
            let useCommand = false;
            if (!fromCursor.collapsed) {
                this.editor.ownerDoc.execCommand('delete');
                useCommand = true;
            }
            //在上面插入一行
            let newRow = enterTool.createNewRow();
            this.editor.insertBlock(newRow, rowid, true);
            //设置结束的光标
            if (!useCommand) {
                this.editor.snapshot(this._stepCache);
                this._stepCache.toCursor = this.editor.cursor.update();
                this.push(this._stepCache);
            }
        }
    }
}