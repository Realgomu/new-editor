import * as Util from './util';
import { Editor } from './editor';

type PositionRange = { 0: number, 1: number };

export interface IActionStep {
    fromCursor: EE.ICursorPosition;
    toCursor: EE.ICursorPosition;
    rows: {
        rowid: string;
        from: EE.IBlock;
        to: EE.IBlock;
    }[];
}

export class Actions {
    private _queue: IActionStep[] = [];
    private _point: number = -1;
    private _max = 20;
    constructor(private editor: Editor) {

    }

    push(step: IActionStep) {
        if (this._queue.length >= this._max) {
            this._queue.shift();
            this._point--;
        }
        this._queue.push(step);
        this._point++;
        this.editor.events.trigger('$contentChanged', null);
    }

    redo() {
        this._point++;
        let step = this._queue[this._point];
        step.rows.forEach(item => {
            this.editor.renderRow(item.to);
        });
        this.editor.cursor.moveTo(step.toCursor);
    }

    undo() {
        let step = this._queue[this._point];
        step.rows.forEach(item => {
            this.editor.renderRow(item.from);
        });
        this.editor.cursor.moveTo(step.fromCursor);
        this._point--;
    }

    doEnter(ev: Event) {
        let cursor = this.editor.cursor.current();
        if (!cursor.collapsed) {
            //todo 删除选中的
        }
        if (cursor.collapsed) {
            let row = this.editor.findRowData(cursor.rows[0]);
            if (cursor.start === 0) {
                //add row before
                let newId = this.editor.interNewRow(cursor.rows[0]);
                ev.preventDefault();
                this.editor.cursor.update();
                return;
            }
            else if (cursor.start === row.text.length) {
                //add row end
                this.editor.interNewRow(cursor.rows[0], true);
                ev.preventDefault();
                this.editor.cursor.update();
                return;
            }
            else {
                //重新计算后一行的rowid
            }
        }
        else {
            //删除选中的，并换行
        }
    }

    doBackspace() {
    }

    doInput(ev?: Event) {
        let fromCursor = this.editor.cursor.current();
        if (!fromCursor.mutilple) {
            let rowid = fromCursor.rows[0];
            let from = this.editor.findRowData(rowid);
            setTimeout(() => {
                this.editor.cursor.update(ev);
                let toCursor = this.editor.cursor.current();
                let to = this.editor.reloadRow(rowid);
                let step: IActionStep = {
                    fromCursor: fromCursor,
                    toCursor: toCursor,
                    rows: [{
                        rowid: rowid,
                        from: from,
                        to: to
                    }]
                };
                this.push(step);
            });
        }
    }
}