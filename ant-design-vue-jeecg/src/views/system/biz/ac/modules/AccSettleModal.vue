<template>
  <j-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <!-- 主表单区域 -->
      <a-form :form="form">
        <a-row>

          <a-col :xs="24" :sm="12">
            <a-form-item label="单据号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['bizNo', validatorRules.bizNo]" placeholder="请输入单据号" disabled></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="单据日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-date placeholder="请选择单据日期" v-decorator="['bizDate', validatorRules.bizDate]" :trigger-change="true" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="科目" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['subjectsId', validatorRules.subjectsId]" placeholder="请输入科目"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="银行帐户" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-search-select-tag v-decorator="['bankId', validatorRules.bankId]" dict="sys_bank,bank_name,id" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="经手人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['handler']" placeholder="请输入经手人"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['memo']" placeholder="请输入备注"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>



      <a-tabs v-model="activeKey" @change="handleChangeTabs">
        <!-- 子表单区域 -->
        <a-tab-pane :tab="detailTitle" :key="refKeys[0]" :forceRender="true">
          <j-editable-table
            :handleYfkInfo="handleYfkInfo"
            :ref="refKeys[0]"
            :loading="accSettleDetailTable.loading"
            :columns="accSettleDetailTable.columns"
            :dataSource="accSettleDetailTable.dataSource"
            :yfkButtonShow ="getBizType()=='FKD'?true:false"
            :yskButtonShow = "getBizType()=='SKD'?true:false"
            :maxHeight="300"
            :rowNumber="true"
            :rowSelection="true"
            @valueChange="handleValueChange"
            :actionButton="true"/>
        </a-tab-pane>
        
      </a-tabs>

    </a-spin>
    <acc-get-payable-modal ref = "getPayableModalForm"  :getSelectPayableList = "getSelectPayableList"  ></acc-get-payable-modal>

    <!--
    <a-button type="primary" icon="plus" @click="wxlTest"  ref = "wxlTest">测试获取数据</a-button>
    -->
  </j-modal>
</template>

