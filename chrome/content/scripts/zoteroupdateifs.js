if (typeof Zotero === 'undefined') {
    Zotero = {};
}
Zotero.UpdateIFs = {};
// ScholarCitations 改为 UpdateIFs

Zotero.UpdateIFs.init = function() {
    Zotero.UpdateIFs.resetState();

    stringBundle = document.getElementById('zoteroUpdateIFs-bundle');
    Zotero.UpdateIFs.captchaString = 'Please enter the correct ISSN of the journal or the journal is not SCI idexed.';
    Zotero.UpdateIFs.citedPrefixString = ''
        if (stringBundle != null) {
            Zotero.UpdateIFs.captchaString = stringBundle.getString('captchaString');
        }

    // Register the callback in Zotero as an item observer
    var notifierID = Zotero.Notifier.registerObserver(
            Zotero.UpdateIFs.notifierCallback, ['item']);

    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener('unload', function(e) {
        Zotero.Notifier.unregisterObserver(notifierID);
    }, false);
};

Zotero.UpdateIFs.notifierCallback = {
    notify: function(event, type, ids, extraData) {
        if (event == 'add') {
            Zotero.UpdateIFs.updateItems(Zotero.Items.get(ids));
        }
    }
};

Zotero.UpdateIFs.resetState = function() {
    Zotero.UpdateIFs.current = -1;
    Zotero.UpdateIFs.toUpdate = 0;
    Zotero.UpdateIFs.itemsToUpdate = null;
    Zotero.UpdateIFs.numberOfUpdatedItems = 0;
};

Zotero.UpdateIFs.updateSelectedEntity = function(libraryId) {
    if (!ZoteroPane.canEdit()) {
        ZoteroPane.displayCannotEditLibraryMessage();
        return;
    }

    var collection = ZoteroPane.getSelectedCollection();
    var group = ZoteroPane.getSelectedGroup();

    if (collection) {
        var items = [];
        collection.getChildItems(false).forEach(function (item) {
            items.push(Zotero.Items.get(item.id));
        });
        Zotero.UpdateIFs.updateItems(items);
    } else if (group) {
        if (!group.editable) {
            alert("This group is not editable!");
            return;
        }
        var items = [];
        group.getCollections().forEach(function(collection) {
            collection.getChildItems(false).forEach(function(item) {
                items.push(Zotero.Items.get(item.id));
            })
        });
        Zotero.UpdateIFs.updateItems(items);
    } else {
        Zotero.UpdateIFs.updateAll();
    }
};

Zotero.UpdateIFs.updateSelectedItems = function() {
    Zotero.UpdateIFs.updateItems(ZoteroPane.getSelectedItems());
};

Zotero.UpdateIFs.updateAll = function() {
    var items = [];
    Zotero.Items.getAll().forEach(function (item) {
        if (item.isRegularItem() && !item.isCollection()) {
            var libraryId = item.getField('libraryID');
            if (libraryId == null ||
                    libraryId == '' ||
                    Zotero.Libraries.isEditable(libraryId)) {
                items.push(item);
            }
        }
    });
    Zotero.UpdateIFs.updateItems(items);
};

Zotero.UpdateIFs.updateItems = function(items) {
    if (items.length == 0 ||
            Zotero.UpdateIFs.numberOfUpdatedItems < Zotero.UpdateIFs.toUpdate) {
        return;
    }

    Zotero.UpdateIFs.resetState();
    Zotero.UpdateIFs.toUpdate = items.length;
    Zotero.UpdateIFs.itemsToUpdate = items;
    Zotero.UpdateIFs.updateNextItem();
};

Zotero.UpdateIFs.updateNextItem = function() {
    Zotero.UpdateIFs.numberOfUpdatedItems++;

    if (Zotero.UpdateIFs.current == Zotero.UpdateIFs.toUpdate - 1) {
        Zotero.UpdateIFs.resetState();
        return;
    }

    Zotero.UpdateIFs.current++;
    Zotero.UpdateIFs.updateItem(
            Zotero.UpdateIFs.itemsToUpdate[Zotero.UpdateIFs.current]);
};

Zotero.UpdateIFs.generateItemUrl = function(item) {  // 通过ISSN检索期刊
    var baseUrl = 'http://sci.justscience.cn/?q='; // 唯问前半段
    var url = baseUrl +
        encodeURIComponent(item.getField('ISSN')) +  // 得到ISSN
        '&sci=1'; // 唯问后半段
        
   return url;
};

Zotero.UpdateIFs.updateItem = async function(item) {
        stringBundle = document.getElementById('zoteroUpdateIFs-bundle');
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
                    
                } catch (error){
                    //continue;
                }

        }
        Zotero.UpdateIFs.updateNextItem();

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


if (typeof window !== 'undefined') {
    window.addEventListener('load', function(e) {
        Zotero.UpdateIFs.init();
    }, false);
}

module.exports = Zotero.UpdateIFs;
