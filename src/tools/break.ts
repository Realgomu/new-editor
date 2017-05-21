import * as Tool from 'core/tool';

@Tool.EditorTool({
    token: 'br',
    type: EE.ToolType.Br
})
export default class Break extends Tool.InlineTool implements EE.IActionTool {
    tagNames = ['br'];
    action = 'br';

    constructor(editor: EE.IEditor) {
        super(editor);
    }

    redo() {
    }

    undo() {

    }
}