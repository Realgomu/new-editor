import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'strike',
    type: EE.ToolType.StrikeThrough
})
export default class Strike extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['s'];
    action = 'strikethrough';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }

    redo() {
        if (this.useCommand && this.action) {
            this.editor.actions.doCommandAction(this.action);
        }
    }

    undo() {

    }
}