import * as Tool from '../core/tool';
import * as Action from 'core/action';

@Tool.EditorTool('bold')
export default class Bold extends Tool.InlineTool implements Tool.IActionTool {
    tagNames = ['b', 'strong'];
    action = 'bold';
    useCommand = true;

    constructor() {
        super(EE.ToolType.Bold);
    }

    redo() {
        if (this.useCommand && this.action) {
            Action.DoCommandAction(this.action)
        }
    }

    undo() {

    }
}