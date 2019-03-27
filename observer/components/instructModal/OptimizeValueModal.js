/**
 * 报警配置页面
 */
import React, { Component} from 'react';
import { Text } from "react-native";
//import Dialog from 'material-ui/Dialog';
//import FlatButton from 'material-ui/FlatButton';
//import RaisedButton from 'material-ui/RaisedButton';
//import {TextField} from 'material-ui';

let checkInputIsEmpty = (function(){
  return function(value){
    return !!String.prototype.trim.call(value)
  }
})()

class OptimizeValueModal extends Component{
  constructor(props) {
    super(props);
    
    this.state = {
        isLimit : false,
        reason : '',
        reasonErrText : false,
        userPwd : '',
        userPwdErrText : false,
        value : '',
        valueErrText : false,
        modalH : null
    };
  }

  componentDidMount(){
      let h = parseInt(window.getComputedStyle(document.getElementById('container')).width)
      this.setState({value : this.props.currentValue,modalH : h})
  }

  onSubmit = () => {
    // 获取模态框的值
    const {reason,userPwd,value} = this.state;
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
    if(!checkInputIsEmpty(value)) {
      return this.setState({valueErrText : true})
    }else{
      this.setState({valueErrText : false})
    }
    this.props.optimizeSetting({
        currentValue : this.props.currentValue,
        pwd : userPwd,
        reason ,
        settingValue : value
    },idCom)

  }

  handleValue = (value) => {

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

    let description
    if(this.props.pointInfo){
      if (this.props.pointInfo.hight>this.props.pointInfo.low){  //判断有无高低限
       this.setState({
         isLimit: true
       })
     };
     description=this.props.pointInfo && this.props.pointInfo.description
    }
    return (
      <Text>hello</Text>
    )
  }
}

/*
      <Dialog
        title={ title || '设定优化值' }
        open={true}
        actions={actions}
        contentStyle={{
          height : this.state.modalH,
          width : '100%' ,
          transformOrigin: "0% 0%",
          WebkitTransformOrigin : '0%,0%',
          msTransformOrigin : '0%,0%',
          transform: "rotate(90deg) translateY(-100%) ",
          WebkitTransform : "rotate(90deg) translateY(-100%) ",
          msTransform : "rotate(90deg) translateY(-100%) ",
        }}
      >
        <div>
            当前值&nbsp;&nbsp;:
            <TextField
                hintText="当前值"
                defaultValue={this.props.currentValue}
                style={{width:120,height:45}}
                disabled={true}
            />
        </div>
        <div>
            高低限&nbsp;&nbsp;:
            <TextField
                hintText="高低限"
                defaultValue={this.state.isLimit ? (this.props.pointInfo.low + '~' + this.props.pointInfo.height) : '不受限制'}
                style={{width:120,height:45}}
                disabled={true}
            />
        </div>
        <div>
            设置新值:
            <TextField
                hintText="设置新值"
                onChange={(e,value)=>{this.handleValue(value)}}
                value={this.state.value}
                style={{width:120,height:45}}
                errorText={this.state.valueErrText ? '请填写新设置的值' : ''}
            />
        </div>
        <div>
            修改原因:
            <TextField
                hintText="修改原因"
                onChange={(e,value)=>{this.handleReason(value)}}
                errorText={this.state.reasonErrText ? '请填写修改原因' : ''}
                value={this.state.reason}
                style={{width:120,height:45}}
            />
        </div>

        <div>
            用户密码:
            <TextField
                hintText="密码"
                onChange={(e,value)=>{this.handlePassword(value)}}
                errorText={this.state.userPwdErrText ? '请填写用户密码' : ''}
                value={this.state.userPwd}
                style={{width:120,height:45}}
                type='password'
            />
        </div>
      </Dialog>
      */
export default OptimizeValueModal
