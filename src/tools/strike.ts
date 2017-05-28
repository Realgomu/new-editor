import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'strike',
    type: EE.ToolType.StrikeThrough,
    buttonOptions: {
        name: 'strike',
        iconFA: 'fa-strikethrough',
        text: '划线'
    }
})
export default class Strike extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['s'];
    action = 'strikethrough';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }
}