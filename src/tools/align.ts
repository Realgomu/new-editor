import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'align',
    level: EE.ToolLevel.Align,
})
export default class Align implements EE.IEditorTool {
    readonly token: string;
    readonly level: EE.ToolLevel;
    constructor(private editor: Editor) {
        //buttons

        let texts = ['左对齐', '右对齐', '居中', '左右'];
        ['Left', 'Right', 'Center', 'Justify'].forEach((t, index) => {
            let type = t.toLowerCase();
            this.editor.buttons.register({
                name: `align${t}`,
                token: 'align',
                iconFA: `fa-align-${type}`,
                text: texts[index],
                click: () => {
                    this.apply(type);
                },
                checkActive: () => {
                    return this.active(type);
                }
            });
        });
    }

    apply(type: string = 'left') {
        this.editor.cursor.eachRow((node) => {
            if (!node.block.style) {
                node.block.style = {};
            }
            node.block.style.align = type;
            let el = this.editor.findBlockElement(node.rowid);
            el.style.textAlign = type;
        });
        this.editor.actions.doInput();
    }

    active(type: string = 'left') {
        let cursor = this.editor.cursor.current();
        if (!cursor.mutilple) {
            let el = this.editor.findBlockElement(cursor.rows[0]);
            return type === (el.style.textAlign || 'left');
        }
        return false;
    }
}