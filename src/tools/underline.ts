import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'underline',
    type: EE.ToolType.Underline,
    buttonOptions: {
        name: 'underline',
        iconFA: 'fa-underline',
        text: '下划线'
    }
})
export default class Underline extends Tool.InlineTool {
    selectors = ['u'];
    action = 'underline';
    useDocCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }
}