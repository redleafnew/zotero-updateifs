if (typeof Zotero === 'undefined') {
    Zotero = {};
}
Zotero.UpdateIFs = {};
// ScholarCitations 改为 UpdateIFs

// Preference managers

Zotero.UpdateIFs.getPref =  function(pref) {
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
Zotero.UpdateIFs.openPreferenceWindow = function(paneID, action) {
    var io = {pane: paneID, action: action};
    window.openDialog('chrome://zoteroupdateifs/content/options.xul',
        'updateifs-pref',
        'chrome,titlebar,toolbar,centerscreen' + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal', io
    );
};

Zotero.UpdateIFs.openUtilsWindow= function(paneID, action) {
    var io = {pane: paneID, action: action};
    window.openDialog('chrome://zoteroupdateifs/content/utils.xul',
        'updateifs-utils',
        'chrome,titlebar,toolbar,centerscreen' + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal', io
    );
};

// Controls for Tools menu end


// Startup - initialize plugin初始化

Zotero.UpdateIFs.init = function() {
    
    if (!Zotero.UpdateIFs) {
        var fileLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
            .getService(Components.interfaces.mozIJSSubScriptLoader);
        var scripts = ['zoteroupdateifs', 'options.js'];
        scripts.forEach(s => fileLoader.loadSubScript('chrome://zoteroupdateifs/content/scripts/' + s + '.js', {}, "UTF-8"));
    }

    // Register the callback in Zotero as an item observer
    var notifierID = Zotero.Notifier.registerObserver(
        Zotero.UpdateIFs.notifierCallback, ['item']);

    // Unregister callback when the window closes (important to avoid a memory leak)
    window.addEventListener('unload', function(e) {
        Zotero.Notifier.unregisterObserver(notifierID);
    }, false);

    // Zotero.UpdateIFs.initPref();

};

// 初始化设置
// Zotero.UpdateIFs.initPref = function() {
//     if (Zotero.UpdateIFs.getPref('add-update') === undefined) {
//         Zotero.UpdateIFs.setPref('add-update', false);
//     }
//     if (Zotero.UpdateIFs.getPref('ch-abbr') === undefined) {
//         Zotero.UpdateIFs.setPref('ch-abbr', false);
//     }
//     if (Zotero.UpdateIFs.getPref('en-abbr') === undefined) {
//         Zotero.UpdateIFs.setPref('en-abbr', false);
//     }
//     if (Zotero.UpdateIFs.getPref('pubtitle_issn') === undefined) {
//         Zotero.UpdateIFs.setPref('pubtitle_issn', 'pubtitle');
//     }
    
// };


Zotero.UpdateIFs.cleanExtra = function() {
    var items = Zotero.UpdateIFs.getSelectedItems();
    if (items == ''){ // 如果没有选中条目
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
                        
                        } catch (error){
                        // numFail = numFail + 1;
                    }
                }
            }
            var alertInfo = Zotero.UpdateIFs.ZUIFGetString("clean.finished");
            Zotero.UpdateIFs.showPopUP(alertInfo, 'finished');
        }
    }
};


// 处理作者
Zotero.UpdateIFs.addBoldStar = async function() {
    
var newName = Zotero.UpdateIFs.newNames();
// //英文替换
  var oldName = newName[0];
  var newFirstName = newName[1];
  var newLastName = newName[2];
  var newFieldMode = newName[3]; // 0: two-field, 1: one-field (with empty first name)
  var mergeedName = newName[4];
  var mergeedNameNew = newName[5];

var rn = 0; //计数替换条目个数
//await Zotero.DB.executeTransaction(async function () {
  
    items = Zotero.UpdateIFs.getSelectedItems();
        for (item of items) {
        let creators = item.getCreators();
        let newCreators = [];
        for (let creator of creators) {
        	if (`${creator.firstName} ${creator.lastName}`.trim() == oldName) {
        		creator.firstName = newFirstName;
        		creator.lastName = newLastName;
        		creator.fieldMode = newFieldMode;
                        rn ++;
        	}

            if (`${creator.lastName}`.trim() == mergeedName) { // 针对已经合并姓名的
                creator.firstName = '';
        		creator.lastName = mergeedNameNew;
        		creator.fieldMode = newFieldMode;
                        rn ++;
            }
        	newCreators.push(creator);

        }
        item.setCreators(newCreators);

        await item.save();

        }

//}); 
var lanUI = Zotero.Prefs.get('intl.locale.requested', true); // 得到当前Zotero界面语言
var whiteSpace = ' ';
if (lanUI == 'zh-CN') {whiteSpace = ''};
var rnInfo = rn > 1 ? 'author.changed.mul' : 'author.changed.sig';
var statusInfo = rn > 0 ? 'finished' : 'failed';
var alertInfo = rn + whiteSpace + Zotero.UpdateIFs.ZUIFGetString(rnInfo);
Zotero.UpdateIFs.showPopUP(alertInfo, statusInfo);
// return rn + " item(s) updated";
    
};


