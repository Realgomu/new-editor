import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'br',
    type: EE.ToolType.Br
})
export default class Break extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['br'];
    action = 'br';

    constructor(editor: Editor) {
        super(editor);
    }

    redo() {
    }

    undo() {

    }
}