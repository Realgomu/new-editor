import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'underline',
    level: EE.ToolLevel.Underline,
})
export default class Underline extends Tool.InlineTool {
    selectors = ['u'];
    action = 'underline';
    useDocCommand = true;

    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'underline',
            token: 'underline',
            iconFA: 'fa-underline',
            text: '下划线'
        })
    }
}