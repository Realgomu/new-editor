import * as Tool from 'core/tool';

@Tool.EditorTool({
    token: 'sup',
    type: EE.ToolType.Super
})
export default class Sup extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['sup'];
    action = 'superscript';
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