import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'header',
    level: EE.ToolLevel.Header
})
export default class Paragraph extends Tool.BlockTool {
    selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    action = 'header';
    constructor(editor: Editor) {
        super(editor);

        //按钮
        this.editor.buttons.register({
            name: 'h1',
            token: 'header',
            iconFA: 'fa-header',
            text: '标题',
        });
    }

    readData(el: Element, list?: EE.IBlock[]): EE.IBlock {
        let block = this.$getDate(el as HTMLElement);
        let level = parseInt(el.tagName.substr(1, 1));
        block.data = level;
        if (list) list.push(block);
        return block;
    }

    render(block: EE.IBlock) {
        let el = this.$render(block, 'h' + block.data);
        this.$renderInlines(el, block.inlines);
        return el;
    }

    apply(merge: boolean, level = 1) {
        let tag = this.selectors[level - 1];
        this.$apply(tag);
    }
}