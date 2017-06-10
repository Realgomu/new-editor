import * as Util from 'core/util';
import { Editor } from 'core/editor';

interface IActiveObj {
    token: string;
    el?: Element;
}

interface ICursorNode {
    node: Node;
    offset: number;
    atClose?: boolean;
    afterClose?: boolean;
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

    atEnd() {
        let lastRowId = this._current.rows[this._current.rows.length - 1];
        let node = this.editor.findBlockNode(lastRowId);
        if (node) {
            if (this._current.end === node.block.text.length && this._current.endAfterClose !== false) {
                return true;
            }
        }
    }

    atStart() {
        return this._current.start === 0 && this._current.startBeforeClose !== false;
    }

    private _getTargetNode(node: Node, offset: number): ICursorNode {
        if (node.nodeType === 1) {
            let child = node.childNodes[offset];
            if (child) {
                return { node: child, offset: 0, atClose: true, afterClose: child.nodeType === 3 };
            }
            else {
                return { node: node.childNodes[offset - 1], offset: 0, atClose: true, afterClose: true };
            }
        }
        return { node: node, offset: offset, atClose: false };
    }

    update(ev?: Event) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection.anchorNode === this.editor.rootEl) {
            this.editor.cursor.restore();
            return;
        }
        let anchor = this._getTargetNode(selection.anchorNode, selection.anchorOffset);
        let focus = this._getTargetNode(selection.focusNode, selection.focusOffset);
        let startCursorNode: ICursorNode;
        let endCursorNode: ICursorNode;
        let cursor: EE.ICursorPosition = {
            rows: [],
            start: 0,
            end: 0,
            collapsed: selection.isCollapsed
        };
        let pos = 0,
            count = 0,
            rowid = '';
        this.editor.treeWalker(
            this.editor.rootEl,
            (el: Element) => {
                if (el.nodeType === 1) {
                    let id = this.editor.isBlockElement(el, true);
                    if (id) {
                        if (count === 2) return true;
                        rowid = id;
                        pos = 0;
                        if (count === 1) cursor.rows.push(rowid);
                    }
                }
                if (el === anchor.node) {
                    if (count === 0) {
                        cursor.start = pos + anchor.offset;
                        startCursorNode = anchor;
                    }
                    else {
                        cursor.end = pos + anchor.offset;
                        endCursorNode = anchor;
                    }
                    cursor.rows.indexOf(rowid) < 0 && cursor.rows.push(rowid);
                    count++;
                }
                if (el === focus.node) {
                    if (count === 0) {
                        cursor.start = pos + focus.offset;
                        startCursorNode = focus;
                    }
                    else {
                        cursor.end = pos + focus.offset;
                        endCursorNode = focus;
                    }
                    cursor.rows.indexOf(rowid) < 0 && cursor.rows.push(rowid);
                    count++;
                }
                if (el.nodeType === 3) {
                    pos += el.textContent.length;
                }
            })
        if (selection.isCollapsed) {
            cursor.end = cursor.start;
        }
        this._setCurrent(cursor, startCursorNode, endCursorNode);
        //计算激活的token
        this._getActiveTokens();
        console.log(this._current);
        return this._current;
    }

    private _setCurrent(cursor: EE.ICursorPosition, startCursorNode?: ICursorNode, endCursorNode?: ICursorNode) {
        this._current = cursor;
        this._current.mutilple = this._current.rows.length > 1;
        if (startCursorNode && endCursorNode) {
            let atClose = startCursorNode.atClose || endCursorNode.atClose;
            if (atClose) {
                if (!cursor.collapsed && cursor.start === cursor.end) {
                    this._current.startBeforeClose = true;
                    this._current.endAfterClose = true;
                }
                else {
                    this._current.startBeforeClose = startCursorNode.atClose && !startCursorNode.afterClose;
                    this._current.endAfterClose = endCursorNode.atClose && endCursorNode.afterClose;
                }
            }
        }
        //计算激活的token
        this._getActiveTokens();
        //触发事件
        this.editor.events.trigger('$cursorChanged', null);
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
            let lastNode = this.editor.lastLeafNode();
            let lastEl = this.editor.findBlockElement(lastNode.rowid);
            this._current = {
                rows: [lastNode.rowid],
                start: lastNode.block.text.length,
                end: lastNode.block.text.length,
                collapsed: true,
                endAfterClose: true,
                startBeforeClose: false,
            };
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
                this.editor.treeWalker(startRow, (current: Text) => {
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
                }, true);
            }
            if (cursor.mutilple) {
                let endRow = this.editor.findBlockElement(cursor.rows[cursor.rows.length - 1]);
                pos = 0;
                if (endRow) {
                    this.editor.treeWalker(endRow, (current: Text) => {
                        let length = current.textContent.length;
                        if (pos <= cursor.end && cursor.end <= pos + length) {
                            range.setEnd(current, cursor.end - pos);
                            isEmpty = false;
                        }
                        pos += length;
                    }, true);
                }
            }
            if (isEmpty) {
                let offset = cursor.start + (cursor.endAfterClose ? 1 : 0);
                range.setStart(startRow, offset);
                range.setEnd(startRow, offset);
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
            this.editor.treeWalker(target, (node: Text) => {
                if (pos === 0) {
                    range.setStart(node, 0);
                }
                pos += node.textContent.length;
                if (pos === length) {
                    range.setEnd(node, node.textContent.length);
                }
            }, true);
            // Util.TreeWalker(
            //     this.editor.ownerDoc,
            //     target,
            //     (node: Text) => {
            //         if (pos === 0) {
            //             range.setStart(node, 0);
            //         }
            //         pos += node.textContent.length;
            //         if (pos === length) {
            //             range.setEnd(node, node.textContent.length);
            //         }
            //     },
            //     true
            // )
            selection.addRange(range);
        }
    }
}