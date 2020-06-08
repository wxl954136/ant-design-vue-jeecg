<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="银行名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['bankName', validatorRules.bankName]" placeholder="请输入银行名称"></a-input>
        </a-form-item>
        <a-form-item label="开户行" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['bankAddress', validatorRules.bankAddress]" placeholder="请输入开户行"></a-input>
        </a-form-item>
        <a-form-item label="银行卡号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['bankCardNo', validatorRules.bankCardNo]" placeholder="请输入银行卡号"></a-input>
        </a-form-item>
        <a-form-item label="银行归属人" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['bankBelong', validatorRules.bankBelong]" placeholder="请输入银行归属人"></a-input>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['memo', validatorRules.memo]" placeholder="请输入备注"></a-input>
        </a-form-item>
        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['bankSort', validatorRules.bankSort]" placeholder="请输入排序" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="启用状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['enableFlag', {'initialValue':1}]" :trigger-change="true" dictCode="sys_enable_status" placeholder="请选择启用状态"/>
        </a-form-item>

      </a-form>
    </a-spin>
  </j-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
  import {duplicateCheck } from '@/api/api'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"


  export default {
    name: "SysBankModal",
    components: { 
      JDictSelectTag,
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        width:800,
        visible: false,
        bankId:'',
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {
          bankName: {
            rules: [
              { required: true, message: '请输入银行名称!'},
              { validator: this.validateBankName }
            ]
          },
          bankAddress: {
            rules: [
              { required: true, message: '请输入开户行!'},
            ]
          },
          bankCardNo: {
            rules: [
              { required: true, message: '请输入银行卡号!'},
            ]
          },
          bankBelong: {
            rules: [
              { required: true, message: '请输入银行归属人!'},
            ]
          },
          memo: {
            rules: [
              { required: false, message: '请输入备注!'},
            ]
          },
          bankSort: {
            rules: [
              { required: true, message: '请输入排序!'},
            ]
          },
          enableFlag: {
            rules: [
              { required: true, message: '请输入启用状态!'},
            ]
          },
        },
        url: {
          add: "/bank/sysBank/add",
          edit: "/bank/sysBank/edit",
        }
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        let that = this;
        that.bankId = record.id;
        that.form.resetFields();
        that.model = Object.assign({}, record);
        that.visible = true;
        that.$nextTick(() => {
          that.form.setFieldsValue(pick(this.model,'bankName','bankAddress','bankCardNo','bankBelong','memo','bankSort','enableFlag'))
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values);
            console.log("表单提交数据",formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })
          }
         
        })
      },
      handleCancel () {
        this.close()
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'bankName','bankAddress','bankCardNo','bankBelong','memo','bankSort','enableFlag'))
      },
      validateBankName(rule, value, callback){
        var params = {
          tableName: 'sys_bank',
          fieldName: 'bank_name',
          fieldVal: value,
          fieldGsdm:'gsdm',
          dataId: this.bankId
        };
        duplicateCheck(params).then((res) => {
          if (res.success) {
            callback()
          } else {
            callback("该银行名称已经存在!")
          }
        })
      }

      
    }
  }
</script>