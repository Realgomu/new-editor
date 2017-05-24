import { Toolbar } from './toolbar';
import { Popover } from './popover';
import { Editor } from 'core/editor';

export class DefaultUI implements EE.IDefaultUI {
    container: HTMLElement;
    toolbar: Toolbar;
    popover: Popover;
    constructor(private editor: Editor) {
        this.toolbar = new Toolbar(editor, this);
        this.popover = new Popover(editor, this);
    }

    init(el: HTMLElement) {
        this.container = el;
        this.container.classList.add('ee-box');
        let div = this.editor.ownerDoc.createElement('div');
        div.innerHTML = this.container.innerHTML;
        this.editor.initContentEditable(div);
        this.container.innerHTML = '';
        this.container.appendChild(div);

        this.toolbar.init();
        this.popover.init();
    }
}