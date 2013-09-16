if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.LocalHistory=Clazz.extend({construct:function(a){this.facade=a;
this.historyEntry;
this.historyProxy;
this.historyStore;
this.storage;
this.fail;
this.uid;
this.historyInterval;
if(this.haveSupportForLocalHistory()){this.setupAndLoadHistoryData();
this.startStoring()
}this.facade.offer({name:"Display Local History",functionality:this.displayLocalHistory.bind(this),group:"localstorage",icon:ORYX.BASE_FILE_PATH+"images/view.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/localhistory.png",description:"Display Local History",index:1,minShape:0,maxShape:0,isEnabled:function(){return ORYX.LOCAL_HISTORY_ENABLED
}.bind(this)});
this.facade.offer({name:"Clear Local History",functionality:this.clearLocalHistory.bind(this),group:"localstorage",icon:ORYX.BASE_FILE_PATH+"images/clear.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/localhistory.png",description:"Clear Local History",index:2,minShape:0,maxShape:0,isEnabled:function(){return ORYX.LOCAL_HISTORY_ENABLED
}.bind(this)});
this.facade.offer({name:"Enable Local History",functionality:this.enableLocalHistory.bind(this),group:"localstorage",icon:ORYX.BASE_FILE_PATH+"images/enable.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/localhistory.png",description:"Enable Local History",index:3,minShape:0,maxShape:0,isEnabled:function(){return !ORYX.LOCAL_HISTORY_ENABLED
}.bind(this)});
this.facade.offer({name:"Disable Local History",functionality:this.disableLocalHistory.bind(this),group:"localstorage",icon:ORYX.BASE_FILE_PATH+"images/disable.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/localhistory.png",description:"Disable Local History",index:4,minShape:0,maxShape:0,isEnabled:function(){return ORYX.LOCAL_HISTORY_ENABLED
}.bind(this)});
window.onbeforeunload=function(){this.stopStoring()
}.bind(this)
},displayLocalHistory:function(){var a=Ext.id();
var c=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:this.historyStore,id:a,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"pid",header:"Id",width:100,dataIndex:"processid",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pname",header:"Name",width:100,dataIndex:"processname",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"ppkg",header:"Package",width:100,dataIndex:"processpkg",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pver",header:"Version",width:100,dataIndex:"processversion",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"tms",header:"Time Stamp",width:200,dataIndex:"timestamp",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pim",header:"Process Image",width:150,dataIndex:"svg",renderer:function(e){if(e&&e.length>0){return'<center><img src="'+ORYX.BASE_FILE_PATH+'images/page_white_picture.png" onclick="resetSVGView(\''+e+"');new SVGViewer({title: 'Local History Process Image', width: '650', height: '450', autoScroll: true, fixedcenter: true, src: '',hideAction: 'close'}).show();\" alt=\"Click to view Process Image\"/></center>"
}else{return"<center>Process image not available.</center>"
}return""
}}])});
var d=new Ext.Panel({id:"localHistoryPanel",title:'<center>Select Process Id and click "Restore" to restore.</center>',layout:"column",items:[c],layoutConfig:{columns:1},defaults:{columnWidth:1}});
var b=new Ext.Window({layout:"anchor",autoCreate:true,title:"Local History View",height:350,width:780,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){b.hide()
}.bind(this)}],items:[d],listeners:{hide:function(){b.destroy()
}.bind(this)},buttons:[{text:"Restore",handler:function(){if(c.getSelectionModel().getSelectedCell()!=null){var e=c.getSelectionModel().getSelectedCell()[0];
var f=this.historyStore.getAt(e).data.json;
if(f&&f.length>0){f=Base64.decode(f);
this.clearCanvas();
var g=f.evalJSON();
this.facade.importJSON(g)
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Invalid Process info. Unable to restore.",title:""})
}b.hide()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:"Please select a process id.",title:""})
}}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){b.hide()
}.bind(this)}]});
b.show();
c.render();
c.focus(false,100)
},setupAndLoadHistoryData:function(){this.historyEntry=Ext.data.Record.create([{name:"processid"},{name:"processname"},{name:"processpkg"},{name:"processversion"},{name:"timestamp"},{name:"json"},{name:"svg"}]);
this.historyProxy=new Ext.data.MemoryProxy({root:[]});
this.historyStore=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},this.historyEntry),proxy:this.historyProxy});
this.historyStore.load();
if(this.storage){var c=ORYX.EDITOR.getSerializedJSON();
var g=jsonPath(c.evalJSON(),"$.properties.id");
var f=jsonPath(c.evalJSON(),"$.properties.package");
var b=this.storage.getItem(f+"_"+g);
if(b){var e=b.evalJSON();
for(var a=0;
a<e.length;
a++){var d=e[a];
this.addToStore(d)
}}}},addToStore:function(a){this.historyStore.insert(0,new this.historyEntry({processid:a.processid,processname:a.processname,processpkg:a.processpkg,processversion:a.processversion,timestamp:new Date(a.timestamp).format("d.m.Y H:i:s"),json:a.json,svg:a.svg}));
this.historyStore.commitChanges()
},clearLocalHistory:function(){this.historyStore.removeAll();
this.historyStore.commitChanges();
var a=ORYX.EDITOR.getSerializedJSON();
var c=jsonPath(a.evalJSON(),"$.properties.id");
var b=jsonPath(a.evalJSON(),"$.properties.package");
this.storage.removeItem(b+"_"+c);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:"Local History has been cleared.",title:""})
},enableLocalHistory:function(){this.setupAndLoadHistoryData()
},haveSupportForLocalHistory:function(){try{this.uid=new Date;
(this.storage=window.localStorage).setItem(this.uid,this.uid);
this.fail=this.storage.getItem(this.uid)!=this.uid;
this.storage.removeItem(this.uid);
this.fail&&(this.storage=false)
}catch(a){}return this.storage&&ORYX.LOCAL_HISTORY_ENABLED
},addToHistory:function(){var processJSON=ORYX.EDITOR.getSerializedJSON();
var formattedSvgDOM=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
var processName=jsonPath(processJSON.evalJSON(),"$.properties.processn");
var processPackage=jsonPath(processJSON.evalJSON(),"$.properties.package");
var processId=jsonPath(processJSON.evalJSON(),"$.properties.id");
var processVersion=jsonPath(processJSON.evalJSON(),"$.properties.version");
var item={processid:processId,processname:processName,processpkg:processPackage,processversion:processVersion,timestamp:new Date().getTime(),json:Base64.encode(processJSON),svg:Base64.encode(formattedSvgDOM)};
try{var processHistory=this.storage.getItem(processPackage+"_"+processId);
if(processHistory){var pobject=processHistory.evalJSON();
pobject.push(item);
this.storage.setItem(processPackage+"_"+processId,eval(JSON.stringify(pobject)))
}else{var addArray=new Array();
addArray.push(item);
this.storage.setItem(processPackage+"_"+processId,eval(JSON.stringify(addArray)))
}this.addToStore(item)
}catch(e){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:"Local History quota exceeded. Clearing local history.",title:""});
this.clearLocalHistory()
}},clearCanvas:function(){ORYX.EDITOR.getCanvas().nodes.each(function(a){ORYX.EDITOR.deleteShape(a)
}.bind(this));
ORYX.EDITOR.getCanvas().edges.each(function(a){ORYX.EDITOR.deleteShape(a)
}.bind(this))
},disableLocalHistory:function(){ORYX.LOCAL_HISTORY_ENABLED=false;
this.stopStoring();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:"Local History has been disabled.",title:""})
},enableLocalHistory:function(){ORYX.LOCAL_HISTORY_ENABLED=true;
this.setupAndLoadHistoryData();
this.startStoring();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:"Local History has been enabled.",title:""})
},startStoring:function(){this.historyInterval=setInterval(this.addToHistory.bind(this),ORYX.LOCAL_HISTORY_TIMEOUT)
},stopStoring:function(){clearInterval(this.historyInterval)
}});
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(c){var a="";
var k,h,f,j,g,e,d;
var b=0;
c=Base64._utf8_encode(c);
while(b<c.length){k=c.charCodeAt(b++);
h=c.charCodeAt(b++);
f=c.charCodeAt(b++);
j=k>>2;
g=((k&3)<<4)|(h>>4);
e=((h&15)<<2)|(f>>6);
d=f&63;
if(isNaN(h)){e=d=64
}else{if(isNaN(f)){d=64
}}a=a+this._keyStr.charAt(j)+this._keyStr.charAt(g)+this._keyStr.charAt(e)+this._keyStr.charAt(d)
}return a
},decode:function(c){var a="";
var k,h,f;
var j,g,e,d;
var b=0;
c=c.replace(/[^A-Za-z0-9\+\/\=]/g,"");
while(b<c.length){j=this._keyStr.indexOf(c.charAt(b++));
g=this._keyStr.indexOf(c.charAt(b++));
e=this._keyStr.indexOf(c.charAt(b++));
d=this._keyStr.indexOf(c.charAt(b++));
k=(j<<2)|(g>>4);
h=((g&15)<<4)|(e>>2);
f=((e&3)<<6)|d;
a=a+String.fromCharCode(k);
if(e!=64){a=a+String.fromCharCode(h)
}if(d!=64){a=a+String.fromCharCode(f)
}}a=Base64._utf8_decode(a);
return a
},_utf8_encode:function(b){b=b.replace(/\r\n/g,"\n");
var a="";
for(var e=0;
e<b.length;
e++){var d=b.charCodeAt(e);
if(d<128){a+=String.fromCharCode(d)
}else{if((d>127)&&(d<2048)){a+=String.fromCharCode((d>>6)|192);
a+=String.fromCharCode((d&63)|128)
}else{a+=String.fromCharCode((d>>12)|224);
a+=String.fromCharCode(((d>>6)&63)|128);
a+=String.fromCharCode((d&63)|128)
}}}return a
},_utf8_decode:function(a){var b="";
var d=0;
var e=c1=c2=0;
while(d<a.length){e=a.charCodeAt(d);
if(e<128){b+=String.fromCharCode(e);
d++
}else{if((e>191)&&(e<224)){c2=a.charCodeAt(d+1);
b+=String.fromCharCode(((e&31)<<6)|(c2&63));
d+=2
}else{c2=a.charCodeAt(d+1);
c3=a.charCodeAt(d+2);
b+=String.fromCharCode(((e&15)<<12)|((c2&63)<<6)|(c3&63));
d+=3
}}}return b
}};
function resetSVGView(a){ORYX.EDITOR.localStorageSVG=Base64.decode(a)
};