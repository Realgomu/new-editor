import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'sup',
    level: EE.ToolLevel.Super,
})
export default class Sup extends Tool.InlineTool {
    selectors = ['sup'];
    action = 'superscript';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'sup',
            token: 'sup',
            iconFA: 'fa-superscript',
            text: '上标'
        })
    }
}