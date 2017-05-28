import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'paragraph',
    type: EE.ToolType.Paragraph,
    buttonOptions: {
        name: 'paragraph',
        iconFA: 'fa-paragraph',
        text: '正文'
    }
})
export default class Paragraph extends Tool.BlockTool implements EE.IActionTool {
    selectors = ['p'];
    action = 'paragraph';
    constructor(editor: Editor) {
        super(editor);
    }

    redo() {
        this.$changeBlock();
    }

    undo() {

    }
}