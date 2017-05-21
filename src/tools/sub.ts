import * as Tool from 'core/tool';

@Tool.EditorTool({
    token: 'sub',
    type: EE.ToolType.Sub
})
export default class Sub extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['sub'];
    action = 'subscript';
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