if (typeof Zotero === 'undefined') {
    Zotero = {};
}
Zotero.UpdateIFs = {};
// ScholarCitations 改为 UpdateIFs

// Preference managers

Zotero.UpdateIFs.getPref = function (pref) {
    return Zotero.Prefs.get('extensions.updateifs.' + pref, true);
};

// Zotero.UpdateIFs.setPref = function(pref, value) {
//     return Zotero.Prefs.set('extensions.updateifs.' + pref, value, true);
// };




// *********** Change the checkbox, topref
// Zotero.UpdateIFs.changePref = function changePref(option) {
//     Zotero.UpdateIFs.setPref("autoretrieve", option);
// };

// /**
//  * Open UpdateIFs preference window
//  */
Zotero.UpdateIFs.test = function () {
    //var bd = document.getElementById('id-menu-bold-star-ckb').checked
    //return bd;
    alertInfo = 'bd';
    Zotero.UpdateIFs.showPopUP(alertInfo, 'failed');
};

Zotero.UpdateIFs.showToolboxMenu = function () {

    // 读取设置
    var boldStar = Zotero.Prefs.get('pref-updateifs-menu-bold-star', true);
    var boldStar = Zotero.Prefs.get('pref-updateifs-menu-bold-star', true);
    var cleanBold = Zotero.Prefs.get('pref-updateifs-menu-clean-bold', true);
    var cleanStar = Zotero.Prefs.get('pref-updateifs-menu-clean-star', true);
    var cleanBoldAndStar = Zotero.Prefs.get('pref-updateifs-menu-clean-bold-star', true);
    var auTitleCase = Zotero.Prefs.get('pref-updateifs-menu-au-title-case', true);
    var swapAu = Zotero.Prefs.get('pref-updateifs-menu-swap-au', true);
    var titleSenCase = Zotero.Prefs.get('pref-updateifs-menu-title-sen-case', true);
    var titleFindReplace = Zotero.Prefs.get('pref-updateifs-menu-find-replace-item-title', true); // 题目查找替换
    var pubTitle = Zotero.Prefs.get('pref-updateifs-menu-pub-title', true);
    var pubTitleCase = Zotero.Prefs.get('pref-updateifs-menu-pub-title-case', true);
    var profileDir = Zotero.Prefs.get('pref-updateifs-menu-profile-dir', true);
    var dataDir = Zotero.Prefs.get('pref-updateifs-data-dir-star', true);
    var sep1 = Zotero.Prefs.get('pref-updateifs-sep1', true);
    var sep2 = Zotero.Prefs.get('pref-updateifs-sep2', true);

    // 设置菜单隐藏
    document.getElementById('menu_Tools-updateifs-menu-popup-bold-star').hidden = !boldStar;
    document.getElementById('menu_Tools-updateifs-menu-popup-remove-bold').hidden = !cleanBold;
    document.getElementById('menu_Tools-updateifs-menu-popup-remove-star').hidden = !cleanStar;
    document.getElementById('menu_Tools-updateifs-menu-remove-bold-and-star').hidden = !cleanBoldAndStar;
    document.getElementById('menu_Tools-updateifs-chang-author-case').hidden = !auTitleCase;
    document.getElementById('menu_Tools-updateifs-swap-author').hidden = !swapAu;
    document.getElementById('menu_Tools-updateifs-menu-chang-title-case').hidden = !titleSenCase;
    document.getElementById('menu_Tools-updateifs-menu-item-title-find-replace').hidden = !titleFindReplace; // 题目查找替换
    document.getElementById('menu_Tools-updateifs-chang-pub-title').hidden = !pubTitle;
    document.getElementById('id-menu-chang-pub-title-case').hidden = !pubTitleCase;
    document.getElementById('menu_Tools-updateifs-menu-show-profile-dir').hidden = !profileDir;
    document.getElementById('menu_Tools-updateifs-menu-show-data-dir').hidden = !dataDir;
    document.getElementById('id-updateifs-separator-1').hidden = !sep1;
    document.getElementById('id-updateifs-separator-2').hidden = !sep2;


};


// 打开设置对话框
Zotero.UpdateIFs.openPreferenceWindow = function (paneID, action) {
    var io = { pane: paneID, action: action };
    window.openDialog('chrome://zoteroupdateifs/content/options.xul',
        'updateifs-pref',
        'chrome,titlebar,toolbar,centerscreen' + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal', io
    );
};

// 打开更改期刊名称对话框
Zotero.UpdateIFs.openUtilsWindow = function (paneID, action) {
    var io = { pane: paneID, action: action };
    window.openDialog('chrome://zoteroupdateifs/content/change-publication-title.xul',
        'updateifs-change-pub-title',
        'chrome,titlebar,toolbar,centerscreen' + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal', io
    );
};

// 打开作者加粗加星对话框
Zotero.UpdateIFs.openAuthorProcess = function (paneID, action) {
    var io = { pane: paneID, action: action };
    window.openDialog('chrome://zoteroupdateifs/content/author-bold-star.xul',
        'updateifs-change-pub-title',
        'chrome,titlebar,toolbar,centerscreen', io
    );
};

// Controls for Tools menu end


// Startup - initialize plugin初始化

Zotero.UpdateIFs.init = function () {

    if (!Zotero.UpdateIFs) {
        var fileLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
            .getService(Components.interfaces.mozIJSSubScriptLoader);
        var scripts = ['zoteroupdateifs', 'options.js'];
        scripts.forEach(s => fileLoader.loadSubScript('chrome://zoteroupdateifs/content/scripts/' + s + '.js', {}, "UTF-8"));
        Zotero.UpdateIFs.showToolboxMenu();
    }

    // Register the callback in Zotero as an item observer
    var notifierID = Zotero.Notifier.registerObserver(
        Zotero.UpdateIFs.notifierCallback, ['item']);

    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener('unload', function (e) {
        Zotero.Notifier.unregisterObserver(notifierID);
    }, false);



};

Zotero.UpdateIFs.cleanExtra = function () {
    var items = Zotero.UpdateIFs.getSelectedItems();
    if (items == '') { // 如果没有选中条目
        var alertInfo = Zotero.UpdateIFs.ZUIFGetString("clean.failed");
        Zotero.UpdateIFs.showPopUP(alertInfo, 'failed');
    } else {
        var requireInfo = items.length > 1 ? "clean.extra.mul" : "clean.extra.sig";
        var truthBeTold = window.confirm(Zotero.UpdateIFs.ZUIFGetString(requireInfo));
        if (truthBeTold) {
            for (let item of items) {

                if (item.isRegularItem() && !item.isCollection()) {
                    try {
                        item.setField('extra', '');
                        item.save();

                    } catch (error) {
                        // numFail = numFail + 1;
                    }
                }
            }
            var alertInfo = Zotero.UpdateIFs.ZUIFGetString("clean.finished");
            Zotero.UpdateIFs.showPopUP(alertInfo, 'finished');
        }
    }
};

// 清除摘要、系列、系列文本、归档、归档位置、索引号、版权 20220722
Zotero.UpdateIFs.cleanIfsFields = function () {
    var items = Zotero.UpdateIFs.getSelectedItems();
    if (items == '') { // 如果没有选中条目
        var alertInfo = Zotero.UpdateIFs.ZUIFGetString("clean.failed");
        Zotero.UpdateIFs.showPopUP(alertInfo, 'failed');
    } else {
        var requireInfo = items.length > 1 ? "clean.ifs.fields.sig" : "clean.ifs.fields.mul";
        var truthBeTold = window.confirm(Zotero.UpdateIFs.ZUIFGetString(requireInfo));
        if (truthBeTold) {
            for (let item of items) {

                if (item.isRegularItem() && !item.isCollection()) {
                    try {
                        item.setField('abstractNote', '');  //摘要
                        item.setField('archive', ''); //归档
                        item.setField('archiveLocation', '');  //归档位置
                        item.setField('callNumber', '');  //索引号
                        item.setField('rights', ''); //版权
                        item.setField('series', '');  //系列
                        item.setField('seriesText', '');  //系列文本
                        item.setField('seriesTitle', '');  //系列标题
                        item.setField('libraryCatalog', '');  //图书馆目录
                        item.setField('extra', ''); //其它
                        item.saveTx();

                    } catch (error) {
                        // numFail = numFail + 1;
                    }
                }
            }
            var alertInfo = Zotero.UpdateIFs.ZUIFGetString("clean.ifs.finished");
            Zotero.UpdateIFs.showPopUP(alertInfo, 'finished');
        }
    }
};



