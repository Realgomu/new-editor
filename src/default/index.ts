import * as Util from 'core/util';
import { Toolbar } from './toolbar';
import { Popover } from './popover';
import { Editor } from 'core/editor';

export class DefaultUI {
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
        let rootEl = Util.CreateRenderElement(this.editor.ownerDoc, {
            tag: 'div',
            attr: {
                class: 'ee-view'
            }
        }) as HTMLElement;
        rootEl.innerHTML = this.container.innerHTML;
        this.editor.initContentEditable(rootEl);
        rootEl.classList.add('ee-page');
        this.container.innerHTML = '';
        this.container.appendChild(rootEl);

        this.toolbar.init();
        this.popover.init();
    }

    getOffset(el: HTMLElement) {
        let offset = { left: 0, top: 0 };
        if (this.container.contains(el)) {
            let parent: Element;
            do {
                parent = el.offsetParent;
                offset.left += el.offsetLeft;
                offset.top += el.offsetTop;
            }
            while (parent !== this.container);
        }
        return offset;
    }
}