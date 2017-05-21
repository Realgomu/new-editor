/// <reference path="index.d.ts" />

import { Editor } from 'core/editor';

import './styles/index.less';

$(() => {
    let el = document.querySelector('#Editor');

    let editor = new Editor(el as HTMLElement);
    $('#GET').click(() => {
        let result = editor.getData();
        console.log(result);
        console.log(JSON.stringify(result));
    });
    $('#SET').click(() => {
        let str = '['
        str += '{"rowid":"123456","token":"paragraph","type":100,"text":"测试所发生的粉红色方式萨卡发放啊发放阿斯大大","inlines":{"bold":[{"type":50,"start":4,"end":17}],"underline":[{"type":31,"start":9,"end":13}],"br":[{"type":1,"start":20,"end":20}]}}'
        str += ',{"rowid":"214144","token":"paragraph","type":100,"text":"测试所发生的粉红色方式萨卡发放啊发放阿斯大大","inlines":{"link":[{"type":90,"start":2,"end":17}],"bold":[{"type":50,"start":4,"end":17}],"italic":[{"type":40,"start":9,"end":13}]}}'
        str += ',{"rowid":"adasda","token":"header","type":101,"text":"测试一下标题","inlines":{"italic":[{"type":40,"start":4,"end":5}]},"data":2}'
        str += ']';
        let data = JSON.parse(str);
        editor.loadData(data);
    })
    $('.action').click(function () {
        let $btn = $(this);
        let action = $btn.attr('role');
        let option = $btn.attr('role-option');
        editor.excuCommand(action, option);
    });
})
