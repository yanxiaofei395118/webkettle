


function generateJobPanel(){
    var tabPanel=Ext.getCmp("TabPanel");
    //var data=response.responseText;
    //列模型
    var cm=new Ext.grid.ColumnModel([
        new Ext.grid.RowNumberer(),//行序号生成器,会为每一行生成一个行号
        {header:"名字",width:100,dataIndex:"name"},
        {header:"创建用户",width:100,dataIndex:"createUser"},
        {header:"创建时间",width:150,dataIndex:"createDate",tooltip:"这是创建时间"},
        {header:"最终修改的用户",width:100,dataIndex:"modifiedUser",align:"center"},
        {header:"修改时间",width:150,dataIndex:"modifiedDate"},
        /*  {header:"是否激活",width:200,dataIndex:"enabled",
         renderer:function(v){
         if(v=="Y"){
         return "已激活";
         }else{
         return "未激活";
         }
         }
         },*/
        {
            header:"操作",width:190,dataIndex:"",menuDisabled:true,
            renderer:function(v){
                return "<span style='margin-right: 10px'><a href='#'>修改" +
                    "</a></span><span><a href='#'>删除</a></span>";
            }
        }
    ]);

    //准备数据 使用HttpProxy方式从后台获取json格式的数据
    var proxy=new Ext.data.HttpProxy({url:"/task/getJobs.do"});

    //Record定义记录结果
    var human=Ext.data.Record.create([
        {name:"name",type:"string",mapping:"name"},
        {name:"createUser",type:"string",mapping:"createUser"},
        {name:"createDate",type:"string",mapping:"createDate"},
        {name:"modifiedUser",type:"string",mapping:"modifiedUser"},
        {name:"modifiedDate",type:"string",mapping:"modifiedDate"}
    ])
    var reader=new Ext.data.JsonReader({totalProperty:"totalProperty",root:"root"},human);

    var store=new Ext.data.Store({
        proxy:proxy,
        reader:reader
    })
    store.load({params:{start:0,limit:3}});

    var grid=new Ext.grid.GridPanel({
        id:"JobPanel",
        title:"JobPanel",
        width:1000,
        height:470,
        cm:cm,      //列模型
        store:store,
        closable:true,
        tbar:new Ext.Toolbar({
            buttons:[
                {
                    text:"新建",
                    handler:function(){

                    }
                },"-",
                {
                    text:"保存",
                    handler:function(){

                    }
                },
                {
                    text:"打开",
                    handler:function(){

                    }
                }
            ]
        }),
        bbar:new Ext.PagingToolbar({
            store:store,
            pageSize:3,
            displayInfo:true,
            displayMsg:"本页显示第{0}条到第{1}条的记录,一共{2}条",
            emptyMsg:"没有记录"
        })
    });
    tabPanel.add(grid);
    //把创建好的gridPanel设置为默认的标签
    tabPanel.setActiveTab(grid);
}




