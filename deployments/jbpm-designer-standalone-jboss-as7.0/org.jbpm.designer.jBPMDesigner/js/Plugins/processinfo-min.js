if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.ProcessInfo=Clazz.extend({construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.View.showInfo,functionality:this.showInfo.bind(this),group:ORYX.I18N.View.infogroup,icon:ORYX.BASE_FILE_PATH+"images/information.png",description:ORYX.I18N.View.showInfoDesc,index:1,minShape:0,maxShape:0,isEnabled:function(){return true
}.bind(this)})
},showInfo:function(){window.alert("jBPM Designer Version: "+ORYX.VERSION)
}});