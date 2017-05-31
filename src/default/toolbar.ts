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
            let activeTokens = this.editor.cursor.activeTokens();
            this.buttons.forEach(b => {
                let active = false;
                if (b.active) {
                    active = b.active();
                }
                else {
                    active = activeTokens.indexOf(b.token) >= 0;
                }
                b.element.classList.toggle('active', active);
            });
        });
    }

    createDivider() {
        let div = this.editor.ownerDoc.createElement('div');
        div.classList.add('divider');
        return div;
    }
}