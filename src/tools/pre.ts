import * as Tool from 'core/tool';

@Tool.EditorTool({
    token: 'pre',
    type: EE.ToolType.Pre
})
export default class Pre extends Tool.BlockTool implements EE.IActionTool {
    selectors = ['pre'];
    action = 'pre';
    constructor(editor: EE.IEditor) {
        super(editor);
    }

    redo() {
        this.$changeBlock();
    }

    undo() {

    }
}