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
                    let list = map[tool.token];
                    if (!list) list = map[tool.token] = [];
                    list.push(tool.getData(child, pos));
                }
            });
        return map;
    }

    getData(el: Element): EE.IBlock {
        return this.$getDate(el);
    }

    protected $getDate(el: Element): EE.IBlock {
        let id = el.getAttribute('data-row-id');
        let block: EE.IBlock = {
            rowid: id || Util.RandomID(),
            token: this.token,
            type: this.type,
            text: el.textContent,
            inlines: this.getInlines(el)
        }
        return block;
    }

    protected $ChangeBlock(tag: string = this.tagNames[0]) {
        let pos = this.editor.selection.lastPos;
        if (pos.rowid) {
            let old = this.editor.ownerDoc.querySelector(`[data-row-id="${pos.rowid}"]`);
            if (old.tagName.toLowerCase() !== tag) {
                let rowid = old.getAttribute('data-row-id');
                let newNode = this.editor.ownerDoc.createElement(tag);
                newNode.setAttribute('data-row-id', rowid);
                newNode.innerHTML = old.innerHTML;
                old.parentElement.replaceChild(newNode, old);
                this.editor.selection.restoreCursor(newNode);
            }
        }
    }
}