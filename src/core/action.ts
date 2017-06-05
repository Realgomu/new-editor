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
        let current = this.editor.findBlockNode(rowid);
        let tool = this.editor.tools.matchToken(current.block.token) as Tool.IEnterBlockTool;
        if (fromCursor.atEnd) {
            ev.preventDefault();
            let useCommand = false;
            if (!fromCursor.collapsed) {
                this.editor.ownerDoc.execCommand('delete');
                useCommand = true;
            }
            //创建新行
            let newRow = this.editor.tools.createNewRow(current.pid);
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
            let newRow = this.editor.tools.createNewRow(current.pid);
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
            let fromNode = fromStep.map[key];
            let toNode = toStep.map[key];
            //新老节点都存在
            if (fromNode && toNode) {
                let tool = this.editor.tools.matchToken(toNode.block.token);
                let changed = !Util.DeepCompare(fromNode.block, toNode.block);
                if (changed) {
                    paths.push({
                        type: PathType.Change,
                        toBlock: toNode.block
                    });
                }
                else if (fromNode.pid !== toNode.pid) {
                    paths.push({
                        type: PathType.Move,
                        rowid: fromNode.rowid,
                        toPid: toNode.pid,
                        toIndex: toNode.index,
                    });
                }
                else if (fromNode.index !== toNode.index) {
                    // paths.push({
                    //     type: PathType.Switch,
                    //     rowid: from.block.rowid,
                    //     toPid: to.node.pid,
                    //     toIndex: to.node.index,
                    // });
                }
            }
            //老节点不存在
            else if (!fromNode) {
                let old = fromStep.map[key];
                //新增
                paths.push({
                    type: PathType.Add,
                    toPid: toNode.pid,
                    toIndex: toNode.index,
                    toBlock: toNode.block
                });
            }
        }
        for (let key in fromStep.map) {
            let from = fromStep.map[key];
            let to = toStep.map[key];
            if (!to) {
                //删除老节点
                paths.push({
                    type: PathType.Delete,
                    rowid: from.block.rowid,
                });
            }
        }
        return paths;
    }

    private _doPaths(paths: IPathData[]) {
        paths
            //按照增加、删除、移动的顺序处理
            .sort((a, b) => a.type - b.type)
            .forEach(p => {

                switch (p.type) {
                    case PathType.Add:
                        {
                            let parent = this.editor.findBlockElement(p.toPid);
                            let newEl = this.editor.createElement(p.toBlock);
                            this.editor.insertElement(parent, newEl, p.toIndex);
                        }
                        break;
                    case PathType.Delete:
                        {
                            this.editor.removeElement(p.rowid);
                        }
                        break;
                    case PathType.Move:
                        {
                            let el = this.editor.findBlockElement(p.rowid);
                            let parent = this.editor.findBlockElement(p.toPid);
                            this.editor.insertElement(parent, el, p.toIndex);
                        }
                        break;
                    // case PathType.Switch:
                    //     {
                    //         let el = this.editor.findBlockElement(p.rowid);
                    //         let parent = this.editor.findBlockElement(p.toPid);
                    //         let target = this.editor.childElement(parent, p.toIndex);
                    //         //同层移动，比较位置是否有变化
                    //         if (target === el) {
                    //         }
                    //         else {
                    //             this.editor.insertElement(parent, el, p.toIndex);
                    //         }
                    //     }
                    //     break;
                    case PathType.Change:
                        {
                            let newEl = this.editor.createElement(p.toBlock);
                        }
                        break;
                }
            });
    }
}
const enum PathType {
    Add,
    Change,
    Move,
    Delete,
}
interface IPathData {
    type: PathType;
    rowid?: string;
    toPid?: string;
    toIndex?: number;
    toBlock?: EE.IBlock;
}