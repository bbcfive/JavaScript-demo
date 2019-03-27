/**
 * 报警配置页面
 */
import React, { Component} from 'react';
import { Text } from "react-native";
//import Dialog from 'material-ui/Dialog';
//import FlatButton from 'material-ui/FlatButton';
//import RaisedButton from 'material-ui/RaisedButton';
//import {TextField} from 'material-ui';

// import http from '../../../common/http';

let checkInputIsEmpty = (function(){
  return function(value){
    return !!String.prototype.trim.call(value)
  }
})()

class OneClickOnOffModal extends Component{
  constructor(props) {
    super(props);
    
    this.state = {
      reason : '',
      reasonErrText : false,
      userPwd : '',
      userPwdErrText : false,
    };
  }

  onSubmit = () => {
    // 获取模态框的值
    const {reason,userPwd} = this.state;
    const {idCom,setValue,description,unsetValue} = this.props
    if(!checkInputIsEmpty(reason) ){
      return this.setState({reasonErrText : true})
    }else{
      this.setState({reasonErrText : false})
    }

    if(!checkInputIsEmpty(userPwd)) {
      return this.setState({userPwdErrText : true})
    }else{
      this.setState({userPwdErrText : false})
    }

    this.props.checkboxSetting(idCom,setValue,description,unsetValue,reason,userPwd)
  }


  handleReason = (value) => {
    this.setState({reason:value})
  }

  handlePassword = ( value ) => {
    this.setState({userPwd : value})
  }

  render(){
    let {
      visible,
      hideModal,
      title
    } = this.props


    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={hideModal}
      />,

      <FlatButton
        label="OK"  
        primary={true}
        onClick={this.onSubmit}
      />
    ];
    
    visible = typeof visible === 'undefined' ? true : visible;

    return (
      <Text>hello</Text>
    )
  }
}

/*
      <Dialog
        title={ title || '设备状态切换' }
        open={true}
        actions={actions}
        contentStyle={{
          width : '100%' ,
          transformOrigin: "0% 0%",
          WebkitTransformOrigin : '0%,0%',
          msTransformOrigin : '0%,0%',
          transform: "rotate(90deg) translateY(-100%) ",
          WebkitTransform : "rotate(90deg) translateY(-100%) ",
          msTransform : "rotate(90deg) translateY(-100%) ",
        }}
      >
        <TextField
            hintText="修改原因"
            onChange={(e,value)=>{this.handleReason(value)}}
            errorText={this.state.reasonErrText ? '请填写修改原因' : ''}
            value={this.state.reason}
            style={{width:120,height:45}}
        />

        <TextField
            hintText="密码"
            onChange={(e,value)=>{this.handlePassword(value)}}
            errorText={this.state.userPwdErrText ? '请填写用户密码' : ''}
            value={this.state.userPwd}
            style={{width:120,height:45}}
            type='password'
        />
      </Dialog>
      */

export default OneClickOnOffModal
