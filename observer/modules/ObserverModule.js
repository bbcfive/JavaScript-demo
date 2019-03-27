import http from '../../../common/http'
// import {message} from 'antd'
import CheckWorker from '../../../common/checkWorker'
import {syncFunc} from '../../../common/utils'
import appConfig from '../../../common/appConfig'
// ------------------------------------
// Constants
// ------------------------------------
export const RESET = 'observer.RESET';
export const TOGGLE_TIMESHAFT = 'observer.TOGGLE_TIMESHAFT';
export const OBSERVER_PARMS = 'observer.OBSERVER_PARMS';
export const UPDATE_PAGE_ID = 'observer.UPDATE_PAGE_ID'
export const SHOW_SWITCH = 'observer.SHOW_SWITCH'
export const HIDE_SWITCH = 'observer.HIDE_SWITCH'
export const VALUE_LOADING = 'observer.VALUE_LOADING'
export const UPDATE_OPERATE_DATA = 'observer.UPDATE_OPERATE_DATA'
export const TOGGLE_LOADING = 'observer.TOGGLE_LOADING'
export const SHOW_CHECKBOX = 'observer.SHOW_CHECKBOX'
export const HIDE_CHECKBOX = 'observer.HIDE_CHECKBOX'
export const ADD_PAGE_CHCHE = 'observer.ADD_PAGE_CHCHE'
export const DELETE_PAGE_CACHE = 'observer.DELETE_PAGE_CACHE';
export const GET_PAGES = 'observer.GET_PAGES';
export const SAVE_OBSERVER_PAGE_ID = 'observer.SAVE_OBSERVER_PAGE_ID'

export const SHOW_INSTRUCT_MODAL = 'observer.SHOW_INSTRUCT_MODAL'
export const HIDE_INSTRUCT_MODAL = 'observer.HIDE_INSTRUCT_MODAL'
export const GET_POINT_INFO = 'observer.GET_POINT_INFO';
// ------------------------------------
// Actions
// ------------------------------------ 

export function initializePageData() {
  return function (dispatch, getState) {
    let selectedProjectId = 374;
    return http.get('http://47.100.17.99/api/omlab/getPages?projectId='+selectedProjectId).then(
      data => {
        console.log(data);
        if (data.status==='OK') {
          
          let observerPages = [] , dashboardPages = [];
          data.data.pages.forEach(page=>{
            if(page.type === 'Observer'){
              observerPages.push(page)
            }else{
              dashboardPages.push(page)
            }
          })
          
          dispatch({
            type: GET_PAGES,
            data: {
              nav : data.data.nav,
              observerPages,
              dashboardPages
            }
          });

          return observerPages[0]["_id"]
        }else{
          // message.error('设备页面为空，无法查看',2.5)
        }
      }
    );
  }
}

export const saveObserverPage_Id = (observerPage_Id) => {
  return {
    type : SAVE_OBSERVER_PAGE_ID,
    observerPage_Id : observerPage_Id
  }
}

//保存observerScreen中的方法
export const observerScreenParms = (parmsDict) => {
  return {
    type : OBSERVER_PARMS,
    parmsDict
  }
}

export const updatePageId = (pageId) => {
  return {
    type : UPDATE_PAGE_ID,
    pageId
  }
}
// 显示指令下发模态框
export function showInstructModal(modalType,modalProps){
  return {
    type : SHOW_INSTRUCT_MODAL ,
    modalType,
    modalProps
  }
}

// 隐藏指令下发模态框
export function hideInstructModal(){
  return {
    type : HIDE_INSTRUCT_MODAL
  }
}


//弹出设备开关模态框
export function showOperatingModal(modalType,modalProps) {
  return showInstructModal(modalType,modalProps)
}


//弹出优化设置值模块
export function showOptimizeModal(modalType,modalProps) {
  console.log('showOptimizeModal');
  return getPointInfo(modalType,modalProps);
}

//获取点名信息
export function getPointInfo(modalType,modalProps) {
  let pointName = [];
  let idCom = '';
  if (modalProps.idCom) {
    idCom = modalProps.idCom
    pointName.push(modalProps.idCom)
  }
  return function (dispatch,getState) {
    return http.post('http://47.100.17.99/api/analysis/get_point_info_from_s3db',{
      pointList: pointName
    }).then(
      serverData =>{
        if(serverData) {
          dispatch({
            type: GET_POINT_INFO,
            pointInfo:serverData.data[idCom]
          });
         dispatch(showInstructModal(modalType, modalProps));
        }else {
          dispatch(showInstructModal(modalType, modalProps));
        }
      }
    ).catch(
      () =>{
      dispatch(showInstructModal(modalType, modalProps));
      }
    )
  }
}


