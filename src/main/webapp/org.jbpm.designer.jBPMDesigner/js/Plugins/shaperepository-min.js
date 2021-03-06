if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeRepository={facade:undefined,construct:function(c){this.facade=c;
this._currentParent;
this._canContain=undefined;
this._canAttach=undefined;
this._patternData;
this.shapeList=new Ext.tree.TreeNode({});
var a=new Ext.tree.TreePanel({cls:"shaperepository",loader:new Ext.tree.TreeLoader(),root:this.shapeList,autoScroll:true,rootVisible:false,lines:false,anchors:"0, -30"});
var d=this.facade.addToRegion("west",a,ORYX.I18N.ShapeRepository.title);
Ext.Ajax.request({url:ORYX.PATH+"stencilpatterns",method:"POST",success:function(f){try{this._patternData=Ext.decode(f.responseText)
}catch(g){ORYX.Log.error("Failed to retrieve Stencil Patterns Data :\n"+g)
}}.createDelegate(this),failure:function(){ORYX.Log.error("Failed to retrieve Stencil Patterns Data")
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID}});
var b=new Ext.dd.DragZone(this.shapeList.getUI().getEl(),{shadow:!Ext.isMac});
b.afterDragDrop=this.drop.bind(this,b);
b.beforeDragOver=this.beforeDragOver.bind(this,b);
b.beforeDragEnter=function(){this._lastOverElement=false;
return true
}.bind(this);
this.setStencilSets();
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,this.setStencilSets.bind(this))
},setStencilSets:function(){var a=this.shapeList.firstChild;
while(a){this.shapeList.removeChild(a);
a=this.shapeList.firstChild
}this.facade.getStencilSets().values().each((function(d){var b;
var f=d.title();
var c=d.extensions();
this.shapeList.appendChild(b=new Ext.tree.TreeNode({text:f,allowDrag:false,allowDrop:false,iconCls:"headerShapeRepImg",cls:"headerShapeRep",singleClickExpand:true}));
b.render();
b.expand();
var e=d.stencils(this.facade.getCanvas().getStencil(),this.facade.getRules());
var g=new Hash();
e=e.sortBy(function(h){return h.position()
});
e.each((function(j){if(j.hidden()){return
}var h=j.groups();
h.each((function(k){if(!g[k]){g[k]=new Ext.tree.TreeNode({text:k,allowDrag:false,allowDrop:false,iconCls:"headerShapeRepImg",cls:"headerShapeRepChild",singleClickExpand:true});
b.appendChild(g[k]);
g[k].render()
}this.createStencilTreeNode(g[k],j)
}).bind(this));
if(h.length==0){this.createStencilTreeNode(b,j)
}var i=ORYX.CONFIG.STENCIL_GROUP_ORDER();
b.sort(function(l,k){return i[d.namespace()][l.text]-i[d.namespace()][k.text]
})
}).bind(this))
}).bind(this))
},createStencilTreeNode:function(a,b){var d=new Ext.tree.TreeNode({text:b.title(),icon:decodeURIComponent(b.icon()),allowDrag:false,allowDrop:false,iconCls:"ShapeRepEntreeImg",cls:"ShapeRepEntree"});
a.appendChild(d);
d.render();
var c=d.getUI();
c.elNode.setAttributeNS(null,"title",b.description());
Ext.dd.Registry.register(c.elNode,{node:c.node,handles:[c.elNode,c.textNode].concat($A(c.elNode.childNodes)),isHandle:false,type:b.id(),title:b.title(),namespace:b.namespace()})
},drop:function(k,i,b){this._lastOverElement=undefined;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.added"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.attached"});
var j=k.getProxy();
if(j.dropStatus==j.dropNotAllowed){return
}if(!this._currentParent){return
}var g=Ext.dd.Registry.getHandle(i.DDM.currentTarget);
var o=b.getXY();
var l={x:o[0],y:o[1]};
var m=this.facade.getCanvas().node.getScreenCTM();
l.x-=m.e;
l.y-=m.f;
l.x/=m.a;
l.y/=m.d;
l.x-=document.documentElement.scrollLeft;
l.y-=document.documentElement.scrollTop;
var n=this._currentParent.absoluteXY();
l.x-=n.x;
l.y-=n.y;
g.position=l;
if(this._canAttach&&this._currentParent instanceof ORYX.Core.Node){g.parent=undefined
}else{g.parent=this._currentParent
}var e=ORYX.Core.Command.extend({construct:function(r,p,t,a,q,s){this.option=r;
this.currentParent=p;
this.canAttach=t;
this.position=a;
this.facade=q;
this.selection=this.facade.getSelection();
this.shape;
this.parent
},execute:function(){if(!this.shape){this.shape=this.facade.createShape(g);
this.parent=this.shape.parent
}else{this.parent.add(this.shape)
}if(this.canAttach&&this.currentParent instanceof ORYX.Core.Node&&this.shape.dockers.length>0){var a=this.shape.dockers[0];
if(this.currentParent.parent instanceof ORYX.Core.Node){this.currentParent.parent.add(a.parent)
}a.bounds.centerMoveTo(this.position);
a.setDockedShape(this.currentParent)
}if(h&&h.length>0&&this.shape instanceof ORYX.Core.Node){this.shape.setProperty("oryx-tasktype",h);
this.shape.refresh()
}this.facade.setSelection([this.shape]);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DROP_SHAPE,shape:this.shape})
},rollback:function(){this.facade.deleteShape(this.shape);
this.facade.setSelection(this.selection.without(this.shape));
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var f=this.facade.eventCoordinates(b.browserEvent);
var d=g.type.split("#");
if(d[1].startsWith("wp-")){this.facade.raiseEvent({type:ORYX.CONFIG.CREATE_PATTERN,pid:d[1],pdata:this._patternData,pos:f})
}else{if(d[1].endsWith("Task")){var h=d[1];
h=h.substring(0,h.length-4);
g.type=d[0]+"#Task";
if(h.length<1){if(g.title=="User"||g.title=="Send"||g.title=="Receive"||g.title=="Manual"||g.title=="Service"||g.title=="Business Rule"||g.title=="Script"){h=g.title
}}var c=new e(g,this._currentParent,this._canAttach,f,this.facade,h);
this.facade.executeCommands([c])
}else{var c=new e(g,this._currentParent,this._canAttach,f,this.facade);
this.facade.executeCommands([c])
}}this._currentParent=undefined
},beforeDragOver:function(h,f,b){var e=this.facade.eventCoordinates(b.browserEvent);
var k=this.facade.getCanvas().getAbstractShapesAtPosition(e);
if(k.length<=0){var a=h.getProxy();
a.setStatus(a.dropNotAllowed);
a.sync();
return false
}var c=k.last();
if(k.lenght==1&&k[0] instanceof ORYX.Core.Canvas){return false
}else{var d=Ext.dd.Registry.getHandle(f.DDM.currentTarget);
var i=this.facade.getStencilSets()[d.namespace];
var j=i.stencil(d.type);
if(j.type()==="node"){var g=k.reverse().find(function(l){return(l instanceof ORYX.Core.Canvas||l instanceof ORYX.Core.Node||l instanceof ORYX.Core.Edge)
});
if(g!==this._lastOverElement){this._canAttach=undefined;
this._canContain=undefined
}if(g){if(!(g instanceof ORYX.Core.Canvas)&&g.isPointOverOffset(e.x,e.y)&&this._canAttach==undefined){this._canAttach=this.facade.getRules().canConnect({sourceShape:g,edgeStencil:j,targetStencil:j});
if(this._canAttach){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeRepo.attached",elements:[g],style:ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,color:ORYX.CONFIG.SELECTION_VALID_COLOR});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.added"});
this._canContain=undefined
}}if(!(g instanceof ORYX.Core.Canvas)&&!g.isPointOverOffset(e.x,e.y)){this._canAttach=this._canAttach==false?this._canAttach:undefined
}if(this._canContain==undefined&&!this._canAttach){this._canContain=this.facade.getRules().canContain({containingShape:g,containedStencil:j});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeRepo.added",elements:[g],color:this._canContain?ORYX.CONFIG.SELECTION_VALID_COLOR:ORYX.CONFIG.SELECTION_INVALID_COLOR});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.attached"})
}this._currentParent=this._canContain||this._canAttach?g:undefined;
this._lastOverElement=g;
var a=h.getProxy();
a.setStatus(this._currentParent?a.dropAllowed:a.dropNotAllowed);
a.sync()
}}else{this._currentParent=this.facade.getCanvas();
var a=h.getProxy();
a.setStatus(a.dropAllowed);
a.sync()
}}return false
}};
ORYX.Plugins.ShapeRepository=Clazz.extend(ORYX.Plugins.ShapeRepository);