// 清除加粗
Zotero.UpdateIFs.cleanBold = async function () {
    var rn = 0;
    var items = Zotero.UpdateIFs.getSelectedItems();
    for (item of items) {
        let creators = item.getCreators();
        let newCreators = [];

        for (creator of creators) {
            if (/<b>/.test(creator.firstName) || /<b>/.test(creator.lastName)) {  // 是否包含<b>

                creator.firstName = creator.firstName.replace(/<b>/g, '').replace(/<\/b>/g, '');
                creator.lastName = creator.lastName.replace(/<b>/g, '').replace(/<\/b>/g, '');
                creator.fieldMode = creator.fieldMode;
                rn++;
            }
            newCreators.push(creator);

        }
        item.setCreators(newCreators);

        await item.save();

    }
    var lanUI = Zotero.Prefs.get('intl.locale.requested', true); // 得到当前Zotero界面语言
    var whiteSpace = ' ';
    if (lanUI == 'zh-CN') { whiteSpace = '' };
    var rnInfo = rn > 1 ? 'author.changed.mul' : 'author.changed.sig';
    var statusInfo = rn > 0 ? 'finished' : 'failed';
    var alertInfo = rn + whiteSpace + Zotero.UpdateIFs.ZUIFGetString(rnInfo);
    Zotero.UpdateIFs.showPopUP(alertInfo, statusInfo);

};



// 清除加星
Zotero.UpdateIFs.cleanStar = async function () {
    var rn = 0;
    var items = Zotero.UpdateIFs.getSelectedItems();
    for (item of items) {
        let creators = item.getCreators();
        let newCreators = [];

        for (creator of creators) {
            if (/\*/.test(creator.firstName) || /\*/.test(creator.lastName)) {

                creator.firstName = creator.firstName.replace(/\*/g, '');
                creator.lastName = creator.lastName.replace(/\*/g, '');
                creator.fieldMode = creator.fieldMode;
                rn++;
            }
            newCreators.push(creator);

        }
        item.setCreators(newCreators);

        await item.save();

    }
    var lanUI = Zotero.Prefs.get('intl.locale.requested', true); // 得到当前Zotero界面语言
    var whiteSpace = ' ';
    if (lanUI == 'zh-CN') { whiteSpace = '' };
    var rnInfo = rn > 1 ? 'author.changed.mul' : 'author.changed.sig';
    var statusInfo = rn > 0 ? 'finished' : 'failed';
    var alertInfo = rn + whiteSpace + Zotero.UpdateIFs.ZUIFGetString(rnInfo);
    Zotero.UpdateIFs.showPopUP(alertInfo, statusInfo);


};

// 清除加粗加星
Zotero.UpdateIFs.cleanBoldAndStar = async function () {
    Zotero.UpdateIFs.cleanStar();
    Zotero.UpdateIFs.cleanBold();


};

Zotero.UpdateIFs.getAuthorName = function () {

    var auName = document.getElementById('id-updateifs-textb-author-name');
    Zotero.Prefs.set('extensions.updateifs.author-name', auName, true);


};

// 将题目改为句首字母大写
Zotero.UpdateIFs.changeTitleCase = async function () {
    var items = Zotero.UpdateIFs.getSelectedItems();
    var alertInfo = '';
    // progresswindow   // 20220310
    progressWin = null; // 20220310
    itemProgress = []; // 20220310
    progressWin = new Zotero.ProgressWindow(); // 20220310
    progressWin.changeHeadline(Zotero.UpdateIFs.ZUIFGetString('title.case')); // 20220310
    var icon_1 = 'chrome://zoteroupdateifs/skin/pen.png'; // 20220310
    var icon_2 = 'chrome://zoteroupdateifs/skin/greenarrow.png'; // 20220310

    if (items.length == 0) {
        alertInfo = Zotero.UpdateIFs.ZUIFGetString('zotero.item');
        Zotero.UpdateIFs.showPopUP(alertInfo, 'failed');
    } else {
        var result = "";
        for (item of items) {
            var title = item.getField('title');
            if (Zotero.UpdateIFs.detectUpCase(title)) {//如果期刊名全部为大写，转换并提醒
                title = Zotero.UpdateIFs.titleCase(title); // 转换为单词首字母大写
                alertInfo = Zotero.UpdateIFs.ZUIFGetString('all.upcase');
                Zotero.UpdateIFs.showPopUP(alertInfo, 'infomation');
            }

            result += " " + title + "\n";
            var new_title = title.replace(/\b([A-Z][a-z0-9]+|A)\b/g, function (x) { return x.toLowerCase(); });
            new_title = new_title.replace(/(^|\?\s*)[a-z]/, function (x) { return x.toUpperCase(); }).
                replace('china', 'China'). // 替换china  代码来源于fredericky123，感谢。
                replace('chinese', 'Chinese'). // 替换chinese
                replace('america', 'America'). // 替换america
                replace('english', 'English'). // 替换english
                replace('england', 'England'). // 替换england
                replace('india', 'India').// 替换india
                //20220510 增加冒号后面为大写字母
                // https://stackoverflow.com/questions/72180052/regexp-match-and-replace-to-its-uppercase-in-javascript#72180194
                replace(/：|:\s*\w/, fullMatch => fullMatch.toUpperCase()); //匹配冒号后面的空格及一个字母，并转为大写

            //20220509 增加冒号后面为大写字母
            //colon_letter = new_title.match((/(：|:\s*\w)/))[0];
            //new_title = new_title.replace(colon_letter, colon_letter.toUpperCase()); //转为大写

            // result += "-> " + new_title + "\n\n";
            // // Do it at your own risk
            //pronew =  title + "\n" + "-> " + new_title + "\n\n" ; //// 20220310
            itemProgress.push(new progressWin.ItemProgress(icon_1, title)); //// 20220310
            itemProgress.push(new progressWin.ItemProgress(icon_2, new_title)); //// 20220310
            itemProgress.push(new progressWin.ItemProgress('', '')); // 加空行 20220310
            item.setField('title', new_title);
            await item.saveTx();
        }
        // alertInfo = result;
        // Zotero.UpdateIFs.showPopUP(alertInfo, 'finished');
        progressWin.show(); //// 20220310
        progressWin.startCloseTimer(4000); //// 20220310
    }

};

// 将单词转为首字母大写
Zotero.UpdateIFs.titleCase = function (str) {
    var newStr = str.split(" ");
    for (var i = 0; i < newStr.length; i++) {
        newStr[i] = newStr[i].slice(0, 1).toUpperCase() + newStr[i].slice(1).toLowerCase();
    }
    return newStr.join(" ");
};

// 检查句子是否为全部大写
Zotero.UpdateIFs.detectUpCase = function (word) {
    var arr_is_uppercase = [];
    for (var char of word) {
        if (char.charCodeAt() < 97) {
            arr_is_uppercase.push(1);   // 是大写就加入 1
        } else {
            arr_is_uppercase.push(0);   // 是小写就加入 0
        }
    }
    var uppercase_sum = arr_is_uppercase.reduce((x, y) => x + y);
    if (
        uppercase_sum === word.length   // 全部为大写
    ) {
        return true;
    } else {
        return false;
    }
};

