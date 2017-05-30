import { Editor } from 'core/editor';
import * as UI from 'default/index';

export class Popover implements EE.IPopover {
    panel: HTMLElement;
    private _lastPop: HTMLElement;
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

    show(target: HTMLElement, pop: HTMLElement) {
        if (!this._show) {
            if (this._lastPop !== pop) {
                this.panel.innerHTML = '';
                this.panel.appendChild(pop);
                this._lastPop = pop;
            }
            this.panel.style.display = "block";
            this._setPosition(target);
            this._show = true;
        }
    }

    private _setPosition(target: HTMLElement) {
        let t_offset = this.ui.getOffset(target);
        let top = t_offset.top + target.offsetHeight + 2;
        let left = t_offset.left + target.offsetWidth / 2 - this.panel.offsetWidth / 2;
        this.panel.style.top = top + 'px';
        this.panel.style.left = left + 'px';
    }

    hide() {
        this.panel.style.display = "none";
        this._show = false;
    }
}