// 返回新的名字用以替换
Zotero.UpdateIFs.newNames = function() {
    var newName = [];
    var splitName = '';
    var oldName= '';
    var newFirstName= '';
    var newLastName= '';
    var reg =/[一-龟]/; // 匹配所有汉字
    var mergeedName ='';
    var mergeedNameNew ='';
    var alertInfo ='';
    
    var authorName = Zotero.Prefs.get('extensions.updateifs.author-name', true); // 得到设置的姓名
  

    if (authorName == ''){ // 如果作者为空时提示
        alertInfo = Zotero.UpdateIFs.ZUIFGetString("author.empty");
        Zotero.UpdateIFs.showPopUP(alertInfo, 'failed');
    } else if (!/\s/.test(authorName) ) {  //检测输入的姓名中是否有空格,无空格提示
        alertInfo = Zotero.UpdateIFs.ZUIFGetString("author.no.space");
        Zotero.UpdateIFs.showPopUP(alertInfo, 'failed');
    } else {  
        
        var splitName =  authorName.split(/\s/); // 用空格分为名和姓
        var firstName = splitName[1];
        var lastName = splitName[0];
        oldName = firstName + ' ' + lastName;
        // 检测姓名是否为中文
        if (reg.test(authorName)) { // 为真时匹配到中文
        var newFieldMode = 1;  // 1中文时为合并
        mergeedName = authorName.replace(/\s/, ''); // 中文姓名删除空格得到合并的姓名
        } else {
            newFieldMode = 0; // 0为拆分姓名，英文
            mergeedName = oldName; // 英文姓名与原姓名相同
        };


        var authorBold =  Zotero.Prefs.get('extensions.updateifs.bold', true); // 得到设置的姓名是否加粗
        var authorStar =  Zotero.Prefs.get('extensions.updateifs.star', true); // 得到设置的姓名是否加星
       
        var boldStar = '';
        if (authorBold && authorStar) {
            boldStar = 'ba';  // bold and add star加粗加星
            } else if (authorBold  && !authorStar) {
                boldStar = 'b';  // 仅加粗
            } else if (!authorBold && authorStar) {
                boldStar = 's';  // 仅加星
            } else if (!authorBold && !authorStar) {
                //boldStar = 'n';  // 不加粗也不加星
                var alertInfo = Zotero.UpdateIFs.ZUIFGetString("bold.or.star");
                Zotero.UpdateIFs.showPopUP(alertInfo, 'failed');
            }

        switch (boldStar) {
            case 'ba':  // 加粗加星
                            
                mergeedNameNew = '<b>' + mergeedName + '*</b>';
                newFirstName = '<b>' + firstName + '*</b>';
                newLastName = '<b>' + lastName  + '</b>';
                if (reg.test(authorName)) { // 中文姓名
                    newFirstName = "";
                    newLastName = '<b>' + lastName + firstName +'*</b>';
                };
                break;
            case 'b': // 仅加粗
            mergeedNameNew = '<b>' + mergeedName + '</b>'; 
                newFirstName = '<b>' + firstName + '</b>';
                newLastName = '<b>' + lastName  + '</b>';
                if (reg.test(authorName)) { // 中文姓名
                    newFirstName = "";
                    newLastName = '<b>' + lastName + firstName +'</b>';
                };
                break;
            case 's':  // 加粗加星
                mergeedNameNew = mergeedName + '*'; 
                newFirstName =  firstName + '*';
                newLastName = lastName;
                if (reg.test(authorName)) { // 中文姓名
                    newFirstName = "";
                    newLastName = lastName + firstName +'*';
                };
                break;
            case 'n':
                //var alertInfo = Zotero.UpdateIFs.ZUIFGetString("bold.or.star");
                //Zotero.UpdateIFs.showPopUP(alertInfo, 'failed');
                break;
         
        }
        newName.push(oldName, newFirstName, newLastName, newFieldMode, mergeedName, mergeedNameNew)
        return  newName;

    }

};

