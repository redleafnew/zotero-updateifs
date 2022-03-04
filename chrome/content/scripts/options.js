// 下面函数不起作用

getAuthorName = function() {

    var auName = document.getElementById('id-updateifs-textb-author-name');
    Zotero.Prefs.set('extensions.updateifs.author-name', auName, true);
    

};