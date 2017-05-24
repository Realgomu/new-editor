import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'bold',
    type: EE.ToolType.Bold
})
export default class Bold extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['b', 'strong'];
    action = 'bold';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }

    redo() {
        let actions = [];
        this.editor.selection.eachRow((block, start, end) => {
            let list = block.inlines[this.token];
            if (list) {
                for (let i = 0, l = list.length; i < l; i++) {
                    let inline = list[i];
                    if (start < inline.start) {
                        if (end <= inline.start) {
                            actions.push([block.rowid, start, end]);
                            break;
                        }
                        else {
                            actions.push([block.rowid, start, inline.start]);
                            if (inline.end >= end) {
                                break;
                            }
                            else {
                                start = inline.end;
                            }
                        }
                    }
                    else if (start <= inline.end) {
                        if (end <= inline.end) {
                            break;
                        }
                        else {
                            start = inline.end;
                        }
                    }
                    else if (i === l - 1) {
                        actions.push([block.rowid, start, end]);
                    }
                }
            }
            else {
                list = [];
            }
            list = this.editor.MergeInlines(list, {
                type: this.type,
                start: start,
                end: end
            });
            block.inlines[this.token] = list;
            this.editor.renderRow(block);
        });
        this.editor.selection.restore();
        console.log(actions);
    }

    undo() {

    }
}