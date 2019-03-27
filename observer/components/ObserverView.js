/**
 * Observer 页面
 */

import React, { Component } from 'react';

import { List, Picker } from 'antd-mobile-rn';
import { StyleSheet, View, Text } from "react-native";
import ObserverScreen from './core/observerScreen';
import ObserverModal from '../../modal'
import InstructModal from './instructModal/InstructModal'

export default class Observer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      observerPages: props.observerPages, 
      observerPage_Id: props.observerPage_Id, 
      instructInfo: props.instructInfo,
    };

    this.divRef = null;
    this.observerScreen = null;

    this.saveDivRef = this.saveDivRef.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.renderScreen = this.renderScreen.bind(this);
    this.closeRealTimeFresh = this.closeRealTimeFresh.bind(this);
    this.startRealTimeFresh = this.startRealTimeFresh.bind(this);
    this.initHistroyData = this.initHistroyData.bind(this);
    this.getDataByTheTimeKey = this.getDataByTheTimeKey.bind(this)
  }

  saveDivRef(divRef) {
    this.divRef = divRef;
  }
  
  showLoading() {
    this.setState({
      //loading: true
    });
  }

  hideLoading() {
    this.setState({
      //loading: false
    });
  }

  componentDidMount() {
    //this.props.saveSelectedIndex(3) //底部导航栏状态更新

    this.props.initializePageData().then(observerPage_Id=> {
        this.renderScreen(observerPage_Id);
      }
    )
  }
  componentWillReceiveProps(nextProps) {
    if (
      this.props.observerPage_Id !== nextProps.observerPage_Id || 
      this.props.selectedProjectId != nextProps.selectedProjectId
    ) {
      if (this.observerScreen) {
        this.observerScreen.close();
      }
      this.renderScreen(nextProps.observerPage_Id);
      console.log('changed');
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.loading !== this.state.loading) {
      return true;
    }
    if( nextProps.instructInfo.modalType !== this.props.instructInfo.modalType ){
      return true
    }
    return false;
  }

  componentWillUnmount() {
    if (this.observerScreen) {
      this.observerScreen.close();
    }
  }

  //关闭实时刷新
  closeRealTimeFresh(){
    this.observerScreen.stop()
  }

  //获取历史模式数据
  initHistroyData(dictDate){
    return this.observerScreen.initHistroyData(dictDate)
  }

  // 根据时间轴的key获取保存的数据
  getDataByTheTimeKey(timeKey){
    return this.observerScreen.getDataByTheTimeKey(timeKey)
  }

  //退出回放，开始实时刷新
  startRealTimeFresh() {
    this.observerScreen.resite();
    this.observerScreen.show();
  }

  renderRealScreen= (id, bShowTimeShaft) => {
    console.log('renderRealScreen');
    console.log(this.props);
    this.observerScreen = new ObserverScreen(id, this.divRef, {
      showLoading: this.showLoading,
      hideLoading: this.hideLoading,
      // showObserverModal: this.props.showObserverModal,
      showOptimizeModal: this.props.showOptimizeModal,
      showMainOperatingPane : this.props.showOperatingModal,
      showMainCheckboxModal : this.props.showMainCheckboxModal,
      bShowTimeShaft : bShowTimeShaft || this.props.bShowTimeShaft, //判断值，判断是否开启实时刷新
      // dateProps : this.props.dateModal.props,
      curValue : this.props.curValue
    });

    //保存方法
    this.props.observerScreenParms({
      pageId:id, //页面id
      divRef:this.divRef, //容器
      closeRealTimeFresh:this.closeRealTimeFresh, //关闭实时刷新
      initHistroyData : this.initHistroyData, //刷新历史数据
      getDataByTheTimeKey : this.getDataByTheTimeKey,
      renderScreen : this.renderScreen,
      startRealTimeFresh : this.startRealTimeFresh,
    })

    this.observerScreen.show({screenType:'fullscreen'});
  }

  // 进入历史模式
  renderHistoryScreen = (id,bShowTimeShaft) => {
    const {obPageCache} = this.props
    if( id in obPageCache){  //已经包含缓存
      this.observerScreen = new ObserverScreen(id, this.divRef, {
        showLoading: this.showLoading,
        hideLoading: this.hideLoading,
        //showObserverModal: this.props.showObserverModal,
        showOptimizeModal: this.props.showOptimizeModal,
        showMainOperatingPane : this.props.showOperatingModal,
        showMainCheckboxModal : this.props.showMainCheckboxModal,
        bShowTimeShaft : bShowTimeShaft || this.props.bShowTimeShaft, //判断值，判断是否开启实时刷新
        // dateProps : this.props.dateModal.props,
        curValue : this.props.curValue
      });
      //保存方法
      this.props.observerScreenParms({
        pageId:id, //页面id
        divRef:this.divRef, //容器
        closeRealTimeFresh:this.closeRealTimeFresh, //关闭实时刷新
        initHistroyData : this.initHistroyData, //刷新历史数据
        getDataByTheTimeKey : this.getDataByTheTimeKey,
        renderScreen : this.renderScreen,
        startRealTimeFresh:this.startRealTimeFresh,
      })
      // 携带缓存
      this.observerScreen.show({screenType:'fullscreen',pageHistoryData:obPageCache[id]});
    }else{
      // 没有缓存
      
      this.observerScreen = new ObserverScreen(id || this.props.observerPage_Id, this.divRef, {
        showLoading: this.showLoading,
        hideLoading: this.hideLoading,
        //showObserverModal: this.props.showObserverModal,
        showOptimizeModal: this.props.showOptimizeModal,
        showMainOperatingPane : this.props.showOperatingModal,
        showMainCheckboxModal : this.props.showMainCheckboxModal,
        bShowTimeShaft : bShowTimeShaft || this.props.bShowTimeShaft, //判断值，判断是否开启实时刷新
        // dateProps : this.props.dateModal.props,
        curValue : this.props.curValue,
        addPageHistoryCache : this.props.addPageHistoryCache
      });
      //保存方法
      this.props.observerScreenParms({
        pageId:id, //页面id
        divRef:this.divRef, //容器
        closeRealTimeFresh:this.closeRealTimeFresh, //关闭实时刷新
        initHistroyData : this.initHistroyData, //刷新历史数据
        getDataByTheTimeKey : this.getDataByTheTimeKey,
        renderScreen : this.renderScreen,
        startRealTimeFresh:this.startRealTimeFresh,
      })
      this.observerScreen.show({screenType:'fullscreen'});
    }
  }

  renderScreen(id, bShowTimeShaft) {
    console.log(id, bShowTimeShaft);
    const {observerPages} = this.props;
    this.setState({ 
      loading: false,
      observerPages: observerPages, 
      observerPage_Id: id 
    });
  
    let observerPage_Id = id || this.props.observerPage_Id
    let newId  = observerPages.filter(page=>page._id == observerPage_Id )[0]['observerPageId']

    var bShowTimeShaft = bShowTimeShaft || this.props.bShowTimeShaft;

    this.renderRealScreen(newId,bShowTimeShaft);

    if(!bShowTimeShaft){ //实时模式
      this.renderRealScreen(newId,bShowTimeShaft)
    }else{
      this.renderHistoryScreen(newId,bShowTimeShaft)
    }
  }

  handleChange = (event, index, observerPage_Id) => {
    console.log('handleChange');    
    this.props.saveObserverPage_Id(this.state.observerPage_Id)
  }

  render() {

    //然后逐步渲染
    
    var { observerPages, observerPage_Id , instructInfo } = this.state;

    console.log(this.state)

    var observerPagesdb = [];

    observerPages.map(page=>{
      observerPagesdb.push({
        label: page.name,
        value: page.name,
      });
    })

    return (
      <View style={{ flex: 1 }}>
      {this.state.loading ? 
        <Text>Loading</Text>
        :
        <View style={ styles.container }>
          <View style={ styles.header }>
              <Picker
                data={ observerPagesdb }
                cols={1}
                //value={ observerPage_Id }
                onChange={ this.handleChange }
                keyExtractor={ item => item.id }
                //style={{ height: 50, width: 100, borderWidth: 1, borderColor: 'red' }}
              >
                <List.Item 
                  arrow="down"
                  style={{ 
                    width: 300, 
                    height: 30  
                  }}                  
                > 
                </List.Item>
              </Picker>     
          </View>
          <View style={ styles.content }>
              <View ref={this.saveDivRef}></View>
          </View>
          <InstructModal
                {...instructInfo}
                hideModal={this.props.hideInstructModal}
                operateSwitch={this.props.operateSwitch}
                pointInfo={this.props.pointInfo}
                optimizeSetting={this.props.optimizeSetting}
                checkboxSetting={this.props.checkboxSetting}
          />
        </View>
      } 
     </View>  
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    //backgroundColor: 'red' 
  },
  header: {
    height: 64,
    flexDirection: 'row',
    //backgroundColor: 'gray' 
  },
  content: {
    paddingTop: 64,
    //backgroundColor: 'blue'
  }
});
