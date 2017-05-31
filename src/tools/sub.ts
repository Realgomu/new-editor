import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'sub',
    level: EE.ToolLevel.Sub,
    buttonOptions: {
        name: 'sub',
        iconFA: 'fa-subscript',
        text: '下标'
    }
})
export default class Sub extends Tool.InlineTool {
    selectors = ['sub'];
    action = 'subscript';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }
}