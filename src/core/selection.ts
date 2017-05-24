import * as Util from 'core/util';
import { Editor } from 'core/editor';

export class Selection implements EE.ISelection {
    private _lastCursor: EE.ICursorSelection = undefined;
    constructor(private editor: Editor) {

    }

    current() {
        return Object.assign({}, this._lastCursor) as EE.ICursorSelection;
    }

    update() {
        let selection = this.editor.ownerDoc.getSelection();
        let cursor: EE.ICursorSelection = {
            start: { rowid: '', pos: 0 },
            end: { rowid: '', pos: 0 },
        };
        let pos = 0, lastRowid = '';
        Util.TreeWalker(
            this.editor.ownerDoc,
            this.editor.rootEl,
            (current: Element) => {
                if (current.nodeType === 1) {
                    let rowid = this.editor.isRowElement(current);
                    if (rowid) {
                        pos = 0;
                        lastRowid = rowid;
                    }
                }
                if (current === selection.anchorNode) {
                    cursor.start = { rowid: lastRowid, pos: pos + selection.anchorOffset };
                }
                if (current === selection.focusNode) {
                    cursor.end = { rowid: lastRowid, pos: pos + selection.focusOffset };
                }
                if (current.nodeType === 3) {
                    pos += current.textContent.length;
                }
            });
        if (selection.isCollapsed) {
            cursor.end = cursor.start;
            cursor.collapsed = true;
        }
        else if (cursor.start.pos > cursor.end.pos) {
            //交换start和end
            let t = cursor.end;
            cursor.end = cursor.start;
            cursor.start = t;
        }
        if (cursor.start.rowid !== cursor.end.rowid) {
            cursor.mutilple = true;
        }
        // blockPos.rowid = block.getAttribute('data-row-id');
        // let active = anchorParent === focusParent ? focusParent : undefined;
        // blockPos.activeTokens = this.editor.tools.getActiveTokens(active);
        this._lastCursor = cursor;
        console.log(selection);
        console.log(this._lastCursor);
    }

    restore(block?: Element) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection) {
            // selection.removeAllRanges();
            // let range = this.editor.ownerDoc.createRange();
            // if (this._lastCursor) {
            //     if (!block) block = this.editor.ownerDoc.querySelector(`[data-row-id="${this._lastCursor.rowid}"]`);
            //     if (block) {
            //         Util.NodeTreeWalker(
            //             block,
            //             (start, current, end) => {
            //                 if (start <= this._lastCursor.start && this._lastCursor.start <= end) {
            //                     range.setStart(current, this._lastCursor.start - start);
            //                 }
            //                 if (start <= this._lastCursor.end && this._lastCursor.end <= end) {
            //                     range.setEnd(current, this._lastCursor.end - start);
            //                 }
            //             },
            //             true
            //         );
            //         selection.addRange(range);
            //     }
            // }
            // else {
            //     //如果上个光标记录点不存在，则将光标定位到文章末尾
            //     let lastEl = this.editor.rootEl.lastElementChild;
            //     let lastNode = Util.FindLastNode(lastEl);
            //     if (lastNode) {
            //         range.setStart(lastNode, lastNode.textContent.length);
            //         range.setEnd(lastNode, lastNode.textContent.length);
            //         selection.addRange(range);
            //         this._lastCursor = {
            //             rowid: lastEl.getAttribute('data-row-id'),
            //             start: lastEl.textContent.length,
            //             end: lastEl.textContent.length
            //         }
            //     }
            // }
        }
    }

    moveTo(cursor: EE.ICursorSelection) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection) {
            selection.removeAllRanges();
            let range = this.editor.ownerDoc.createRange();
            let startRow = this.editor.getRowElement(cursor.start.rowid);
            let pos = 0;
            let isEmpty = true;
            cursor.mutilple = cursor.mutilple || cursor.start.rowid !== cursor.end.rowid;
            if (startRow) {
                Util.TreeWalker(
                    this.editor.ownerDoc,
                    startRow,
                    (current: Text) => {
                        let length = current.textContent.length;
                        if (pos <= cursor.start.pos && cursor.start.pos <= pos + length) {
                            range.setStart(current, cursor.start.pos - pos);
                            isEmpty = false;
                        }
                        if (!cursor.mutilple) {
                            if (pos <= cursor.end.pos && cursor.end.pos <= pos + length) {
                                range.setStart(current, cursor.end.pos - pos);
                                isEmpty = false;
                            }
                        }
                        pos += length;
                    },
                    true
                )
            }
            if (cursor.mutilple) {
                let endRow = this.editor.getRowElement(cursor.start.rowid);
                pos = 0;
                if (endRow) {
                    Util.TreeWalker(
                        this.editor.ownerDoc,
                        startRow,
                        (current: Text) => {
                            let length = current.textContent.length;
                            if (pos <= cursor.end.pos && cursor.end.pos <= pos + length) {
                                range.setStart(current, cursor.end.pos - pos);
                                isEmpty = false;
                            }
                            pos += length;
                        },
                        true
                    )
                }
            }
            if (isEmpty) {
                range.setStart(startRow, cursor.start.pos);
                range.setEnd(startRow, cursor.end.pos);
            }
            selection.addRange(range);
        }
    }
}