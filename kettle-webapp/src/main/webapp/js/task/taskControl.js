var timeInterval="";
var carteId;
var conHostName;
var type;
transDetailInterval="";
var transDetailId;
var transDetailHostName;
var transAndJobGrid;

//显示正在运行中的任务列表
function showTaskControlPanel(){
    var secondGuidePanel=Ext.getCmp("secondGuidePanel");
    var chooseModel=new Ext.grid.CheckboxSelectionModel();

    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),
        chooseModel,
        {header:"id",dataIndex:"id"},
        {header:"任务名",dataIndex:"name"},
        {header:"运行节点",dataIndex:"hostName"},
        {header:"任务类型",dataIndex:"type"},
        {header:"运行状态",dataIndex:"isStart"},
    ])
    //数据从后台获取
    var proxy=new Ext.data.HttpProxy({url:"/task/getRunningTask.do"});
    //Record定义数据结构 后台传过来的数据则以这种形式展示
    var controlRecord=Ext.data.Record.create([
        {name:"id",type:"string",mapping:"id"},
        {name:"name",type:"string",mapping:"name"},
        {name:"hostName",type:"string",mapping:"hostName"},
        {name:"type",type:"string",mapping:"type"},
        {name:"isStart",type:"string",mapping:"isStart"}
    ])
    //reader对record进一步封装 第一个参数是分页参数 没有分页功能则不需要
    var reader=new Ext.data.JsonReader({},controlRecord);
    var store=new Ext.data.Store({
        reader:reader,
        proxy:proxy
    })
    store.load();
    //创建panel
    var grid=new Ext.grid.GridPanel({
        id:"controlPanel",
        title:"任务监控",
        width:1150,
        height:470,
        cm:cm,      //列模型
        sm:chooseModel,
        store:store,
        closable:true,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        },
        listeners:{
            rowclick:function(grid,index,e){
                var view=grid.getView();
                var rsm=grid.getSelectionModel();
                var flag=false;
                for(var i= 0;i<view.getRows().length;i++){
                    if(rsm.isSelected(i)){
                        var type=grid.getStore().getAt(i).get("type");
                        if(type=="作业"){
                            Ext.getCmp("pushOrStart").disable();
                            Ext.getCmp("transDetailButton").disable();
                            flag=true;
                        }
                    }
                }
                if(flag=false){
                    Ext.getCmp("transDetailButton").enable();
                    Ext.getCmp("pushOrStart").enable();
                }
            }
        },
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"刷新",
                handler:function(){
                    secondGuidePanel.removeAll(true);
                    secondGuidePanel.add(showTaskControlPanel());
                    secondGuidePanel.doLayout();
                }
            },'-',
            {
                text:"日志明细",
                handler:function(){
                    collectData(grid);
                }
            },'-',
            {
                text:"结束",
                handler:function(){
                    stopJobOrTrans(grid,secondGuidePanel);
                }
            },'-',
            {
                text:"转换详情",
                id:"transDetailButton",
                handler:function(){
                    showTransDetailWindow(grid);
                }
            },'-',
            {
                text:"暂停/开始",
                id:"pushOrStart",
                handler:function(){
                   pauseOrStart(grid,secondGuidePanel);
                }
            }
        ]})
    });
    grid.getColumnModel().setHidden(2,true);
    transAndJobGrid=grid;
    return grid;
}

//暂停OR开始转换
function pauseOrStart(grid,secondGuidePanel){
    var view=grid.getView();
    var rsm=grid.getSelectionModel();
    var idArray=new Array();
    var hostArray=new Array();
    for(var i= 0;i<view.getRows().length;i++){
        if(rsm.isSelected(i)){
            idArray.push(grid.getStore().getAt(i).get("id"));
            hostArray.push(grid.getStore().getAt(i).get("hostName"));
        }
    }
    if(idArray.length<1){
        Ext.MessageBox.alert("请至少选择一个需要暂停/开始的转换");
        return;
    }else{
        Ext.Ajax.request({
            url:"/task/pauseOrStart.do",
            success:function(response,config){
                Ext.MessageBox.alert("result","OK");
                secondGuidePanel.removeAll(true);
                secondGuidePanel.add(showTaskControlPanel());
                secondGuidePanel.doLayout();
            },
            failure:function(){
                Ext.MessageBox.alert("result","内部错误,暂停/开始失败!");
            },
            params:{idArray:idArray,hostArray:hostArray}
        });
    }
}

