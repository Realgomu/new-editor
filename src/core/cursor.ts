import * as Util from 'core/util';
import { Editor } from 'core/editor';

export class Cursor {
    private _current: EE.ICursorPosition = undefined;
    private _activeTokens: string[] = [];
    constructor(private editor: Editor) {

    }

    current() {
        return this._current as Readonly<EE.ICursorPosition>;
    }

    activeTokens() {
        return this._activeTokens;
    }

    eachRow(func: (block: EE.IBlock, start?: number, end?: number, index?: number) => void) {
        this.editor.eachRow(
            this._current.rows,
            (block, index) => {
                let start = 0, end = block.text.length;
                if (block.rowid === this._current.rows[0]) {
                    start = this._current.start;
                }
                if (block.rowid === this._current.rows[this._current.rows.length - 1]) {
                    end = this._current.end;
                }
                func(block, start, end, index);
            });
    }

    update(ev?: Event) {
        let selection = this.editor.ownerDoc.getSelection();
        let cursor: EE.ICursorPosition = {
            rows: [],
            start: 0,
            end: 0
        };
        let pos = 0,
            count = 0,
            rowid = '',
            startFirst: boolean = undefined,
            endPos: number = undefined;
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
                    if (count === 2 && endPos === undefined) {
                        endPos = pos;
                    }
                }
            });
        if (selection.isCollapsed) {
            cursor.end = cursor.start;
        }
        else if (!startFirst || (!cursor.mutilple && cursor.start > cursor.end)) {
            //交换start和end
            let t = cursor.end;
            cursor.end = cursor.start;
            cursor.start = t;
        }

        cursor.atEnd = endPos === cursor.end;
        this._setCurrent(cursor);
    }

    private _setCurrent(cursor: EE.ICursorPosition) {
        this._current = cursor;
        this._current.collapsed = this._current.rows.length === 1 && this._current.start === this._current.end;
        this._current.mutilple = this._current.rows.length > 1;
        this._current.atStart = this._current.start === 0;
        this._current.atEnd = cursor.atEnd;
        //计算激活的token
        this._getActiveTokens();
        //触发事件
        this.editor.events.trigger('$cursorChanged', null);
        // console.log(selection);
        // console.log(this._current);
    }

    private _getActiveTokens() {
        let list = [];
        if (!this._current.mutilple) {
            let block = this.editor.findRowData(this._current.rows[0]);
            list.push(block.token);
            for (let key in block.inlines) {
                if (block.inlines[key]
                    .findIndex(i => i.start <= this._current.start && this._current.end <= i.end) >= 0) {
                    list.push(key);
                }
            }
            if (block.pid) {
                let parent = this.editor.findRowData(block.pid);
                list.push(parent.token);
            }
            this._activeTokens = list;
        }
    }

    restore() {
        if (!this._current) {
            let lastRow = this.editor.lastRow();
            this._current = {
                rows: [lastRow.rowid],
                start: lastRow.text.length,
                end: lastRow.text.length,
                atEnd: true
            }
        }
        this.moveTo(this._current);
    }

    moveTo(cursor: EE.ICursorPosition) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection) {
            selection.removeAllRanges();
            let range = this.editor.ownerDoc.createRange();
            let startRow = this.editor.findRowElement(cursor.rows[0]);
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
                let endRow = this.editor.findRowElement(cursor.rows[cursor.rows.length - 1]);
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