<script>

  import pick from 'lodash.pick'
  import AccGetPayableModal from './AccGetPayableModal'

  import { FormTypes,getRefPromise } from '@/utils/JEditableTableUtil'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { validateDuplicateValue } from '@/utils/util'
  import JDate from '@/components/jeecg/JDate'  
  import JSearchSelectTag from '@/components/dict/JSearchSelectTag'

  export default {
    name: 'AccSettleModal',
    mixins: [JEditableTableMixin],
    components: {
      JDate,
      JSearchSelectTag,
      AccGetPayableModal,
    },
    data() {
      return {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        labelCol2: {
          xs: { span: 24 },
          sm: { span: 3 },
        },
        wrapperCol2: {
          xs: { span: 24 },
          sm: { span: 20 },
        },

        // 新增时子表默认添加几行空数据
        addDefaultRowNum: 1,
        validatorRules: {
          bizNo: {
            rules: [
              { required: true, message: '请输入单据号!'},
            ],
            initialValue: 'NEW'
          },
          bizDate: {
            rules: [
              { required: true, message: '请输入单据日期!'},
            ],
            initialValue: new Date()
          },
          subjectsId: {
            rules: [
              { required: true, message: '请输入科目!'},
            ]
          },
          bankId: {
            rules: [
              { required: true, message: '请输入银行帐户!'},
            ]
          },
        },
        refKeys: ['accSettleDetail', ],
        tableKeys:['accSettleDetail', ],
        activeKey: 'accSettleDetail',
        // 结算明细表
        detailTitle:"",
        accSettleDetailTable: {
          loading: false,
          dataSource: [],
          columns: [
            /*
            {
              title: '当前id',
              key: 'id',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [{ required: true, message: '${title}不能为空' }],
            },
             */

            {
              title: '应付款ID',
              key: 'payableId',
              type: FormTypes.hidden,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [{ required: true, message: '${title}不能为空' }],
            },
            {
              title: '业务单据号',
              key: 'payableBizNo',
              type: FormTypes.input,
              width:"200px",
              disabled:true,
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [
                { required: true, message: '${title}不能为空' },
                { unique:true }
              ],
            },
            {
              title: '往来单位',
              key: 'traderName',
              type: FormTypes.input,
              width:"300px",
              disabled:true,
              placeholder: '请输入${title}',
              defaultValue: '',
              //validateRules: [{ required: true, message: '${title}不能为空' }],
            },
            {
              title: '结算金额',
              key: 'targetAmount',
              type: FormTypes.inputNumber,
              width:"100px",
              placeholder: '请输入${title}',
              defaultValue: '',
              statistics:true,
              validateRules: [{ required: true, message: '${title}不能为空' }],
            },
            {
              title: '备注',
              key: 'memo',
              type: FormTypes.input,
              placeholder: '请输入${title}',
              defaultValue: '',
            },
          ]
        },
        url: {
          // add: "/biz.ac/accSettle/add",
          add: this.getAddUrl("/biz.ac/accSettle/add/"),//"/biz.po/bizPurchaseIn/add",
          edit: "/biz.ac/accSettle/edit",
          accSettleDetail: {
            list: '/biz.ac/accSettle/queryAccSettleDetailByMainId'
          },
        }
      }
    },
    // watch: {
    //   eachtime: {
    //     handler() {
    //       //当变化的时候更新
    //       this.changeSettleButtonContent()
    //     },
    //     // 代表在wacth里声明了firstName这个方法之后立即先去执行handler方法，如果设置了false，那么效果和上边例子一样
    //     immediate: true
    //   }
    // },
    mounted() {
      let title = this.getBizType()
      if (title == "FKD") this.detailTitle = "付款明细"
      else if (title == "SKD") this.detailTitle = "收款明细"
      this.initTableHeadTitle()
      // this.changeSettleButtonContent()
      //这里增加按钮  action-button-group
    },
    methods: {
      handleValueChange(event) {
        //当有任何更改时，可以重设备值

      },
      getBizType(){
        let routePath = this.$route.path
        let bizType = (routePath.toString().indexOf("FKD") >=0?"FKD":"SKD")
        return bizType
      },
      getAddUrl(url){
        let baseRoute= url
        //这个$root.path取的是进来时的列表路由地址，即list
        let routePath = this.$route.path
        let bizType = routePath.toString().indexOf("FKD") >=0?"FKD":"SKD"
        return baseRoute +bizType
      },
      handleCancel(){
        this.accSettleDetailTable.dataSource = []
        this.close()

      },
      changeSettleButtonContent()
      {
        let settleButton =  this.$refs.accSettleDetail.$refs.btnYskYfk
        let settleButtonHtml = settleButton.$el.innerHTML
        let buttonContent = "应付款单"
        if (this.getBizType() == "SKD"){
          buttonContent = "应收款单"
          settleButtonHtml = settleButtonHtml.replace("应付款单",buttonContent)
        }
        settleButton.$el.innerHTML = settleButtonHtml

      },

      importPayableRecordToTable(value)
      {
        let that = this.$refs.accSettleDetail
        that.add()
        let rows = that.rows
        let row = rows[rows.length - 1]
        let record = Object.assign({}, row)
        this.accSettleDetailTable.dataSource.push(record)
        record.payableId = value.id
        record.payableBizNo=value.bizNo
        record.traderName = value.traderName
        record.targetAmount = value.diffAmount
      },
      handleYfkInfo(){
        this.$refs.getPayableModalForm.title = (this.getBizType() == "SKD"?"应收款信息":"应付款信息");
        this.$refs.getPayableModalForm.visible = true;
      },
      //AccGetPayableModal中获取选中的记录值,获取选中的应收付款记录
      getSelectPayableList(payableRecords){
        payableRecords.forEach((record, index) => {
          //已经把值传给了record
           this.importPayableRecordToTable(record)
        })

      },
      initTableHeadTitle() {
        for (let key in this.accSettleDetailTable.columns) {
          let obj = this.accSettleDetailTable.columns[key]
          if (obj.key ==  "traderName") {
            obj.title = (this.getBizType() == "FKD" ? "供应商" : "客户")
          }else if (obj.key ==  "payableBizNo")
          {
            obj.title = (this.getBizType() == "FKD" ? "应付款单据" : "应收款单据")
          }
        }
      },
      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        let fieldval = pick(this.model,'bizNo','bizDate','subjectsId','bankId','handler','memo')
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
        })
        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.id }
          this.requestSubTableData(this.url.accSettleDetail.list, params, this.accSettleDetailTable)
        }
      },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)
        return {
          ...main, // 展开
          accSettleDetailList: allValues.tablesValue[0].values,
        }
      },
      validateError(msg){
        this.$message.error(msg)
      },
     popupCallback(row){
       this.form.setFieldsValue(pick(row,'bizNo','bizDate','subjectsId','bankId','handler','memo'))
     },
    }
  }
</script>

<style scoped>
</style>