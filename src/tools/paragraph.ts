import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';
import { IActionStep } from 'core/action';

@Tool.EditorTool({
    token: 'paragraph',
    level: EE.ToolLevel.Paragraph,
    blockType: EE.BlockType.Leaf,
})
export default class Paragraph extends Tool.BlockTool implements Tool.IEnterBlockTool {
    selectors = ['div', 'p'];
    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'paragraph',
            token: 'paragraph',
            iconFA: 'fa-paragraph',
            text: '正文'
        })
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