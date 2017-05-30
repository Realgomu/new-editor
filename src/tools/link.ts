import * as Tool from 'core/tools';
import * as Util from 'core/util';
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

    private _popTool: HTMLElement;
    private _current: HTMLLinkElement;
    constructor(editor: Editor) {
        super(editor);
    }

    init() {
        this.editor.events.on('$click', (ev, target: HTMLLinkElement) => {
            this._current = target;
            this._openPop(target);
            ev.preventDefault();
            ev.stopPropagation();
        }, 'a');

        if (this.editor.defaultUI.buttons) {
            this.editor.defaultUI.buttons.register({
                name: 'openLink',
                token: 'link',
                iconFA: 'fa-external-link',
                text: '打开链接',
                click: () => {
                    if (this._current) {
                        window.open(this._current.href, this._current.target);
                    }
                    console.log(this, 'open link');
                }
            });
            this.editor.defaultUI.buttons.register({
                name: 'editLink',
                token: 'link',
                iconFA: 'fa-edit',
                text: '编辑链接',
                click: () => {
                    console.log(this, 'edit link');
                }
            });
            this.editor.defaultUI.buttons.register({
                name: 'deleteLink',
                token: 'link',
                iconFA: 'fa-chain-broken',
                text: '删除链接',
                click: () => {
                    console.log(this, 'delete link');
                }
            });
        }
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

    private _openPop(target: HTMLElement) {
        if (!this._popTool) {
            this._popTool = Util.CreateRenderElement(this.editor.ownerDoc, {
                tag: 'div',
                attr: {
                    class: 'ee-pop-toolbar'
                }
            }) as HTMLElement;
            this._popTool.appendChild(this.editor.defaultUI.buttons.createButton('openLink').element);
            this._popTool.appendChild(this.editor.defaultUI.buttons.createButton('editLink').element);
            this._popTool.appendChild(this.editor.defaultUI.buttons.createButton('deleteLink').element);
        }
        this.editor.defaultUI.popover.show(target, this._popTool);
    }
}