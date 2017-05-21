import * as Tool from 'core/tool';

@Tool.EditorTool({
    token: 'bold',
    type: EE.ToolType.Bold
})
export default class Bold extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['b', 'strong'];
    action = 'bold';
    useCommand = true;

    constructor(editor: EE.IEditor) {
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