//停止作业OR转换
function stopJobOrTrans(grid,secondGuidePanel){
    var view=grid.getView();
    var rsm=grid.getSelectionModel();

    var typeArray=new Array();
    var idArray=new Array();
    var hostArray=new Array();
    for(var i= 0;i<view.getRows().length;i++){
        if(rsm.isSelected(i)){
            idArray.push(grid.getStore().getAt(i).get("id"));
            typeArray.push(grid.getStore().getAt(i).get("type"));
            hostArray.push(grid.getStore().getAt(i).get("hostName"));
        }
    }
    if(idArray.length<1){
        Ext.MessageBox.alert("请至少选择一个需要停止的任务");
    }else{
        Ext.Ajax.request({
            url:"/task/stopTransOrJob.do",
            success:function(response,config){
                Ext.MessageBox.alert("result","OK");
                secondGuidePanel.removeAll(true);
                secondGuidePanel.add(showTaskControlPanel());
                secondGuidePanel.doLayout();
            },
            failure:function(){
                Ext.MessageBox.alert("result","内部错误,删除失败!");
            },
            params:{idArray:idArray,typeArray:typeArray,hostArray:hostArray}
        });
    }
}

//显示转换详情的窗口(嵌入一个panel)
function showTransDetailWindow(grid){
    var view=grid.getView();
    var rsm=grid.getSelectionModel();
    var idArray=new Array();
    var hostName=""
    for(var i= 0;i<view.getRows().length;i++){
        if(rsm.isSelected(i)){
            idArray.push(grid.getStore().getAt(i).get("id"));
            transDetailId=idArray[0];
            hostName=grid.getStore().getAt(i).get("hostName");
            transDetailHostName=hostName;
        }
    }
    if(idArray.length==1){
        var transDetailPanel=generateTransDetailPanel(idArray[0],hostName);
        transDetailWindow=new Ext.Window({
            id:"transDetail",
            title:"转换详情",
            width:1010,
            height:200,
            items:[transDetailPanel],
            listeners:{
                "close":function(){
                    if(transDetailInterval!=""){
                        clearInterval(transDetailInterval);
                    }
                }
            }
        });
        transDetailWindow.show(grid);
        transDetailInterval=setInterval("refreshTransDetailWindow(transDetailWindow,transAndJobGrid)",2000);
    }else{
        Ext.MessageBox.alert("请先选择一个(不能多选)需要查看的转换");
        return;
    }
}

//刷新转换详情的窗口
function refreshTransDetailWindow(transDetailWindow,grid){
    transDetailWindow.removeAll(true);
    transDetailWindow.add(generateTransDetailPanel(transDetailId,transDetailHostName));
    transDetailWindow.hide();
    transDetailWindow.show(grid);
}

