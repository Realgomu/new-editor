import { Editor } from 'core/editor';
import { DefaultUI } from './index';

export class Toolbar {
    panel: HTMLElement;
    constructor(
        private editor: Editor,
        private ui: DefaultUI
    ) { }

    init() {
        this.panel = this.editor.ownerDoc.createElement('div');
        this.panel.classList.add('ee-toolbar');
        this.ui.container.insertBefore(this.panel, this.editor.rootEl);

        this.editor.options.toolbars.forEach(item => {
            if (item === '|') {
                this.panel.appendChild(this.createDivider());
            }
            else {
                let button = this.ui.buttons.createButton(item);
                if (button) {
                    this.panel.appendChild(button);
                }
            }
        });
    }

    createDivider() {
        let div = this.editor.ownerDoc.createElement('div');
        div.classList.add('divider');
        return div;
    }
}