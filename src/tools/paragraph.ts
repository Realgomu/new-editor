import * as Tool from 'core/tool';
import * as Util from 'core/util';

@Tool.EditorTool('paragraph')
export default class Paragraph extends Tool.BlockTool implements Tool.IActionTool {
    tagNames = ['p'];
    action = 'paragraph';
    constructor() {
        super(EE.ToolType.Paragraph);
    }

    redo() {
        this.$ChangeBlock();
    }

    undo() {

    }
}