// 显示配置目录
Zotero.UpdateIFs.showProfileDir = function () {
    var profileDir = Zotero.Profile.dir;  // 配置目录

    var alertInfo = Zotero.UpdateIFs.ZUIFGetString('show.profile.dir') + ' ' + profileDir;
    Zotero.UpdateIFs.showPopUP(alertInfo, 'finished');

};


// 显示数据目录
Zotero.UpdateIFs.showDataDir = function () {
    var dataDir = Zotero.DataDirectory.dir;// 数据目录
    var alertInfo = Zotero.UpdateIFs.ZUIFGetString('show.data.dir') + ' ' + dataDir;
    Zotero.UpdateIFs.showPopUP(alertInfo, 'finished');

};




// 添加条目时自动添加影响因子及分区
Zotero.UpdateIFs.notifierCallback = {

    notify: function (event, type, ids, extraData) {
        var addedItems = Zotero.Items.get(ids);
        var addUppdate = Zotero.Prefs.get('extensions.updateifs.add-update', true); // 是否在添加条目时更新
        var items = [];
        // 得到正常的条目
        for (let item of addedItems) {
            if (event == 'add' && addUppdate && !item.isNote() &&
                item.isRegularItem() && !item.isCollection()) {
                //Zotero.UpdateIFs.updateSelectedItems();// 20221126

                items.push(item);// 20221126 正常条目才纳入更新
            }

        }
        if (event == 'add' && addUppdate && items != '') { //20221203得到的items不为空时才更新。
            Zotero.UpdateIFs.updateSelectedItem(items);
        }
    } //此处如果以“，”结尾会提示两次。

};



// 更新分类
Zotero.UpdateIFs.updateSelectedColl = async function () {
    var collection = ZoteroPane.getSelectedCollection();
    var items = collection.getChildItems();
    Zotero.UpdateIFs.updateSelectedItem(items); // 调用更新所选条目函数
    await collection.saveTx();
};

// 更新所选条目
Zotero.UpdateIFs.updateSelectedItems = async function () {
    var items = Zotero.UpdateIFs.getSelectedItems();
    Zotero.UpdateIFs.updateSelectedItem(items); // 调用更新所选条目函数
};


// 得到所选条目
Zotero.UpdateIFs.getSelectedItems = function () {
    var zoteroPane = Zotero.getActiveZoteroPane();
    var items = zoteroPane.getSelectedItems();
    return items; //
};