//界面上的优化设置值模块
export function optimizeSetting(data,idCom) {
  return function (dispatch,getState) {
    let projId = getState().home.selectedProjectId
    //往后台传的都是数组格式
    let setValue = []
    if (data.settingValue !== 'undefined') {
      setValue.push(String(data.settingValue))
    }
    let pointName = []
    if (idCom) {
      pointName.push(idCom)
    }
    return http.post('http://47.100.17.99/api/set_data_to_site_by_projid',{
        projId:projId,
        pointList:pointName,
        valueList:setValue,
        reason:data.reason,
        userId:JSON.parse(window.sessionStorage.getItem('user')).id,
        userPwd: data.pwd
    }).then(
      serverData =>{
        if(serverData.err >= 1) {
        //  message.error(serverData.msg,3)
        } else {
          //dispatch(valueLoading(true));
          //dispatch(refreshData(pointName,setValue[0]))
          dispatch(hideInstructModal()); 
          // message.success("指令已发送成功，现场处理成功并反馈可能需要一段时间，请耐心等待",3);
        }
      }
    )
  }
}

// 一键开关机 , 单选按钮 ， 设值
export function operateSwitch(idCom,setValue,description,unsetValue,reason,userPwd) {
 return function (dispatch,getState) {
        let projId = getState().home.selectedProjectId
        var valueList = [setValue]
        let pointName = []
        if (idCom) {
          pointName.push(idCom)
        }
        //设置点值
        dispatch(updateOperateData(true,''))
        return http.post('http://47.100.17.99/api/set_data_to_site_by_projid',{
            projId:projId,
            pointList:pointName,
            valueList:valueList,
            reason:reason,
            userId:JSON.parse(window.sessionStorage.getItem('user')).id,
            userPwd: userPwd
        }).then(
          serverData =>{
            if(serverData.err) {
              // message.error(serverData.msg,2.5)
            }else {
              // dispatch(valueLoading(true));
              // //设置完点值后获取当前点名 , 点值，开始和后台数据对比
              // dispatch(refreshSwitch(pointName,valueList[0]));
              // message.success('指令已发送成功，现场处理成功并反馈可能需要一段时间，请耐心等待',2.5)
              dispatch(hideInstructModal()); 
            }
          }
        ).catch(
          ()=>{
            // message.error('服务器通讯失败')
          }
        )
 }
}

// 修改checkbox模态框
export function showMainCheckboxModal(modalType,modalProps){
  return showInstructModal(modalType, modalProps)
}

//checkbox指令下发函数
export function checkboxSetting(idCom,setValue,text,unsetValue,reason,userPwd) {
  return function (dispatch, getState) {
    let nextValue
    let projId = getState().home.selectedProjectId
    
    http.post('http://47.100.17.99/api/get_realtimedata',{
      pointList: [idCom],
      proj:projId
    }).then(
      data=>{
        if(data[0]['value'] === setValue ){ //如果点击的时候点值等于自带的setvalue就表示要取消选中
          nextValue = unsetValue
        }else{ //其他都是就表示要选中
          nextValue = setValue.toString()
        }
         
        http.post("http://47.100.17.99/api/set_data_to_site_by_projid",{
          projId:projId,
          pointList:[idCom],
          valueList:[nextValue],
          reason:reason,
          userId:JSON.parse(window.sessionStorage.getItem('user')).id,
          userPwd: userPwd
          }).then(
            serverData =>{
              if(serverData.err>=1){
                // message.err("修改失败")
              } else{
                  dispatch(hideInstructModal()); 
              }
            }
          ) 
      }
    )  
  }
}


// //设备开关的刷新检查
// export function refreshSwitch(pointName,value) {
//  return function  (dispatch,getState) {
//    //得到后台更新的点值,对比,2s循环检测，正确后结束loading
   
//     let checkWorker = new CheckWorker(function (info, next, stop) {
//         http.post('/api/get_realtimedata',{
//             pointList: pointName,
//             proj: window.localStorage.selectedProjectId
//           }).then(
//             data =>{
//                 console.info( data )
//                 if(!data[0] || data[0]["value"] != value){
//                     //执行下一次check，触发progress事件
//                     //如果达到设置的check次数，会还会触发complete
//                     next(); 
//                 } else {
//                     // 直接停止，无需执行下一次 check
//                     // 会触发 progress 和 stop 事件
//                     dispatch(switchHide()); 
//                     dispatch(valueLoading(false));
//                     stop();
//                 }
//             }
//           )
//       }, {
//       // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
//       })

//       checkWorker
//       .on('progress', function ({progress}) {console.info('progress', progress)})
//       .on('stop', function ({progress}) {
//         dispatch(updateOperateData(false,'指令发送成功'))
//       })
//       .on('complete', function ({progress}) { 
//         dispatch(updateOperateData(false,'指令发送失败请重试'))
//       })
//       .start()
//  }
// }




