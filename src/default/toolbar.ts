import { Editor } from 'core/editor';
import { IToolbarButton } from 'core/buttons';
import { DefaultUI } from './index';

export class Toolbar {
    panel: HTMLElement;
    buttons: IToolbarButton[] = [];
    constructor(
        private editor: Editor,
        private ui: DefaultUI
    ) { }

    init() {
        this.panel = this.editor.ownerDoc.createElement('div');
        this.panel.classList.add('ee-toolbar');
        this.ui.box.insertBefore(this.panel, this.ui.box.childNodes[0]);

        this.editor.options.toolbars.forEach(item => {
            if (item === '|') {
                this.panel.appendChild(this.createDivider());
            }
            else {
                let button = this.editor.buttons.createButton(item);
                if (button) {
                    this.buttons.push(button);
                    this.panel.appendChild(button.element);
                }
            }
        });

        //events
        this.editor.events.attach('mousedown', this.panel, (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
        });
        this.editor.events.on('$cursorChanged', () => {
            let cursor = this.editor.cursor.current();
            let activeTokens = this.editor.cursor.activeTokens();
            this.buttons.forEach(b => {
                //判断active
                b.active = b.checkActive ? b.checkActive(b) : activeTokens.findIndex(a => a.token === b.token) >= 0;
                //判断disable
                b.disabled = b.checkDisabled ? b.checkDisabled(b) : false;
                b.element.classList.toggle('active', b.active);
                if (b.disabled) {
                    b.element.setAttribute('disabled','disabled');
                }
                else {
                    b.element.removeAttribute('disabled');
                }
            });
        });
    }

    createDivider() {
        let div = this.editor.ownerDoc.createElement('div');
        div.classList.add('divider');
        return div;
    }
}