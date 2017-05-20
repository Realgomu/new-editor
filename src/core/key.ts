
export const KeyCode = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    DELETE: 46,
    K: 75, // K keycode, and not k
    M: 77,
    V: 86,
    Y: 89,
    Z: 90
}

// http://stackoverflow.com/a/11752084/569101
const isMac = (window.navigator.platform.toUpperCase().indexOf('MAC') >= 0);

export function IsKey(event: KeyboardEvent, code: number | number[], metaCtrl: boolean = false) {
    let key = GetKeyCode(event);
    let same = false;
    if (code instanceof Array) {
        same = code.indexOf(key) >= 0;
    }
    else {
        same = code === key;
    }
    if (metaCtrl) {
        return IsMetaCtrlKey(event) && same;
    }
    else {
        return same;
    }
}

export function IsMetaCtrlKey(event: KeyboardEvent) {
    if ((isMac && event.metaKey) || (!isMac && event.ctrlKey)) {
        return true;
    }

    return false;
}

export function GetKeyCode(event: KeyboardEvent) {
    var keyCode = event.which;

    // getting the key code from event
    if (null === keyCode) {
        keyCode = event.charCode !== null ? event.charCode : event.keyCode;
    }

    return keyCode;
}