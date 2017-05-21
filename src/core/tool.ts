import { Editor } from './editor';

export { InlineTool } from './tool-inline';
export { BlockTool } from './tool-block';

const _toolFactory: {
    [token: string]: EE.IToolConstructor;
} = {};

export function EditorTool(options: {
    token: string;
    type: EE.ToolType;
}) {
    return function (ctrl: EE.IToolConstructor) {
        ctrl.prototype.token = options.token;
        ctrl.prototype.type = options.type;
        if (_toolFactory[options.token]) {
            throw new Error(`repeated editor tool [${options.token}]!`);
        }
        else {
            _toolFactory[options.token] = ctrl;
        }
    }
}

export class Tools implements EE.ITools {
    private _toolCache: EE.EditorToolMap = {};

    constructor(private editor: EE.IEditor) {
        this._initOptions(editor.options.tools);
    }

    private _initOptions(token: 'all' | string[]) {
        if (typeof token === 'string' && token === 'all') {
            for (let key in _toolFactory) {
                this._toolCache[key] = new _toolFactory[key](this.editor);
            }
        }
        else {
            token.forEach(key => {
                let ctrl = _toolFactory[key];
                if (ctrl) {
                    try {
                        if (!this._toolCache[key]) {
                            this._toolCache[key] = new ctrl(this.editor);
                        }
                    }
                    catch (ex) {
                        console.warn(`init editor tool [${ctrl.prototype.token}] error !`);
                    }
                }
            });
        }
    }

    private _match(func: (tool: EE.IEditorTool) => boolean) {
        for (let key in this._toolCache) {
            let tool = this._toolCache[key];
            if (func && func(tool)) {
                return tool;
            }
        }
    }

    /** 根据element的tag匹配相对应的inline tool */
    matchInlineTool(el: Element) {
        return this._match((tool) => {
            return tool.type >= 10 && tool.type < 100 && ElementTagCheck(tool, el);
        }) as EE.IInlineTool;
    }

    /** 根据element的tag匹配相对应的block tool */
    matchBlockTool(el: Element) {
        return this._match((tool) => {
            return tool.type >= 100 && tool.type < 1000 && ElementTagCheck(tool, el);
        }) as EE.IBlockTool;
    }

    /** 根据token匹配对应的command tool */
    matchActionTool(name: string) {
        return this._match((tool: EE.IActionTool) => {
            return tool.action && tool.action === name;
        }) as EE.IActionTool;
    }
}

export function ElementTagCheck(tool: EE.IEditorTool, el: Element) {
    return tool.tagNames.indexOf(el.tagName.toLowerCase()) >= 0;
}