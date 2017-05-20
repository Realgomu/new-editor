declare module EE {
    const enum ToolType {
        None = 0,
        Br = 1,
        //inline
        Bold = 10,
        Italic,
        Underline,
        StrikeThrough,
        Super,
        Sub,
        //inline block
        Link = 99,
        //block
        Paragraph = 100,
        H1,
        H2,
        H3,
        H4,
        H5,
        H6,
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
        type: ToolType;
        text: string;
        inlines: InlineMap;
        styles?: any;
        options?: any;
    }

    type InlineMap = {
        [type: number]: IInline[]
    };

    interface IInline {
        type: ToolType,
        start: number;
        end: number;
        data?: any;
    }
}