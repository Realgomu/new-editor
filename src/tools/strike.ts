import * as Tool from 'core/tool';

@Tool.EditorTool({
    token: 'strike',
    type: EE.ToolType.StrikeThrough
})
export default class Strike extends Tool.InlineTool implements EE.IActionTool {
    tagNames = ['s'];
    action = 'strikethrough';
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