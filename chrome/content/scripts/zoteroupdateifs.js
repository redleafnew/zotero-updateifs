if (typeof Zotero === 'undefined') {
    Zotero = {};
}
Zotero.UpdateIFs = {};
// ScholarCitations 改为 UpdateIFs

// 更新分类
Zotero.UpdateIFs.updateSelectedColl = async function( ){
    var collection = ZoteroPane.getSelectedCollection();
    var items = collection.getChildItems();
    Zotero.UpdateIFs.updateSelectedItem(items); // 调用更新所选条目函数
    await collection.saveTx();
};

// 得到所选条目
Zotero.UpdateIFs.updateSelectedItems= async function( ){
    var zoteroPane = Zotero.getActiveZoteroPane();
    var items = zoteroPane.getSelectedItems();
    Zotero.UpdateIFs.updateSelectedItem(items); // 调用更新所选条目函数
};




// 更新条目
Zotero.UpdateIFs.updateSelectedItem = async function(items) {
    var numSuccess = 0;
    var numFail = 0;
    var lanUI = Zotero.Prefs.get('intl.locale.requested', true); // 得到当前Zotero界面语言
    var whiteSpace = ' ';
    if (lanUI == 'zh-CN') {whiteSpace = ''};

    for (let item of items) { 
        var url = Zotero.UpdateIFs.generateItemUrl(item);
        var resp = await Zotero.HTTP.request("GET", url);
        var parser = new DOMParser();
        var html = parser.parseFromString(
            resp.responseText,
            "text/html"
            );
        if (item.isRegularItem() && !item.isCollection()) {
            try {
                var old = item.getField('extra')
                var xPath = '//div[2]/div[1]/table[2]/tbody/tr[2]/td[';
                var jour = Zotero.Utilities.xpath(html, xPath + "2]")[0].innerText;  
                var issnSearched = Zotero.Utilities.xpath(html, xPath +"4]")[0].innerText;
                var if5Year = Zotero.Utilities.xpath(html, xPath +"6]")[0].innerText;  
                var ifCurrent = Zotero.Utilities.xpath(html, xPath +"8]")[0].innerText; 
                // return "Jour:" + jour + '5year:'+ 'if5Year' + 'current:' + ifCurrent;
                
                //var ifc = stringBundle.getString('ifc') + ' '; // 影响因子字符
                
                //var if5 = '\n' + stringBundle.getString('if5') + ' '; // 5年影响因子字符
               	var ifc ='影响因子: ';
	            var if5 ='\n5年影响因子: ';

                var dig = '(([1-9][\d]{0,6}|0)(\.[\d]{1,5})?)';
                //var patt = new RegExp(ifc);
                var patt1 = new RegExp(ifc + dig); // 影响因子正则
                var patt2 = new RegExp(if5 + dig); // 5年影响因子正则

                var ifsc = ifc + ifCurrent; // 新影响因子
                var ifs5 = if5 + if5Year; // 新5年影响因子
	            var ifs = ifsc + ifs5;
                var patt = /影响因子: (([1-9][\d]{0,6}|0)(\.[\d]{1,5})?)\n5年影响因子: (([1-9][\d]{0,6}|0)(\.[\d]{1,5})?)/;   // 匹配以前影响因子的正则

                if (old.length == 0 ) {   // 如果内容为空
                    item.setField('extra', ifs);
                // } else if (old.search(/^\d{5} *\n/) != -1) {
                //     item.setField(
                //             'extra',
                //             old.replace(/^\d{5} */, citations + ' '));
                 } else if (old.search(patt) != -1) { // 如果以前有影响因子则替换
                    item.setField(
                        'extra',
                        old.replace(patt, ifs));
                // } else if (old.search(patt2) != -1) { // 如果以前有5年影响因子则替换
                    // item.setField(
                   //          'extra',
                   //          old.replace(patt2, ifs5));
                } else {   // 以前没有，且内容不为空
 		            item.setField('extra', ifs + '\n' + old);
                   // item.setField('extra', ifsc + ifsc5 + '\n' + old);
                }
                item.save();
                numSuccess = numSuccess + 1;    
                } catch (error){
                    numFail = numFail + 1;
                }
                
        }
        
        
        
    }
    alert (numSuccess + whiteSpace + Zotero.UpdateIFs.ZUIFGetString('success'));
};

