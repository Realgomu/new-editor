import * as Tool from './tool';
import * as Util from './util';
import * as Selection from './selection';

export abstract class BlockTool implements EE.IBlockTool {
    readonly type: EE.ToolType;
    readonly token: string;
    abstract tagNames: string[];

    constructor(protected editor: EE.IEditor) {
    }

    getInlines(el: Element): EE.InlineMap {
        let map: EE.InlineMap = {};
        Util.NodeTreeWalker(
            el,
            (pos, child: Element) => {
                let tool = this.editor.tools.matchInlineTool(child);
                if (tool) {
                    let list = map[tool.type];
                    if (!list) list = map[tool.type] = [];
                    list.push(tool.getData(child, pos));
                }
                console.log(pos, child);
            });
        return map;
    }

    getData(el: Element): EE.IBlock {
        let id = el.getAttribute('data-row-id');
        let block: EE.IBlock = {
            rowid: id || Util.RandomID(),
            type: this.type,
            text: el.textContent,
            inlines: this.getInlines(el)
        }
        return block;
    }

    protected $ChangeBlock() {
        let pos = this.editor.selection.lastPos;
        if (pos.focusParent) {
            let current = Util.FindBlockParent(pos.focusParent);
            if (!Tool.ElementTagCheck(this, current)) {
                let rowid = current.getAttribute('data-row-id');
                let newNode = this.editor.ownerDoc.createElement(this.tagNames[0]);
                newNode.setAttribute('data-row-id', rowid);
                newNode.innerHTML = current.innerHTML;
                current.parentElement.replaceChild(newNode, current);
                this.editor.selection.restoreCursor(newNode);
            }
        }
    }
}