import * as Tool from 'core/tool';
import * as Util from 'core/util';

@Tool.EditorTool('pre')
export default class Pre extends Tool.BlockTool implements Tool.IActionTool {
    tagNames = ['pre'];
    action = 'pre';
    constructor() {
        super(EE.ToolType.Pre);
    }

    redo() {
        this.$ChangeBlock();
    }

    undo() {

    }
}