import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'pre',
    level: EE.ToolLevel.Pre,
    blockType: EE.BlockType.Leaf,
})
export default class Pre extends Tool.BlockTool {
    selectors = ['pre'];
    action = 'pre';
    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'pre',
            token: 'pre',
            iconFA: 'fa-code',
            text: '代码'
        })
    }

    enterAtEnd(newRow: Element, current: EE.IBlockNode, parent?: EE.IBlockNode) {
        //检查parent
        if (current.pid) {
            let parent = this.editor.findBlockData(current.pid);
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
            let parent = this.editor.findBlockData(current.pid);
            let tool = this.editor.tools.matchToken(parent.block.token) as Tool.IEnterBlockTool;
            if (tool && tool.enterAtEnd) {
                return tool.enterAtStart(newRow, current, parent);
            }
        }
        //插入当前行的上面
        this.editor.insertBlock(newRow, current.rowid, true);
    }
}