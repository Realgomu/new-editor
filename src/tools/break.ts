import * as Tool from 'core/tools';

@Tool.EditorTool({
    token: 'br',
    type: EE.ToolType.Br
})
export default class Break extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['br'];
    action = 'br';

    constructor(editor: EE.IEditor) {
        super(editor);
    }

    redo() {
    }

    undo() {

    }
}