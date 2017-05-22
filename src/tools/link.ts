import * as Tool from 'core/tool';

@Tool.EditorTool({
    token: 'link',
    type: EE.ToolType.Link
})
export default class Link extends Tool.InlineTool implements EE.IActionTool {
    selectors = ['a'];
    action = 'link';

    constructor(editor: EE.IEditor) {
        super(editor);
    }

    redo() {
    }

    undo() {

    }

    getData(el: Element, start: number) {
        let inline = this.$getData(el, start);
        let href = el.getAttribute('href');
        inline.data = href || undefined;
        return inline;
    }

    render(data: EE.IInline) {
        let node = this.$render(data);
        node.attr = {
            href: data.data,
            target: '_blank'
        };
        return node;
    }
}