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
        <a-row style="width: 100%;">
          <a-col :span="24/2">
            <a-form-item label="商品编码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['code']" placeholder="请输入商品编码"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24/2">
            <a-form-item label="品牌" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['brand', validatorRules.brand]" placeholder="请输入品牌"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row style="width: 100%;">
          <a-col :span="24/2">
            <a-form-item label="商品名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['name', validatorRules.name]" placeholder="请输入商品名称"
                       @change="onChangeForFullName($event,'name')"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24/2">
            <a-form-item label="颜色" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['color', validatorRules.color]" placeholder="请输入颜色"
                       @change="onChangeForFullName($event,'color')"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row >
          <a-col :span="24">
            <a-form-item label="商品全称" :labelCol="labelColX1"  :wrapperCol="wrapperColX1">
              <a-input v-decorator="['fullName', validatorRules.fullName]"   placeholder="请输入商品全称"></a-input>
            </a-form-item>
          </a-col >
        </a-row>
        <a-row style="width: 100%;">
          <a-col :span="24/2">
            <a-form-item label="商品分类" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-category-select v-decorator="['classifyId', validatorRules.classifyId]" pcode="B03" placeholder="请选择商品分类" />
            </a-form-item>
          </a-col>
          <a-col :span="24/2">
            <a-form-item label="库龄 " :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number v-decorator="['stockAge', validatorRules.stockAge]" placeholder="请输入库龄 " style="width: 100%"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row style="width: 100%;">
          <a-col :span="24/2">
            <a-form-item label="成本方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['costFlag', validatorRules.costFlag]" :trigger-change="true" dictCode="sys_cost_type" placeholder="请选择成本方式"/>
            </a-form-item>
          </a-col>

          <a-col :span="24/2">
            <a-form-item label="虚拟商品" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['virFlag', validatorRules.virFlag]" :trigger-change="true" dictCode="sys_confirm_status" placeholder="请选择虚拟商品"/>
            </a-form-item>
          </a-col>

        </a-row>
        <a-row style="width: 100%;">
          <a-col :span="24/2">
            <a-form-item label="启用状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['enableFlag', validatorRules.enableFlag]" :trigger-change="true" dictCode="sys_enable_status" placeholder="请选择启用状态"/>
            </a-form-item>
          </a-col>
          <a-col :span="24/2">
            <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['skuSort']" placeholder="请输入排序"></a-input>
            </a-form-item>
          </a-col>
        </a-row>



      </a-form>
    </a-spin>
  </j-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { validateDuplicateValue } from '@/utils/util'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import JCategorySelect from '@/components/jeecg/JCategorySelect'
  import ACol from "ant-design-vue/es/grid/Col";


  export default {
    name: "SysSkuModal",
    components: {
      ACol,
      JDictSelectTag,
      JCategorySelect,
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
        labelColX1: {
          xs: { span: 24 },
          sm: { span: 3 },
        },
        wrapperColX1: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
        confirmLoading: false,
        validatorRules: {
          brand: {
            rules: [
              { required: true, message: '请输入品牌!'},
            ]
          },
          name: {
            rules: [
              { required: true, message: '请输入商品名称!'},
            ]
          },
          color: {
            rules: [
              { required: true, message: '请输入颜色!'},
            ]
          },
          fullName: {
            rules: [
              { required: true, message: '请输入商品全称!'},
            ]
          },
          classifyId: {
            rules: [
              { required: true, message: '请输入商品分类!'},
            ]
          },
          stockAge: {
            rules: [
              { required: true, message: '请输入库龄 !'},
              { pattern: /^-?\d+$/, message: '请输入整数!'},
            ]
          },
          costFlag: {
            rules: [
              { required: true, message: '请输入成本方式!'},
            ]
          },
          virFlag: {
            rules: [
              { required: true, message: '请输入虚拟商品!'},
            ]
          },
          enableFlag: {
            rules: [
              { required: true, message: '请输入启用状态!'},
            ]
          },
        },
        url: {
          add: "/sku/sysSku/add",
          edit: "/sku/sysSku/edit",
        }
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({});
      },
      onChangeForFullName(event,object){

        let color = this.form.getFieldValue("color")
        let name = this.form.getFieldValue("name")
        if (object == "name"){
          name = event.target.value;
        }else  if (object == "color"){
          color = event.target.value;
        }

        let fullName = name.toString().trim() + " " + color.toString().trim();
        this.form.setFieldsValue({
          'fullName': fullName,
          //这里可以继续设置N个值form表单值
        });
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'code','brand','name','color','fullName','classifyId','stockAge','costFlag','virFlag','enableFlag','skuSort'))
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
        this.form.setFieldsValue(pick(row,'code','brand','name','color','fullName','classifyId','stockAge','costFlag','virFlag','enableFlag','skuSort'))
      },
      handleCategoryChange(value,backObj){
        this.form.setFieldsValue(backObj)
      }

      
    }
  }
</script>