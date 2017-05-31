import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';
import { IToolbarButton } from 'core/buttons';

@Tool.EditorTool({
    token: 'link',
    level: EE.ToolLevel.Link
})
export default class Link extends Tool.InlineTool {
    selectors = ['a'];
    action = 'link';

    private _current: HTMLLinkElement;
    private _popTool: HTMLElement;
    private _popInput: HTMLElement;
    constructor(editor: Editor) {
        super(editor);

        //按钮
        this.editor.buttons.register({
            name: 'link',
            token: 'link',
            iconFA: 'fa-link',
            text: '链接',
            click: (ev: Event) => {
                this._openInput(ev.currentTarget as HTMLElement);
                ev.stopPropagation();
            }
        });
        this.editor.buttons.register({
            name: 'openLink',
            token: 'link',
            iconFA: 'fa-external-link',
            text: '打开链接',
            click: () => {
                this._openCurrent();
            }
        });
        this.editor.buttons.register({
            name: 'editLink',
            token: 'link',
            iconFA: 'fa-edit',
            text: '编辑链接',
            click: (ev: Event) => {
                if (this._current) {
                    this._openInput(this._current);
                }
            }
        });
        this.editor.buttons.register({
            name: 'deleteLink',
            token: 'link',
            iconFA: 'fa-chain-broken',
            text: '删除链接'
        });
    }

    init() {
        this.editor.events.on('$click', (ev: KeyboardEvent, target: HTMLLinkElement) => {
            this._current = target;
            if (Util.IsMetaCtrlKey(ev)) {
                this._openCurrent();
            }
            else {
                this._openTool(target);
            }
            ev.preventDefault();
            ev.stopPropagation();
        }, 'a');
        this.editor.events.on('$cursorChanged', () => {
            let target = this._findTarget();
            if (target) {
                this._openTool(target);
            }
            else {
                this.editor.defaultUI.popover.hide();
            }
        });
    }

    private _findTarget() {
        let cursor = this.editor.cursor.current();
        if (cursor.activeTokens.indexOf(this.token) >= 0 && !cursor.mutilple) {
            let block = this.editor.getRowElement(cursor.rows[0]);
            let nodes = block.querySelectorAll('a');
            for (let i = 0, l = nodes.length; i < l; i++) {
                let rn = nodes[i].$renderNode;
                if (rn && rn.start <= cursor.start && cursor.end <= rn.end) {
                    return nodes[i];
                }
            }
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

    private _openCurrent() {
        if (this._current) {
            window.open(this._current.href, this._current.target);
        }
    }

    private _openTool(target: HTMLElement) {
        if (!this._popTool) {
            this._popTool = Util.CreateRenderElement(this.editor.ownerDoc, {
                tag: 'div',
                attr: {
                    class: 'ee-pop-toolbar'
                }
            }) as HTMLElement;
            ['openLink', 'editLink', 'deleteLink'].forEach(item => {
                let button = this.editor.buttons.createButton(item);
                if (button) {
                    this._popTool.appendChild(button.element);
                }
            });
        }
        this.editor.defaultUI.popover.show(target, this._popTool);
    }

    private _openInput(target: HTMLElement) {
        if (!this._popInput) {
            this._popInput = Util.CreateRenderElement(this.editor.ownerDoc, {
                tag: 'div',
                attr: {
                    class: 'ee-link-input'
                }
            }) as HTMLElement;
            this._popInput.innerHTML = `<input type="text"><input type="text">`;
        }
        this.editor.defaultUI.popover.show(target, this._popInput);
    }
}