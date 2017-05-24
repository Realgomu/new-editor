import * as Util from './util';
import { Editor } from './editor';

export interface IActionStep {

}

export interface IActionObj {
    cursor: EE.ICursorPosition,
    
}

export class Actions implements EE.IActions {
    private _queue: any[] = [];
    private _point: number = -1;
    private _max = 20;
    constructor(private editor: Editor) {

    }

    doCommandAction(name: string, pos?: EE.ICursorSelection) {
        if (!pos) pos = this.editor.selection.current();
        // let action: EE.IActionStep = {
        //     name: name,
        //     useCommand: true,
        //     rowid: pos.rowid,
        //     start: pos.start,
        //     end: pos.end
        // };
        // this.editor.ownerDoc.execCommand(name);
        // this._push(action);
    }

    private _push(action: any) {
        if (this._queue.length >= this._max) {
            this._queue.shift();
            this._point--;
        }
        this._queue.push(action);
        this._point++;
    }

    redo() {
        // if (this._queue.length <= this._point + 1) {
        //     return;
        // }
        // this._point++;
        // let next = this._queue[this._point];
        // if (next && next.useCommand) {
        //     this.editor.ownerDoc.execCommand('redo');
        // }
        this.editor.ownerDoc.execCommand('redo');
    }

    undo() {
        // if (this._point < 0) {
        //     return;
        // }
        // let last = this._queue[this._point];
        // this._point--;
        // if (last && last.useCommand) {
        //     this.editor.ownerDoc.execCommand('undo');
        // }
        this.editor.ownerDoc.execCommand('undo');
    }

    doEnter(ev: Event) {
        let cursor = this.editor.selection.current();
        if (cursor.collapsed) {
            let row = this.editor.getRowData(cursor.start.rowid);
            if (cursor.start.pos === 0) {
                //add row before
                let newId = this.editor.interNewRow(cursor.start.rowid);
                ev.preventDefault();
                return;
            }
            else if (cursor.start.pos === row.text.length) {
                //add row end
                this.editor.interNewRow(cursor.start.rowid, true);
                ev.preventDefault();
                return;
            }
        }
        else {
            //删除选中的，并换行
        }
    }

    doBackspace() {
        let cursor = this.editor.selection.current();
        if (cursor.collapsed && cursor.start.pos === 0) {
            //merge two row
            this.editor.getData();
        }
    }
}