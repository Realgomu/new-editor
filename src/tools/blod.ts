import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'bold',
    type: EE.ToolType.Bold
})
export default class Bold extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['b', 'strong'];
    action = 'bold';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }

    redo() {
    }

    undo() {

    }
}