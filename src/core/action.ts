import * as Util from './util';
import { Editor } from './editor';
import * as Tool from 'core/tools';

export interface IActionStep {
    fromCursor?: EE.ICursorPosition;
    toCursor?: EE.ICursorPosition;
    rows: {
        from?: EE.IBlock;
        to?: EE.IBlock;
        insert?: string;
    }[];
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
    }

    redo() {
        if (this._point + 1 < this._queue.length) {
            this._point++;
            let step = this._queue[this._point];
            step.rows.forEach(item => {
                if (item.to) {
                    let newEl = this.editor.refreshBlock(item.to);
                    if (newEl) {
                        this.editor.insertBlock(newEl, item.insert);
                    }
                }
                else {
                    this.editor.removeBlock(item.from.rowid);
                }
            });
            this.editor.cursor.moveTo(step.toCursor);
        }
    }

    undo() {
        if (this._point >= 0) {
            let step = this._queue[this._point];
            step.rows.forEach(item => {
                if (item.from) {
                    let newEl = this.editor.refreshBlock(item.from);
                    if (newEl) {
                        this.editor.insertBlock(newEl, item.insert);
                    }
                }
                else {
                    this.editor.removeBlock(item.to.rowid);
                }
            });
            this.editor.cursor.moveTo(step.fromCursor);
            this._point--;
        }
    }

    doInput(ev: Event) {
        let fromCursor = this.editor.cursor.current();
        let step: IActionStep = {
            fromCursor: fromCursor,
            rows: []
        };
        this.editor.parseData(step);
        if (step.rows.length > 0) {
            //设置结束的光标
            step.toCursor = this.editor.cursor.update();
            this.push(step);
        }
    }

    doEnter(ev: Event) {
        let fromCursor = this.editor.cursor.current();
        let step: IActionStep = {
            fromCursor: fromCursor,
            rows: []
        };
        let rowid = fromCursor.rows[0];
        let current = this.editor.findBlockData(rowid);
        let enterTool = this.editor.tools.matchToken(current.token) as Tool.IEnterBlockTool;
        if (fromCursor.atEnd) {
            ev.preventDefault();
            if (!fromCursor.collapsed) {
                this.editor.ownerDoc.execCommand('delete');
            }
            //在下面插入一行
            let newRow = enterTool.createNewRow();
            let newId = newRow.getAttribute('data-row-id');
            this.editor.insertBlock(newRow, rowid, false);
            this.editor.parseData(step);
            step.toCursor = this.editor.cursor.moveTo({
                rows: [newId],
                start: 0,
                end: 0,
                atEnd: true,
            });
            this.push(step);
        }
        else if (fromCursor.atStart) {
            ev.preventDefault();
            if (!fromCursor.collapsed) {
                this.editor.ownerDoc.execCommand('delete');
            }
            //在上面插入一行
            let newRow = enterTool.createNewRow();
            this.editor.insertBlock(newRow, rowid, true);
            this.editor.parseData(step);
            //设置结束的光标
            step.toCursor = this.editor.cursor.update();
            this.push(step);
        }
    }
}