// 清除加粗
Zotero.UpdateIFs.cleanBold = async function() {
    var rn = 0;
    var  items = Zotero.UpdateIFs.getSelectedItems();
        for (item of items) {
        let creators = item.getCreators();
        let newCreators = [];
       
        for (creator of creators) {
        	if (/<b>/.test(creator.firstName) || /<b>/.test(creator.lastName)) {  // 是否包含<b>
        		
        		creator.firstName = creator.firstName.replace(/<b>/g, '').replace(/<\/b>/g, '');
        		creator.lastName = creator.lastName.replace(/<b>/g, '').replace(/<\/b>/g, '');
        		creator.fieldMode = creator.fieldMode;
                rn ++;
        	 }
        	newCreators.push(creator);

             }
        item.setCreators(newCreators);

        await item.save();

        }
        var lanUI = Zotero.Prefs.get('intl.locale.requested', true); // 得到当前Zotero界面语言
        var whiteSpace = ' ';
        if (lanUI == 'zh-CN') {whiteSpace = ''};
        var rnInfo = rn > 1 ? 'author.changed.mul' : 'author.changed.sig';
        var statusInfo = rn > 0 ? 'finished' : 'failed';
        var alertInfo = rn + whiteSpace + Zotero.UpdateIFs.ZUIFGetString(rnInfo);
        Zotero.UpdateIFs.showPopUP(alertInfo, statusInfo);

    };



// 清除加星
Zotero.UpdateIFs.cleanStar = async function() {
    var rn = 0;
    var  items = Zotero.UpdateIFs.getSelectedItems();
        for (item of items) {
        let creators = item.getCreators();
        let newCreators = [];
       
        for (creator of creators) {
        	if (/\*/.test(creator.firstName) || /\*/.test(creator.lastName)) {
        		
        		creator.firstName = creator.firstName.replace(/\*/g, '');
        		creator.lastName = creator.lastName.replace(/\*/g, '');
        		creator.fieldMode = creator.fieldMode;
                        rn ++;
        	 }
        	newCreators.push(creator);

             }
        item.setCreators(newCreators);

        await item.save();

        }
        var lanUI = Zotero.Prefs.get('intl.locale.requested', true); // 得到当前Zotero界面语言
        var whiteSpace = ' ';
        if (lanUI == 'zh-CN') {whiteSpace = ''};
        var rnInfo = rn > 1 ? 'author.changed.mul' : 'author.changed.sig';
        var statusInfo = rn > 0 ? 'finished' : 'failed';
        var alertInfo = rn + whiteSpace + Zotero.UpdateIFs.ZUIFGetString(rnInfo);
        Zotero.UpdateIFs.showPopUP(alertInfo, statusInfo);


    };

// 清除加粗加星
Zotero.UpdateIFs.cleanBoldAndStar = async function() {
    Zotero.UpdateIFs.cleanStar();
    Zotero.UpdateIFs.cleanBold();


};

Zotero.UpdateIFs.getAuthorName = function() {

    var auName = document.getElementById('id-updateifs-textb-author-name');
    Zotero.Prefs.set('extensions.updateifs.author-name', auName, true);
    

};

// 显示配置目录
Zotero.UpdateIFs.showProfileDir= function() {
    var profileDir = Zotero.Profile.dir;  // 配置目录
    
    var alertInfo = Zotero.UpdateIFs.ZUIFGetString('show.profile.dir') + ' ' + profileDir;
    Zotero.UpdateIFs.showPopUP(alertInfo,'finished');

    };


// 显示数据目录
Zotero.UpdateIFs.showDataDir= function() {
    var dataDir = Zotero.DataDirectory.dir;// 数据目录
    var alertInfo = Zotero.UpdateIFs.ZUIFGetString('show.data.dir') + ' ' + dataDir;
    Zotero.UpdateIFs.showPopUP(alertInfo, 'finished');

    };




