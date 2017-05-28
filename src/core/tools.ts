import { Editor } from './editor';
import * as Util from './util';
import { InlineTool } from './tool-inline';
import { BlockTool } from './tool-block';

export { InlineTool } from './tool-inline';
export { BlockTool } from './tool-block';

export const toolFactory: {
    [token: string]: {
        ctrl: EE.IToolConstructor;
        options: IEditorToolOptions;
    }
} = {};

export interface IEditorToolOptions {
    token: string;
    type: EE.ToolType;
    buttonOptions?: {
        name: string;
        iconFA?: string;
        text?: string;
    }
}

export function EditorTool(options: IEditorToolOptions) {
    return function (ctrl: EE.IToolConstructor) {
        ctrl.prototype.token = options.token;
        ctrl.prototype.type = options.type;
        if (toolFactory[options.token]) {
            throw new Error(`repeated editor tool [${options.token}]!`);
        }
        else {
            toolFactory[options.token] = {
                ctrl: ctrl,
                options: options
            };
        }
    }
}

export class Tools {
    private _toolCache: EE.IEditorTool[] = [];
    rowTool: EE.IBlockTool;
    constructor(private editor: Editor) {
        this._initOptions(editor.options.tools);
        this.rowTool = this.matchToken('paragraph') as EE.IBlockTool;
    }

    private _initOptions(token: 'all' | string[]) {
        if (typeof token === 'string' && token === 'all') {
            for (let key in toolFactory) {
                this._toolCache.push(new toolFactory[key].ctrl(this.editor));
            }
        }
        else {
            token.forEach(key => {
                let ctrl = toolFactory[key].ctrl;
                if (ctrl) {
                    try {
                        if (!this._toolCache[key]) {
                            this._toolCache.push(new ctrl(this.editor));
                        }
                    }
                    catch (ex) {
                        console.warn(`init editor tool [${ctrl.prototype.token}] error !`);
                    }
                }
            });
        }
        this._toolCache.sort((a, b) => b.type - a.type);
    }

    private _match(func: (tool: EE.IEditorTool) => boolean) {
        for (let item of this._toolCache) {
            if (func && func(item)) {
                return item;
            }
        }
    }

    /** 根据element的tag匹配相对应的inline tool */
    matchInlineTool(el: Element) {
        return this._match((tool) => {
            return tool.type < 100 && ElementTagCheck(tool, el);
        }) as InlineTool;
    }

    /** 根据element的tag匹配相对应的block tool */
    matchBlockTool(el: Element) {
        return this._match((tool) => {
            return tool.type >= 100 && tool.type < 1000 && ElementTagCheck(tool, el);
        }) as BlockTool;
    }

    /** 根据action name 匹配对应的 tool */
    matchActionTool(name: string) {
        return this._match((tool: EE.IActionTool) => {
            return tool.action && tool.action === name;
        }) as EE.IActionTool;
    }

    matchToken(token: string) {
        return this._match((tool) => {
            return tool.token === token;
        });
    }

    getInlineTools() {
        return this._toolCache.filter(t => t.type < 100) as InlineTool[];
    }

    getBlockTools() {
        return this._toolCache.filter(t => t.type >= 100) as BlockTool[];
    }

    getActiveTokens(el: Element) {
        let list = [];
        // Util.FindParend(el, (parent => {
        //     let tool = this._match(tool => {
        //         return ElementTagCheck(tool, parent);
        //     });
        //     list.push(tool.token);
        //     return parent.hasAttribute('data-row-id');
        // }));
        return list;
    }
}

export function ElementTagCheck(tool: EE.IEditorTool, el: Element) {
    return tool.selectors.indexOf(el.tagName.toLowerCase()) >= 0;
}