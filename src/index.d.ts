import EE = EnrichEditor;

declare var EREditor: EnrichEditor.IEditorStatic;

declare module EnrichEditor {
    interface IEditorStatic {
        new (el: Element, options: IEditorOptions): IEditor;
    }
    //options
    interface IEditorOptions {
        /** 编辑器的tool配置,默认是'all'*/
        tools?: 'all' | string[];
        defaultUI?: boolean;
        inline?: boolean;
        toolbars?: string[];
    }

    interface IEditor {
        options: EE.IEditorOptions;
        tools: ITools;
        selection: ISelection;
        actions: IActions;

        ownerDoc: Document;
        rootEl: Element;

        initContentEditable(el: HTMLElement): void;
    }

    /** edtitor tool type enum */
    const enum ToolType {
        None = 0,
        Br = 1,
        //inline
        Super = 20,
        Sub = 21,
        StrikeThrough = 30,
        Underline = 31,
        Italic = 40,
        Bold = 50,
        //inline block
        Link = 90,
        //block
        Paragraph = 100,
        Header,
        Pre = 110,
        //extend
        Quote = 200,
        OL,
        UL,
    }

    interface IPage {
        rows: IBlock[];
        extends?: any
    }

    interface IBlock {
        rowid: string;
        token: string;
        type: ToolType;
        text: string;
        inlines: InlineMap;
        styles?: any;
        data?: any;
    }

    type InlineMap = {
        [token: string]: IInline[]
    };

    interface IInline {
        type: ToolType;
        start: number;
        end: number;
        data?: any;
    }

    //element render
    interface IRenderNode {
        start: number;
        end: number;
        tag: string;
        attr?: IAttributeMap;
        children: IRenderNode[];
    }

    interface IAttributeMap {
        [name: string]: string
    }

    //key code
    const enum KeyCode {
        BACKSPACE = 8,
        TAB = 9,
        ENTER = 13,
        ESCAPE = 27,
        SPACE = 32,
        Left = 37,
        Up = 38,
        Right = 39,
        Down = 40,
        DELETE = 46,
        K = 75,
        M = 77,
        V = 86,
        Y = 89,
        Z = 90
    }

    //tool
    interface ITools {
        matchInlineTool(el: Element): IInlineTool;
        matchBlockTool(el: Element): IBlockTool;
        matchActionTool(name: string): IActionTool;
        matchToken(token: string): IEditorTool;
        getInlineTools(): IInlineTool[];
        getBlockTools(): IBlockTool[];
    }

    interface IToolConstructor extends Function {
        new (...args: any[]): IEditorTool;
        prototype: {
            token?: string;
            type?: EE.ToolType;
        }
    }

    interface IEditorTool {
        readonly type: EE.ToolType;
        readonly token: string;
        selectors: string[];
    }

    type EditorToolMap = {
        [token: string]: IEditorTool;
    }

    interface IActionTool extends IEditorTool {
        action: string;
        useCommand?: boolean;
        redo: Function;
        undo: Function;
    }

    interface IInlineTool extends IEditorTool {
        selectors: string[];
        getData(el: Element, start: number): EE.IInline;
        render(data: EE.IInline): IRenderNode;
    }

    interface IBlockTool extends IEditorTool {
        selectors: string[];
        getData(el: Element): EE.IBlock;
        render(data: EE.IBlock): IRenderNode;
    }

    //selection 
    interface ISelectionPosition {
        rowid: string;
        start: number;
        end: number;
        focusParent?: Element;
    }

    interface ISelection {
        lastPos: EE.ISelectionPosition;
        isCollapsed(): boolean;
        updateCurrent(block?: Element): ISelectionPosition;
        restoreCursor(block?: Element): void;
    }

    //action
    interface IActions {
        doCommandAction(name: string, pos?: EE.ISelectionPosition): void;
        redo(): void;
        undo(): void;
    }

    interface IActionStep extends ISelectionPosition {
        name: string;
        useCommand?: boolean;
    }

    //ui
    interface IDefaultUI {
        container: HTMLElement;
        toolbar: IToolbar;
    }

    interface IToolbar {

    }

    interface IPopover {

    }

    interface IButtonOption {
        name: string;
        action: string;
        iconFA?: string;
        isDropdown?: boolean;
        text?: string;
        click?: Function;
    }
}