// 添加条目时自动添加影响因子及分区
Zotero.UpdateIFs.notifierCallback = {
    notify: function(event, type, ids, extraData) {
        var addedItems = Zotero.Items.get(ids);
        var addUppdate = Zotero.Prefs.get('extensions.updateifs.add-update', true); // 是否在添加条目时更新
        for (let item of addedItems) { 
            if (event == 'add' && addUppdate && !item.isNote() && 
            item.isRegularItem() && !item.isCollection()) {
                    Zotero.UpdateIFs.updateSelectedItems();
                }
            }
    }
};



// 更新分类
Zotero.UpdateIFs.updateSelectedColl = async function( ){
    var collection = ZoteroPane.getSelectedCollection();
    var items = collection.getChildItems();
    Zotero.UpdateIFs.updateSelectedItem(items); // 调用更新所选条目函数
    await collection.saveTx();
};

// 更新所选条目
Zotero.UpdateIFs.updateSelectedItems= async function( ){
    var items = Zotero.UpdateIFs.getSelectedItems();
    Zotero.UpdateIFs.updateSelectedItem(items); // 调用更新所选条目函数
};


// 得到所选条目
Zotero.UpdateIFs.getSelectedItems = function( ){
    var zoteroPane = Zotero.getActiveZoteroPane();
    var items = zoteroPane.getSelectedItems();
    return items; // 
};

