import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'hr',
    level: EE.ToolLevel.Hr,
    blockType: EE.BlockType.Close,
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
        let newHrEl = this.editor.renderElement({
            tag: 'hr',
            attr: {
                'data-row-id': newId
            }
        }) as HTMLElement;
        let lastRow = this.editor.cursor.findLastRow();
        let index = lastRow.index + 1;
        if (lastRow) {
            this.editor.insertElement(this.editor.rootEl, newHrEl, lastRow.index + 1);
        }
        if (index === this.editor.blockTree.children.length) {
            let newRowEl = this.editor.tools.createNewRow();
            this.editor.insertElement(this.editor.rootEl, newRowEl, lastRow.index + 2);
        }
        this.editor.actions.doAction();
        return newId;
    }
}