import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'bold',
    level: EE.ToolLevel.Bold,
    buttonOptions: {
        name: 'bold',
        iconFA: 'fa-bold',
        text: '加粗'
    }
})
export default class Bold extends Tool.InlineTool {
    selectors = ['b', 'strong'];
    action = 'bold';
    useCommand = true;

    constructor(editor: Editor) {
        super(editor);
    }
}