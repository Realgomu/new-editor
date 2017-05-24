import { Editor } from 'core/editor';

export class Popover implements EE.IPopover {
    panel: HTMLElement;
    constructor(
        private editor: Editor,
        private ui: EE.IDefaultUI
    ) { }

    init() {
        this.panel = this.editor.ownerDoc.createElement('div');
        this.panel.classList.add('ee-popover');
        this.ui.container.appendChild(this.panel);
    }
}