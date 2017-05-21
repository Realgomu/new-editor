import * as Tool from 'core/tool';
import * as Util from 'core/util';

@Tool.EditorTool({
    token: 'header',
    type: EE.ToolType.Header
})
export default class Paragraph extends Tool.BlockTool implements EE.IActionTool {
    tagNames = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    action = 'header';
    constructor(editor: EE.IEditor) {
        super(editor);
    }

    getData(el: Element): EE.IBlock {
        let block = this.$getDate(el);
        let level = parseInt(el.tagName.substr(1, 1));
        block.data = level;
        return block;
    }

    redo(level: number) {
        let tag = 'h' + level;
        this.$ChangeBlock(tag);
    }

    undo() {

    }
}