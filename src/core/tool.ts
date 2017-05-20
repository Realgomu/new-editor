import { InlineTool } from './tool-inline';
import { BlockTool } from './tool-block';

export { InlineTool } from './tool-inline';
export { BlockTool } from './tool-block';

const toolCache: {
    [token: string]: IEditorTool;
} = {};

/** 注册tool */
export function register(funcList: any[]) {
    funcList.forEach((ctrl: IToolFunction) => {
        try {
            let token = ctrl.prototype.__token__;
            let tool = new ctrl();
            if (!toolCache[token]) {
                toolCache[token] = tool;
            }
        }
        catch (ex) {
            throw new Error(`register ${ctrl} error!`);
        }
    });
}

/** 根据element的tag匹配相对应的inline tool */
export function MatchInlineTool(el: Element) {
    let tagName = el.tagName.toLowerCase();
    for (let key in toolCache) {
        let tool = toolCache[key];
        if (tool.type > 0 && tool.type < 100 && Match(tool, el)) {
            return tool as InlineTool;
        }
    }
    return undefined;
}

/** 根据element的tag匹配相对应的block tool */
export function MatchBlockTool(el: Element) {
    let tagName = el.tagName.toLowerCase();
    for (let key in toolCache) {
        let tool = toolCache[key];
        if (tool.type >= 100 && tool.type < 1000 && Match(tool, el)) {
            return tool as BlockTool;
        }
    }
    return undefined;
}

/** 根据element匹配对应的tool */
export function Match(tool: IEditorTool, el: Element) {
    return tool.tagNames.indexOf(el.tagName.toLowerCase()) >= 0;
}

/** 根据token匹配对应的command tool */
export function matchActionTool(name: string) {
    for (let key in toolCache) {
        let tool = toolCache[key] as IActionTool;
        if (tool.action && tool.action === name) {
            return tool;
        }
    }
}

interface IToolFunction extends Function {
    new (...args: any[]): IEditorTool;
    prototype: {
        [key: string]: any;
        '__token__'?: string;
    }
}

export function EditorTool(token: string) {
    return function (ctrl: IToolFunction) {
        ctrl.prototype['__token__'] = token;
    }
}

type EditorToolConstructor = {
    new (...args: any[]): IEditorTool;
}

export interface IEditorTool {
    readonly type: EE.ToolType;
    tagNames: string[];
}

export interface IActionTool extends IEditorTool {
    action: string;
    useCommand?: boolean;
    redo: Function;
    undo: Function;
}