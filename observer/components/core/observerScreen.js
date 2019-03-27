import http from '../../../../common/http';
import appConfig from '../../../../common/appConfig';
// import {message} from 'antd'
import {getColor} from '../../../../common/utils';
import ModelText from './entities/modelText';
import { LineChart, BarChart, PieChart } from './entities/modelChart';
import {Instruct_modalTypes} from '../../../../common/enum';

import { HitModel } from './commonCanvas';
import { Stopwatch } from './timer';

import ObserverWorker from './observer.worker.js';

import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View } from "react-native";
import Canvas from 'react-native-canvas';



function ObserverScreen(id, container, options) {
    this.id = id;

    this.options = options || {};

    this.container = container;
    this.canvasContainer = undefined;
    
    this.divMain=undefined
    this.canvas = undefined;
    this.ctx = undefined;
    this.cacheCanvas = undefined;
    this.cacheCtx = undefined;
    this.hitModel = undefined;
    this.workerUpdate = undefined;
    this.isRunning = true;
    this.store = {};                      //store of all elements of this page.
    //this.dictRefreshMap = undefined;      //the relationship between dataPoint id and element id. using for refresh data.
    this.stopWatch = undefined;

    this.dictTexts = undefined;
           
    this.indexImageLoaded = 0;            //using for recording the process of loading images.

    this.isDetailPage = false;
    this.dialogTitle = undefined;

    this.isDataReady = false;
    this.isPlayback = false;              //whether this screen bases on realtime data or history data.
    this.toolContainer = undefined;       //JQuery object
    this.timer = null
    this.historyData = {}
    this.modalHistoryData = {}
}


