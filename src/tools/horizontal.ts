import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'hr',
    level: EE.ToolLevel.Hr,
    blockType: EE.BlockType.Leaf,
})
export default class Horizontal extends Tool.BlockTool {
    selectors = ['hr'];
    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'hr',
            token: 'hr',
            iconFA: 'fa-minus',
            text: '分隔线',
            click: () => {
                this.apply();
            }
        });
    }

    apply() {
        let newId = Util.RandomID();
        let newEl = Util.CreateRenderElement(this.editor.ownerDoc, {
            tag: 'hr',
            attr: {
                'data-row-id': newId
            }
        }) as HTMLElement;
        let insertEl: Element;
        this.editor.cursor.eachRow((block) => {
            let child = this.editor.findBlockElement(block.rowid);
            if (!block.pid) {
                insertEl = child.nextElementSibling;
            }
        });
        this.editor.insertBlock(newEl, insertEl, true);
        this.editor.actions.doInput();
        return newId;
    }
}