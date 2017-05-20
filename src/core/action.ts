import * as Selection from './selection';

export interface IAction extends Selection.ISelectionPosition {
    name: string;
    useCommand?: boolean;
}

const queue: IAction[] = [];
let point: number = -1;
const max = 20;

export function AddAction(action: IAction) {
    queue.push(action);
}

export function DoCommandAction(name: string, pos?: Selection.ISelectionPosition) {
    if (!pos) pos = Selection.Current()
    let action: IAction = {
        name: name,
        useCommand: true,
        rowid: pos.rowid,
        start: pos.start,
        end: pos.end
    };
    document.execCommand(name);
    queue.push(action);
    point++;
}

function push(action: IAction) {
    if (queue.length >= max) {
        queue.shift();
        point--;
    }
    
}

export function redo() {
    if (queue.length <= point + 1) {
        return;
    }
    point++;
    let next = queue[point];
    if (next && next.useCommand) {
        document.execCommand('redo');
    }
}

export function undo() {
    if (point < 0) {
        return;
    }
    let last = queue[point];
    point--;
    if (last && last.useCommand) {
        document.execCommand('undo');
    }
}