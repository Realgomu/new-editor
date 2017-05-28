import { Editor } from 'core/editor';
import * as UI from 'default/index';

export class Popover implements EE.IPopover {
    panel: HTMLElement;
    private _show: boolean;
    constructor(
        private editor: Editor,
        private ui: UI.DefaultUI
    ) { }

    init() {
        this.panel = this.editor.ownerDoc.createElement('div');
        this.panel.classList.add('ee-popover');
        this.ui.container.appendChild(this.panel);

        this.editor.events.attach('click', this.editor.ownerDoc.body, (ev: MouseEvent) => {
            if (this._show) {
                this.hide();
            }
        });
        this.editor.events.attach('click', this.panel, (ev: MouseEvent) => {
            ev.stopPropagation();
        });
    }

    show(target?: Element) {
        if (!this._show) {
            let poptool = this.editor.ownerDoc.createElement('div');
            poptool.classList.add('ee-pop-toolbar');
            poptool.appendChild(this.ui.buttons.createButton('link'));
            poptool.appendChild(this.ui.buttons.createButton('bold'));
            this.panel.innerHTML = '';
            this.panel.appendChild(poptool);
            this.panel.style.display = "block";
            this._show = true;
        }
    }

    hide() {
        this.panel.style.display = "none";
        this._show = false;
    }
}