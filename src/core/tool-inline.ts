import { IEditorTool, IActionTool } from './tool';

export abstract class InlineTool implements IEditorTool {
    readonly type: EE.ToolType;
    abstract tagNames: string[];

    constructor(type: EE.ToolType) {
        this.type = type;
    }

    getData(el: Element, start: number): EE.IInline {
        let inline: EE.IInline = {
            type: this.type,
            start: start,
            end: start + el.textContent.length
        }
        return inline;
    }
}