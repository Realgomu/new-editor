import * as Util from 'core/util';
import { Editor } from 'core/editor';

export class Cursor {
    private _lastCursor: EE.ICursorPosition = undefined;
    constructor(private editor: Editor) {

    }

    current() {
        return Object.assign({}, this._lastCursor) as EE.ICursorPosition;
    }

    eachRow(func: (block: EE.IBlock, start?: number, end?: number) => void) {
        this.editor.eachRow(
            this._lastCursor.rows,
            (block) => {
                let start = 0, end = block.text.length;
                if (block.rowid === this._lastCursor.rows[0]) {
                    start = this._lastCursor.start;
                }
                if (block.rowid === this._lastCursor.rows[this._lastCursor.rows.length - 1]) {
                    end = this._lastCursor.end;
                }
                func(block, start, end);
            });
    }

    update(ev?: Event) {
        let selection = this.editor.ownerDoc.getSelection();
        let cursor: EE.ICursorPosition = {
            rows: [],
            start: 0,
            end: 0,
            activeTokens: []
        };
        let pos = 0,
            count = 0,
            rowid = '',
            startFirst: boolean = undefined;
        Util.TreeWalker(
            this.editor.ownerDoc,
            this.editor.rootEl,
            (el: Element) => {
                if (el.nodeType === 1) {
                    let id = this.editor.isRowElement(el);
                    if (id) {
                        rowid = id;
                        pos = 0;
                        if (count === 1) cursor.rows.push(rowid);
                    }
                }
                if (el === selection.anchorNode) {
                    cursor.start = pos + selection.anchorOffset;
                    cursor.rows.indexOf(rowid) < 0 && cursor.rows.push(rowid);
                    count++;
                    if (startFirst === undefined) startFirst = true;
                }
                if (el === selection.focusNode) {
                    cursor.end = pos + selection.focusOffset;
                    cursor.rows.indexOf(rowid) < 0 && cursor.rows.push(rowid);
                    count++;
                    if (startFirst === undefined) startFirst = false;
                }
                if (el.nodeType === 3) {
                    pos += el.textContent.length;
                }
            });
        cursor.mutilple = cursor.rows.length > 1;
        if (selection.isCollapsed) {
            cursor.end = cursor.start;
            cursor.collapsed = true;
        }
        else if (!startFirst || (!cursor.mutilple && cursor.start > cursor.end)) {
            //交换start和end
            let t = cursor.end;
            cursor.end = cursor.start;
            cursor.start = t;
        }

        this._setCurrent(cursor);
    }

    private _setCurrent(cursor: EE.ICursorPosition) {
        this._lastCursor = cursor;
        //计算激活的token
        this._activeTokens();
        //触发事件
        this.editor.events.trigger('$cursorChanged', null);
        // console.log(selection);
        // console.log(this._lastCursor);
    }

    private _activeTokens() {
        let list = [];
        if (!this._lastCursor.mutilple) {
            let block = this.editor.getRowData(this._lastCursor.rows[0]);
            list.push(block.token);
            for (let key in block.inlines) {
                if (block.inlines[key]
                    .findIndex(i => i.start <= this._lastCursor.start && this._lastCursor.end <= i.end) >= 0) {
                    list.push(key);
                }
            }
            this._lastCursor.activeTokens = list;
        }
    }

    restore() {
        this.moveTo(this._lastCursor);
    }

    moveTo(cursor: EE.ICursorPosition) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection) {
            selection.removeAllRanges();
            let range = this.editor.ownerDoc.createRange();
            let startRow = this.editor.getRowElement(cursor.rows[0]);
            let pos = 0;
            let isEmpty = true;
            cursor.collapsed = cursor.rows.length === 1 && cursor.start === cursor.end;
            cursor.mutilple = cursor.rows.length > 1;
            if (startRow) {
                Util.TreeWalker(
                    this.editor.ownerDoc,
                    startRow,
                    (current: Text) => {
                        let length = current.textContent.length;
                        if (pos <= cursor.start && cursor.start <= pos + length) {
                            range.setStart(current, cursor.start - pos);
                            isEmpty = false;
                        }
                        if (!cursor.mutilple) {
                            if (pos <= cursor.end && cursor.end <= pos + length) {
                                range.setEnd(current, cursor.end - pos);
                                isEmpty = false;
                            }
                        }
                        pos += length;
                    },
                    true
                )
            }
            if (cursor.mutilple) {
                let endRow = this.editor.getRowElement(cursor.rows[cursor.rows.length - 1]);
                pos = 0;
                if (endRow) {
                    Util.TreeWalker(
                        this.editor.ownerDoc,
                        endRow,
                        (current: Text) => {
                            let length = current.textContent.length;
                            if (pos <= cursor.end && cursor.end <= pos + length) {
                                range.setEnd(current, cursor.end - pos);
                                isEmpty = false;
                            }
                            pos += length;
                        },
                        true
                    )
                }
            }
            if (isEmpty) {
                range.setStart(startRow, cursor.start);
                range.setEnd(startRow, cursor.end);
            }
            selection.addRange(range);

            this._setCurrent(cursor);
        }
    }
}