// 更新期刊影响因子
Zotero.UpdateIFs.updateSelectedItem = async function (items) {

    // 得到是否显示南农核心期刊的设置

    var njauCore = Zotero.Prefs.get('extensions.updateifs.njau-core', true);
    var njauCoreField = Zotero.Prefs.get('extensions.updateifs.njau-core-field', true);
    var njauHighQulity = Zotero.Prefs.get('extensions.updateifs.njau-high-quality', true);
    var njauHighQulityField = Zotero.Prefs.get('extensions.updateifs.njau-high-quality-field', true);


    // 得到是否显示影响因子的设置

    var sciIf = Zotero.Prefs.get('extensions.updateifs.sci-if', true);  // IF
    var sciIf5 = Zotero.Prefs.get('extensions.updateifs.sci-if5', true); // 5年IF
    var chjCscd = Zotero.Prefs.get('extensions.updateifs.chj-cscd', true); // CSCD
    var pkuCore = Zotero.Prefs.get('extensions.updateifs.pku-core', true); // 北大核心
    var sciCore = Zotero.Prefs.get('extensions.updateifs.sci-core', true); // 科技核心
    var comIf = Zotero.Prefs.get('extensions.updateifs.com-if', true); // 复合影响因子
    var aggIf = Zotero.Prefs.get('extensions.updateifs.agg-if', true); // 综合影响因子

    var sciIfField = Zotero.Prefs.get('extensions.updateifs.sci-if-field', true);  // IF字段
    var sciIf5Field = Zotero.Prefs.get('extensions.updateifs.sci-if5-field', true); // 5年IF字段
    var cscdField = Zotero.Prefs.get('extensions.updateifs.chj-cscd-field', true); // CSCD字段
    var pkuField = Zotero.Prefs.get('extensions.updateifschj-pku-field', true);  // 北大核心字段
    var chjSciField = Zotero.Prefs.get('extensions.updateifs.chj-sci-field', true);  // 科技核心字段
    var chjCIfField = Zotero.Prefs.get('extensions.updateifs.chj-com-field', true);  //复合影响因子字段
    var chjAIfField = Zotero.Prefs.get('extensions.updateifs.agg-if-field', true);  // 综合影响因子字段

    var sciAllExtra = Zotero.Prefs.get('extensions.updateifs.sci-all-extra', true);  // 显示所有英文期刊信息到其它
    var chjAllExtra = Zotero.Prefs.get('extensions.updateifs.chj-all-extra', true);  // 显示所有中文期刊信息到其它

    var numSuccess = 0;
    var numFail = 0;
    var lanUI = Zotero.Prefs.get('intl.locale.requested', true); // 得到当前Zotero界面语言
    var whiteSpace = ' ';
    if (lanUI == 'zh-CN') { whiteSpace = '' };

    for (let item of items) {

        if (item.isRegularItem() && !item.isCollection()) {

            if (njauCore) item.setField( // 设置南农核心
                njauCoreField,
                Zotero.UpdateIFs.NJAU_Core(item));

            if (njauHighQulity) item.setField( // 设置南农高质量期刊
                njauHighQulityField,
                Zotero.UpdateIFs.NJAU_High_Quality(item));

            item.save();


            try {

                var ifs = await Zotero.UpdateIFs.getIFs(item);
                var if5Year = ifs[0];
                var ifCurrent = ifs[1];
                var detailURL = ifs[2];
                var jourAbb = ifs[3];
                var old = item.getField('extra')


                var ifc = '影响因子: ';
                var if5 = '\n5年影响因子: ';

                var dig = '(([1-9][\d]{0,6}|0)(\.[\d]{1,5})?)';


                var ifsc = ifc + ifCurrent; // 填充的影响因子字符串
                var ifs5 = if5 + if5Year; // 填充的5年影响因子字符串
                var ifs = ifsc + ifs5;
                var patt = /影响因子: (([1-9][\d]{0,6}|0)(\.[\d]{1,5})?)\n5年影响因子: (([1-9][\d]{0,6}|0)(\.[\d]{1,5})?)/;   // 匹配以前影响因子的正则
                var enAbbr = Zotero.Prefs.get('extensions.updateifs.en-abbr', true) // 设置中 英文期刊缩写选项
                // if (enAbbr) {
                item.setField('journalAbbreviation', jourAbb); // 设置期刊缩写
                // }

                if (sciIf) item.setField( // 设置影响因子
                    sciIfField,
                    ifCurrent);

                if (sciIf5) item.setField( // 设置5年影响因子
                    sciIf5Field,
                    if5Year);

                if (sciAllExtra) { // 如果所有英文期刊信息到其它为真，则全部显示到其它字段
                    if (old.length == 0) {   // 如果内容为空
                        item.setField('extra', ifs);

                    } else if (old.search(patt) != -1) { // 如果以前有影响因子则替换
                        item.setField(
                            'extra',
                            old.replace(patt, ifs));

                    } else {   // 以前没有，且内容不为空
                        item.setField('extra', ifs + '\n' + old);
                        // item.setField('extra', ifsc + ifsc5 + '\n' + old);
                    }
                };

                // var  detailURL = await Zotero.UpdateIFs.generateItemDetailUrl(url);

                Zotero.UpdateIFs.setItemJCR(detailURL, item);  // 设置JCR及中科院分区

                item.save();
                numSuccess++;
            } catch (error) {
                numFail++;
            }

            // if (njauCore)  item.setField( // 设置南农核心
            //     njauCoreField,
            //     Zotero.UpdateIFs.NJAU_Core(item));

            // if (njauHighQulity)  item.setField( // 设置南农高质量期刊
            //     njauHighQulityField,
            //     Zotero.UpdateIFs.NJAU_High_Quality(item));

            // 得到中文期刊信息 与前面英文相比后缀加CN
            try {
                var pubTitle = item.getField('publicationTitle');
                var urlCN = 'http://sci.justscience.cn/list?sci=0&q=' +
                    encodeURIComponent(pubTitle); // 为中文期刊详情查询地址 20221124
                // var urlCN = 'http://sci.justscience.cn/?q=' +
                //    encodeURIComponent(pubTitle) +
                //    '&sci=0';// 为中文期刊详情查询地址
                //  使用函数获取html
                // var respCN = await Zotero.HTTP.request("GET", urlCN);

                // var parserCN = Components.classes["@mozilla.org/xmlextras/domparser;1"]
                //     .createInstance(Components.interfaces.nsIDOMParser);
                // var htmlCN = parserCN.parseFromString(
                //     respCN.responseText,
                //     "text/html"
                // );
                var htmlCN = await Zotero.UpdateIFs.getHtmlCN(urlCN);
                // 收录情况
                var xPathSL = "//table[@class='s-result-table']";
                var jourCNSL = Zotero.Utilities.xpath(htmlCN, xPathSL)[0].textContent;
                var searchReg1 = /×/g; // 替换×
                var searchReg2 = /√/g; // 替换√

                // var shouLuReg = /最新版本(\s.+){6,10}\s+(.*)\s+(.*)\s+(.*)/; //期刊收录情况正则 20221124
                var shouLuReg = '\\s+' + pubTitle + '\\s+(.*)\\s+(.*)\\s+(.*)'; //期刊收录情况正则 20221124
                var pattSL = new RegExp(shouLuReg, 'i'); //
                var shouLu = jourCNSL.replace(searchReg1, '否').replace(searchReg2, '是'). // 替换×√
                    match(pattSL);
                var jourCN1Extra = shouLu[1]; // 放入Extra用 // CSCD 20221124
                var jourCN1New = jourCN1Extra.replace(/否/, '').replace(/是/, 'CSCD'); //放入字段中用  // CSCD

                var jourCN2Extra = shouLu[2]; // 北大核心 //放入Extra用 20221026 20221124

                var jourCN3Extra = shouLu[3]; //科技核心 放入Extra用 20221026 20221124
                var jourCN3New = jourCN3Extra.replace(/否/, '').replace(/是/, '科技核心');    //放入字段中用

                // 综合影响因子，复合影响因子
                var xPathCN = "//table[@class='s-result-table']//a[contains(concat('  ', normalize-space(text()), '  '), '  " + // 20221124

                    // var xPathCN = "//table[@class='tb1']//a[contains(concat('  ', normalize-space(text()), '  '), '  " +
                    pubTitle +
                    "  ')]"; // 20221024 可用 小林的xPath，为得到详情URL;
                var detailURLPreCN = Zotero.Utilities.xpath(htmlCN, xPathCN)[0].href;
                var detailURLCN = 'http://sci.justscience.cn/' + detailURLPreCN; // 中文期刊详细地址20221025
                var old = item.getField('extra');
                var detailURLHtmlCN = await Zotero.UpdateIFs.getHtmlCN(detailURLCN);
                // var xPathSL = "//table[@class='tb1'][1]"; // 收录情况2-4
                // var xPathCNIF = "//table[@class='tb1'][2]"; // 影响因子表格
                // var xPathSL = "//table[@class='s-list-table']"; // 收录情况2-4 20221124
                var xPathCNIF = "//table[@class='list_table_blue_y hover_table_tr box_mt20 font_16 blue_bj_light']"; // 影响因子表格20221124
                //  var jourCNSL = Zotero.Utilities.xpath(detailURLHtmlCN, xPathSL)[0].textContent // 收录情况文本 20221124
                var jourCNIF = Zotero.Utilities.xpath(detailURLHtmlCN, xPathCNIF)[0].textContent // 影响因子文本



                // var jourCNIFReg = /复合影响因子(.*)\s+综合影响因子(.*)/;
                var jourCNIFReg = /复合影响因子\n(.*)\s+综合影响因子\n(.*)/; //20221124



                var CNIF = jourCNIF.match(jourCNIFReg);
                var jourCNIF1 = CNIF[1]; // 复合影响因子
                var jourCNIF2 = CNIF[2]; // 综合影响因子20221026

                // var jourCNIF1 = Zotero.Utilities.xpath(htmlCN, xPathCNIF1)[0].innerText // 复合影响因子
                // var jourCNIF2 = Zotero.Utilities.xpath(htmlCN, xPathCNIF2)[0].innerText // 综合影响因子

                // var jourCN1 = Zotero.Utilities.xpath(htmlCN, xPathCN + '2]')[0].innerText // CSCD20221012

                // var jourCN1Extra = jourCN1.replace(searchReg1, '否').replace(searchReg2, '是'); // 放入Extra用 // CSCD 20221026
                // var jourCN1New = jourCN1.replace(searchReg1, '').replace(searchReg2, 'CSCD');//放入字段中用  // CSCD 20221026


                var jourCN2New = item.getField("url") ? await Zotero.UpdateIFs.CSSCI_PKU(item) : ''; //根据网址获致CSSCI，北大核心,  如无网址返回空白

                // if (item.getField("url")) {

                //     var jourCN2New = await Zotero.UpdateIFs.CSSCI_PKU(item); //根据网址获致CSSCI，北大核心

                // }

                // var jourCN2Extra = Zotero.Utilities.xpath(htmlCN, xPathCN + '3]')[0].innerText. // 北大核心
                //     replace(searchReg1, '否').replace(searchReg2, '是');//放入Extra用 20221026

                // var jourCN2New = jourCN2.replace(searchReg1, '').replace(searchReg2, '北大核心');



                // var jourCN3 = Zotero.Utilities.xpath(htmlCN, xPathCN + '4]')[0].innerText // 科技核心
                // var jourCN3Extra = jourCN3.replace(searchReg1, '否').replace(searchReg2, '是'); //放入Extra用
                // var jourCN3New = jourCN3.replace(searchReg1, '').replace(searchReg2, '科技核心');    //放入字段中用


                var jourCNInfo = 'CSCD: ' + jourCN1Extra + '\n' + '北大核心: ' + jourCN2Extra + '\n' + '科技核心: ' + jourCN3Extra + '\n\n' +
                    '复合影响因子: ' + jourCNIF1 + '\n'
                    + '综合影响因子: ' + jourCNIF2 + '\n';  // 期刊信息组合


                var pattCN = /CSCD: (.+)\n北大核心: (.+)\n科技核心: (.+)\n\n复合影响因子: (.*)\n综合影响因子: (.*)/g;   // 匹配以前影响因子的正则



                if (chjCscd) item.setField( // 设置CSCD
                    cscdField,
                    jourCN1New);

                if (pkuCore) item.setField( // 设置北大核心，CSSCI，CSCD
                    pkuField,
                    jourCN2New);  // CSCD在这个字段中保留

                if (sciCore) item.setField( // 设置科技核心
                    chjSciField,
                    jourCN3New); //

                if (comIf) item.setField( // 设置复合影响因子
                    chjCIfField,
                    jourCNIF1);

                if (aggIf) item.setField( // 设置综合影响因子
                    chjAIfField,
                    jourCNIF2);

                if (chjAllExtra) { // 如果所有中文期刊信息到其它为真，则全部显示到其它字段


                    if (old.length == 0) {   // 如果内容为空
                        item.setField('extra', jourCNInfo);

                    } else if (old.search(pattCN) != -1) { // 如果以前有影响因子则替换
                        item.setField(
                            'extra',
                            old.replace(pattCN, jourCNInfo));

                    } else {   // 以前没有，且内容不为空
                        item.setField('extra', jourCNInfo + '\n' + old);
                        // item.setField('extra', ifsc + ifsc5 + '\n' + old);
                    }
                };

                var chAbbr = Zotero.Prefs.get('extensions.updateifs.ch-abbr', true) // 设置中中文期刊缩写选项
                if (chAbbr) { // 如果设置中中文期刊缩写为true时
                    item.setField('journalAbbreviation', pubTitle);

                }
                item.save();

                numSuccess++;
            } catch (error) {
                numFail++;
            }
            var jourAbbrOrigin = item.getField('journalAbbreviation');  // 得到原期刊缩写
            var pubTitleOrin = item.getField('publicationTitle'); // 得到期刊名称
            var enAbbr = Zotero.Prefs.get('extensions.updateifs.en-abbr', true) // 设置中英文期刊缩写选项
            if (jourAbbrOrigin == '' && enAbbr) { // 如果原期刊缩写为空且缩写选择为true

                item.setField('journalAbbreviation', pubTitleOrin); //替换为期刊名称
                item.save();
            }
        }

        await new Promise(resolve => setTimeout(resolve, Math.round(Math.random() * 50000))); // 暂停几秒再抓取，随机等待时间5-50s

    }
    var statusInfo = numSuccess > 0 ? 'finished' : 'failed';
    var successInfo = numSuccess > 1 ? 'success.mul' : 'success.sig';
    var alertInfo = numSuccess + whiteSpace + Zotero.UpdateIFs.ZUIFGetString(successInfo);
    Zotero.UpdateIFs.showPopUP(alertInfo, statusInfo);
    // alert (numSuccess + whiteSpace + Zotero.UpdateIFs.ZUIFGetString('success'));

};
// 根据中文期刊名称，得到htmlCN
Zotero.UpdateIFs.getHtmlCN = async function (url) {
    try {
        var resp = await Zotero.HTTP.request("GET", url);
        var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
            .createInstance(Components.interfaces.nsIDOMParser);
        var html = parser.parseFromString(
            resp.responseText,
            "text/html"
        );
        return html;
    }

    catch (error) {

    }


};