// 更新期刊影响因子
Zotero.UpdateIFs.updateSelectedItem = async function(items) {
    var numSuccess = 0;
    var numFail = 0;
    var lanUI = Zotero.Prefs.get('intl.locale.requested', true); // 得到当前Zotero界面语言
    var whiteSpace = ' ';
    if (lanUI == 'zh-CN') {whiteSpace = ''};

    for (let item of items) { 

        if (item.isRegularItem() && !item.isCollection()) {
            try {
               
                var ifs = await Zotero.UpdateIFs.getIFs(item);
                var if5Year = ifs[0];
                var ifCurrent = ifs[1];
                var detailURL = ifs[2];
                var jourAbb = ifs[3];
                var old = item.getField('extra')

                
               	var ifc ='影响因子: ';
	            var if5 ='\n5年影响因子: ';

                var dig = '(([1-9][\d]{0,6}|0)(\.[\d]{1,5})?)';
               

                var ifsc = ifc + ifCurrent; // 新影响因子
                var ifs5 = if5 + if5Year; // 新5年影响因子
	            var ifs = ifsc + ifs5;
                var patt = /影响因子: (([1-9][\d]{0,6}|0)(\.[\d]{1,5})?)\n5年影响因子: (([1-9][\d]{0,6}|0)(\.[\d]{1,5})?)/;   // 匹配以前影响因子的正则
                var enAbbr  = Zotero.Prefs.get('extensions.updateifs.en-abbr', true) // 设置中英文期刊缩写选项
                if (enAbbr) { 
                    item.setField('journalAbbreviation', jourAbb); // 设置期刊缩写
                }
                if (old.length == 0 ) {   // 如果内容为空
                    item.setField('extra', ifs);
            
                 } else if (old.search(patt) != -1) { // 如果以前有影响因子则替换
                    item.setField(
                        'extra',
                        old.replace(patt, ifs));

                } else {   // 以前没有，且内容不为空
 		            item.setField('extra', ifs + '\n' + old);
                   // item.setField('extra', ifsc + ifsc5 + '\n' + old);
                }

                // var  detailURL = await Zotero.UpdateIFs.generateItemDetailUrl(url);
                Zotero.UpdateIFs.setItemJCR(detailURL, item);  // 设置JCR及中科院分区

                item.save();
                numSuccess ++;    
                } catch (error){
                    numFail ++;
                }
                
                // 得到中文期刊信息 与前面英文相比后缀加CN
                try {
                    var pubTitle = item.getField('publicationTitle');
                    var urlCN = 'http://sci.justscience.cn/details.html?sci=0&q=' + 
                                encodeURIComponent(pubTitle); // 中文期刊详情查询地址
                    var respCN = await Zotero.HTTP.request("GET", urlCN);
                    var parserCN = new DOMParser();
                    var htmlCN = parserCN.parseFromString(
                        respCN.responseText,
                        "text/html"
                    );
                    var regInfo ='\n\t(.+)\n\t(.+)\n\t(.+)\n\t(.+)\n\t(.+)\n\t(.+)\n\t(.+)\n'; // 匹配期刊具体信息
                    
                    var old = item.getField('extra');
                    var xPathCN = '//div[2]/div[1]/table[2]/tbody/tr[2]/td['; // 收录情况2-4
                    var xPathCNIF1 = '//div[2]/div[1]/table[3]/tbody/tr[5]/td[2]'; // 复合影响因子
                    var xPathCNIF2 = '//div[2]/div[1]/table[3]/tbody/tr[6]/td[2]'; // 综合影响因子
                    var searchReg1 = /×/g; // 替换×
                    var searchReg2 = /√/g; // 替换√
                    var jourCNIF1 = Zotero.Utilities.xpath(htmlCN, xPathCNIF1)[0].innerText // 复合影响因子
                    var jourCNIF2 = Zotero.Utilities.xpath(htmlCN, xPathCNIF2)[0].innerText // 综合影响因子
                    var jourCN1 = Zotero.Utilities.xpath(htmlCN, xPathCN + '2]')[0].innerText. // CSCD
                                replace(searchReg1, '否').
                                replace(searchReg2, '是');

                    var jourCN2 = Zotero.Utilities.xpath(htmlCN, xPathCN + '3]')[0].innerText. // 北大核心
                                replace(searchReg1, '否').
                                replace(searchReg2, '是');

                    var jourCN3 = Zotero.Utilities.xpath(htmlCN, xPathCN + '4]')[0].innerText. // 科技核心
                                replace(searchReg1, '否').
                                replace(searchReg2, '是');


                    
                    var jourCNInfo = 'CSCD: ' +  jourCN1 + ' ' + '北大核心: '  + jourCN2 + ' ' +  '科技核心: ' + jourCN3 + '\n\n' + 
                                    '复合影响因子: ' + jourCNIF1 + '\n' 
                                    +'综合影响因子: ' + jourCNIF2 + '\n';  // 期刊信息组合
                    
                   
                    var pattCN = /CSCD: (.+)北大核心: (.+)科技核心: (.+)\n\n复合影响因子: (.*)\n综合影响因子: (.*)\n/g;   // 匹配以前影响因子的正则
    
                    if (old.length == 0 ) {   // 如果内容为空
                        item.setField('extra', jourCNInfo);
                   
                     } else if (old.search(pattCN) != -1) { // 如果以前有影响因子则替换
                        item.setField(
                            'extra',
                            old.replace(pattCN, jourCNInfo));
                  
                    } else {   // 以前没有，且内容不为空
                         item.setField('extra', jourCNInfo + '\n' + old);
                       // item.setField('extra', ifsc + ifsc5 + '\n' + old);
                    }
                    var chAbbr  = Zotero.Prefs.get('extensions.updateifs.ch-abbr', true) // 设置中中文期刊缩写选项
                    if (chAbbr) { // 如果设置中中文期刊缩写为true时
                        item.setField('journalAbbreviation', pubTitle); 
                        
                    }
                    item.save();  

                    numSuccess ++;    
                    } catch (error){
                        numFail ++;
                    }
                    var jourAbbrOrigin = item.getField('journalAbbreviation');  // 得到原期刊缩写
                    var pubTitleOrin = item.getField('publicationTitle'); // 得到期刊名称
                    var enAbbr  = Zotero.Prefs.get('extensions.updateifs.en-abbr', true) // 设置中英文期刊缩写选项
                    if (jourAbbrOrigin == ''  &&  enAbbr) { // 如果原期刊缩写为空且缩写选择为true
                       
                        item.setField('journalAbbreviation', pubTitleOrin); //替换为期刊名称
                        item.save();
                    }   
        }
        
        
        
    }
    var successInfo = numSuccess > 1 ? 'success.mul' : 'success.sig';
    var alertInfo = numSuccess + whiteSpace + Zotero.UpdateIFs.ZUIFGetString(successInfo);
    Zotero.UpdateIFs.showPopUP(alertInfo, 'finished');
   // alert (numSuccess + whiteSpace + Zotero.UpdateIFs.ZUIFGetString('success'));
};




