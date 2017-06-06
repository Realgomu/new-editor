import * as Util from 'core/util';
import { Toolbar } from './toolbar';
import { Popover } from './popover';
import { Editor } from 'core/editor';

export class DefaultUI {
    box: HTMLElement;
    page: HTMLElement;
    toolbar: Toolbar;
    popover: Popover;
    constructor(private editor: Editor) {
        this.toolbar = new Toolbar(editor, this);
        this.popover = new Popover(editor, this);
    }

    init(el: HTMLElement) {
        this.box = el;
        this.box.classList.add('ee-box');
        let wrapper = this.editor.renderElement({
            tag: 'div',
            attr: {
                class: 'ee-wrapper'
            }
        });
        this.page = this.editor.renderElement({
            tag: 'div',
            attr: {
                class: 'ee-page'
            }
        }) as HTMLElement;
        let rootEl = this.editor.renderElement({
            tag: 'div',
            attr: {
                class: 'ee-view'
            }
        }) as HTMLElement;
        rootEl.innerHTML = this.box.innerHTML;
        this.editor.initContentEditable(rootEl);
        // rootEl.classList.add('ee-page');
        this.box.innerHTML = '';
        this.box.appendChild(wrapper);
        wrapper.appendChild(this.page);
        this.page.appendChild(rootEl);

        this.toolbar.init();
        this.popover.init();
    }

    getOffset(target: HTMLElement, parent: HTMLElement = this.page) {
        let offset = { left: 0, top: 0 };
        if (this.box.contains(target)) {
            do {
                offset.left += target.offsetLeft;
                offset.top += target.offsetTop;
                target = target.offsetParent as HTMLElement;
            }
            while (target !== parent);
        }
        return offset;
    }
}