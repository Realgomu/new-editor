import * as Util from './util';
import { Editor } from './editor';

type PositionRange = { 0: number, 1: number };

export interface IActionStep {
    token: string;
    type?: any;
    cursor: EE.ICursorPosition;
    rows: {
        rowid: string;
        from: EE.IInline[];
        to: EE.IInline[];
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
    }

    redo() {
        this._point++;
        let step = this._queue[this._point];
        let tool = this.editor.tools.matchToken(step.token);
        if (tool) {
            tool.undo(step);
        }
        this.editor.cursor.moveTo(step.cursor)
    }

    undo() {
        let step = this._queue[this._point];
        let tool = this.editor.tools.matchToken(step.token);
        if (tool) {
            tool.undo(step);
        }
        this.editor.cursor.moveTo(step.cursor)
        this._point--;
    }

    doEnter(ev: Event) {
        let cursor = this.editor.cursor.current();
        if (cursor.collapsed) {
            let row = this.editor.getRowData(cursor.rows[0]);
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
        setTimeout(() => {
            this.editor.getData();
            if (this.editor.isEmpty()) {
                this.editor.interNewRow();
            }
        });
    }

    doInput() {

    }
}