// 得到影响因子及详细网址函数 
Zotero.UpdateIFs.getIFs = async function (item){
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

        var xPathJour ='//div[2]/div[1]/table[2]/tbody'; // 为得到期刊名称
        // var xPathJour = '//td[contains(text(),'Annu')]/..'
    
        var AllJour = Zotero.Utilities.xpath(html, xPathJour)[0].innerText;
        var publicationTitle = item.getField('publicationTitle'); 
        var reg = '\n\t(.*)\n\t' + publicationTitle + // 分组1序号
                                '\n\t(.*)\n\t(.*)'+ // 分组3 ISSN，分组4文章数
                                '\n\t(.*)\n\t(.*)'+ //分组5 5年平均分， 分组6 非自引分
                                '\n\t(.*)\n\t(.*)'; // 分组7 影响因子
        var patt = new RegExp(reg, 'i'); // 
        var jour = AllJour.match(patt);  

        var if5Year = jour[5];  
        var ifCurrent = jour[7];  
        
        
        var xPathUrl = '//div[2]/div[1]/table[2]/tbody//@href'; // 为得到详情URL
        var index = jour[1]-1;
        var detailURLPre = Zotero.Utilities.xpath(html, xPathUrl);  
        var detailURL = 'http://sci.justscience.cn/' + detailURLPre[index].value;
        var regAbbr = '\n\t' + publicationTitle + '\n.(.*)';  // 用于得到期刊缩写
        var abbr = AllJour.match(regAbbr)[1];  // 匹配得到期刊缩写

        ifs.push(if5Year, ifCurrent, detailURL, abbr)        
        return ifs;
    } catch (error){
        // numFail = numFail + 1;
    }
         

    try { // 期刊名字中有&的情况
            var html = await Zotero.UpdateIFs.getHtml(item);
         
            var xPathJour ='//div[2]/div[1]/table[2]/tbody'; // 为得到期刊名称
        
            var AllJour = Zotero.Utilities.xpath(html, xPathJour)[0].innerText;
            var publicationTitle = item.getField('publicationTitle').
                        replace('&', 'and').
                        replace(' - ', '-'); 
            var reg = '\n\t(.*)\n\t' + publicationTitle + // 分组1序号
                                    '\n\t(.*)\n\t(.*)'+ // 分组3 ISSN，分组4文章数
                                    '\n\t(.*)\n\t(.*)'+ //分组5 5年平均分， 分组6 非自引分
                                    '\n\t(.*)\n\t(.*)'; // 分组7 影响因子
            var patt = new RegExp(reg, 'i'); // 
            var jour = AllJour.match(patt);  
    
            var if5Year = jour[5];  
            var ifCurrent = jour[7];  
            
             
            var xPathUrl = '//div[2]/div[1]/table[2]/tbody//@href'; // 为得到详情URL
            var index = jour[1]-1;
            var detailURLPre = Zotero.Utilities.xpath(html, xPathUrl);  
            var detailURL = 'http://sci.justscience.cn/' + detailURLPre[index].value;
            var regAbbr = '\n\t' + publicationTitle + '\n.(.*)';  // 用于得到期刊缩写
            var abbr = AllJour.match(regAbbr)[1];  // 匹配得到期刊缩写

            ifs.push(if5Year, ifCurrent, detailURL, abbr)  
            // ifs.push(if5Year, ifCurrent, detailURL)        
            return ifs; 
            } catch (error){
                // numFail = numFail + 1;
            }
            
        try { // 更名或剔除情况
                var html = await Zotero.UpdateIFs.getHtml(item);
             
                var xPathJour ='//div[2]/div[1]/table[2]/tbody'; // 为得到期刊名称
            
                var AllJour = Zotero.Utilities.xpath(html, xPathJour)[0].innerText;
                var publicationTitle = item.getField('publicationTitle').
                            replace('&', 'and').
                            replace(' - ', '-'); 
                var reg = '\n\t(.*)\n\t' + publicationTitle + '(更名\/剔除)(.*)'+ // 分组1序号
                                        '\n\t(.*)\n\t(.*)'+ // 分组7 ISSN，分组8文章数
                                        '\n\t(.*)\n\t(.*)'+ //分组7 5年平均分， 分组6 非自引分
                                        '\n\t(.*)\n\t(.*)'; // 分组9 影响因子
                var patt = new RegExp(reg, 'i'); // 
                var jour = AllJour.match(patt);  
        
                var if5Year = jour[7];  
                var ifCurrent = jour[9];  
                
                 
                var xPathUrl = '//div[2]/div[1]/table[2]/tbody//@href'; // 为得到详情URL
                var index = jour[1]-1;
                var detailURLPre = Zotero.Utilities.xpath(html, xPathUrl);  
                var detailURL = 'http://sci.justscience.cn/' + detailURLPre[index].value;
                var regAbbr = '\n\t' +  publicationTitle + '(更名\/剔除)\n.(.*)';// 用于得到期刊缩写
                //var regAbbr = /\t{2}\n.*\n.*\n.(.*)/;  
                var abbr = AllJour.match(regAbbr)[2];  // 匹配得到期刊缩写

                ifs.push(if5Year, ifCurrent, detailURL, abbr);        
                return ifs;   
                } catch (error){
                    // numFail = numFail + 1;
                }


 };


 // 根据期刊名称，得到html，用于得到issn
 Zotero.UpdateIFs.getHtml = async function (item) {
    try {
        var pubTitle = item.getField('publicationTitle');
        var url = 'http://sci.justscience.cn/index.php?q=' + 
                    encodeURIComponent(pubTitle) + '&sci=1'; 

        var resp = await Zotero.HTTP.request("GET", url);
        var parser = new DOMParser();
        var html = parser.parseFromString(
            resp.responseText,
            "text/html"
        );  
        return html;
    }

    catch (error){

    }
    

};