// 得到影响因子及详细网址函数
Zotero.UpdateIFs.getIFs = async function (item) {
    var ifs = [];
    try {
        var html = await Zotero.UpdateIFs.getHtml(item);

        // 新函数开始
        // var publicationTitle = item.getField('publicationTitle');

        // var xPathJour = '//td/a[contains(text(),' +
        //     '\'' +
        //     publicationTitle +
        //     '\'' +
        //     ')]/../..';

        // // var xPathJour = xPath + '../..'
        // // var xPathDetailURL = xPath + '@href'
        // //  var all = xPathJour + ' | ' + xPathDetailURL;

        // var AllJour = Zotero.Utilities.xpath(html, xPathJour)[0].innerHTML

        // pattTds = new RegExp('<td class="td1" height="30" align="center">', 'g');
        // pattTde = new RegExp('</td>', 'g');
        // var allInfo = AllJour.replace(pattTds,'').replace(pattTde,'');
        // var jour = allInfo.match(/href=\"(.*)\"\s.*\n.(.*)\n.(.*)\n.*\n.(.*)\n.(.*)\n.(.*)/);
        // var detailURL = 'http://sci.justscience.cn/' + jour[1];
        // var regAbbr = jour[2];
        // var if5Year = jour[4];
        // var ifCurrent = jour[6];

        //新函数结束
        // var xPathJour = '//*[@id="app"]/div[1]/div/div[1]'; // 20221023为得到期刊名称
        // var xPathJour = "//table[@class='tb1']"; // 20221023为得到期刊名称 小林的xPath

        // var xPathJour = '//div[2]/div[1]/table[2]/tbody'; // 为得到期刊名称
        // var xPathJour = '//td[contains(text(),'Annu')]/..'
        var xPathJour = "//table[@class='s-result-table']";  // 为得到期刊名称 20221120

        var AllJour = Zotero.Utilities.xpath(html, xPathJour)[0].textContent;
        var publicationTitle = item.getField('publicationTitle');
        // 20221023 修改
        var reg = '\n\\s+' + publicationTitle + '\\s' + // 匹配期刊
            '\\s+\n\\s+' + '(.*)' +  // 分组1 缩写
            '\\s+' + '(.*)' + // 分组2 ISSN
            '\\s+' + '(.*)' +  //分组3文章数
            '\\s+' + '(.*)' + //分组4 5年平均分
            '\\s+' + '(.*)' + //分组5 非自引分
            '\\s+' + '(.*)'; //分组6 影响因子  // 20221124
        // 20221023 注释
        // var reg = '\n\t(.*)\n\t' + publicationTitle + // 分组1序号
        //     '\n\t(.*)\n\t(.*)' + // 分组3 ISSN，分组4文章数
        //     '\n\t(.*)\n\t(.*)' + //分组5 5年平均分， 分组6 非自引分
        //     '\n\t(.*)\n\t(.*)'; // 分组7 影响因子
        var patt = new RegExp(reg, 'i'); //
        var jour = AllJour.match(patt);
        // var abbr = Zotero.UpdateIFs.titleCase(jour[2]); // 转为首字母大写 20221124
        // var if5Year = jour[5];
        // var ifCurrent = jour[7];
        var abbr = Zotero.UpdateIFs.titleCase(jour[1]); // 转为首字母大写 20221124
        var if5Year = jour[4];
        var ifCurrent = jour[6];
        var xPathUrl = "//table[@class='s-result-table']//a[contains(concat('  ', normalize-space(text()), '  '), '  " +
            publicationTitle +
            "  ')]"; // 20221024 可用 小林的xPath，为得到详情URL

        // var xPathUrl = "//a[contains(text(),'Meat Science')]"
        // var xPathUrl = xPathJour + '//@href'; // 为得到详情URL 可用 20231024 需要用到index
        // var index = Number(jour[1]) + 3; // 20221024
        // var index = jour[1] + 3;
        // var detailURLPre = Zotero.Utilities.xpath(html, xPathUrl); // 20221024
        // var detailURL = 'http://sci.justscience.cn/' + detailURLPre[index].value;//20221024
        var detailURLPre = Zotero.Utilities.xpath(html, xPathUrl)[0].href; // 20221024
        var detailURL = 'http://sci.justscience.cn/' + detailURLPre; // 20221024
        // var regAbbr = '\n\t' + publicationTitle + '\n.(.*)';  // 用于得到期刊缩写
        // var abbr = AllJour.match(regAbbr)[1];  // 匹配得到期刊缩写

        ifs.push(if5Year, ifCurrent, detailURL, abbr)
        return ifs;
    } catch (error) {
        // numFail = numFail + 1;
    }


    try { // 期刊名字中有&的情况
        var html = await Zotero.UpdateIFs.getHtml(item);
        // var xPathJour = "//table[@class='tb1']";  // 为得到期刊名称

        var xPathJour = "//table[@class='s-result-table']";  // 为得到期刊名称 20221120

        var AllJour = Zotero.Utilities.xpath(html, xPathJour)[0].textContent;
        var publicationTitle = item.getField('publicationTitle').
            replace(/&/g, 'and').  // 替换&为and
            replace(/ - /g, '-').
            replace(/,/g, '').    // 替换逗号（，）
            replace(/: /g, '-');  // 替换冒号空格（：）  全局替换代码源于@crazyi
        var reg = '\n\\s+' + publicationTitle + '\\s' + // 匹配期刊
            '\\s+\n\\s+' + '(.*)' +  // 分组2 缩写
            '\\s+' + '(.*)' + // 分组3 ISSN
            '\\s+' + '(.*)' +  //分组4文章数
            '\\s+' + '(.*)' + //分组5 5年平均分
            '\\s+' + '(.*)' + //分组6 非自引分
            '\\s+' + '(.*)'; //分组7 影响因子
        var patt = new RegExp(reg, 'i'); //
        var jour = AllJour.match(patt);
        var abbr = Zotero.UpdateIFs.titleCase(jour[1]); // 转为首字母大写
        var if5Year = jour[4];
        var ifCurrent = jour[6];

        var xPathUrl = "//table[@class='s-result-table']//a[contains(concat('  ', normalize-space(text()), '  '), '  " +
            publicationTitle +
            "  ')]";
        var detailURLPre = Zotero.Utilities.xpath(html, xPathUrl)[0].href; // 20221024
        var detailURL = 'http://sci.justscience.cn/' + detailURLPre; // 20221024

        ifs.push(if5Year, ifCurrent, detailURL, abbr)
        // ifs.push(if5Year, ifCurrent, detailURL)
        return ifs;
    } catch (error) {
        // numFail = numFail + 1;
    }

    try { // 更名或剔除情况
        var html = await Zotero.UpdateIFs.getHtml(item);

        var xPathJour = "//table[@class='s-result-table']";  // 为得到期刊名称

        var AllJour = Zotero.Utilities.xpath(html, xPathJour)[0].textContent;
        var publicationTitle = item.getField('publicationTitle').
            replace('&', 'and').
            replace(' - ', '-');
        var reg = '\n\\s+' + publicationTitle + '\\s' + '(更名\/剔除)(.*)' + // 分组1序号 后面还有两个分组
            '\\s+\n\\s+' + '(.*)' +  // 分组4 缩写
            '\\s+' + '(.*)' + // 分组3 ISSN
            '\\s+' + '(.*)' +  //分组6文章数
            '\\s+' + '(.*)' + //分组7 5年平均分
            '\\s+' + '(.*)' + //分组8 非自引分
            '\\s+' + '(.*)'; //分组9 影响因子
        var patt = new RegExp(reg, 'i'); //
        var jour = AllJour.match(patt);


        var abbr = Zotero.UpdateIFs.titleCase(jour[3]); // 转为首字母大写
        var if5Year = jour[6];
        var ifCurrent = jour[8];

        var xPathUrl = "//table[@class='s-result-table']//a[contains(concat('  ', normalize-space(text()), '  '), '  " +
            publicationTitle +
            "  ')]";
        var detailURLPre = Zotero.Utilities.xpath(html, xPathUrl)[0].href; // 20221024
        var detailURL = 'http://sci.justscience.cn/' + detailURLPre; // 20221024

        ifs.push(if5Year, ifCurrent, detailURL, abbr)

        return ifs;

    } catch (error) {
        // numFail = numFail + 1;
    }


};


