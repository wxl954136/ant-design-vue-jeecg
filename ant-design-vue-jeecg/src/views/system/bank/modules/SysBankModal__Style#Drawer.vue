<template>
  <a-drawer
    :title="title"
    :width="width"
    placement="right"
    :closable="false"
    @close="close"
    :visible="visible">
  
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
          <j-dict-select-tag type="list" v-decorator="['enableFlag', validatorRules.enableFlag]" :trigger-change="true" dictCode="sys_enable_status" placeholder="请选择启用状态"/>
        </a-form-item>
        
      </a-form>
    </a-spin>
    <a-button type="primary" @click="handleOk">确定</a-button>
    <a-button type="primary" @click="handleCancel">取消</a-button>
  </a-drawer>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
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
              { required: true, message: '请输入备注!'},
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
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'bankName','bankAddress','bankCardNo','bankBelong','memo','bankSort','enableFlag'))
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
      }
      
    }
  }
</script>

<style lang="less" scoped>
/** Button按钮间距 */
  .ant-btn {
    margin-left: 30px;
    margin-bottom: 30px;
    float: right;
  }
</style>