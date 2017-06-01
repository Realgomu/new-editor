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

    private _selectionDelete: boolean;
    doDeleteSelection(merge: boolean = true) {
        if (!this._selectionDelete) {
            this._selectionDelete = true;
            this.editor.cursor.deleteSelection();
            let fromCursor = this.editor.cursor.current();
            let step: IActionStep = {
                fromCursor: fromCursor,
                rows: []
            };
            let rowid = fromCursor.rows[0];
            let deleteIds = [];
            this.editor.cursor.eachRow((block, start, end, index) => {
                step.rows.push({
                    from: block,
                    index: index,
                });
                if (block.rowid !== rowid) {
                    deleteIds.push(block.rowid);
                }
            });
            deleteIds.forEach(id => this.editor.removeRow(id));
            step.rows[0].to = this.editor.reloadRow(rowid);
            //设置结束的光标
            let toCursor = this.editor.cursor.update();
            step.toCursor = toCursor;
            this.push(step);
            this._selectionDelete = false;
        }
    }

    private _specialInput: SpecilInput;
    specilInput(value: SpecilInput) {
        this._specialInput = value;
    }

    doInput(ev: Event) {
        let fromCursor = this.editor.cursor.current();
        if (fromCursor.collapsed) {
            let rowid = fromCursor.rows[0];
            let step: IActionStep = {
                fromCursor: fromCursor,
                rows: [{
                    from: this.editor.findRowData(rowid)
                }]
            };
            step.rows[0].to = this.editor.reloadRow(rowid);
            //设置结束的光标
            this.editor.cursor.update();
            let toCursor = this.editor.cursor.current();
            step.toCursor = toCursor;
            this.push(step);
        }
    }

    doEnterAtStart() {
        let fromCursor = this.editor.cursor.current();
        let step: IActionStep = {
            fromCursor: fromCursor,
            rows: []
        };
        let rowid = fromCursor.rows[0];

        this.push(step);
    }

    doEnterAtEnd() {
        let fromCursor = this.editor.cursor.current();
        let step: IActionStep = {
            fromCursor: fromCursor,
            rows: []
        };
        let rowid = fromCursor.rows[0];
        //插入一行空白行

        this.push(step);
    }

    doMergeRow() {

    }

    doEnter(ev: Event) {
        let fromCursor = this.editor.cursor.current();
        if (fromCursor.collapsed) {
            let step: IActionStep = {
                fromCursor: fromCursor,
                rows: []
            };
            let rowid = fromCursor.rows[0];
            let current = this.editor.findRowData(rowid);
            let insertIndex = this.editor.findRowIndex(rowid);
            let enterTool = this.editor.tools.matchToken(current.token) as Tool.IEnterBlockTool;
            if (current && enterTool) {
                if (fromCursor.atEnd) {
                    //在下面插入一行
                    let newRow = enterTool.createNewRow();
                    let newBlockData = this.editor.insertNewRow(newRow, rowid, true, true);
                    step.rows.push({
                        to: newBlockData,
                        index: insertIndex + 1
                    });
                    //设置结束的光标
                    let toCursor = this.editor.cursor.moveTo({
                        rows: [newBlockData.rowid],
                        start: 0,
                        end: 0,
                        atEnd: true,
                    });
                    step.toCursor = toCursor;
                }
                else if (fromCursor.atStart) {
                    //在上面插入一行
                    let newRow = enterTool.createNewRow();
                    let newBlockData = this.editor.insertNewRow(newRow, rowid, false, true);
                    step.rows.push({
                        to: newBlockData,
                        index: insertIndex + 1
                    });
                    //设置结束的光标
                    let toCursor = this.editor.cursor.update();
                    step.toCursor = toCursor;
                }
                else {
                    //TODO 切分当前行
                    let cutIndex = fromCursor.start;
                    let newBlockData = Util.BlockDelete(current, 0, cutIndex) as EE.IBlock;
                    newBlockData.rowid = Util.RandomID();
                    let newRow = enterTool.render(newBlockData);
                    let to = Util.BlockDelete(current, cutIndex, current.text.length);
                    this.editor.refreshRow(to);
                    step.rows.push({
                        from: current,
                        to: to
                    });
                    newBlockData = this.editor.insertNewRow(newRow, rowid, true, true);
                    step.rows.push({
                        to: newBlockData,
                        index: insertIndex - 1
                    });
                    //设置结束的光标
                    let toCursor = this.editor.cursor.moveTo({
                        rows: [newBlockData.rowid],
                        start: 0,
                        end: 0,
                        atEnd: false,
                    });
                    step.toCursor = toCursor;
                }
                this.push(step);
            }
        }
    }
}