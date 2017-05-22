export abstract class InlineTool implements EE.IInlineTool {
    readonly type: EE.ToolType;
    readonly token: string;
    abstract selectors: string[];

    constructor(protected editor: EE.IEditor) {
    }

    protected $getData(el: Element, start: number): EE.IInline {
        let inline: EE.IInline = {
            type: this.type,
            start: start,
            end: start + el.textContent.length
        }
        return inline;
    }

    getData(el: Element, start: number): EE.IInline {
        return this.$getData(el, start);
    }

    redo() {

    }

    protected $render(data: EE.IInline) {
        let node: EE.IRenderNode = {
            tag: this.selectors[0],
            start: data.start,
            end: data.end,
            children: []
        };
        return node;
    }

    render(data: EE.IInline) {
        return this.$render(data);
    }
}