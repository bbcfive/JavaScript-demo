/**
 * 项目统一模态框
 */

import React, { Component} from 'react';

import { Instruct_modalTypes } from '../../../../common/enum';
import OneClickOnOffModal from './OneClickOnOffModal';
import OptimizeValueModal from './OptimizeValueModal';
import CheckboxModal from './CheckboxSwitchModal'


class Modal extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }
  render() {
    if (!this.props.modalType) {
      return null;
    }

    const {
      modalType, //props
      modalProps,
      // 隐藏模态框的方法
      hideModal
      // 模态框改值方法

    } = this.props;

    if ( modalType === Instruct_modalTypes.ONE_KEY_OPERATE_MODAL ){
      return (
        <OneClickOnOffModal
          { ...modalProps }
          hideModal={hideModal}
          operateSwitch={this.props.operateSwitch}
        />
      )
    } else if(modalType === Instruct_modalTypes.OPTIMIZE_VALUE_MODAL ){

      return (
        <OptimizeValueModal
          { ...modalProps }
          hideModal={hideModal}
          pointInfo={this.props.pointInfo}
          optimizeSetting={this.props.optimizeSetting}
        />
      )
    }else if(modalType === Instruct_modalTypes.CHECKBOX_MODAL) {
      return (
        <CheckboxModal
          { ...modalProps }
          hideModal={hideModal}
          checkboxSetting={this.props.checkboxSetting}
        />
      )
    }
    else {
      return null;
    }
  }
}

Modal.propTypes = {
};

export default Modal;