//优化选项的刷新检查
export function refreshCheckbox(pointName,value) {
  return function(dispatch,getState){
    new CheckWorker(function (info, next, stop) {
      http.post('http://47.100.17.99/api/get_realtimedata',{
            pointList: pointName,
            proj: window.localStorage.selectedProjectId
          }).then(
            data =>{
                if(!data[0]||data[0]["value"] != value){
                    //执行下一次check，触发progress事件
                    //如果达到设置的check次数，会还会触发complete
                    next(); 
                } else {
                    // 直接停止，无需执行下一次 check
                    // 会触发 progress 和 stop 事件
                    dispatch(checkboxHide()); 
                    dispatch(valueLoading(false));
                    stop();
                }
            }
          )
      }, {
      // 自定义 check 次数和 check 间隔，不填则使用默认值（见文件顶部）
    })
    .on('progress', function ({progress}) {console.info('progress', progress)})
    .on('stop', function ({progress}) {
      dispatch(updateOperateData(false,'指令发送成功'))
    })
    .on('complete', function ({progress}) { 
      dispatch(updateOperateData(false,'指令发送失败，请重试。'))
    })
    .start()
  }
}

//更新设备数据
export function updateOperateData(status,description){
  return {
    type : UPDATE_OPERATE_DATA,
    conditionDict : {
      status : status,
      description : description || ''
    }
  }
}


//保存loading状态
export function toggleLoading(loading){
  return {
    type : TOGGLE_LOADING,
    loading
  }
}

// 缓存历史数据模式下页面数据
export function addPageHistoryCache(cache){
  return {
    type : ADD_PAGE_CHCHE,
    cache
  }
}

export function deletePageCache(){
  return {
    type : DELETE_PAGE_CACHE
  }
}


export const actions = {
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RESET]: (state) => {
    return initialState;
  },
  [GET_PAGES] : (state,action) => {
    return {...state, pageData : action.data}
  },
  [SAVE_OBSERVER_PAGE_ID] : (state,action) => {
    return {...state,observerPage_Id : action.observerPage_Id}
  },
  // [TOGGLE_TIMESHAFT]: (state) => {
  //   return { ...state, bShowTimeShaft: !state.bShowTimeShaft }
  // },
  [OBSERVER_PARMS] :(state,action) => {
    return {...state , parmsDict :action.parmsDict }
  },
  [UPDATE_PAGE_ID] : (state,action) => {
    return {...state,parmsDict:{...state.parmsDict,pageId}}
  },
  [SHOW_SWITCH] : (state, action) => {
    return { ...state, operateModalVisible: action.operateModalVisible, operateData: action.operateData }
  },
  [HIDE_SWITCH] : (state) => {
    return { 
      ...state, 
      operateModalVisible: null, 
      operateData: {...state.operateData,description:''} ,
      conditionDict:{status : false,description : ''}
    }
  },
  [VALUE_LOADING]: (state, action) => {
    return {...state, operateIsLoading: action.isLoading }
  },
  [UPDATE_OPERATE_DATA] : (state,action) =>{
    return {...state,conditionDict:action.conditionDict }
  },
  [TOGGLE_LOADING] : (state,action) => {
    return {...state,loading:action.loading}
  },
  [SHOW_CHECKBOX] : (state,action) =>{
    return {...state,operateModalVisible: action.operateModalVisible, operateData: action.operateData }
  },
  [HIDE_CHECKBOX] : (state,action) => {
    return { ...state, operateModalVisible: null, operateData: {...state.operateData,description:''} ,operateIsLoading:false,conditionDict:{status : false,description : ''}}
  },
  [ADD_PAGE_CHCHE] : (state,action) => {
    return {...state,obPageCache:{...state.obPageCache,...action.cache}}
  },
  [DELETE_PAGE_CACHE] : (state) => {
    return {...state,obPageCache:{}}
  },
  [SHOW_INSTRUCT_MODAL] : (state,action) => {
    return {...state,instructModal : {modalType:action.modalType,modalProps:action.modalProps} }
  },
  [HIDE_INSTRUCT_MODAL] : (state,action) => {
    return {...state,instructModal : {modalType:null,modalProps:{}}}
  },
  [GET_POINT_INFO]: (state, action) => {
    return {...state, pointInfo: action.pointInfo}
  },
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  parmsDict:{},
  operateModalVisible: false,
  operateData: {},
  operateIsLoading : false,
  conditionDict:{
    status : false,
    description : ''
  },
  loading : false,
  obPageCache : {},
  pageData : {
    observerPages : [],
    dashboardPages : [],
    nav:[]
  },
  observerPage_Id : '',
  instructModal : {
    modalType:null,
    modalProps:{}
  },
  
  pointInfo: '',
};
export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
