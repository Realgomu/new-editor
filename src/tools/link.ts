import * as Tool from 'core/tools';
import { Editor } from 'core/editor';

@Tool.EditorTool({
    token: 'link',
    type: EE.ToolType.Link,
    buttonOptions: {
        name: 'link',
        iconFA: 'fa-link',
        text: '链接'
    }
})
export default class Link extends Tool.InlineTool {
    selectors = ['a'];
    action = 'link';

    constructor(editor: Editor) {
        super(editor);
    }

    init() {
        this.editor.events.on('$click', (Editor, ev) => {
            console.log('click a');
            this.editor.defaultUI.popover.show();
            ev.preventDefault();
            ev.stopPropagation();
        }, 'a');
    }

    getDataFromEl(el: Element, start: number) {
        let href = el.getAttribute('href');
        return this.createData(start, start + el.textContent.length, href || undefined);
    }

    render(data: EE.IInline) {
        let node = this.$render(data);
        node.attr = {
            href: data.data,
            target: '_blank'
        };
        return node;
    }

    apply(): any {
    }
}