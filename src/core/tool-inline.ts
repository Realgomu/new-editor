export abstract class InlineTool implements EE.IInlineTool {
    readonly type: EE.ToolType;
    readonly token: string;
    abstract selectors: string[];

    constructor(protected editor: EE.IEditor) {
    }

    getData(el: Element, start: number): EE.IInline {
        length = el.textContent.length > 0 ? el.textContent.length - 1 : 0;
        let inline: EE.IInline = {
            type: this.type,
            start: start,
            end: start + length
        }
        return inline;
    }

    redo() {

    }

    render(data: EE.IInline) {
        let node: EE.IRenderNode = {
            tag: this.selectors[0],
            start: data.start,
            end: data.end,
            children: []
        };
        return node;
    }
}