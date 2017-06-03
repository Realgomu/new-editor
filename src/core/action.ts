import * as Util from './util';
import { Editor } from './editor';
import * as Tool from 'core/tools';

export interface IActionStep {
    fromCursor?: EE.ICursorPosition;
    toCursor?: EE.ICursorPosition;
    tree?: EE.IBlockNode;
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
            // this._calcChanges(from, to);
            let paths = this._diffPath(from, to);
            console.log(paths);
            this._doPaths(paths);
            this.editor.blockTree = to.tree;
            this.editor.blockMap = to.map;
            this.editor.cursor.moveTo(to.toCursor);
            this._point++;
        }
    }

    undo() {
        if (this._point > 0) {
            let from = this._queue[this._point];
            let to = this._queue[this._point - 1];
            // this._calcChanges(from, to);
            let paths = this._diffPath(from, to);
            console.log(paths);
            this._doPaths(paths);
            this.editor.blockTree = to.tree;
            this.editor.blockMap = to.map;
            this.editor.cursor.moveTo(from.fromCursor);
            this._point--;
        }
    }

    // private _calcChanges(from: IActionStep, to: IActionStep) {
    //     let _render = (node: EE.IBlockNode) => {
    //         let oldBlock = from.map[node.rowid] ? from.map[node.rowid].block : undefined;
    //         let newBlock = to.map[node.rowid].block;
    //         let tool = this.editor.tools.matchToken(newBlock.token) as Tool.BlockTool;
    //         let el: Element;
    //         let useOld = true;
    //         //判断是否使用现在的element
    //         if (tool.blockType !== EE.BlockType.Leaf) {
    //             useOld = false;
    //         }
    //         else if (!Util.DeepCompare(oldBlock, newBlock)) {
    //             useOld = false;
    //         }
    //         if (useOld) {
    //             el = this.editor.findBlockElement(node.rowid);
    //         }
    //         if (!el || !useOld) {
    //             el = tool.render(newBlock);
    //         }
    //         if (node.children && node.children.length > 0) {
    //             node.children.forEach(child => {
    //                 let childEl = _render(child);
    //                 tool.appendChild(el, childEl);
    //             });
    //         }
    //         return el;
    //     }
    //     let cacheList = []
    //     to.tree.children.forEach(node => {
    //         let el = _render(node);
    //         cacheList.push(el);
    //     });
    //     this.editor.rootEl.innerHTML = '';
    //     cacheList.forEach(el => {
    //         this.editor.rootEl.appendChild(el);
    //     });
    //     this.editor.blockTree = to.tree;
    //     this.editor.blockMap = to.map;
    // }

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

    doEnter(ev?: Event) {
        let fromCursor = this.editor.cursor.current();
        if (!this._stepCache) {
            this._stepCache = {
                fromCursor: fromCursor,
            }
        }
        let rowid = fromCursor.rows[0];
        let current = this.editor.findBlockData(rowid);
        let tool = this.editor.tools.matchToken(current.token) as Tool.IEnterBlockTool;
        if (fromCursor.atEnd) {
            ev.preventDefault();
            let useCommand = false;
            if (!fromCursor.collapsed) {
                this.editor.ownerDoc.execCommand('delete');
                useCommand = true;
            }
            //创建新行
            let newRow = this.editor.tools.createNewRow();
            //执行enter逻辑判断
            tool.enterAtEnd(newRow, current);
            //移动光标到新行
            let toCursor = this.editor.cursor.moveTo({
                rows: [newRow.getAttribute('data-row-id')],
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
            let newRow = this.editor.tools.createNewRow();
            //执行enter逻辑判断
            tool.enterAtStart(newRow, current);
            if (!useCommand) {
                this.editor.snapshot(this._stepCache);
                this._stepCache.toCursor = this.editor.cursor.update();
                this.push(this._stepCache);
            }
        }
    }

    doDeleteAtStart(ev?: Event) {
        let fromCursor = this.editor.cursor.current();
        ev.preventDefault();
        let useCommand = false;
        if (!fromCursor.collapsed) {
            this.editor.ownerDoc.execCommand('delete');
            useCommand = true;
        }
    }


    private _diffPath(fromStep: IActionStep, toStep: IActionStep) {
        let paths: IPathData[] = [];
        for (let key in toStep.map) {
            let from = fromStep.map[key];
            let to = toStep.map[key];
            //新老节点都存在
            if (from && to) {
                let tool = this.editor.tools.matchToken(to.block.token);
                let changed = !Util.DeepCompare(from.block, to.block);
                if (changed) {
                    paths.push({
                        type: PathType.Change,
                        rowid: from.block.rowid,
                        toPid: to.node.pid,
                        toIndex: to.node.index,
                        toBlock: to.block
                    });
                }
                else if (from.node.depth !== to.node.depth) {
                    paths.push({
                        type: PathType.Move,
                        rowid: from.block.rowid,
                        toPid: to.node.pid,
                        toIndex: to.node.index,
                    });
                }
                else if (from.node.index !== to.node.index) {
                    paths.push({
                        type: PathType.Switch,
                        rowid: from.block.rowid,
                        toPid: to.node.pid,
                        toIndex: to.node.index,
                    });
                }
            }
            //老节点不存在
            else if (!from) {
                let old = fromStep.map[key];
                //新增
                paths.push({
                    type: PathType.Add,
                    rowid: to.block.rowid,
                    toPid: to.node.pid,
                    toIndex: to.node.index,
                    toBlock: to.block
                });
            }
        }
        for (let key in fromStep.map) {
            let from = fromStep.map[key];
            let to = toStep.map[key];
            if (!to) {
                //删除老节点
                paths.push({
                    type: PathType.Remove,
                    rowid: from.block.rowid,
                });
            }
        }
        return paths;
    }

    private _doPaths(paths: IPathData[]) {
        paths
            //按照增加、删除、移动的顺序处理
            .sort((a, b) => b.type - a.type)
            .forEach(p => {

                switch (p.type) {
                    case PathType.Add:
                        {
                            let parent = this.editor.findBlockElement(p.toPid);
                            let newEl = this.editor.createElement(p.toBlock);
                            this.editor.insertElement(parent, newEl, p.toIndex);
                        }
                        break;
                    case PathType.Remove:
                        {
                            this.editor.removeBlock(p.rowid);
                        }
                        break;
                    case PathType.Move:
                        {
                            let el = this.editor.findBlockElement(p.rowid);
                            let parent = this.editor.findBlockElement(p.toPid);
                            this.editor.insertElement(parent, el, p.toIndex);
                        }
                    case PathType.Switch:
                        {
                            let el = this.editor.findBlockElement(p.rowid);
                            let parent = this.editor.findBlockElement(p.toPid);
                            let target = this.editor.childElement(parent, p.toIndex);
                            //同层移动，比较位置是否有变化
                            if (target === el) {
                            }
                            else {
                                this.editor.insertElement(parent, el, p.toIndex);
                            }
                        }
                        break;
                    case PathType.Change:
                        {
                            let newEl = this.editor.createElement(p.toBlock);
                            let parent = this.editor.findBlockElement(p.toPid);
                            this.editor.insertElement(parent, newEl, p.toIndex);
                        }
                        break;
                }
            });
    }
}
const enum PathType {
    Switch,
    Remove,
    Move,
    Change,
    Add,
}
interface IPathData {
    type: PathType;
    rowid: string;
    toPid?: string;
    toIndex?: number;
    toBlock?: EE.IBlock;
}