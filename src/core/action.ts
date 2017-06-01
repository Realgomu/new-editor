import * as Util from './util';
import { Editor } from './editor';
import * as Tool from 'core/tools';

type PositionRange = { 0: number, 1: number };

export const enum SpecilInput {
    None = 0,
    Enter,
    EnterAtStart,
    EnterAtEnd,
    MergeRow,
}

export interface IActionStep {
    fromCursor?: EE.ICursorPosition;
    toCursor?: EE.ICursorPosition;
    rows: {
        from?: EE.IBlock;
        to?: EE.IBlock;
        index?: number;
    }[];
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
                    this.editor.refreshRow(item.to, item.index);
                }
                else {
                    this.editor.removeRow(item.from.rowid);
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
                    this.editor.refreshRow(item.from, item.index);
                }
                else {
                    this.editor.removeRow(item.to.rowid);
                }
            });
            this.editor.cursor.moveTo(step.fromCursor);
            this._point--;
        }
    }

    private _specialInput: SpecilInput;
    specilInput(value: SpecilInput) {
        this._specialInput = value;
    }

    doInput(ev: Event) {
        if ([SpecilInput.EnterAtEnd, SpecilInput.EnterAtStart, SpecilInput.MergeRow].indexOf(this._specialInput) >= 0) {
            this._specialInput = undefined;
            return;
        }
        let step = this.inputStep();
        let cursor = this.editor.cursor.current();
        let rowid = cursor.rows[0];
        if (this._specialInput === SpecilInput.Enter) {
            this._specialInput = undefined;
            let firstRow = this.editor.findRowElement(rowid);
            firstRow.nextElementSibling.setAttribute('data-row-id', Util.RandomID());
            let newRowData = this.editor.insertNewRow(firstRow.nextElementSibling, rowid);
            step.rows.push({
                to: newRowData,
                index: this.editor.findRowIndex(newRowData.rowid)
            });
        }
        //设置结束的光标
        this.editor.cursor.update();
        let toCursor = this.editor.cursor.current();
        step.toCursor = toCursor;
        this.push(step);
    }

    inputStep() {
        let fromCursor = this.editor.cursor.current();
        let step: IActionStep = {
            fromCursor: fromCursor,
            rows: []
        };
        let rowid = fromCursor.rows[0];
        this.editor.cursor.eachRow((block, start, end, index) => {
            step.rows.push({
                from: block,
                index: index,
            });
        });
        if (fromCursor.mutilple) {
            this.editor.removeRows(step.rows[1].index, fromCursor.rows.length - 1);
        }
        let to = this.editor.reloadRow(rowid);
        step.rows[0].to = to;
        return step;
    }

    doEnterAtStart() {
        let fromCursor = this.editor.cursor.current();
        let step: IActionStep;
        if (!fromCursor.collapsed) {
            this.editor.ownerDoc.execCommand('delete');
            this.editor.actions.specilInput(SpecilInput.EnterAtEnd);
            step = this.inputStep();
        }
        else {
            step = {
                fromCursor: fromCursor,
                rows: []
            };
        }
        let rowid = fromCursor.rows[0];
        //插入一行空白行
        let block = this.editor.findRowData(rowid);
        let enterTool = this.editor.tools.matchToken(block.token) as Tool.IEnterBlockTool;
        if (enterTool) {
            let newRow = enterTool.createNewRow();
            let index = this.editor.findRowIndex(rowid);
            let newBlockData = this.editor.insertNewRow(newRow, rowid, false, true);
            step.rows.push({
                to: newBlockData,
                index: index + 1
            });
            //设置结束的光标
            this.editor.cursor.update();
            let toCursor = this.editor.cursor.current();
            step.toCursor = toCursor;
        }
        this.push(step);
    }

    doEnterAtEnd() {
        let fromCursor = this.editor.cursor.current();
        let step: IActionStep;
        if (!fromCursor.collapsed) {
            this.editor.ownerDoc.execCommand('delete');
            this.editor.actions.specilInput(SpecilInput.EnterAtEnd);
            step = this.inputStep();
        }
        else {
            step = {
                fromCursor: fromCursor,
                rows: []
            };
        }
        let rowid = fromCursor.rows[0];
        //插入一行空白行
        let block = this.editor.findRowData(rowid);
        let enterTool = this.editor.tools.matchToken(block.token) as Tool.IEnterBlockTool;
        if (enterTool) {
            let newRow = enterTool.createNewRow();
            let index = this.editor.findRowIndex(rowid);
            let newBlockData = this.editor.insertNewRow(newRow, rowid, true, true);
            step.rows.push({
                to: newBlockData,
                index: index + 1
            });
            //设置结束的光标
            this.editor.cursor.moveTo({
                rows: [newBlockData.rowid],
                start: 0,
                end: 0,
                atEnd: true,
            })
            let toCursor = this.editor.cursor.current();
            step.toCursor = toCursor;
        }
        this.push(step);
    }

    doMergeRow() {

    }
}