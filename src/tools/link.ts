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

    private _currentLink: HTMLLinkElement;
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
            },
            checkDisabled: (button) => {
                let disabled = this.checkDisabled();
                let cursor = this.editor.cursor.current();
                return cursor.mutilple || disabled;
            }
        });
        this.editor.buttons.register({
            name: 'openLink',
            token: 'link',
            iconFA: 'fa-external-link',
            text: '打开链接',
            click: () => {
                if (this._currentLink) {
                    this._openLink(this._currentLink);
                }
            }
        });
        this.editor.buttons.register({
            name: 'editLink',
            token: 'link',
            iconFA: 'fa-edit',
            text: '编辑链接',
            click: (ev: Event) => {
                if (this._currentLink) {
                    this._openEdit();
                }
            }
        });
        this.editor.buttons.register({
            name: 'deleteLink',
            token: 'link',
            iconFA: 'fa-chain-broken',
            text: '删除链接',
            click: () => {
                this._deleleLink();
                this.editor.actions.doAction();
            }
        });
    }

    init() {
        this.editor.events.on('$click', (ev: KeyboardEvent, target: HTMLLinkElement) => {
            if (Util.IsMetaCtrlKey(ev)) {
                this._openLink(target);
            }
            else {
                this._currentLink = target;
                // this._currentLink = this._findTarget();
                if (this._currentLink) {
                    this._openTool(this._currentLink);
                }
            }
            ev.preventDefault();
            ev.stopPropagation();
        }, 'a');
        // this.editor.events.on('$cursorChanged', () => {
        //     this._linkNode = this._findTarget();
        //     if (this._linkNode) {
        //         this._openTool();
        //     }
        //     else if (this._popTool) {
        //         this.editor.defaultUI.popover.hide(this._popTool);
        //     }
        // });
    }

    private _findTarget() {
        let cursor = this.editor.cursor.current();
        let activeTokens = this.editor.cursor.activeTokens();
        if (!cursor.mutilple && activeTokens.findIndex(a => a.token === this.token) >= 0) {
            return this.editor.findInlineNode(cursor.rows[0], 'a', cursor.start, cursor.end);
        }
    }

    readData(el: Element, start: number) {
        let inline: ILink = {
            start: start,
            end: start + el.textContent.length,
            href: el.getAttribute('href') || ''
        }
        return inline;
    }

    render(inline: ILink, replaceText: Text) {
        let el = this.editor.renderElement({
            tag: this.selectors[0],
            attr: {
                href: inline.href,
                target: '_blank',
            }
        });
        if (replaceText) {
            replaceText.parentNode.replaceChild(el, replaceText);
            el.appendChild(replaceText);
        }
        return el;
    }

    apply(button: IToolbarButton) {
        if (!button.active && !button.disabled) {
            let cursor = this.editor.cursor.current();
            let node = this.editor.findBlockNode(cursor.rows[0]);
            if (node && node.block) {
                if (!node.block.inlines[this.token]) {
                    node.block.inlines[this.token] = [];
                }
                let list = node.block.inlines[this.token];
                let link: ILink = {
                    start: cursor.start,
                    end: cursor.end,
                    href: ''
                };
                list.push(link);
                let newEl = this.editor.refreshElement(node.block);
                this.editor.cursor.restore();
                let targetNode = this._findTarget();
                this._currentLink = targetNode.el as HTMLLinkElement;
                this._openEdit(true);
                // this._currentLink = newEl;
                // this._currentLink = {
                //     rowid: node.block.rowid,
                //     start: link.start,
                //     end: link.end,
                //     el: newEl
                // };
                // this._openEdit(true);
            }
        }
        else if (button.active) {
            let node = this._findTarget();
            if (node) {
                this._currentLink = node.el as HTMLLinkElement;
                this._openEdit();
            }
        }
    }

    private _openLink(link: HTMLLinkElement) {
        if (link) {
            window.open(link.href, link.target);
        }
    }

    private _openTool(target: HTMLElement) {
        if (!this._popTool) {
            this._popTool = this.editor.renderElement({
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

    private _createEditPanel() {
        this._popEdit = this.editor.renderElement({
            tag: 'div',
            attr: {
                class: 'ee-link-input'
            }
        }) as HTMLElement;
        let link = this._currentLink;
        this._popEdit.innerHTML = `
<input name="href" type="text" placeholder="URL" value="${link.getAttribute('href') || ''}">
<input name="text" type="text" placeholder="文字" value="${link.textContent}">
<div class="ee-pop-footer"><a class="cancel">取消</a><a class="submit">确定</a></div>
`;
        let $href = this._popEdit.querySelector('input[name="href"]') as HTMLInputElement;
        let $text = this._popEdit.querySelector('input[name="text"]') as HTMLInputElement;
        let $submit = this._popEdit.querySelector('a.submit') as HTMLElement;
        let $cancel = this._popEdit.querySelector('a.cancel') as HTMLElement;
        //事件
        this.editor.events.attach('click', $submit, (ev: Event) => {
            let href = $href.value;
            let text = $text.value;
            this._editSubmit(href, text);
        });
        this.editor.events.attach('click', $cancel, (ev: Event) => {
            this._editCancel();
        });
    }

    private _editSubmit(href: string, text: string) {
        if (this._currentLink) {
            let link = this._currentLink;
            link.textContent = text;
            link.href = href;
            let fromCursor = this.editor.cursor.current();
            this.editor.cursor.selectElement(link);
            this.editor.actions.doAction(fromCursor);
            this._openTool(this._currentLink);
        }
    }

    private _editCancel() {
        if (this._isNew) {
            this._deleleLink();
        }
        else {
            this.editor.cursor.restore();
            this._openTool(this._currentLink);
        }
    }

    private _isNew: boolean = false;
    private _openEdit(isNew: boolean = false) {
        this._isNew = isNew;
        if (!this._popEdit) {
            this._createEditPanel();
        }
        this.editor.defaultUI.popover.show(this._currentLink, this._popEdit);
        setTimeout(() => {
            let $href = this._popEdit.querySelector('input[name="href"]') as HTMLInputElement;
            $href.focus();
        }, 150);
    }

    private _deleleLink() {
        if (this._currentLink) {
            let node = this._findTarget();
            let block = this.editor.findBlockNode(node.rowid).block;
            let list = block.inlines[this.token];
            if (list && list.length > 0) {
                let index = list.findIndex(l => l.start <= node.start && node.end <= l.end);
                list.splice(index, 1);
            };
            this.editor.refreshElement(block);
            this.editor.cursor.restore();
            this.editor.actions.doAction();
            this.editor.defaultUI.popover.hide(this._popTool);
        }
    }
}