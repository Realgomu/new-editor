import * as Util from 'core/util';
import { Editor } from 'core/editor';
import { toolFactory } from 'core/tools';

export interface IButtonConfig {
    name: string;
    token: string;
    iconFA?: string;
    isDropdown?: boolean;
    text?: string;
    click?: (ev: Event, button: IToolbarButton) => any;
    checkActive?: () => boolean;
    active?: boolean;
    checkDisable?: () => boolean;
    disable?: boolean;
    [key: string]: any;
}

export interface IToolbarButton extends IButtonConfig {
    tool: EE.IEditorTool;
    element: HTMLElement;
}

export class Buttons {
    private _configs: IButtonConfig[] = [];
    constructor(
        private editor: Editor
    ) {
    }

    register(config: IButtonConfig) {
        if (this._configs.findIndex(c => c.name === config.name) < 0) {
            this._configs.push(config);
        }
    }

    createButton(name: string): IToolbarButton {
        let config = this._configs.find(c => c.name === name);
        if (config) {
            let button = Util.Extend({}, config) as IToolbarButton;
            let _editor = this.editor;
            let el = _editor.ownerDoc.createElement('div');
            el.classList.add('ee-button');
            el.setAttribute('title', button.text);
            el.innerHTML = `<i class="fa ${button.iconFA}"></i>`;
            button.tool = _editor.tools.matchToken(button.token);
            if (!button.click) {
                button.click = function (ev: MouseEvent, _button: IToolbarButton) {
                    if (_button.tool && _button.element) {
                        let active = _button.element.classList.contains('active');
                        _button.tool.apply && _button.tool.apply(_button);
                    }
                }
            }
            this.editor.events.attach('mousedown', el, (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
            })
            this.editor.events.attach('click', el, (ev: MouseEvent) => {
                button.click(ev, button);
                ev.stopPropagation();
            });
            button.element = el;
            return button;
        }
    }
}