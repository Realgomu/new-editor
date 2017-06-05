import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'quote',
    level: EE.ToolLevel.Quote,
    blockType: EE.BlockType.Wrapper,
})
export default class Quote extends Tool.BlockTool {
    selectors = ['blockquote'];
    constructor(editor: Editor) {
        super(editor);

        this.editor.buttons.register({
            name: 'blockquote',
            token: 'quote',
            iconFA: 'fa-quote-left',
            text: '引用'
        });
    }

    apply(merge: boolean) {
        let activeList = this.editor.cursor.activeTokens();
        let cursor = this.editor.cursor.current();
        if (merge) {
            let quote: EE.IBlock = {
                rowid: Util.RandomID(),
                token: this.token,
                text: '',
                inlines: {}
            };
            let el = this.render(quote);
            let index: number;
            activeList.forEach(item => {
                let node = this.editor.findBlockNode(item.el.getAttribute('data-row-id'));
                if (node) {
                    if (!node.pid) {
                        el.appendChild(item.el);
                        if (index === undefined) {
                            index = node.index;
                        }
                    }
                }
            });
            this.editor.insertElement(this.editor.rootEl, el, index);
            this.editor.cursor.restore();
            this.editor.actions.doInput();
        }
        else {
            let obj = activeList.find(a => a.token === this.token);
            if (obj) {
                let oldEl = obj.el;
                let rowid = oldEl.getAttribute('data-row-id');
                let block = this.editor.findBlockNode(rowid);
                if (block) {
                    while (oldEl.firstElementChild) {
                        let el = oldEl.firstElementChild;
                        this.editor.rootEl.insertBefore(el, oldEl);
                    }
                    oldEl.remove();
                    this.editor.cursor.restore();
                    this.editor.actions.doInput();
                }
            }
        }
    }
}