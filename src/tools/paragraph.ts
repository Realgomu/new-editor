import * as Tool from 'core/tool';
import * as Util from 'core/util';

@Tool.EditorTool({
    token: 'paragraph',
    type: EE.ToolType.Paragraph
})
export default class Paragraph extends Tool.BlockTool implements EE.IActionTool {
    tagNames = ['p'];
    action = 'paragraph';
    constructor(editor: EE.IEditor) {
        super(editor);
    }

    redo() {
        this.$ChangeBlock();
    }

    undo() {

    }
}