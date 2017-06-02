import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

interface IHeader extends EE.IBlock {
    size: number;
}

@Tool.EditorTool({
    token: 'header',
    level: EE.ToolLevel.Header,
    blockType: EE.BlockType.Leaf,
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

    readData(el: Element): IHeader {
        let block = this.$readDate(el as HTMLElement) as IHeader;
        let size = parseInt(el.tagName.substr(1, 1));
        block.size = size;
        return block;
    }

    render(block: IHeader) {
        let el = this.$render(block, 'h' + block.size);
        this.$renderInlines(el, block.inlines);
        return el;
    }

    apply(merge: boolean, level = 1) {
        let tag = this.selectors[level - 1];
        this.$apply(tag);
    }
}