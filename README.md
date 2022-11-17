**注意：唯问网站最近更新了，插件当前不可用了，后期排版还可能有变化，等网站稳定后再更新，现在可以用[easyScholar版](https://github.com/redleafnew/zotero-updateifsE)。**
json
   //着色代码
```
html
   //着色代码
```
```js
   //着色代码
```
```css
   //着色代码
```
//等
# Zotero Update IFs

使用[easyScholar](https://easyscholar.cc)数据接口版本可见：<https://github.com/redleafnew/zotero-updateifsE>。

1. 使用期刊名称从`唯问`(<http://sci.justscience.cn/>)更新期刊英文期刊的`JCR分区`、`中科院分区`、`影响因子`和`5年影响因子`，对于中文期刊更新是否`CSCD收录`、`北大核心`、`科技核心`、`复合影响因子`、`综合影响因子`。插件主体来源于`Zotero Scholar Citations`(<https://github.com/beloglazov/zotero-scholar-citations>)，获取核心期刊信息部分代码来源于`茉莉花`（<https://github.com/l0o0/jasminum/>），在此表示感谢。插件安装后在分类及条目上右击会出现`从唯问更新期刊信息`，点击即可从`唯问`(<http://sci.justscience.cn/>)获取`JCR分区`、`中科院分区`、`影响因子`和`5年影响因子`及中文期刊更新是否南`南农大核心期刊`、`南农大高质量期刊（仅含食品科学与工程）`、`CSCD收录`、`北大/南大核心`、`科技核心`、`复合影响因子`、`综合影响因子`，并分别写入到`档案`、`存档位置`、`馆藏目录`、`索书号`、`版权`字段（可进行设置是否显示和存贮位置），如果没有获取到数据，请核实该期刊有无被`SCI`索引或直接访问`唯问`(<http://sci.justscience.cn/>)查看。

2. 使用期刊名称从`唯问`(<http://sci.justscience.cn/>)更新期刊英文期刊的缩写，写入到`刊名缩写` （需要在`工具`-`更新期刊信息设置...`中进行相关选项设置）。

3. 清除`其它`字段内容（`工具`-`清除其它内容...`）。

4. 给作者加粗、加星、清除加粗、清除加星；将文献题目改为首字母大写；更改期刊题目；更改期刊题目大小写；作者姓名改为词首字母大写；交换作者姓和名；显示配置目录，显示数据目录等小工具（`工具`-`工具箱`）。

# 安装方法

从<https://github.com/redleafnew/zotero-updateifs/releases>下载xpi，然后在Zotero或JurisM中通过Tools-Addons-Install Add-on From File安装。



1. Update `JCR Quartile`, `CAS Quartile`, `impact factor` and `5 year impact factor` using name of the journal from `Justscience` (<http://sci.justscience.cn/>). The framework of the present plugin is from `Zotero Scholar Citations`(<https://github.com/beloglazov/zotero-scholar-citations>). A context menu `Update Journal Infomation from Justscience` appears, the  `JCR Quartile`, `CAS Quartile`, `impact factor` and `5 year impact factor` will be fetched from `Justscience` (<http://sci.justscience.cn/>) and stored into the `Archive`, `Loc. in Archive`, `Library Catalog`, `Call Number`, `Rights` field (you can set show or not and the target field) if it doesn't work, please check if the journal is indexed  or browse `Justscience` (<http://sci.justscience.cn/>) for more information.

2. Get journal abbreviation using name of the journal from `Justscience` (<http://sci.justscience.cn/>), set as `Journal Abbr` (Use `Tools`-`Update IFs Preferences...` to set the options).

3. Remove `Extra` field content (`Tools`-`Clean Extra Field...`).

4. Bold, asterisk, remove bold, remove asterisk for author name; Change the item(s) title to sentence case; Change publication title; Change publication title case; Author name to title case; Swap author name first and last name; Show the profile and data directory (Use `Tools`-`Toolbox`).

# Installation
Download xpi from <https://github.com/redleafnew/zotero-updateifs/releases>, and click Tools-Addons-Install Add-on From File in Zotero or JurisM to install the extension. 

# License

Copyright (C) 2022 Minyi Han

Distributed under the Mozilla Public License (MPL).
