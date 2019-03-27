import { connect } from 'react-redux';
import {
  observerScreenParms,
  updatePageId,
  showOperatingModal,
  toggleLoading,
  showMainCheckboxModal,
  addPageHistoryCache,
  deletePageCache,
  initializePageData,
  saveObserverPage_Id,
  hideInstructModal,
  showOptimizeModal,
  operateSwitch,
  optimizeSetting,
  checkboxSetting
} from '../modules/ObserverModule';

import ObserverView from '../components/ObserverView';

//import {
  // showCommomAlarm,
  //showMainInterfaceModal,
  //showObserverModal,
  // showOptimizeModal,
  // showOperatingModal,
  // operateSwitch,
//} from '../../modal/modules/ModalModule';

import {
  //onRouteEnter,
  //saveSelectedIndex,
} from '../../home/modules/HomeModule.js'

const mapActionCreators = {
  // showCommomAlarm,
  //showMainInterfaceModal,
  //showObserverModal,
  //showOperatingModal,
  showOptimizeModal,
  operateSwitch,
  //onRouteEnter,
  //saveSelectedIndex,
  observerScreenParms,
  updatePageId,
  toggleLoading,
  showMainCheckboxModal,
  addPageHistoryCache,
  deletePageCache,
  initializePageData,
  saveObserverPage_Id,
  hideInstructModal,
  optimizeSetting,
  checkboxSetting
}

const mapStateToProps = (state, props) => {

  return {
    selectedProjectId : 374, //state.home.selectedProjectId,
    observerPages : state.observer.pageData.observerPages,
    observerPage_Id : state.observer.observerPage_Id,
    instructInfo : state.observer.instructModal,
    pointInfo:state.observer.pointInfo
  };
}

export default connect(mapStateToProps, mapActionCreators)(ObserverView)
