import * as Tool from 'core/tools';
import * as Util from 'core/util';

@Tool.EditorTool({
    token: 'header',
    type: EE.ToolType.Header
})
export default class Paragraph extends Tool.BlockTool implements EE.IActionTool {
    selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
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

    render(block: EE.IBlock) {
        let root = Util.CreateRenderElement(this.editor.ownerDoc, {
            tag: 'h' + block.data,
            start: 0,
            end: block.text.length,
            content: block.text,
            attr: {
                'data-row-id': block.rowid
            }
        }) as HTMLElement;
        this.$renderInlines(root, block.inlines);
        return root;
    }

    redo(level: number) {
        let tag = 'h' + level;
        this.$changeBlock(tag);
    }

    undo() {

    }
}