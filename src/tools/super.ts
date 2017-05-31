import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'sup',
    level: EE.ToolLevel.Super,
    buttonOptions: {
        name: 'sup',
        iconFA: 'fa-superscript',
        text: '上标'
    }
})
export default class Sup extends Tool.InlineTool {
    selectors = ['sup'];
    action = 'superscript';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }
}