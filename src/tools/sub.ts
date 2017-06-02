import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'sub',
    level: EE.ToolLevel.Sub,
})
export default class Sub extends Tool.InlineTool {
    selectors = ['sub'];
    action = 'subscript';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'sub',
            token: 'sub',
            iconFA: 'fa-subscript',
            text: '下标'
        })
    }
}