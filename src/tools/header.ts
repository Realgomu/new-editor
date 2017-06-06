import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';
import * as Core from 'core/editor';

interface IHeader extends EE.IBlock {
    level: number;
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
            level: 1,
            token: 'header',
            iconFA: 'fa-header',
            text: '标题',
        });
    }

    readData(el: Element): IHeader {
        let block = this.$readDate(el as HTMLElement) as IHeader;
        let size = parseInt(el.tagName.substr(1, 1));
        block.level = size;
        return block;
    }

    render(block: IHeader) {
        return this.$render(block, 'h' + block.level);
    }

    apply(button: Core.IToolbarButton) {
        let tag = this.selectors[button.level - 1];
        this.$apply(tag);
    }

    enterAtEnd(newRow: Element, current: EE.IBlockNode, parent?: EE.IBlockNode) {
        //检查parent
        if (current.pid) {
            let parent = this.editor.findBlockNode(current.pid);
            let tool = this.editor.tools.matchToken(parent.block.token) as Tool.IEnterBlockTool;
            if (tool && tool.enterAtEnd) {
                return tool.enterAtEnd(newRow, current, parent);
            }
        }
        //插入当前行的下面
        this.editor.insertBlock(newRow, current.rowid, false);
    }

    enterAtStart(newRow: Element, current: EE.IBlockNode, parent?: EE.IBlockNode) {
        //检查parent
        if (current.pid) {
            let parent = this.editor.findBlockNode(current.pid);
            let tool = this.editor.tools.matchToken(parent.block.token) as Tool.IEnterBlockTool;
            if (tool && tool.enterAtEnd) {
                return tool.enterAtStart(newRow, current, parent);
            }
        }
        //插入当前行的上面
        this.editor.insertBlock(newRow, current.rowid, true);
    }
}