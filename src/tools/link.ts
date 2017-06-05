import * as Tool from 'core/tools';
import * as Util from 'core/util';
import { Editor } from 'core/editor';
import { IToolbarButton } from 'core/buttons';

interface ILink extends EE.IInline {
    href: string;
}

@Tool.EditorTool({
    token: 'link',
    level: EE.ToolLevel.Link
})
export default class Link extends Tool.InlineTool {
    selectors = ['a'];
    action = 'link';

    private _current: HTMLLinkElement;
    private _popTool: HTMLElement;
    private _popEdit: HTMLElement;
    constructor(editor: Editor) {
        super(editor);

        //按钮
        this.editor.buttons.register({
            name: 'link',
            token: 'link',
            iconFA: 'fa-link',
            text: '链接',
            click: (ev: Event, button: IToolbarButton) => {
                this.apply(button);
            }
        });
        this.editor.buttons.register({
            name: 'openLink',
            token: 'link',
            iconFA: 'fa-external-link',
            text: '打开链接',
            click: () => {
                this._linkCurrent();
            }
        });
        this.editor.buttons.register({
            name: 'editLink',
            token: 'link',
            iconFA: 'fa-edit',
            text: '编辑链接',
            click: (ev: Event) => {
                if (this._current) {
                    this._openEdit(this._current);
                }
            }
        });
        this.editor.buttons.register({
            name: 'deleteLink',
            token: 'link',
            iconFA: 'fa-chain-broken',
            text: '删除链接',
            click: () => {
                this._delele();
            }
        });
    }

    init() {
        this.editor.events.on('$click', (ev: KeyboardEvent, target: HTMLLinkElement) => {
            this._current = target;
            if (Util.IsMetaCtrlKey(ev)) {
                this._linkCurrent();
            }
            ev.preventDefault();
            ev.stopPropagation();
        }, 'a');
        this.editor.events.on('$cursorChanged', () => {
            this._current = this._findTarget();
            if (this._current) {
                this._openTool();
            }
            else {
                this.editor.defaultUI.popover.hide();
            }
        });
    }

    private _findTarget() {
        let cursor = this.editor.cursor.current();
        let activeTokens = this.editor.cursor.activeTokens();
        if (!cursor.mutilple && activeTokens.findIndex(a => a.token === this.token) >= 0) {
            return this.editor.findInlineElement(cursor.rows[0], 'a', cursor.start, cursor.end) as HTMLLinkElement;
        }
    }

    readData(el: Element, start: number) {
        let href = el.getAttribute('href');
        let data = this.$createData(start, start + el.textContent.length) as ILink;
        data.href = href;
        return data;
    }

    renderNode(data: ILink) {
        let node = this.$renderNode(data);
        node.attr = {
            href: data.href,
            target: '_blank'
        };
        return node;
    }

    apply(button: IToolbarButton) {
        if (!button.active) {

        }
    }

    private _linkCurrent() {
        if (this._current) {
            window.open(this._current.href, this._current.target);
        }
    }

    private _openTool(target: HTMLElement = this._current) {
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

    private _openEdit(target: HTMLElement = this._current) {
        if (!this._popEdit) {
            this._popEdit = Util.CreateRenderElement(this.editor.ownerDoc, {
                tag: 'div',
                attr: {
                    class: 'ee-link-input'
                }
            }) as HTMLElement;
            this._popEdit.innerHTML = `
<input name="href" type="text" placeholder="URL" value="${this._current.href}">
<input name="text" type="text" placeholder="文字" value="${this._current.textContent}">
<div class="ee-pop-footer"><a>取消</a><a class="submit">确定</a></div>
`;
        }
        this.editor.defaultUI.popover.show(target, this._popEdit);
        setTimeout(() => {
            let $href = this._popEdit.querySelector('input[name="href"]') as HTMLInputElement;
            $href.focus();
        }, 150);
    }

    private _delele() {
        if (this._current) {
            this._current.remove();
            this.editor.actions.doInput();
        }
    }
}