//生成转换详情的列表
function generateTransDetailPanel(carteId,hostName){

    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),
        {header:"步骤",width:"50px",dataIndex:"stepname"},
        {header:"CopyNR",width:"20px",dataIndex:"copy"},
        {header:"读取",width:"50px",dataIndex:"linesRead"},
        {header:"写",width:"50px",dataIndex:"linesWritten"},
        {header:"输入",width:"50px",dataIndex:"linesInput"},
        {header:"输出",width:"50px",dataIndex:"linesOutput"},
        {header:"更新",width:"25px",dataIndex:"linesUpdated"},
        {header:"拒绝",width:"25px",dataIndex:"linesRejected"},
        {header:"错误",width:"25px",dataIndex:"errors"},
        {header:"状态",width:"30px",dataIndex:"statusDescription"},
        {header:"时间",width:"30px",dataIndex:"seconds"},
        {header:"速度",width:"30px",dataIndex:"speed"},
        {header:"pr/in/out",width:"80px",dataIndex:"priority"}
    ])
    //数据从后台获取
    var proxy=new Ext.data.HttpProxy({url:"/task/getTransDetail.do"});
    //Record定义数据结构 后台传过来的数据则以这种形式展示
    var record=Ext.data.Record.create([
        {name:"stepname",type:"string",mapping:"stepname"},
        {name:"copy",type:"string",mapping:"copy"},
        {name:"linesRead",type:"string",mapping:"linesRead"},
        {name:"linesWritten",type:"string",mapping:"linesWritten"},
        {name:"linesInput",type:"string",mapping:"linesInput"},
        {name:"linesOutput",type:"string",mapping:"linesOutput"},
        {name:"linesUpdated",type:"string",mapping:"linesUpdated"},
        {name:"linesRejected",type:"string",mapping:"linesRejected"},
        {name:"errors",type:"string",mapping:"errors"},
        {name:"statusDescription",type:"string",mapping:"statusDescription"},
        {name:"seconds",type:"string",mapping:"seconds"},
        {name:"speed",type:"string",mapping:"speed"},
        {name:"priority",type:"string",mapping:"priority"}
    ])
    //reader对record进一步封装
    var reader=new Ext.data.JsonReader({},record);
    var store=new Ext.data.Store({
        reader:reader,
        proxy:proxy
    })
    store.load({params:{carteId:carteId,hostName:hostName}});   //params为请求参数
    //创建panel
    var grid=new Ext.grid.GridPanel({
        id:"controlPanel",
        width:1000,
        height:190,
        cm:cm,      //列模型
        store:store,
        closable:true,
        viewConfig : {
            forceFit : true //让grid的列自动填满grid的整个宽度，不用一列一列的设定宽度
        }
    })
    return grid;
}

function collectData(grid){
    var view=grid.getView();
    var rsm=grid.getSelectionModel();
    //存放被选的作业/转换的id串
    var idArray=new Array();
    for(var i= 0;i<view.getRows().length;i++){
        if(rsm.isSelected(i)){
            idArray.push(grid.getStore().getAt(i).get("id"));
            type=grid.getStore().getAt(i).get("type");
            conHostName=grid.getStore().getAt(i).get("hostName");
        }
    }
    if(idArray.length<1){
        Ext.MessageBox.alert("提示","请选择一个作业/转换");
        return;
    }else if(idArray.length>1){
        Ext.MessageBox.alert("提示","只能选择一个任务进行查看");
        return;
    }else{
        carteId=idArray[0];
        showWindow(grid);
        refreshHTML();
    }
}

//日志信息以window形式展现
function showWindow(grid){
    logWindow=new Ext.Window({
        id:"logWindow",
        title:"日志详情",
        bodyStyle:"background-color:white",
        width:370,
        height:500,
        html:"",
        autoScroll:true,
        listeners:{
            "close":function(){
                if(timeInterval!=""){
                    clearInterval(timeInterval);
                }
            }
        },
        tbar:new Ext.Toolbar({buttons:[
            {
                text:"刷新",
                handler:function(){
                    refreshHTML();
                }
            },'-',
            {
                text:"自动刷新",
                handler:function(){
                    refreshHTML();
                    timeInterval=setInterval("refreshHTML()",2000);
                }
            }
        ]})
    });
    logWindow.show(grid);
}

//从后台获取日志信息
function refreshHTML(){
    var logDetail="";
    Ext.Ajax.request({
        url:"/task/getLog.do",
        success:function(response,config){
            logDetail=response.responseText;
            var logWindow=Ext.getCmp("logWindow");
            //更新window中的内容
            logWindow.update(logDetail);
            var windowDom=logWindow.body.dom;
            windowDom.scrollTop=windowDom.scrollHeight- windowDom.offsetHeight;
        },
        failure:function(){
            Ext.MessageBox.alert("result","内部错误,暂时无法查看,请稍后尝试!")
        },
        params:{id:carteId,type:type,hostName:conHostName}
    });
}


