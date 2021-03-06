import * as Tool from 'core/tools';
import { Editor } from 'core/editor';
import * as Util from 'core/util';

interface ITip {
    el: Element;
    rowid: string;
    text?: string;
    left?: number;
    top?: number;
    height?: number;
}

@Tool.EditorTool({
    token: 'row-tip',
    level: 1010,
})
export default class RowTip implements EE.IEditorTool {
    readonly token: string;
    readonly level: EE.ToolLevel;

    panel: HTMLElement;
    me: HTMLElement;
    constructor(private editor: Editor) {
    }

    init() {
        this.editor.events.on('$cursorChanged', () => {
            this._reload();
        });
        // this.editor.events.on('$contentChanged', (ev) => {
        //     this._reload();
        // });
        //create el
        this.panel = this.editor.renderElement({
            tag: 'div',
            attr: {
                class: 'ee-row-tip-container'
            }
        }) as HTMLElement;
        this.editor.defaultUI.page.appendChild(this.panel);

        this.me = this.editor.renderElement({
            tag: 'div',
            attr: {
                class: 'ee-row-tip'
            }
        }) as HTMLElement;
        this.panel.appendChild(this.me);
    }

    private _reload() {
        let cursor = this.editor.cursor.current();
        let left = 0, top = 0, height = 0;
        let start = this.editor.findBlockElement(cursor.rows[0]) as HTMLElement;
        let offset = this.editor.defaultUI.getOffset(start);
        top = offset.top;
        left = 0;
        if (!cursor.mutilple) {
            height = start.offsetHeight;
        }
        else {
            let end = this.editor.findBlockElement(cursor.rows[cursor.rows.length - 1]) as HTMLElement;
            offset = this.editor.defaultUI.getOffset(end);
            height = offset.top + end.offsetHeight - top;
        }
        this.me.style.top = top + 'px';
        this.me.style.left = left + 'px';
        this.me.style.height = height + 'px';
    }
}