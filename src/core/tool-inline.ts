export abstract class InlineTool implements EE.IInlineTool {
    readonly type: EE.ToolType;
    readonly token: string;
    abstract tagNames: string[];

    constructor(protected editor: EE.IEditor) {
    }

    getData(el: Element, start: number): EE.IInline {
        let inline: EE.IInline = {
            type: this.type,
            start: start,
            end: start + el.textContent.length
        }
        return inline;
    }

    redo() {
        
    }
}