// 根据期刊名称，得到html，用于得到issn
Zotero.UpdateIFs.getHtml = async function (item) {
    try {
        var pubTitle = item.getField('publicationTitle');
        var url = 'http://sci.justscience.cn/list?sci=1&q=' +
            encodeURIComponent(pubTitle); // 20221120
        // var url = 'http://sci.justscience.cn/index.php?q=' +
        // encodeURIComponent(pubTitle) + '&sci=1'; // 20221120
        // 20220506 尝试使用科研通得到数据
        // var url = 'https://www.ablesci.com/journal/index?keywords=' +
        //     encodeURIComponent(pubTitle).replace(/%20/g, '+');
        var resp = await Zotero.HTTP.request("GET", url);
        var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
            .createInstance(Components.interfaces.nsIDOMParser);
        var html = parser.parseFromString(
            resp.responseText,
            "text/html"
        );
        return html;
    }

    catch (error) {

    }


};

// 设置JCR信息
Zotero.UpdateIFs.setItemJCR = async function (detailURL, item) {

    // 得到是否显示分区的设置
    var jcrQu = Zotero.Prefs.get('extensions.updateifs.jcr-qu', true);
    var casQu1 = Zotero.Prefs.get('extensions.updateifs.cas-qu1', true);
    var casQu2 = Zotero.Prefs.get('extensions.updateifs.cas-qu2', true);

    var jcrQuField = Zotero.Prefs.get('extensions.updateifs.jcr-qu-field', true);
    var casQu1Field = Zotero.Prefs.get('extensions.updateifs.cas-qu1-field', true);
    var casQu2Field = Zotero.Prefs.get('extensions.updateifs.cas-qu2-field', true);

    var sciAllExtra = Zotero.Prefs.get('extensions.updateifs.sci-all-extra', true);// 显示所有英文期刊信息到其它

    try {
        var JCR = await Zotero.UpdateIFs.generateJCR(detailURL);  // 得到JCR
        var newJcrQu = jcrQu == false ? '' : 'JCR: ' + JCR[0] + '\n';    // 新JCR分区，如果不显示, 则为空白
        var newCasQu1 = casQu1 == false ? '' : '中科院大类分区: ' + JCR[1] + '\n';    // 新中科院大类分区，如果不显示, 则为空白
        var newCasQu2 = casQu2 == false ? '' : '中科院小类分区: ' + JCR[2].replace(/区/g, '区 ') + '\n';    // 新中科院小类分区，如果不显示, 则为空白
        var newJCRinfo = newJcrQu + newCasQu1 + newCasQu2;

        var JCRInfo = 'JCR: ' + JCR[0] + '\n' + '中科院大类分区: ' + JCR[1] + '\n' +
            '中科院小类分区: ' + JCR[2].replace(/区/g, '区 ') + '\n';
        var pattJCR = /JCR:(.*)\n(.*)\n(.*)\n/;
        var pattNewJCR = /JCR:(.*)\n/;
        var pattNewCasQu1 = /中科院大类分区:(.*)\n/;
        var pattNewCasQu2 = /中科院小类分区:(.*)\n/;

        if (jcrQu) item.setField( // 设置JCR
            jcrQuField,
            JCR[0]);

        if (casQu1) item.setField( //中科院大类分区
            casQu1Field,
            JCR[1]);

        if (casQu2) item.setField(//中科院小类分区
            casQu2Field,
            JCR[2]);

        if (sciAllExtra) {
            var old = item.getField('extra');
            if (old.length == 0) {   // 如果内容为空
                item.setField('extra', JCRInfo); // 20220415 恢复原Extra
                //item.setField('extra', newJCRinfo);
            } else if (old.search(pattJCR) != -1) { // 如果以前有影响因子则替换 // 20220415 恢复原Extra
                item.setField(
                    'extra',
                    old.replace(pattJCR, JCRInfo));
                // 以下注释目的为20220415 恢复原Extra
                // }  else if (old.search(pattNewJCR) != -1) { // 如果以前有JCR分区则替换
                //     item.setField(
                //         'extra',
                //         old.replace(pattNewJCR, newJcrQu));


                // }  else if (old.search(pattNewCasQu1) != -1) { // 如果以前有中科院大类分区则替换
                //     item.setField(
                //         'extra',
                //         old.replace(pattNewCasQu1, newCasQu1));


                // }  else if (old.search(pattNewCasQu2) != -1) { // 如果以前有中科院小类区则替换
                //     item.setField(
                //         'extra',
                //         old.replace(pattNewCasQu2, newCasQu2));


            } else {   // 以前没有，且内容不为空
                item.setField('extra', JCRInfo + '\n' + old); // 20220415 恢复原Extra
                //item.setField('extra', newJCRinfo + '\n' + old);
            }
        };
        item.save();
    } catch (error) {
        //continue;
    }

};



