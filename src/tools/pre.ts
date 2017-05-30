import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'pre',
    type: EE.ToolType.Pre,
    buttonOptions: {
        name: 'pre',
        iconFA: 'fa-code',
        text: '代码'
    }
})
export default class Pre extends Tool.BlockTool {
    selectors = ['pre'];
    action = 'pre';
    constructor(editor: Editor) {
        super(editor);
    }
}