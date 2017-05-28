import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'sub',
    type: EE.ToolType.Sub,
    buttonOptions: {
        name: 'sub',
        iconFA: 'fa-subscript',
        text: '下标'
    }
})
export default class Sub extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['sub'];
    action = 'subscript';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }
}