import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'header',
    type: EE.ToolType.Header,
    buttonOptions: {
        name: 'h1',
        iconFA: 'fa-header',
        text: '标题'
    }
})
export default class Paragraph extends Tool.BlockTool {
    selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    action = 'header';
    constructor(editor: Editor) {
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

    apply(level = 1) {
        let tag = this.selectors[level - 1];
        this.$apply(tag);
    }
}