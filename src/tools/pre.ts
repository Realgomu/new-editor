import * as Tool from 'core/tool';
import * as Util from 'core/util';

@Tool.EditorTool({
    token: 'pre',
    type: EE.ToolType.Pre
})
export default class Pre extends Tool.BlockTool implements EE.IActionTool {
    tagNames = ['pre'];
    action = 'pre';
    constructor(editor: EE.IEditor) {
        super(editor);
    }

    redo() {
        this.$ChangeBlock();
    }

    undo() {

    }
}