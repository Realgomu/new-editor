import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'hr',
    level: EE.ToolLevel.Hr,
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
        let newRow = Util.CreateRenderElement(this.editor.ownerDoc, {
            tag: 'hr',
            attr: {
                'data-row-id': newId
            }
        }) as HTMLElement;
        let cursor = this.editor.cursor.current();
        if (!cursor.mutilple) {
            this.editor.rootEl.appendChild(newRow);
            this.editor.getData();
            this.editor.interNewRow();
        }
        // newRow.setAttribute('data-row-id', newId);
        // newRow.innerHTML = '<br>';
        // if (!rowid) {
        //     this.rootEl.appendChild(newRow);
        //     this._pageData.rows.push(block);
        // }
        // else {
        //     let index = rowid ? this._pageData.rows.findIndex(r => r.rowid === rowid) : this._pageData.rows.length;
        //     let el = this.rootEl.querySelector(`[data-row-id="${rowid}"]`);
        //     if (after) {
        //         if (el.nextSibling) {
        //             this.rootEl.insertBefore(newRow, el.nextSibling);
        //             this._pageData.rows.splice(index + 1, 0, block);
        //         }
        //         else {
        //             this.rootEl.appendChild(newRow);
        //             this._pageData.rows.push(block);
        //         }
        //         this.cursor.moveTo({
        //             rows: [newId],
        //             start: 0,
        //             end: 0
        //         });
        //     }
        //     else {
        //         this.rootEl.insertBefore(newRow, el);
        //         this._pageData.rows.splice(index, 0, block);
        //     }
        // }
        return newId;
    }
}