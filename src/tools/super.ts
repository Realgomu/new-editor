import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'sup',
    type: EE.ToolType.Super,
    buttonOptions: {
        name: 'sup',
        iconFA: 'fa-superscript',
        text: '上标'
    }
})
export default class Sup extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['sup'];
    action = 'superscript';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }
}