ObserverScreen.prototype = {
    //展示初始化模态框（控制器）william
    show: function (data) {
        var _this = this;
        var screenType = data ? data.screenType : '' ;
        var modalHistoryData = data ? data.modalHistoryData : {} ;
        var pageHistoryData = data ? data.pageHistoryData : {};

        this.container.innerHTML = '';
        this.initContainer();
        
        this.showLoading();
        this.init({screenType,modalHistoryData,pageHistoryData});
    },
    
    showLoading: function () {
        if (typeof this.options.showLoading === 'function') {
            this.options.showLoading();
        }
    },

    hideLoading: function () {
        if (typeof this.options.hideLoading === 'function') {
            this.options.hideLoading();
        }
    },

    //点击按钮后，先判断即将展示的页面是全屏还是模态框
    chooseShow: function (pageId, title) {
        var _this = this;
        http.get("http://47.100.17.99/api/get_plant/" + appConfig.project.id + "/" + pageId)
            .then(result => {
                if (result.page.type === 'fullscreen') {
                    _this.showFullScreenPage(pageId)
                }else if (result.page.type === 'floating') {
                    _this.showDetailDialog(pageId, title);
                }
            });   
    },
    //若是链接到模态框页面，显示所有设备详情框
    showDetailDialog: function (pageId, title) {
        if (typeof this.options.showObserverModal === 'function') {
            this.options.showObserverModal({
                pageId,
                title
            });
        }
    },
    //优化设定值
    showOptimizeValue: function (idCom,currentValue) {
        if (typeof this.options.showOptimizeModal === 'function') {
            this.options.showOptimizeModal(Instruct_modalTypes.OPTIMIZE_VALUE_MODAL,{
                idCom,
                currentValue
            })
        }
        // }else if (typeof this.options.showOperatingTextModal === 'function') {
        //     this.options.showOperatingTextModal({
        //         idCom,
        //         currentValue
        //     })
        // }
    },

    //设备开关操作
    showOperatingPane: function (idCom, setValue, description) {
        if (typeof this.options.showOperatingModal === 'function') {
            this.options.showOperatingModal({
                idCom,
                setValue,
                description
            })
        }
    },

    //主界面一键开关机模态框显示
    showMainOperatingPane : function (idCom, setValue, description,unsetValue) {
        if (typeof this.options.showMainOperatingPane === 'function') {
            this.options.showMainOperatingPane(Instruct_modalTypes.ONE_KEY_OPERATE_MODAL,{
                idCom,
                setValue,
                description, 
                unsetValue
            })
        }
    },

    showMainOperatingRadio : function(idCom,setValue,description){
        if (typeof this.options.showMainOperatingPane === 'function') {
            this.options.showMainOperatingPane(Instruct_modalTypes.SWITCH_MODAL,{
                idCom,
                setValue,
                description
            })
        }
    },

    //主界面checkbox改值
    showMainCheckbox : function( idCom , setValue ,description ,unsetValue){
        if( typeof this.options.showMainCheckboxModal === 'function' ){
            this.options.showMainCheckboxModal(Instruct_modalTypes.CHECKBOX_MODAL,{
                idCom,
                setValue,
                description,
                unsetValue
            })
        }
    },

    //checkbox按钮
    showCheckboxPane : function( idCom,setValue,text ,unsetValue){ 
        if( typeof this.options.showCheckboxModal === 'function' ){
            this.options.showCheckboxModal({
                idCom,
                setValue,
                text,
                unsetValue
            })
        }
    },

    //设备详情里的启用／禁用
    showRadioPane : function (idCom, setValue, description) {
        if (typeof this.options.showRadioModal === 'function') {
            this.options.showRadioModal({
                idCom,
                setValue,
                description
            })
        }
    },

    //设备详情里的控制模式选项
    showSelectControlValue : function (idCom, currentValue) {
         if (typeof this.options.showSelectControlModal === 'function') {
            this.options.showSelectControlModal({
                idCom,
                currentValue
            })
        }
    },

    //获取到模态框改变后的尺寸
    getModalSize :function(width,height){
        if(typeof this.options.getModalSize === 'function'){
            this.options.getModalSize(width,height)
        }
    },

    // 获取模态框缓存数据
    addModalHistoryCache : function(data){
        if(typeof this.options.addModalHistoryCache === 'function'){
            let id = this.store && this.store.page.id
            this.options.addModalHistoryCache({[id]:data})
        }
    },

    // 缓存页面数据局
    addPageHistoryCache : function(data){
        if(typeof this.options.addPageHistoryCache === 'function'){
            let id = this.store && this.store.page.id
            this.options.addPageHistoryCache({[id]:data})
        }
    },

    //创建canvas容器，在show方法中调用
    initContainer: function () {
        /*this.divMain = document.createElement('div');
        this.divMain.id = 'divMain';
        this.divMain.style.width = '100%';
        this.divMain.style.height = '100%';

        let canvas = document.createElement('canvas');
        canvas.id = 'canvasOverview';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.innerHTML = '浏览器不支持 canvas';

        this.divMain.appendChild(canvas);
        this.container.appendChild(this.divMain);

        this.canvasContainer = canvas;*/

        handleCanvas = (canvas) => {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'purple';
            ctx.fillRect(0, 0, 100, 100);
        }        

        return (
            <View 
                id='divmain'
                style={{ width: 100, height: 100 }}
            >
                <Canvas 
                    id='canvasOverview'
                    style={{ width: 100, height: 100 }}
                    ref={this.handleCanvas} 
                />
            </View>
        );
    },

    close: function () {
        // reset tooltip
        ModelText.destroy();

        if (this.workerUpdate) this.workerUpdate.terminate();
        this.workerUpdate = null;

        for (var item in this.dictCharts) this.dictCharts[item].close();
        this.isRunning = null;
        this.canvas = null;
        this.ctx = null;
        this.cacheCanvas = null;
        this.store = null;
        this.dictRefreshMap = null;
        this.dictPipelines = null;
        this.dictGages = null;
        this.dictRulers = null;
        this.dictEquipments = null;
        this.dictButtons = null;
        this.dictTexts = null;
        this.dictCheckboxs = null;
        this.dictImages = null;
        this.dictRects = null;

        this.hitModel = null;
        this.stopWatch = null;

        this.container.innerHTML = '';
        this.timer=null
            
        this.historyData = null
        this.modalHistoryData = null
    },

    stop: function () {
        this.isRunning = false;
        if (this.workerUpdate) {
            this.workerUpdate.terminate();
            this.workerUpdate = null;
        }
    },

    resume: function () {
        //TODO
        this.isRunning = true;
        this.initWorkerForUpdating();
        requestAnimationFrame(animate);
    },
    resite: function () {
        this.initScreen();
        this.renderElements();
        
        if (this.workerUpdate) {
            this.workerUpdate.terminate();
            this.initWorkerForUpdating();
        }
    },
    //重置
    resize: function () {
        var styles = window.getComputedStyle(document.documentElement);
        var width = this.store.page.width + 32 > parseInt(styles.width) ? parseInt(styles.width) - 32 : this.store.page.width + 32;
        var height = this.store.page.height / this.store.page.width * width + 32;
        
        this.container.style.width = width + 'px';
        this.container.style.height = height + 'px';
        this.getModalSize(width,height)
    },

    onresize: function () {
        ScreenCurrent.resize();
    },
    initDivMainBg : function(){
        var page = this.store.page
        if(page.bgImgId){
            // 使用背景图
            var bgImgId = page.bgImgId
            this.divMain.style.backgroundImage = `url(${appConfig.staticImage}\/plant\/project\/${bgImgId}.png`
            this.divMain.style.backgroundSize='cover'
            this.divMain.style.backgroundPosition="center"
        }else{
            if(page.bgColor2){
                var bgColor1 = getColor(page.bgColor1),
                    bgColor2 = getColor(page.bgColor2)
                // 使用渐变色
                //this.divMain.style.background = "-webkit-linear-gradient(top,"+bgColor1+","+bgColor2+")"
            }else if(page.bgColor1){
                var bgColor1 = getColor(page.bgColor1)
                console.info(bgColor1)
                this.divMain.style.backgroundColor = bgColor1
            }
        }
    },
    init: function (data) {
        console.log(data)
        var _this = this;
        //页面显示需要的数据
        // console.info(appConfig.project.id ,this.id )
        let projectId = 374 || appConfig.project.id
        http.get("http://47.100.17.99/api/get_plant/" + projectId + "/" + this.id)
        .then(result => {
            if(result.error){
                // message.error(result.msg,2.5)
            }
            //store存放当前所有数据
            _this.store = result;
            _this.initDivMainBg()

            _this.initScreen();
            _this.initImageDictionary();
                                                                                  
            _this.renderElements();
            //是实时刷新还是获取历史数据
            if(!_this.options.bShowTimeShaft){
                _this.initWorkerForUpdating();
            }else{

                if(data.modalHistoryData || data.pageHistoryData){
                    // 是否缓存页面数据
                    if(data.pageHistoryData && data.screenType === 'fullscreen' && result.page.type === 'fullscreen' ){
                        _this.historyData = data.pageHistoryData
                        _this.getDataByTheTimeKey(_this.options.curValue)
                    } else if(data.modalHistoryData){ 
                        // 判断是否已经缓存模态框数据
                        _this.modalHistoryData = data.modalHistoryData
                        _this.getModalDataByTheTimeKey(_this.options.curValue)
                    }
                }else{
                    // 没有缓存，直接进入初始化历史数据
                    if(data.screenType === 'fullscreen' && result.page.type === 'fullscreen' ){
                        _this.initHistroyData({
                            startTime:this.options.dateProps.startTime,
                            endTime : this.options.dateProps.endTime,
                            timeFormat:this.options.dateProps.timeFormat
                        })
                    }else{
                        _this.initModalHistroyData({
                            startTime:this.options.dateProps.startTime,
                            endTime : this.options.dateProps.endTime,
                            timeFormat:this.options.dateProps.timeFormat
                        })
                    }
                }
            }
            _this.initAnimation(); //start animation.
        }).catch(function (err) {
            console.error(err);
            _this.hideLoading();
        });
    },
    //绘制基本元素 
    renderElements: function () {
        //实例化HitModel类
     
        this.initTexts();

    },

    initScreenInModal: (function () {
        var paddingLeft, paddingTop;

        function convertPositionToReal(arr) {
            var temp;
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    temp = arr[i];
                    temp.x = temp.x - paddingLeft;
                    temp.y = temp.y - paddingTop;
                }
            }
        }

        function convertTempDistributionsToReal(dis) {
            if (!dis) {
                return
            }
            dis.x -= paddingLeft;
            dis.y -= paddingTop;
            convertPositionToReal(dis.data);
        }
        
        return function () {
            paddingLeft = (1920 - this.store.page.width) / 2;
            paddingTop = (955 - this.store.page.height) / 2;

            convertPositionToReal(this.store.equipments);
            convertPositionToReal(this.store.buttons);
            convertPositionToReal(this.store.texts);
            // william add
            convertPositionToReal(this.store.checkboxs);
            convertTempDistributionsToReal(this.store.tempDistributions);

            this.resize();
        }
    } ()),
    // 设备详情模态框内部容器初始化 --william
    initScreen: function () {    

        /*var isFloat = this.store.page.type !== "fullscreen";   

        this.canvas = this.canvasContainer;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.store.page.width;
        this.canvas.height = this.store.page.height;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        if (isFloat) {
            this.initScreenInModal();
        }*/

        handleCanvas = (canvas) => {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'purple';
            ctx.fillRect(0, 0, 100, 100);
        } 

        return (
          <Canvas ref={this.handleCanvas}/>
        );        

    },

    initWorkerForUpdating: function () {
        if (this.workerUpdate) {
            this.workerUpdate.terminate();
        }
        /*let projectId = window.localStorage.selectedProjectId || appConfig.project.id
        // 创建Worker实例
        this.workerUpdate = new ObserverWorker();
        this.workerUpdate.self = this;
        // 监听，message事件，将子进程返回的数据作为参数传个this.refreshData
        this.workerUpdate.addEventListener("message", this.refreshData, true);
        
        this.workerUpdate.addEventListener("error", function (e) {
            console.warn(e);
        }, true);
        console.info( Object.keys(this.dictRefreshMap) )
        //将当前进程的数据，通过postMessage传递给子进程
        this.workerUpdate.postMessage({
            serverUrl: appConfig.serverUrl,
            projectId: projectId,
            id: this.id,
            pointList: Object.keys(this.dictRefreshMap),
            type: "dataRealtime"
        });*/
    },


    initHistroyData : function(dateDict){
        // get data
        let pointList = Object.keys(this.dictRefreshMap)
        this.showLoading()
        let _this = this
        let projectId = window.localStorage.selectedProjectId || appConfig.project.id
        //dateDict是开始时传的参数，如果没有这个参数默认使用this.options.dateProps中的采样间隔
        const {timeFormat} = this.options.dateProps
        return http.post('http://47.100.17.99/api/get_history_data_padded_reduce', {
            projectId: projectId,
            pointList : pointList,
            timeStart:dateDict.startTime,
            timeEnd:dateDict.endTime,
            timeFormat:dateDict.timeFormat || timeFormat
        }).then(
            data=>{
                if(data.error){
                    _this.hideLoading()
                    // message.error(data.msg,2.5)
                }else{
                    _this.historyData = data

                    // 缓存数据
                    _this.addPageHistoryCache(data)
                    // 初始化得到索引为1的时间的数据
                    _this.getDataByTheTimeKey(_this.options.curValue)
                    _this.hideLoading()
                }
            }
        ).catch(
            err=>{
                throw err
            }
        )
    },

    // 初始化模态框中历史数据
    initModalHistroyData : function(dateDict){
        // get data
        let pointList = Object.keys(this.dictRefreshMap)
        this.showLoading()
        let _this = this
        let projectId = window.localStorage.selectedProjectId || appConfig.project.id
        //dateDict是开始时传的参数，如果没有这个参数默认使用this.options.dateProps中的采样间隔
        const {timeFormat} = this.options.dateProps
        return http.post('http://47.100.17.99/api/get_history_data_padded_reduce', {
            projectId: projectId,
            pointList : pointList,
            timeStart:dateDict.startTime,
            timeEnd:dateDict.endTime,
            timeFormat:dateDict.timeFormat || timeFormat
        }).then(
            data=>{
                if(data.error){
                    _this.hideLoading()
                    // message.error(data.msg,2.5)
                }else{
                    _this.modalHistoryData = data
                    // 缓存数据
                    _this.addModalHistoryCache(data)
                    // 初始化得到索引为1的时间的数据
                    _this.getModalDataByTheTimeKey(_this.options.curValue)
                    _this.hideLoading()
                }
            }
        ).catch(
            err=>{
                throw err
            }
        )
    },

    // 减少时间
    getDataByTheTimeKey : function(timeKey){
        let _this = this
        let data = this.historyData
        let objKeys = Object.keys(data.data)
        let initData = {}
        initData = objKeys.map( (point,index)=>{
            let value = data.data[point].length ? data.data[point][timeKey] : ''
            return { 
                name : point ,
                value : value
            }
        })
        _this.renderData(initData);
    },

    getModalDataByTheTimeKey : function(timeKey){
        let _this = this
        let data = this.modalHistoryData
        let objKeys = Object.keys(data.data)
        let initData = {}
        initData = objKeys.map( (point,index)=>{
            let value = data.data[point].length ? data.data[point][timeKey] : ''
            return { 
                name : point,
                value : value
            }
        })
        _this.renderData(initData);
    },

    initAnimation: function () {
        var _this = this;
        this.stopWatch = new Stopwatch();
        this.stopWatch.start();

        requestAnimationFrame(animate);
        function animate() {
            if (_this.isRunning) {
                //_this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
                //_this.ctx.drawImage(_this.cacheCanvas, 0, 0);

                //update unit detail
                var item, element, time = _this.stopWatch.getElapsedTime();
                for (item in _this.dictPipelines) {
                    element = _this.dictPipelines[item];
                    element.update(_this.ctx, 250);
                }

                for (item in _this.dictEquipments) {
                    element = _this.dictEquipments[item];
                    element.update(null, time);
                    element.refreshImage(_this.store.animationList, _this.dictImages);
                }

                //paint
                for (var i = 0; i < 10; i++) {
                    for (item in _this.dictPipelines) {
                        element = _this.dictPipelines[item];
                        if (element.layer == i) element.paint(_this.ctx);
                    }
                    for (item in _this.dictEquipments) {
                        element = _this.dictEquipments[item];
                        if (element.layer == i) element.paint(_this.ctx);
                    }
                    for (item in _this.dictButtons) {
                        element = _this.dictButtons[item];
                        if (element.layer == i) element.paint(_this.ctx);
                    }
                    for (item in _this.dictTexts) {
                        console.log(_this.ctx)
                        element = _this.dictTexts[item];
                        if (element.layer == i) element.paint(_this.ctx);
                    }
                    for (item in _this.dictTempDistributions) {
                        element = _this.dictTempDistributions[item];
                        if (element.layer == i) element.paint(_this.ctx);
                    }
                    for (item in _this.dictRects) {
                        element = _this.dictRects[item];
                        if (element.layer == i) element.paint(_this.ctx);
                    }
                    for (item in _this.dictCheckboxs ){
                        element = _this.dictCheckboxs[item];
                        if (element.layer == i) element.paint(_this.ctx);
                    }
                }

                requestAnimationFrame(animate);
            }
        }
    },

    getHitModelItem: function (type, id) {
        var item;
        switch (Number(type)) {
            case this.enmuElementType.equipment:
                item = this.dictEquipments[id];
                break;
            case this.enmuElementType.button:
                item = this.dictButtons[id];
                break;
            case this.enmuElementType.ruler:
                var index_array = id.split('_');
                if (!index_array || index_array.length != 2) {
                    item = null;
                    break;
                }
                var rulerId = index_array[0], refIndex = index_array[1];
                item = this.dictRulers[rulerId].references[refIndex];
                break;
            case this.enmuElementType.text:
                item = this.dictTexts[id];
                break;
            case this.enmuElementType.checkbox:
                item = this.dictCheckboxs[id];
                break;
            default:
                item = null;
        }
        return item;
    },

    initHitModel: function () {
        var _this = this;
        var canvas = this.canvasContainer;

        
        canvas.ontouchstart = function (touchEvent) {
            var e = touchEvent.touches[0]
            console.log(e)
            console.log('进入点击事件')
            if (!_this.hitModel) return;
            // var result = _this.hitModel.firstHitId(e.clientX, e.clientY, null);
            var result = _this.hitModel.firstHitId(e.clientX, e.clientY, null);
            if (result && result.id && result.id != "") {
                var item = _this.getHitModelItem(result.type, result.id);
                item && item.mouseDown && item.mouseDown(e);
                if (item instanceof ModelRuler.ModelRulerCurrentReference) {
                    console.log('click ModelRulerCurrentReference');
                  } else if (item && item.readWrite === 1 && item.dictBindString[0] == '正常') {
                     _this.showSelectControlValue(item.idCom,item.value);
                //} else if (item && item.readWrite === 1 && JSON.parse(localStorage.getItem('userData')).role !=1){
                } else if (item && item.readWrite === 1){
                    console.info('click text')
                    _this.showOptimizeValue(item.idCom,item.value);
                //} else if( item && item.checkboxUrl && JSON.parse(localStorage.getItem('userData')).role !=1){
                } else if( item && item.checkbox === 'checkbox'){
                    //checkbox点击
                    console.info('click checkbox')
                    if( item.type === '1'){
                        //主界面checkbox
                        _this.showMainCheckbox(item.idCom, item.setValue, item.text,item.unsetValue)
                    }else if( _this.store.page.type === 'fullscreen' &&  item.type === '0'){
                        // 主界面单选
                        _this.showMainOperatingPane(item.idCom, item.setValue, item.text,item.unsetValue)
                    }
                } else if (item && item.button === 1  && item.link=== undefined ){
                    _this.showMainOperatingPane(item.idCom, item.setValue, item.description); 
                } else {
                    if (item && item.link != undefined) {
                        // 连接到模态框
                        _this.showDetailDialog(item.link, item.name);
                    } else {
                        if (item && item.layer!=2 && item.layer!=3 && item.status==='down' && item.enabled && item.button === 1) {  
                            _this.showOperatingPane(item.idCom, item.setValue, item.description); 
                            console.log('11111')
                        }else {
                            if (item && item.button === 1 ) {
                                _this.showRadioPane(item.idCom, item.setValue, item.description);
                            }
                        }
                    }
                }
            }
            // e.preventDefault();
        };

        canvas.onmousemove = function (e) {
            if (!_this.hitModel) return;
            var result = _this.hitModel.firstHitId(e.clientX, e.clientY, null);
            if (_this.store) {
                var isInfo = {
                    isInModal: _this.store.page.type !== "fullscreen",
                    pageWidth : _this.store.page.width,
                    pageHeight : _this.store.page.height
                };
            }
            //控制鼠标移动到按钮上的样式
            if (result && result.id && result.id != "") {
                _this.canvas.style.cursor = "pointer";
                _this.hitModel.currentModel = result;
                var item = _this.getHitModelItem(result.type, result.id);
                item && item.mouseEnter && item.mouseEnter(e,isInfo);                    
            } else {
                _this.canvas.style.cursor = "auto";
                if (_this.hitModel.currentModel && _this.hitModel.currentModel.id) {
                    var item = _this.getHitModelItem(_this.hitModel.currentModel.type, _this.hitModel.currentModel.id);
                    //判断按钮是否被禁用，禁用则不可样式改变
                
                    item && item.mouseOut && item.mouseOut();
                  
                    _this.hitModel.currentModel = null;
                }
            }
            e.preventDefault();
        };
    },

    renderData: function (data) {
        this.refreshData({data: data});
    },
    //刷新数据
    refreshData: function (e) {
        var _this = this.self ? this.self : this;
        if (e.data && !e.data.error) {
            var tempDistributionsUpdated = {};
            for (var i = 0; i < e.data.length; i++) {
                var item = _this.dictRefreshMap[e.data[i].name];
                if (item) {
                    if (item.pipelines) {
                        for (var j = 0; j < item.pipelines.length; j++) {
                            var pipline = _this.dictPipelines[item.pipelines[j]];
                            pipline.dictIdCom[e.data[i].name] = e.data[i].value == 1 ? true : false;
                        }
                    }
                    if (item.equipments) {
                        for (var j = 0; j < item.equipments.length; j++) {
                            var equipment = _this.dictEquipments[item.equipments[j]];
                            equipment.value = e.data[i].value;
                            equipment.update(null, null);
                        }
                    }
                    if (item.charts) {
                        for (var j = 0; j < item.charts.length; j++) {
                            _this.dictCharts[item.charts[j]].update(e.data[i].name, e.data[i].value);
                        }
                    }
                    if (item.gages) {
                        for (var j = 0; j < item.gages.length; j++) {
                            _this.dictGages[item.gages[j]].update(e.data[i].value);
                        }
                    }
                    //更新checkbox
                    if( item.checkboxs ){
                        for (var j = 0 ; j < item.checkboxs.length ; j++){
                            _this.dictCheckboxs[item.checkboxs[j]].update(e.data[i])
                        }
                    }
                    if(item.buttons) {
                        for (var j = 0; j < item.buttons.length; j++) {
                           // console.log(e.data[i])
                            _this.dictButtons[item.buttons[j]].update(e.data[i])
                        }
                    }
                    if (item.tempDistributions) {
                        for (var j = 0; j < item.texts.length; j++) {
                            if (item.tempDistributions && item.tempDistributions.length > 0) {
                                if (!tempDistributionsUpdated[item.tempDistributions[j]]) {
                                    tempDistributionsUpdated[item.tempDistributions[j]] = [];
                                }
                                tempDistributionsUpdated[item.tempDistributions[j]].push(e.data[i]);
                                _this.dictTexts[item.texts[j]].update(e.data[i].value, true);
                            }
                            else {
                                _this.dictTexts[item.texts[j]].update(e.data[i].value);
                            }
                        }
                        continue
                    }

                    if (item.texts) {
                        for (var j = 0; j < item.texts.length; j++) {
                            _this.dictTexts[item.texts[j]].update(e.data[i].value);
                        }
                    }
                    if (item.rulers) {
                        for (var j = 0; j < item.rulers.length; j++) {
                            _this.dictRulers[item.rulers[j]].update(e.data[i].name, e.data[i].value);
                        }
                    }
                    
                }
            }
            // 防止同一个温度图多次绘制
            for (var tempId in tempDistributionsUpdated) {
                var tempUpdatedData = tempDistributionsUpdated[tempId];
                _this.dictTempDistributions[tempId].update(tempUpdatedData);
            }

            //TODO: to be removed;
            for (var pointName in _this.dictCharts) {
                var chart = _this.dictCharts[pointName];
                if (!chart.isRunning) {
                    chart.isRunning = true;
                    chart.renderChart(chart);
                }
            }
        } else {
            //new Alert(_this.container, Alert.type.danger, I18n.resource.code[e.data.error]).showAtTop(5000);
        }

        _this.isDataReady = true;
    },

    initCanvasCache: function () {
        this.cacheCanvas = document.createElement("canvas");
        this.cacheCtx = this.cacheCanvas.getContext("2d");
        this.cacheCanvas.width = this.canvas.width;
        this.cacheCanvas.height = this.canvas.height;

        //paint
        var item, element;
        for (var i = 0; i < 10; i++) {
            for (item in this.dictEquipments) {
                element = this.dictEquipments[item];
                if ((!element.idCom || element.idCom == "") && element.layer == i) element.paint(this.cacheCtx);
            }
            for (item in this.dictButtons) {
                element = this.dictButtons[item];
                if ((!element.idCom || element.idCom == "") && element.layer == i) element.paint(this.cacheCtx);
            }
        }
        for (item in this.dictTexts) {
            element = this.dictTexts[item];
            if (!element.idCom || element.idCom == "") element.paint(this.cacheCtx);
        }
        for (item in this.dictCheckboxs ){
            element = this.dictCheckboxs[item];
            if (!element.idCom || element.idCom == "") element.paint(this.cacheCtx)
        }
    },

    initImageDictionary: function () {
        if (this.store.images) {
            var item;
            for (var i = 0; i < this.store.images.length; i++) {
                item = this.store.images[i];
                this.addImageIntoRequestQueue(item);
            }
        }

        if (this.store.animationImages) {
            var item;
            for (var i = 0; i < this.store.animationImages.length; i++) {
                item = this.store.animationImages[i];
                this.addImageIntoRequestQueue("animation_" + item);
            }
        }

        //wait for loading images.
        var _this = this;
        var interval = 500;
        var IMAGE_LOAD_TIMEOUT = interval * 4;
        var loadingImage = {
            key: null,
            loadtime: 0
        };
        // 一张图片加载时间超过2秒，认为加载失败，直接跳过
        var imagesFailLoad = [];
        var timer = setInterval(function (e) {
            var isCompleted = true;
            for (var key in _this.dictImages) {
                if (key in imagesFailLoad) {
                    continue;
                }
                if (!_this.dictImages[key].complete) {
                    if (loadingImage.key === key) {
                        loadingImage.loadtime += interval;
                        if (loadingImage.loadtime >= IMAGE_LOAD_TIMEOUT) {
                            imagesFailLoad.push(key);
                            break;
                        }
                    } else {
                        loadingImage = {
                            key: key,
                            loadtime: 0
                        }
                    }
                    isCompleted = false;
                    break;
                }
            }
            if (isCompleted && _this.isDataReady) {
                clearInterval(timer);
                _this.hideLoading();  
            }
        }, 500);
    },

    initPipelines: function () {
        this.dictPipelines = {};
        if (this.store.pipelines) {
            var item, tempLine;
            for (var i = 0; i < this.store.pipelines.length; i++) {
                item = this.store.pipelines[i];

                tempLine = new ModelPipeline(item.id, null, null);
                tempLine.x = parseInt(item.startX);
                tempLine.y = parseInt(item.startY);
                tempLine.startX = parseInt(item.startX);
                tempLine.startY = parseInt(item.startY);
                tempLine.endX = parseInt(item.endX);
                tempLine.endY = parseInt(item.endY);
                tempLine.lineWidth = parseInt(item.width);
                tempLine.direction = item.direction == "1" ? false : true;
                tempLine.speed = 1;
                tempLine.layer = item.layer;
                tempLine.waterType = item.waterType;
                tempLine.color = item.color

                if (item.idCom && item.idCom.toString() != "") {
                    tempLine.idCom = item.idCom;
                    var arr = item.idCom.split(',');
                    for (var j = 0; j < arr.length; j++) {
                        if (arr[j] && arr[j].toString() != "") {
                            tempLine.dictIdCom[arr[j]] = false;
                            this.addElementIdIntoDictRefreshMap(arr[j], this.enmuElementType.pipeline, item.id);
                        }
                    }
                }

                this.dictPipelines[item.id] = tempLine;
            }
        }
    },

    initEquipments: function () {
        this.dictEquipments = {};
        if (this.store.equipments) {
            var item, tempEquip;
            for (var i = 0; i < this.store.equipments.length; i++) {
                item = this.store.equipments[i];

                tempEquip = new ModelEquipment(item.id, null, null);
                tempEquip.x = item.x;
                tempEquip.y = item.y;
                tempEquip.width = item.width;
                tempEquip.height = item.height;
                tempEquip.animation = item.animation;
                tempEquip.idCom = item.idCom;
                tempEquip.layer = item.layer;

                if (!item.isFromAnimation) {
                    tempEquip.image = this.dictImages[item.idPicture];
                }
                else {
                    if (tempEquip.animation[0]) {
                        tempEquip.image = this.dictImages[tempEquip.animation[0].animationId];
                    }
                }

                if (item.rotate != "0.0") tempEquip.rotate = item.rotate;

                if (item.idCom && item.id != "")
                    this.addElementIdIntoDictRefreshMap(item.idCom, this.enmuElementType.equipment, item.id);
                if (item.link > -1) {
                    tempEquip.link = item.link;
                    this.hitModel.add(item.id, this.enmuElementType.equipment, item.x, item.y, item.width, item.height);
                }
                this.dictEquipments[item.id] = tempEquip;
            }
        }
    },

    initCharts: function () {
        this.dictCharts = {};
        function ChartFactory(elementType) {
            var chart;
            switch (Number(elementType)) {
                case 52:
                    chart = LineChart;
                    break;
                case 53:
                    chart = BarChart;
                    break;
                case 54:
                    chart = PieChart;
                    break;
                default:
                    chart = LineChart;
            }
            return chart;
        }

        if (this.store.charts) {
            var item, tempChart;
            for (var i = 0; i < this.store.charts.length; i++) {

                item = this.store.charts[i];
                var ElementChart = ChartFactory(item.elementType)
                tempChart = new ElementChart(item.id, null, null);
                tempChart.x = item.x;
                tempChart.y = item.y;
                tempChart.width = item.width;
                tempChart.height = item.height;
                tempChart.units = item.data;
                if (item.interval && item.interval != '') tempChart.interval = item.interval;

                tempChart.init();

                for (var j = 0; j < item.data.length; j++)
                    this.addElementIdIntoDictRefreshMap(item.data[j].pointName, this.enmuElementType.chart, item.id);
                this.dictCharts[item.id] = tempChart;
            }
        }
    },

    initGages: function () {
        this.dictGages = {};
        if (this.store.gages) {
            var item, tempGage;
            for (var i = 0; i < this.store.gages.length; i++) {
                item = this.store.gages[i];

                tempGage = new ModelGage(item.id, null, null);
                tempGage.width = item.width;
                tempGage.height = item.height;
                tempGage.idCom = item.idCom;
                tempGage.minValue = item.min;
                tempGage.maxValue = item.max;

                if (item.pagetype === 'floating' && item.xposition && item.yposition) {
                    tempGage.x = item.x - item.xposition;
                    tempGage.y = item.y - item.yposition;
                } else {
                    tempGage.x = item.x;
                    tempGage.y = item.y;
                }

                this.addElementIdIntoDictRefreshMap(item.idCom, this.enmuElementType.gage, item.id);
                this.dictGages[item.id] = tempGage;
            }
        }
    },

    initRulers: function () {
        this.dictRulers = {};
        if (this.store.rulers) {
            var item, tempRuler;
            for (var i = 0; i < this.store.rulers.length; i++) {
                item = this.store.rulers[i];

                tempRuler = new ModelRuler(this, item.id, null, null);
                tempRuler.x = item.x;
                tempRuler.y = item.y;
                tempRuler.width = item.width;
                tempRuler.height = item.height;

                tempRuler.minValue = item.min;
                tempRuler.maxValue = item.max;
                tempRuler.name = item.name;
                tempRuler.decimal = item.decimal;
                tempRuler.mainScale = item.mainScale;
                tempRuler.minorScale = item.minorScale;

                for (var j = 0; j < item.levels.length; j++) tempRuler.levels.push(item.levels[j]);
                for (var j = 0; j < item.references.length; j++) {
                    if (item.references[j].idCom != "") {
                        this.addElementIdIntoDictRefreshMap(item.references[j].idCom, this.enmuElementType.ruler, item.id);
                    }
                    tempRuler.references.push(item.references[j]);
                }

                tempRuler.init();
                this.dictRulers[item.id] = tempRuler;
                for (var n = 0, len = tempRuler.references.length; n < len; n++) {
                    var ref = tempRuler.references[n];
                    Number(ref.isInUp) !== 1 && ref.panel && this.hitModel.add(item.id + '_' + n, this.enmuElementType.ruler, ref.panel.x, ref.panel.y, ref.panel.w, ref.panel.h);
                }
            }
        }
    },

    initButtons: function () {
        this.dictButtons = {};
        if (this.store.buttons) {
            var item, tempButton;
            for (var i = 0; i < this.store.buttons.length; i++) {
                item = this.store.buttons[i];

                tempButton = new ModelButton(item.id, null, null);
                tempButton.x = item.x;
                tempButton.y = item.y;
                tempButton.width = item.width;
                tempButton.height = item.height;
                tempButton.image = this.dictImages[item.comm];
                tempButton.imageComm = this.dictImages[item.comm];
                tempButton.imageOver = this.dictImages[item.over];
                tempButton.imageDown = this.dictImages[item.down];
                tempButton.imageDisable = this.dictImages[item.disable];
                tempButton.idCom = item.idCom;
                tempButton.setValue = item.setValue;
                tempButton.description = item.description;
                tempButton.layer = item.layer;
                tempButton.fontSize = item.fontSize;
                tempButton.fontColor = item.fontColor;
                tempButton.relation = item.relation;
                tempButton.relatType = item.relatType;
                tempButton.button = 1;

                if (item.text) tempButton.text = item.text;
                if (item.link > -1) tempButton.link = item.link;
                //添加到实时刷新
                this.addElementIdIntoDictRefreshMap(item.idCom, this.enmuElementType.button, item.id);

                this.hitModel.add(item.id, this.enmuElementType.button, item.x, item.y, item.width, item.height);

                this.dictButtons[item.id] = tempButton;
            }
        }
    },

    //初始化复选框
    initCheckboxs: function () {
        var _this = this;
        this.dictCheckboxs = {};
        if (this.store.checkboxs) {
            var item, tempCheckbox 
            for (var i = 0; i < this.store.checkboxs.length; i++) {
                item = _this.store.checkboxs[i]
                tempCheckbox = new ModelCheckBox(item.id, null, null);
                tempCheckbox.x = item.x;
                tempCheckbox.y = item.y;
                tempCheckbox.width = item.width;
                tempCheckbox.height = item.height;
                tempCheckbox.layer = item.layer;
                tempCheckbox.idCom = item.idCom;
                tempCheckbox.type = item.type;
                tempCheckbox.fontColor = item.fontColor;
                tempCheckbox.fontSize = item.fontSize;
                tempCheckbox.setValue = item.setValue;
                tempCheckbox.unsetValue = item.unsetValue;
                tempCheckbox.text = item.text;
                tempCheckbox.idGroup = item.idGroup;
                tempCheckbox.expression = item.expression;
                tempCheckbox.image = new Image();
                tempCheckbox.checkbox = 'checkbox'
                tempCheckbox.image.src = appConfig.staticImage+"/omsite/check_btn_unsel_com.png"
                _this.hitModel.add(item.id, _this.enmuElementType.checkbox, item.x, item.y, item.width, item.height);
                _this.dictCheckboxs[item.id] = tempCheckbox;
                if (this.store.checkboxs[i].idCom && this.store.checkboxs[i].id != "") {
                    this.addElementIdIntoDictRefreshMap(this.store.checkboxs[i].idCom, this.enmuElementType.checkbox, this.store.checkboxs[i].id);
                }
            }
        }
    },

    initTempDistribution: function () {
        this.dictTempDistributions = {};
        if (this.store.tempDistributions
            && !!this.store.tempDistributions.data
            && this.store.tempDistributions.data.length) {
            var item, tempDistribution;
            item = this.store.tempDistributions;
            tempDistribution = new ModelTempDistribution(item.pageid, null, null);
            tempDistribution.layer = item.layer;
            tempDistribution.data = item.data;
            tempDistribution.width = item.width;
            tempDistribution.height = item.height;
            tempDistribution.x = item.x;
            tempDistribution.y = item.y;
            tempDistribution.heatType = item.heatType;
            tempDistribution.init();
            this.dictTempDistributions[item.pageid] = tempDistribution;
            for (var n = 0, len = item.data.length; n < len; n++) {
                var point = item.data[n];
                this.addElementIdIntoDictRefreshMap(point.idCom, this.enmuElementType.temperature, item.pageid);
            }
        } else if (this.id) {
            tempDistribution = new ModelTempDistribution(this.id, null, null);
            tempDistribution.init();
            this.dictTempDistributions[this.id] = tempDistribution;
        }
    },

    initRects: function () {
        var rects;
        
        this.dictRects = {};
        if (this.store.rects && this.store.rects.length) {
            for (var i = 0, row, len = this.store.rects.length; i < len; i++) {
                row = this.store.rects[i];
                rects = new ModelRect(row.id, null, null);

                rects.x = parseInt(row.x);
                rects.y = parseInt(row.y);
                rects.width = parseInt(row.width);
                rects.height = parseInt(row.height);
                rects.layer = row.layer;

                this.dictRects[row.id] = rects;
            }
        }
    },

    //初始化文字 william
    initTexts: function () {
        var _this = this;
        this.dictTexts = {};
        console.log(this.store.texts)
        if (this.store.texts) {
            var item, tempText;
            //根据得到的数据遍历  william
            for (var i = 0; i < this.store.texts.length; i++) {
                item = this.store.texts[i];
                tempText = new ModelText(item.id, null, null);
                tempText.x = item.x;
                tempText.y = item.y;
                tempText.width = item.width;
                tempText.height = item.height;
                tempText.value = item.text;
                tempText.fontSize = item.fontSize;
                tempText.decimalplace = item.decimalplace;
                tempText.font = item.font;
                tempText.showMode = item.showMode;
                tempText.readWrite = item.rw;
                tempText.layer = item.layer;
                tempText.align = item.align;
                tempText.options = this.options
                if (item.showMode == 0 && item.bindString && item.bindString != "") {
                    var arr = item.bindString.split("|");
                    var strs;
                    for (var j = 0; j < arr.length; j++) {
                        strs = arr[j].split(":");
                        tempText.dictBindString[strs[0]] = strs[1];
                    }
                }
                if (item.color) {
                    tempText.color = 'rgb(' + item.color.b + ',' + item.color.g + ',' + item.color.r + ')';
                }
                if (item.idCom && item.id != "") {
                    tempText.idCom = item.idCom;
                    tempText.value = "--";
                    //this.addElementIdIntoDictRefreshMap(item.idCom, this.enmuElementType.text, item.id);
                }

                if (item.idCom && item.id != "") {
                    //this.hitModel.add(item.id, this.enmuElementType.text, item.x, item.y - (item.height / 2), item.width, item.height);
                }
                this.dictTexts[item.id] = tempText;
            }
        }
    },
    //添加元素id
    addElementIdIntoDictRefreshMap: function (idCom, enmuElementType, elementId) {
        //idCom就是
        console.log(this.dictRefreshMap)
        if (!this.dictRefreshMap[idCom])
            this.dictRefreshMap[idCom] = {
                pipelines: [],
                equipments: [],
                buttons: [],
                texts: [],
                charts: [],
                gages: [],
                rulers: [],
                tempDistributions: [],
                checkboxs:[]   //william add
            };
        switch (enmuElementType) {
            case this.enmuElementType.checkbox:
                this.dictRefreshMap[idCom].checkboxs.push(elementId);
                break;
            case this.enmuElementType.text:
                this.dictRefreshMap[idCom].texts.push(elementId);
                break;
            case this.enmuElementType.pipeline:
                this.dictRefreshMap[idCom].pipelines.push(elementId);
                break;
            case this.enmuElementType.equipment:
                this.dictRefreshMap[idCom].equipments.push(elementId);
                break;
            case this.enmuElementType.chart:
                this.dictRefreshMap[idCom].charts.push(elementId);
                break;
            case this.enmuElementType.button:
                this.dictRefreshMap[idCom].buttons.push(elementId);
                break;
            case this.enmuElementType.gage:
                this.dictRefreshMap[idCom].gages.push(elementId);
                break;
            case this.enmuElementType.temperature:
                this.dictRefreshMap[idCom].tempDistributions.push(elementId);
                break;
            case this.enmuElementType.ruler:
                this.dictRefreshMap[idCom].rulers.push(elementId);
                break;
            default:
                break;
        }
    },

    addImageIntoRequestQueue: function (id) {
        /*
        if (this.dictImages[id]) return this.dictImages[id];
        
        var img = new Image();
        img.src = appConfig.imageUrl + window.localStorage.selectedProjectNameEn + `/${id}.png`;

        var _this = this;
        img.addEventListener("load", function (e) {
            _this.indexImageLoaded++;
        });

        this.dictImages[id] = img;
        return img;*/
    },

    //enmu of element type
    enmuElementType: {pipeline: 0, equipment: 1, button: 2, text: 3, chart: 4, gage: 5, ruler: 6, temperature: 7, checkbox: 8}
};

export default ObserverScreen;
