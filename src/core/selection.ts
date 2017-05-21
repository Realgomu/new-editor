import * as Util from 'core/util';

export class Selection implements EE.ISelection {
    lastPos: EE.ISelectionPosition = undefined;
    constructor(private editor: EE.IEditor) {

    }

    isCollapsed(): boolean {
        let selection = this.editor.ownerDoc.getSelection();
        return selection.isCollapsed;
    }

    updateCurrent(block?: Element) {
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
        }
        else if (blockPos.start > blockPos.end) {
            //交换start和end
            let t = blockPos.end;
            blockPos.end = blockPos.start;
            blockPos.start = t;
        }
        blockPos.rowid = block.getAttribute('data-row-id');
        blockPos.focusParent = anchorParent === focusParent ? focusParent : undefined;
        this.lastPos = blockPos;
        return blockPos;
    }

    restoreCursor(block?: Element) {
        if (this.lastPos) {
            if (!block) block = this.editor.ownerDoc.querySelector(`[data-row-id="${this.lastPos.rowid}"]`);
            let selection = this.editor.ownerDoc.getSelection();
            if (block && selection) {
                selection.removeAllRanges();
                let range = this.editor.ownerDoc.createRange();
                Util.NodeTreeWalker(
                    block,
                    (start, current, end) => {
                        if (start <= this.lastPos.start && this.lastPos.start < end) {
                            range.setStart(current, this.lastPos.start - start);
                        }
                        if (start <= this.lastPos.end && this.lastPos.end < end) {
                            range.setEnd(current, this.lastPos.end - start);
                        }
                    },
                    true
                )
                selection.addRange(range);
            }
        }
    }
}