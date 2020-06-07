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
              <a-input v-decorator="['bizNo']" placeholder="请输入单据号"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="科目" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['subjectsId', validatorRules.subjectsId]" placeholder="请输入科目"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="单据日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-date placeholder="请选择单据日期" v-decorator="['bizDate', validatorRules.bizDate]" :trigger-change="true" style="width: 100%"/>
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

      <!-- 子表单区域 -->
      <a-tabs v-model="activeKey" @change="handleChangeTabs">
        <a-tab-pane tab="应付款明细表" :key="refKeys[0]" :forceRender="true">
          <j-editable-table
            :ref="refKeys[0]"
            :loading="accPayableDetailTable.loading"
            :columns="accPayableDetailTable.columns"
            :dataSource="accPayableDetailTable.dataSource"
            :maxHeight="300"
            :rowNumber="true"
            :rowSelection="true"
            :actionButton="true"/>
        </a-tab-pane>
        
      </a-tabs>

    </a-spin>
  </j-modal>
</template>

<script>

  import pick from 'lodash.pick'
  import { FormTypes,getRefPromise } from '@/utils/JEditableTableUtil'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { validateDuplicateValue } from '@/utils/util'
  import JDate from '@/components/jeecg/JDate'  

  export default {
    name: 'AccPayableModal',
    mixins: [JEditableTableMixin],
    components: {
      JDate,
    },
    data() {
      return {
        noteType:"",
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
          subjectsId: {
            rules: [
              { required: true, message: '请输入科目!'},
            ]
          },
          bizDate: {
            rules: [
              { required: true, message: '请输入单据日期!'},
            ]
          },
        },
        refKeys: ['accPayableDetail', ],
        tableKeys:['accPayableDetail', ],
        activeKey: 'accPayableDetail',
        // 应付款明细表
        accPayableDetailTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: 'TITLE:TRADER',
              key: 'traderId',
              type: FormTypes.sel_search,
              dictCode:"sys_trader,name,id",
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: 'TITLE:AMOUNT',
              key: 'sourceAmount',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
            {
              title: '备注',
              key: 'memo',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
            },
          ]
        },
        url: {
          add: "/biz.ac/accPayable/add",
          edit: "/biz.ac/accPayable/edit",
          accPayableDetail: {
            list: '/biz.ac/accPayable/queryAccPayableDetailByMainId'
          },
        }
      }
    },
    created() {
      let routePath = this.$route.path
      this.noteType = routePath.toString().indexOf("YFK") >=0?"YFK":"YSK"
      this.initTableHeadTitle()
    },
    methods: {
      initTableHeadTitle() {
        for (let key in this.accPayableDetailTable.columns) {
          let obj = this.accPayableDetailTable.columns[key]
          if (obj.title ==  "TITLE:TRADER") {
            obj.title = (this.noteType == "YFK" ? "供应商" : "客户")
          }else if (obj.title ==  "TITLE:AMOUNT")
          {
            obj.title = (this.noteType == "YFK" ? "应付款金额" : "应收款金额")
          }
        }
      },
      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        let fieldval = pick(this.model,'bizNo','subjectsId','bizDate','handler','memo','fromBizType','fromBizId','noteSource')
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
        })
        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.id }
          this.requestSubTableData(this.url.accPayableDetail.list, params, this.accPayableDetailTable)
        }
      },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)

        return {
          ...main, // 展开
          accPayableDetailList: allValues.tablesValue[0].values,
        }
      },
      validateError(msg){
        this.$message.error(msg)
      },
     popupCallback(row){
       this.form.setFieldsValue(pick(row,'bizNo','subjectsId','bizDate','handler','memo','fromBizType','fromBizId','noteSource'))
     },

    }
  }
</script>

<style scoped>
</style>