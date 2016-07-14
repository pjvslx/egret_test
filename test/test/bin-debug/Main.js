//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.apply(this, arguments);
        this.m_connected = false;
    }
    var d = __define,c=Main,p=c.prototype;
    p.createChildren = function () {
        _super.prototype.createChildren.call(this);
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var back = new egret.Shape();
        back.graphics.beginFill(0x336699);
        back.graphics.drawRect(0, 0, 600, 600);
        back.graphics.endFill();
        this.addChild(back);
        console.log("==========createGameScene");
        var label = new egret.TextField();
        label.size = 30;
        label.textColor = 0xffffffff;
        label.x = 100;
        label.y = 100;
        label.scrollRect = new egret.Rectangle(0, 0, 200, 50);
        label.cacheAsBitmap = true;
        label.text = "平移和滚动显示对象,平移和滚动显示对象";
        this.addChild(label);
        label.touchEnabled = true;
        label.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchHandle, this);
        var img = new egret.Bitmap(RES.getRes("egretIcon"));
        img.x = 0;
        img.y = 0;
        img.anchorOffsetX = img.width / 2;
        img.anchorOffsetY = img.height / 2;
        img.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchImg, this);
        img.touchEnabled = true;
        var backIndex = this.getChildIndex(back);
        var labelIndex = this.getChildIndex(label);
        var imgIndex = this.getChildIndex(img);
        var spr = new egret.Sprite();
        spr.x = 200;
        spr.y = 200;
        this.addChild(spr);
        spr.addChild(img);
        var sock = new egret.WebSocket();
        function onConnect() {
            alert("==========onConnect============");
            this.m_connected = true;
        }
        function onDataRecv(evt) {
            var msg = sock.readUTF();
            alert("==========onDataRecv=========== msg " + msg);
        }
        function onSocketError() {
            alert("==========onSocketError==========");
        }
        function onSocketClose() {
            alert("==========onSocketClose==========");
        }
        sock.addEventListener(egret.ProgressEvent.SOCKET_DATA, onDataRecv, this);
        sock.addEventListener(egret.Event.CONNECT, onConnect, this);
        sock.addEventListener(egret.IOErrorEvent.IO_ERROR, onSocketError, this);
        sock.addEventListener(egret.Event.CLOSE, onSocketClose, this);
        sock.connect("192.168.199.109", 9999);
        //        sock.connect("echo.websocket.org",80);
        var lab = new eui.Label();
        lab.text = "Hello eui";
        lab.x = 100;
        lab.y = 400;
        this.addChild(lab);
        var btn = new eui.Button();
        btn.x = 100;
        btn.y = 300;
        //btn.skinName = "ButtonSkin.exml";
        btn.skinName = "resource/eui_skin/ButtonSkin.exml";
        console.log("width = " + btn.width + " height = " + btn.height);
        this.addChild(btn);
        //        EXML.load("resource/eui_skin/ButtonSkin.exml",this.onEXMLLoad,this);
    };
    p.onEXMLLoad = function (clazz, url) {
        var btn = new eui.Button();
        btn.x = 100;
        btn.y = 300;
        btn.skinName = clazz;
        console.log("width = " + btn.width + " height = " + btn.height);
        this.addChild(btn);
    };
    p.touchHandle = function (evt) {
        //        console.log("===========touchHandle============");
        //        let label:egret.TextField = evt.currentTarget;
        //        label.textColor = 0xff00ff;
    };
    p.touchImg = function (evt) {
        var img = evt.currentTarget;
        egret.Tween.get(img).to({ scaleX: 4, scaleY: 4 }, 300, egret.Ease.circIn).to({ scaleX: 1, scaleY: 1 }, 300, egret.Ease.circIn);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    p.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];
            self.changeDescription(textfield, lineArr);
            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };
        change();
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    p.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    return Main;
}(eui.UILayer));
egret.registerClass(Main,'Main');
