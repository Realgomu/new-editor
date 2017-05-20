import * as Util from 'core/util';

export interface ISelectionPosition {
    rowid: string;
    start: number;
    end: number;
    focusParent?: Element;
}

let lastPos: ISelectionPosition = undefined;

export function IsCollapsed() {
    let selection = document.getSelection();
    return selection.isCollapsed;
}

export function Current(block?: Element) {
    let selection = document.getSelection();
    let anchorParent = Util.findElementParent(selection.anchorNode);
    let focusParent = Util.findElementParent(selection.focusNode);
    if (!block) {
        block = Util.findBlockParent(anchorParent);
    }
    let blockPos: ISelectionPosition = {
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
    lastPos = blockPos;
    return blockPos;
}

export function RestoreCursor(block?: Element) {
    if (lastPos) {
        if (!block) block = document.querySelector(`[data-row-id="${lastPos.rowid}"]`);
        let selection = document.getSelection();
        if (block && selection) {
            selection.removeAllRanges();
            let range = document.createRange();
            Util.NodeTreeWalker(
                block,
                (start, current, end) => {
                    if (start <= lastPos.start && lastPos.start < end) {
                        range.setStart(current, lastPos.start - start);
                    }
                    if (start <= lastPos.end && lastPos.end < end) {
                        range.setEnd(current, lastPos.end - start);
                    }
                },
                true
            )
            selection.addRange(range);
        }
    }
}