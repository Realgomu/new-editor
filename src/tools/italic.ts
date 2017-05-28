import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'italic',
    type: EE.ToolType.Italic,
    buttonOptions: {
        name: 'italic',
        iconFA: 'fa-italic',
        text: '斜体'
    }
})
export default class Italic extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['i', 'em'];
    action = 'italic';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }
}