// 得到JCR分区
Zotero.UpdateIFs.generateJCR = async function (detailURL) {
    var JCR = [];
    var ifsType = Zotero.Prefs.get('extensions.updateifs.ifs-type', true);
    try {
        var resp = await Zotero.HTTP.request("GET", detailURL);
        var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
            .createInstance(Components.interfaces.nsIDOMParser);
        var html = parser.parseFromString(
            resp.responseText,
            "text/html"
        );


        // var xPath2 = '//table[3]'; // 20221024
        // var xPath2 = "//td[contains(text(), 'JCR')]/../.."; // 20221024
        // var xPath2 = "//div[@class='detail-table']"; // 20221024
        // var xPath2 = "//table[@class='tb1']";  // 20221024 来自林 //div[@class='detail-table']
        var xPath2 = "//table[@class='list_table_blue_y hover_table_tr box_mt20 font_16 blue_bj_light']";  // 20221124
        var jourJCR = Zotero.Utilities.xpath(html, xPath2)[0].innerText;

        // var pattJCR2 = /JCR分区(.*)|大类\n.(.*)\n{3}.小类\n.(.*)/g // 20221025
        // var pattJCR2 = /JCR分区\n(.*)|大类\n.(.*)\n\s*小类\n\s*(.*)/g // 20221025
        var pattJCR2 = /JCR分区\n(.*)|大类：(.*)\n\s+小类：(.*)/g // 20221124
        var getJCR = jourJCR.match(pattJCR2);
        var qu = getJCR[0].match(/JCR分区\n\s+(.*)/)[1].replace(/\/以上面为准/g, ''); //20221124
        // var basic21 = getJCR[1].match('大类\n\t(.*)\n\n\n\t小类\n\t(.*)');
        // var update21 = getJCR[2].match('大类\n\t(.*)\n\n\n\t小类\n\t(.*)');
        // var basic21 = getJCR[1].match(/大类\n\s+(.*)\n\s+小类\n\s+(.*)/); // 20221025
        // var update21 = getJCR[2].match(/大类\n\s+(.*)\n\s+小类\n\s+(.*)/); // 20221025
        var basic21 = getJCR[1].match(/大类：(.*)\n\s+小类：(.*)/); // 20221124
        var update21 = getJCR[2].match(/大类：(.*)\n\s+小类：(.*)/); // 20221124
        var firstCat = ifsType == 'updated' ? update21[1] : basic21[1]; // 大类：如果为升级版为updated，否则为基础版
        var secCat = ifsType == 'updated' ? update21[2].replace(/区/g, '区 ') : basic21[2].replace(/区/g, '区 '); // 大类：如果为升级版为updated，否则为基础版，并且将区替换为区；，以美化
        JCR.push(qu, firstCat, secCat);
        return JCR;

        //   var xPath = '//div[2]/div[1]/table[3]/tbody';
        // //   var pattJCR = /JCR分区\n\t(.*)\n(\s*)(.+\n\s*(.+\n)\s(.+)\n\s*)大类\n\s(.*)\n\s*小类\n\s(.*)\n/;
        //   var pattJCR = /JCR分区(.*)\n{3}\t.*\n{3}\t\n.\t\n.*\n.\n.*\n.*\n{3}.大类\n.(.*)\n{3}.小类\n.(.*)/; // 20220222 修改正则匹配
        //   var jourJCR = Zotero.Utilities.xpath(html, xPath)[0].innerText;

        //   var getJCR = jourJCR.match(pattJCR);
        // //   JCR.push(getJCR[1], getJCR[6], getJCR[7]);
        // JCR.push(getJCR[1], getJCR[2], getJCR[3]);
        //   return JCR;
    } catch (error) {
        //continue;
    }
};

// 南京农业大学核心期刊分类2010
Zotero.UpdateIFs.NJAU_Core = function (item) {
    var classOne = ['病毒学报', '材料研究学报', '草业学报', '测绘学报', '大豆科学',
        '地理学报', '分析科学学报', '复合材料学报', '管理科学学报', '光学学报',
        '核农学报', '化学通报', '环境科学', '机械工程学报', '计算机学报',
        '计算机研究与发展', '解剖学报', '菌物学报', '昆虫学报', '林业科学',
        '麦类作物学报', '棉花学报', '摩擦学学报', '南京农业大学学报', '农业工程学报',
        '农业机械学报', '气象学报', '软件学报', '生态学报', '生物多样性',
        '生物工程学报', '食品科学', '数学学报',
        '水产学报', '水土保持学报',
        '太阳能学报', '土壤学报', '微生物学报', '畜牧兽医学报', '岩土工程学报',
        '遥感学报', '药学学报', '营养学报', '应用生态学报', '园艺学报',
        '振动工程学报', '植物保护学报', '植物病理学报', '植物生态学报', '植物学报',
        '植物营养与肥料学报', '中国公路学报', '中国环境科学', '中国激光', '中国农业科学',
        '中国生物化学与分子生物学报', '中国水稻科学', '中国中药杂志', '中华流行病学杂志', '中华微生物学和免疫学杂志',
        '自动化学报', '自然资源学报', '作物学报'];


    var classTwo = ['爆炸与冲击', '材料工程', '材料科学与工程学报', '材料科学与工艺', '长江流域资源与环境',
        '地理科学', '地理研究', '地球化学', '地球科学进展', '电子与信息学报',
        '动物分类学报', '动物学研究', '动物学杂志', '发光学报', '分析测试学报',
        '分析试验室', '分子细胞生物学报', '高分子材料科学与工程', '工程力学', '管理工程学报',
        '光子学报', '海洋与湖泊', '环境工程学报', '环境化学', '环境科学学报',
        '机器人', '机械设计', '计算机辅助设计与图型学学报', '计算机集成制造系统-CIMS', '计算机科学',
        '精细化工', '控制与决策', '昆虫知识', '力学进展', '林业科学研究',
        '免疫学杂志', '农业环境科学学报', '农业生物技术学报', '农业现代化研究', '汽车工程',
        '色谱', '生态学杂志', '生物物理学报', '食品工业科技', '食品与发酵工业',
        '食品与生物技术学报', '数学进展', '数学年刊A辑',
        '水生生物学报', '水土保持通报',
        '土壤', '土壤通报', '微生物学通报', '细胞与分子免疫学杂志', '西北植物学报',
        '小型微型计算机系统', '岩石学报', '遥感技术与应用', '仪器仪表学报', '遗传',
        '应用化学', '应用气象学报', '应用数学学报',
        '应用与环境生物学报', '杂交水稻',
        '振动与冲击', '植物保护', '植物生理学通讯', '植物研究', '植物遗传资源学报',
        '植物资源与环境学报', '中草药', '中国草地学报', '中国给水排水', '中国机械工程',
        '中国寄生虫学与寄生虫病杂志', '中国粮油学报', '中国人兽共患病学报', '中国生物防治', '中国生物医学工程学报',
        '中国兽医学报', '中国水产科学', '中国图象图形学报', '中国药理学通报', '中国药学杂志',
        '中国油料作物学报', '中国油脂', '中国兽医科学', '中药材', '资源科学',
        '草地学报', '茶叶科学*', '农药学学报', '气候变化研究进展'];
    var pubT = item.getField('publicationTitle');

    if (classOne.includes(pubT)) {
        return '一类核心';
    } else if (classTwo.includes(pubT)) {
        return '二类核心';
    } else {
        return '无'
    }


};

