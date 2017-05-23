import * as Util from 'core/util';

export class Selection implements EE.ISelection {
    private _lastPos: EE.ISelectionPosition = undefined;
    constructor(private editor: EE.IEditor) {

    }

    current() {
        return Object.assign({}, this._lastPos) as EE.ISelectionPosition;
    }

    update(block?: Element) {
        let selection = this.editor.ownerDoc.getSelection();
        let anchorParent = Util.FindElementParent(selection.anchorNode);
        let focusParent = Util.FindElementParent(selection.focusNode);
        if (!block) {
            block = Util.FindBlockParent(anchorParent);
        }
        let blockPos: EE.ISelectionPosition = {
            rowid: '',
            start: 0,
            end: 0,
        };
        Util.NodeTreeWalker(
            block,
            (pos, current) => {
                if (selection.anchorNode === current) {
                    blockPos.start = pos + selection.anchorOffset;
                }
                if (selection.focusNode === current) {
                    blockPos.end = pos + selection.focusOffset;
                }
            },
            true
        );
        if (selection.isCollapsed) {
            blockPos.end = blockPos.start;
            blockPos.isCollapsed = true;
        }
        else if (blockPos.start > blockPos.end) {
            //交换start和end
            let t = blockPos.end;
            blockPos.end = blockPos.start;
            blockPos.start = t;
        }
        blockPos.rowid = block.getAttribute('data-row-id');
        let active = anchorParent === focusParent ? focusParent : undefined;
        blockPos.activeTokens = this.editor.tools.getActiveTokens(active);
        this._lastPos = blockPos;
        console.log(selection);
        console.log(this._lastPos);
    }

    restore(block?: Element) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection) {
            selection.removeAllRanges();
            let range = this.editor.ownerDoc.createRange();
            if (this._lastPos) {
                if (!block) block = this.editor.ownerDoc.querySelector(`[data-row-id="${this._lastPos.rowid}"]`);
                if (block) {
                    Util.NodeTreeWalker(
                        block,
                        (start, current, end) => {
                            if (start <= this._lastPos.start && this._lastPos.start <= end) {
                                range.setStart(current, this._lastPos.start - start);
                            }
                            if (start <= this._lastPos.end && this._lastPos.end <= end) {
                                range.setEnd(current, this._lastPos.end - start);
                            }
                        },
                        true
                    );
                    selection.addRange(range);
                }
            }
            else {
                //如果上个光标记录点不存在，则将光标定位到文章末尾
                let lastEl = this.editor.rootEl.lastElementChild;
                let lastNode = Util.FindLastNode(lastEl);
                if (lastNode) {
                    range.setStart(lastNode, lastNode.textContent.length);
                    range.setEnd(lastNode, lastNode.textContent.length);
                    selection.addRange(range);
                    this._lastPos = {
                        rowid: lastEl.getAttribute('data-row-id'),
                        start: lastEl.textContent.length,
                        end: lastEl.textContent.length
                    }
                }
            }
        }
    }

    moveTo(pos: EE.ISelectionPosition) {
        let selection = this.editor.ownerDoc.getSelection();
        if (selection) {
            selection.removeAllRanges();
            let range = this.editor.ownerDoc.createRange();
            let block = this.editor.getRowElementRoot(pos.rowid);
            if (block) {
                let isEmpty = true;
                Util.NodeTreeWalker(
                    block,
                    (start, current, end) => {
                        if (start <= pos.start && pos.start <= end) {
                            range.setStart(current, pos.start - start);
                            isEmpty = false;
                        }
                        if (start <= pos.end && pos.end <= end) {
                            range.setEnd(current, pos.end - start);
                            isEmpty = false;
                        }
                    },
                    true
                );
                if (isEmpty) {
                    range.setStart(block, pos.start);
                    range.setEnd(block, pos.end);
                }
                selection.addRange(range);
            }
        }
    }
}