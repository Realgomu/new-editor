import { IEditorTool, IActionTool } from './tool';
import * as Tool from './tool';
import * as Util from './util';
import * as Selection from './selection';

export abstract class BlockTool implements IEditorTool {
    readonly type: EE.ToolType;
    abstract tagNames: string[];

    constructor(type: EE.ToolType) {
        this.type = type;
    }

    getInlines(el: Element): EE.InlineMap {
        let map: EE.InlineMap = {};
        Util.NodeTreeWalker(
            el,
            (pos, child: Element) => {
                let tool = Tool.MatchInlineTool(child);
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
            rowid: id || Util.randomID(),
            type: this.type,
            text: el.textContent,
            inlines: this.getInlines(el)
        }
        return block;
    }

    protected $ChangeBlock() {
        let pos = Selection.Current();
        if (pos.focusParent) {
            let current = Util.findBlockParent(pos.focusParent);
            if (!Tool.Match(this, current)) {
                let rowid = current.getAttribute('data-row-id');
                let newNode = document.createElement(this.tagNames[0]);
                newNode.setAttribute('data-row-id', rowid);
                newNode.innerHTML = current.innerHTML;
                current.parentElement.replaceChild(newNode, current);
                Selection.RestoreCursor(newNode);
            }
        }
    }
}