import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'italic',
    level: EE.ToolLevel.Italic,
    buttonOptions: {
        name: 'italic',
        iconFA: 'fa-italic',
        text: '斜体'
    }
})
export default class Italic extends Tool.InlineTool {
    selectors = ['i', 'em'];
    action = 'italic';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }
}