// 南京农业大学高质量期刊
Zotero.UpdateIFs.NJAU_High_Quality = function (item) {
    // 高质量论文一类
    var highQulityOne = ['中国农业科学', '农业工程学报', '南京农业大学学报', '核农学报', '园艺学报', '微生物学报',
        '生物工程学报'];
    // 高质量论文二类
    var highQulityTwo = ['食品与发酵工业', '微生物学通报', '中国粮油学报', '食品与生物技术学报'];

    // 高质量论文A类
    var highQulityA = ['Comprehensive Reviews in Food Science and Food Safety', 'Critical Reviews in Food Science and Nutrition',
        'ACS Nano', 'Metabolic Engineering', 'Postharvest Biology and Technology', 'Journal of Agricultural and Food Chemistry',
        'Food Hydrocolloids', 'Food Chemistry', 'Food Microbiology', 'Food Control', 'Food & Function', 'Microbiome', 'ISME Journal',
        'Ecotoxicology and Environmental Safety', 'Colloids and surfaces B-Biointerfaces', 'Food and Chemical Toxicology',
        'International Journal of Food Microbiology', 'Food Quality and Preference', 'Food Packaging and Shelf Life', 'Toxins',
        'Food Research International', 'Journal of Food Engineering', 'Journal of Functional Foods', 'Meat Science',
        'LWT-Food Science and Technology', 'Journal of Dairy Science', 'Journal of Food Composition and Analysis',
        'Journal of the Science of Food and Agriculture', 'Poultry Science', 'Scientia Horticulturae', 'Journal of Integrative Agriculture',
        'mBio', 'Free Radical Biology and Medicine', 'mSystems', 'Ultrasonics Sonochemistry', 'Journal of Experimental Botany',
        'Journal of Nutritional Biochemistry', 'Foods', 'Food Reviews International', 'Food and Bioproducts Processing',
        'Plant Foods for Human Nutrition', 'Microchemical Journal', 'Sensors', 'Current Opinion in Food Science'];

    // 高质量论文B类
    var highQulityB = ['Applied Microbiology and Biotechnology', 'Microorganisms', 'Frontiers in Microbiology', 'Food and Bioprocess Technology',
        'Food Analytical Methods', 'Food Science and Human Wellness', 'Food Bioscience', 'International Dairy Journal', 'Journal of Cereal Science',
        'International Journal of Food Sciences and Nutrition', 'Biotechnology Progress', 'International Journal of Food Science and Technology',
        'Journal of Bioscience and Bioengineering', 'Food Biophysics', 'Journal of Food Science', 'European Food Research and Technology',
        'Molecules', 'Process Biochemistry', 'Coatings', 'Drying Technology', 'Horticulture Environment and Biotechnology',
        'Animal Science Journal'];
    // 高质量论文C类
    var highQulityC = ['European Journal of Lipid Science and Technology'];

    var pubT = item.getField('publicationTitle');

    if (highQulityOne.includes(pubT)) {
        return '自然科学一类'; // 高质量论文一类
    } else if (highQulityTwo.includes(pubT)) {
        return '自然科学二类'; // 高质量论文二类
    } else if (highQulityA.includes(pubT)) {
        return '自然科学A';
    } else if (highQulityB.includes(pubT)) {
        return '自然科学B';
    } else if (highQulityC.includes(pubT)) {
        return '自然科学C';
    } else {
        return '无'
    }


};

// CSSCI、北大核心
Zotero.UpdateIFs.CSSCI_PKU = async function (item) {
    let url = item.getField("url");
    let resp = await Zotero.HTTP.request("GET", url);
    // Use DOMParser to parse text to HTML.
    // This DOMParser is from XPCOM.
    var parser = Components.classes["@mozilla.org/xmlextras/domparser;1"]
        .createInstance(Components.interfaces.nsIDOMParser);
    let html = parser.parseFromString(resp.responseText, "text/html");
    var cssci = html.querySelectorAll("a.type");
    if (cssci.length > 0) {
        var njuCore = Array.prototype.map.call(cssci, ele => ele.innerText).join(", ");
    } else {
        var njuCore = '';
    }
    return njuCore;


};
//   // CSSCI、EI 无法抓取 网页加密了
//   Zotero.UpdateIFs.CSSCI_EI = async function(detailURL){
//     try {
//         var pubTitle = item.getField('publicationTitle');
//         var url = 'https://s.wanfangdata.com.cn/magazine?q=' +
//                     encodeURIComponent(pubTitle);
//         var xPathJour = '//*[@class="title-area"]';
//         var resp = await Zotero.HTTP.request("GET", url);
//         var parser = new DOMParser();
//         var html = parser.parseFromString(
//             resp.responseText,
//             "text/html"
//         );
//        // return html;

//         var AllJour = Zotero.Utilities.xpath(html, xPathJour)[0].innerText;
//     }

//     catch (error){

//     }
//   };

// Localization (borrowed from ZotFile sourcecode)
// 提示语言本地化函数 Zotero.UpdateIFs.updateItem = async function(item) {

Zotero.UpdateIFs.ZUIFGetString = function (name, params) {
    var l10n = '';
    stringsBundle = Components.classes['@mozilla.org/intl/stringbundle;1']
        .getService(Components.interfaces.nsIStringBundleService)
        .createBundle('chrome://zoteroupdateifs/locale/zoteroupdateifs.properties');
    try {
        if (params !== undefined) {
            if (typeof params != 'object') {
                params = [params];
            }
            l10n = tringsBundle.formatStringFromName(name, params, params.length);
        }
        else {
            l10n = stringsBundle.GetStringFromName(name);
        }
    }
    catch (e) {
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
    if (collection) { var items_coll = collection.getChildItems(); }
    //Zotero.debug("**Jasminum selected item length: " + items.length);
    var showMenuItem = items.some((item) => Zotero.UpdateIFs.checkItem(item));  // 检查条目
    var showMenuColl = (collection == false); // 非正常文件夹，如我的出版物、重复条目、未分类条目、回收站，为false，此时返回值为true，隐藏菜单
    if (collection) { // 如果是正常分类才显示
        var showMenuColl = items_coll.some((item) => Zotero.UpdateIFs.checkItem(item));
    } else {
        var showMenuColl = false;
    } // 检查分类条目是否适合
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

            if ( //issn.search('-') != -1 && // 如果isn中有'-'
                Zotero.ItemTypes.getName(item.itemTypeID) == 'journalArticle' // 文献类型为期刊
            ) { return true }

        }

    }
};

// 生成空格，如果是中文是无空格，英文为空格
Zotero.UpdateIFs.whiteSpace = function () {
    var lanUI = Zotero.Prefs.get('intl.locale.requested', true); // 得到当前Zotero界面语言
    var whiteSpace = ' ';
    if (lanUI == 'zh-CN') { whiteSpace = '' };
    return whiteSpace;
};

// 右下角弹出函数
Zotero.UpdateIFs.showPopUP = function (alertInfo, status) {

    var progressWindow = new Zotero.ProgressWindow({ closeOnClick: true });
    progressWindow.changeHeadline(Zotero.UpdateIFs.ZUIFGetString(status));
    progressWindow.addDescription(alertInfo);
    progressWindow.show();
    progressWindow.startCloseTimer(4000);
};

if (typeof window !== 'undefined') {

    window.addEventListener('load', function (e) {
        Zotero.UpdateIFs.init();

    }, false);
}

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
            // add event listener for pop menu监听弹出菜单，执行隐藏函数
            doc.getElementById("menu_ToolsPopup").addEventListener(
                "popupshowing",
                Zotero.UpdateIFs.showToolboxMenu,
                false
            );

            // add event listener for pop menu
            // doc.getElementById("menu_ToolsPopup").addEventListener(
            //     "popupshowing",
            //     Zotero.UpdateIFs.test,
            //     false
            // );

            // // add event listener for pop menu
            // doc.getElementById("menu_Tools-updateifs-menu").addEventListener(
            //     "popupshowing",
            //     Zotero.UpdateIFs.showToolboxMenu,
            //     false
            // );
            // // add event listener for pop menu
            // doc.getElementById("menu_Tools-updateifs-menu-popup").addEventListener(
            //                     "popupshowing",
            //                     Zotero.UpdateIFs.showToolboxMenu,
            //                     false
            // );
        }
    },
    false
)

module.exports = Zotero.UpdateIFs;
