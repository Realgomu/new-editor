/// <reference path="index.d.ts" />

import { Editor } from 'core/editor';

import './styles/index.less';

$(() => {
    let el = document.querySelector('#Editor');

    let editor = new Editor(el as HTMLElement);
})
