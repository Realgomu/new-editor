import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'italic',
    level: EE.ToolLevel.Italic,
})
export default class Italic extends Tool.InlineTool {
    selectors = ['i', 'em'];
    action = 'italic';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'italic',
            token: 'italic',
            iconFA: 'fa-italic',
            text: '斜体'
        })
    }
}