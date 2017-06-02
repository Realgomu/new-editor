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
    selectors = ['p'];
    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'paragraph',
            token: 'paragraph',
            iconFA: 'fa-paragraph',
            text: '正文'
        })
    }

    createNewRow() {
        return Util.CreateRenderElement(this.editor.ownerDoc, {
            tag: this.selectors[0],
            attr: {
                'data-row-id': Util.RandomID()
            },
            children: [{
                tag: 'br'
            }]
        }) as HTMLElement;
    }

    enterAtEnd(step: IActionStep, currentBlock: EE.IBlock) {
        let newRow = this.createNewRow();
        // let index = this.editor.findRowIndex(currentBlock.rowid);
    }
}