// 得到url
Zotero.UpdateIFs.generateItemUrl = function(item) {  // 通过ISSN检索期刊
    var baseUrl = 'http://sci.justscience.cn/?q='; // 唯问前半段
    var url = baseUrl +
        encodeURIComponent(item.getField('ISSN')) +  // 得到ISSN
        '&sci=1'; // 唯问后半段
        
   return url;
};

// Localization (borrowed from ZotFile sourcecode) 
// 提示语言本地化函数 Zotero.UpdateIFs.updateItem = async function(item) {
    
    Zotero.UpdateIFs.ZUIFGetString = function (name, params){
        var l10n = '';
        stringsBundle = Components.classes['@mozilla.org/intl/stringbundle;1']
            .getService(Components.interfaces.nsIStringBundleService)
            .createBundle('chrome://zoteroupdateifs/locale/zoteroupdateifs.properties');
        try { 
            if (params !== undefined){
                if (typeof params != 'object'){
                    params = [params];
                }
                l10n = tringsBundle.formatStringFromName(name, params, params.length);
            }
            else {
                l10n = stringsBundle.GetStringFromName(name);
            }
        }
        catch (e){
            throw ('Localized string not available for ' + name);
        }
        return l10n;
    };


// 是否显示菜单函数
Zotero.UpdateIFs.displayMenuitem = function () { // 如果条目不符合，则禁用菜单
    var pane = Services.wm.getMostRecentWindow("navigator:browser")
        .ZoteroPane;
    var collection = ZoteroPane.getSelectedCollection();
    var items = pane.getSelectedItems();
    if (collection) {var items_coll = collection.getChildItems();}
    //Zotero.debug("**Jasminum selected item length: " + items.length);
    var showMenuItem = items.some((item) => Zotero.UpdateIFs.checkItem(item));  // 检查条目
    var showMenuColl = (collection == false); // 非正常文件夹，如我的出版物、重复条目、未分类条目、回收站，为false，此时返回值为true，隐藏菜单
    if (collection) { // 如果是正常分类才显示
        var showMenuColl = items_coll.some((item) => Zotero.UpdateIFs.checkItem(item));} else {
            var showMenuColl = false;} // 检查分类条目是否适合
    //   

    pane.document.getElementById( // 分类/文件夹菜单是否可见 
        "zotero-collectionmenu-updateifs"
        ).hidden = !showMenuColl; // 分类条目上不符合则隐藏

    // pane.document.getElementById( // 分类/文件夹分隔条是否可见 id-delcoll-separator
    //     "id-delcoll-separator"
    //     ).hidden = showMenuColl; //  分隔条

    pane.document.getElementById( // 条目上是否禁用
            "zotero-itemmenu-updateifs"
            ).disabled = !showMenuItem; // 如不符合则禁用 
                
};

// 检查条目是否符合
Zotero.UpdateIFs.checkItem = function (item) { 
    if (item && !item.isNote()) {
        if (item.isRegularItem()) { // not an attachment already
            issn = item.getField('ISSN')
            
            if (issn.search('-') != -1 && // 如果isn中有'-'
                Zotero.ItemTypes.getName(item.itemTypeID) ==  'journalArticle' // 文献类型为期刊
            ) {return true}

        }  
        
    }      
};



    window.addEventListener(
        "load",
        function (e) {
            if (window.ZoteroPane) {
                var doc = window.ZoteroPane.document;
                // add event listener for menu items
                doc.getElementById("zotero-itemmenu").addEventListener(
                    "popupshowing",
                    Zotero.UpdateIFs.displayMenuitem,
                    false
                );
                // add event listener for menu collections
                doc.getElementById("zotero-collectionmenu").addEventListener(
                    "popupshowing",
                    Zotero.UpdateIFs.displayMenuitem,
                    false
                );
            }
        },
        false
    )

module.exports = Zotero.UpdateIFs;
