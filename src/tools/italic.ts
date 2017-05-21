import * as Tool from 'core/tool';

@Tool.EditorTool({
    token: 'italic',
    type: EE.ToolType.Italic
})
export default class Italic extends Tool.InlineTool implements EE.IActionTool {
    tagNames = ['i', 'em'];
    action = 'italic';
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