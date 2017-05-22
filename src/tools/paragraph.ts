import * as Tool from 'core/tools';

@Tool.EditorTool({
    token: 'paragraph',
    type: EE.ToolType.Paragraph
})
export default class Paragraph extends Tool.BlockTool implements EE.IActionTool {
    selectors = ['p'];
    action = 'paragraph';
    constructor(editor: EE.IEditor) {
        super(editor);
    }

    redo() {
        this.$changeBlock();
    }

    undo() {

    }
}