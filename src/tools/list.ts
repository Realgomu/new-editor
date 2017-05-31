import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'list',
    level: EE.ToolLevel.List,
})
export default class List extends Tool.BlockTool {
    selectors = ['ol', 'ul', 'li'];
    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'ol',
            token: 'list',
            iconFA: 'fa-list-ol',
            text: '编号列表',
            click: () => {

            }
        });
        this.editor.buttons.register({
            name: 'ul',
            token: 'list',
            iconFA: 'fa-list-ul',
            text: '项目编号',
            click: () => {

            }
        });
    }
}