import * as Util from 'core/util';
import { Editor } from 'core/editor';

interface IActiveObj {
    token: string;
    el?: Element;
}

export class Cursor {
    private _current: EE.ICursorPosition = undefined;
    private _activeList: IActiveObj[] = [];
    constructor(private editor: Editor) {

    }

    current() {
        return this._current as Readonly<EE.ICursorPosition>;
    }

    activeTokens() {
        return this._activeList as Readonly<Array<IActiveObj>>;
    }

    eachRow(func: (node: EE.IBlockNode, start?: number, end?: number) => void) {
        this._current.rows.forEach(id => {
            let node = this.editor.findBlockNode(id);
            let start = 0, end = node.block.text.length;
            if (node.rowid === this._current.rows[0]) {
                start = this._current.start;
            }
            if (node.rowid === this._current.rows[this._current.rows.length - 1]) {
                end = this._current.end;
            }
            func && func(node, start, end);
        })
    }

    findLastRow(): EE.IBlockNode {
        let lastId = this._current.rows[this._current.rows.length - 1];
        let parent = this.editor.findBlockNode(lastId);
        while (parent.pid) {
            parent = this.editor.findBlockNode(parent.pid);
        }
        return parent;
    }

    update(ev?: Event) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection.anchorNode === this.editor.rootEl) {
            this.editor.cursor.restore();
            return;
        }
        let cursor: EE.ICursorPosition = {
            rows: [],
            start: 0,
            end: 0
        };
        let pos = 0,
            count = 0,
            rowid = '',
            startFirst: boolean = undefined;
        this.editor.treeWalker(
            this.editor.rootEl,
            (el: Element) => {
                if (el.nodeType === 1) {
                    let id = this.editor.isBlockElement(el, true);
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
            })
        // Util.TreeWalker(
        //     this.editor.ownerDoc,
        //     this.editor.rootEl,
        //     (el: Element) => {
        //         if (el.nodeType === 1) {
        //             let id = this.editor.isBlockElement(el, true);
        //             if (id) {
        //                 rowid = id;
        //                 pos = 0;
        //                 if (count === 1) cursor.rows.push(rowid);
        //             }
        //         }
        //         if (el === selection.anchorNode) {
        //             cursor.start = pos + selection.anchorOffset;
        //             cursor.rows.indexOf(rowid) < 0 && cursor.rows.push(rowid);
        //             count++;
        //             if (startFirst === undefined) startFirst = true;
        //         }
        //         if (el === selection.focusNode) {
        //             cursor.end = pos + selection.focusOffset;
        //             cursor.rows.indexOf(rowid) < 0 && cursor.rows.push(rowid);
        //             count++;
        //             if (startFirst === undefined) startFirst = false;
        //         }
        //         if (el.nodeType === 3) {
        //             pos += el.textContent.length;
        //         }
        //     });
        if (selection.isCollapsed) {
            cursor.end = cursor.start;
        }
        else if (!startFirst || (!cursor.mutilple && cursor.start > cursor.end)) {
            //交换start和end
            let t = cursor.end;
            cursor.end = cursor.start;
            cursor.start = t;
        }

        this._setCurrent(cursor);
        return this._current;
    }

    private _setCurrent(cursor: EE.ICursorPosition) {
        this._current = cursor;
        this._current.collapsed = this._current.rows.length === 1 && this._current.start === this._current.end;
        this._current.mutilple = this._current.rows.length > 1;
        this._current.atStart = this._current.start === 0;
        let lastRowId = this._current.rows[this._current.rows.length - 1];
        let block = this.editor.findBlockNode(lastRowId).block;
        this._current.atEnd = block.text.length === this._current.end;
        //计算激活的token
        this._getActiveTokens();
        //触发事件
        this.editor.events.trigger('$cursorChanged', null);
        // console.log(selection);
        console.log(this._current);
    }

    private _getActiveTokens() {
        let list: IActiveObj[] = [];
        if (!this._current.mutilple) {
            let node = this.editor.findBlockNode(this._current.rows[0]);
            for (let key in node.block.inlines) {
                if (node.block.inlines[key]
                    .findIndex(i => i.start <= this._current.start && this._current.end <= i.end) >= 0) {
                    list.push({
                        token: key
                    });
                }
            }
        }
        this.eachRow((node) => {
            list.push({
                token: node.block.token,
                el: this.editor.findBlockElement(node.rowid)
            });
            let parent = node;
            while (parent.pid) {
                parent = this.editor.findBlockNode(parent.pid);
                let el = this.editor.findBlockElement(parent.rowid);
                if (list.findIndex(a => a.el === el) < 0) {
                    list.push({
                        token: parent.block.token,
                        el: el,
                    });
                }
            }
        });
        this._activeList = list;
        // console.log(list);
    }

    restore() {
        if (!this._current) {
            let lastRow = this.editor.lastLeafBlock();
            this._current = {
                rows: [lastRow.rowid],
                start: lastRow.text.length,
                end: lastRow.text.length,
                atEnd: true
            }
        }
        return this.moveTo(this._current);
    }

    moveTo(cursor: EE.ICursorPosition) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection) {
            selection.removeAllRanges();
            let range = this.editor.ownerDoc.createRange();
            let startRow = this.editor.findBlockElement(cursor.rows[0]);
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
                let endRow = this.editor.findBlockElement(cursor.rows[cursor.rows.length - 1]);
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
        return this._current;
    }

    selectElement(target: Element) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection) {
            selection.removeAllRanges();
            let range = this.editor.ownerDoc.createRange();
            let pos = 0, length = target.textContent.length;
            Util.TreeWalker(
                this.editor.ownerDoc,
                target,
                (node: Text) => {
                    if (pos === 0) {
                        range.setStart(node, 0);
                    }
                    pos += node.textContent.length;
                    if (pos === length) {
                        range.setEnd(node, node.textContent.length);
                    }
                },
                true
            )
            selection.addRange(range);
        }
    }
}