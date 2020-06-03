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

        <a-form-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['name', validatorRules.name]" placeholder="请输入名称"></a-input>
        </a-form-item>
        <a-form-item label="供应商" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['salerFlag', validatorRules.salerFlag]" :trigger-change="true" dictCode="sys_confirm_status" placeholder="请选择供应商"/>
        </a-form-item>
        <a-form-item label="客户" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['buyerFlag', validatorRules.buyerFlag]" :trigger-change="true" dictCode="sys_confirm_status" placeholder="请选择客户"/>
        </a-form-item>
        <a-form-item label="帐期(天)" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['period']" placeholder="请输入帐期(天)" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="信用额度(元)" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="['creditAmout']" placeholder="请输入信用额度(元)" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="联系人" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['contacter']" placeholder="请输入联系人"></a-input>
        </a-form-item>
        <a-form-item label="电话" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['tel']" placeholder="请输入电话"></a-input>
        </a-form-item>
        <a-form-item label="地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['address']" placeholder="请输入地址"></a-input>
        </a-form-item>
        <a-form-item label="银行名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['bankName']" placeholder="请输入银行名称"></a-input>
        </a-form-item>
        <a-form-item label="开户行" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['bankAddress']" placeholder="请输入开户行"></a-input>
        </a-form-item>
        <a-form-item label="银行卡号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['bankCardNo']" placeholder="请输入银行卡号"></a-input>
        </a-form-item>
        <a-form-item label="银行归属" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="['bankBelong']" placeholder="请输入银行归属"></a-input>
        </a-form-item>
        <a-form-item label="启用" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['enableFlag', validatorRules.enableFlag]" :trigger-change="true" dictCode="sys_enable_status" placeholder="请选择启用"/>
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
    name: "SysTraderModal",
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
          name: {
            rules: [
              { required: true, message: '请输入名称!'},
            ]
          },
          salerFlag: {
            rules: [
              { required: true, message: '请输入供应商!'},
            ]
          },
          buyerFlag: {
            rules: [
              { required: true, message: '请输入客户!'},
            ]
          },
          enableFlag: {
            rules: [
              { required: true, message: '请输入启用!'},
            ]
          },
        },
        url: {
          add: "/trader/sysTrader/add",
          edit: "/trader/sysTrader/edit",
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
          this.form.setFieldsValue(pick(this.model,'name','salerFlag','buyerFlag','period','creditAmout','contacter','tel','address','bankName','bankAddress','bankCardNo','bankBelong','enableFlag'))
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
        this.form.setFieldsValue(pick(row,'name','salerFlag','buyerFlag','period','creditAmout','contacter','tel','address','bankName','bankAddress','bankCardNo','bankBelong','enableFlag'))
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