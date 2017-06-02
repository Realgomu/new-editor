import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'pre',
    level: EE.ToolLevel.Pre,
    blockType: EE.BlockType.Leaf,
})
export default class Pre extends Tool.BlockTool {
    selectors = ['pre'];
    action = 'pre';
    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'pre',
            token: 'pre',
            iconFA: 'fa-code',
            text: '代码'
        })
    }
}