// 设置JCR信息
Zotero.UpdateIFs.setItemJCR = async function (detailURL, item) {
    try {
        var JCR = await Zotero.UpdateIFs.generateJCR (detailURL);  // 得到JCR
        var JCRInfo = 'JCR: ' + JCR[0] + '\n' + '中科院大类分区: '+ JCR[1] + '\n' +
                        '中科院小类分区: ' + JCR[2].replace(/区/g, '区 ') + '\n';
        var pattJCR = /JCR:(.*)\n(.*)\n(.*)\n/;
        var old = item.getField('extra');
        if (old.length == 0 ) {   // 如果内容为空
                            item.setField('extra', JCRInfo);
            } else if (old.search(pattJCR) != -1) { // 如果以前有影响因子则替换
                item.setField(
                    'extra',
                    old.replace(pattJCR, JCRInfo));
                    
            } else {   // 以前没有，且内容不为空
                item.setField('extra', JCRInfo + '\n' + old);
                        
            }
            item.save();
    } catch (error){
        //continue;
        }

};



// 得到JCR分区
    Zotero.UpdateIFs.generateJCR = async function(detailURL){
        var JCR = [];
        try {   
          var resp = await Zotero.HTTP.request("GET", detailURL);
          var parser = new DOMParser();
          var html = parser.parseFromString(
              resp.responseText,
              "text/html"
          );
  
     
          var xPath = '//div[2]/div[1]/table[3]/tbody';
        //   var pattJCR = /JCR分区\n\t(.*)\n(\s*)(.+\n\s*(.+\n)\s(.+)\n\s*)大类\n\s(.*)\n\s*小类\n\s(.*)\n/;
          var pattJCR = /JCR分区(.*)\n{3}\t.*\n{3}\t\n.\t\n.*\n.\n.*\n.*\n{3}.大类\n.(.*)\n{3}.小类\n.(.*)/; // 20220222 修改正则匹配
          var jourJCR = Zotero.Utilities.xpath(html, xPath)[0].innerText;  
          
          var getJCR = jourJCR.match(pattJCR);  
        //   JCR.push(getJCR[1], getJCR[6], getJCR[7]);
        JCR.push(getJCR[1], getJCR[2], getJCR[3]);
          return JCR; 
      } catch (error){
      //continue;
      }
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
            
            if ( //issn.search('-') != -1 && // 如果isn中有'-'
                Zotero.ItemTypes.getName(item.itemTypeID) ==  'journalArticle' // 文献类型为期刊
            ) {return true}

        }  
        
    }      
};

// 右下角弹出函数 
Zotero.UpdateIFs.showPopUP = function (alertInfo, status) {  

    var progressWindow = new Zotero.ProgressWindow({closeOnClick:true});
    progressWindow.changeHeadline(Zotero.UpdateIFs.ZUIFGetString(status));
    progressWindow.addDescription(alertInfo);
    progressWindow.show();
    progressWindow.startCloseTimer(4000);
};

if (typeof window !== 'undefined') {
    window.addEventListener('load', function(e) {
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
            }
        },
        false
    )

module.exports = Zotero.UpdateIFs;
