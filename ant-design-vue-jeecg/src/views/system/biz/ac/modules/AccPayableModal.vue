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

              <a-input  v-decorator="['bizNo', validatorRules.bizNo]" placeholder="请输入单据号" disabled></a-input>
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
        <a-tab-pane :tab="detailTitle" :key="refKeys[0]" :forceRender="true">
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
  import Vue from 'vue'
  import pick from 'lodash.pick'
  import { FormTypes,getRefPromise } from '@/utils/JEditableTableUtil'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { validateDuplicateValue } from '@/utils/util'
  import {USER_INFO} from "@/store/mutation-types"
  import JDate from '@/components/jeecg/JDate'  

  export default {
    name: 'AccPayableModal',
    mixins: [JEditableTableMixin],
    components: {
      JDate,
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
          subjectsId: {
            rules: [
              { required: true, message: '请输入科目!'},
            ]
          },
          bizNo: {
            rules: [
              { required: true, message: '请输入单据号码!'},
            ],
            initialValue: 'NEW'
          },
          bizDate: {
            rules: [
              { required: true, message: '请输入单据日期!'},
            ],
            initialValue: new Date()
          },
        },
        refKeys: ['accPayableDetail', ],
        tableKeys:['accPayableDetail', ],
        activeKey: 'accPayableDetail',
        detailTitle:"",
        // 应付款明细表
        accPayableDetailTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '供应商',
              key: 'traderId',
              type: FormTypes.sel_search,
              // dictCode:"sys_trader,name,id",
              dictCode: this.getDetailTraderInfo("sys_trader,name___contacter,enable_flag,id"), //___三个下划线表示多字段拼接,表示一个字段，table_name,查询字段，enableFlag,id(注意顺序，和后台封装的对应queryTableDictItemsByCodeEnableAndFilter)
              disabledEdit:true,
              width:"350px",
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [
                { required: true, message: '${title}不能为空' },
                { handler: this.validateTraderHandler }
              ]
            },
            {
              title: '应付款金额',
              key: 'sourceAmount',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: 0,
              validateRules: [
                { required: true, message: '${title}不能为空' },
                { pattern: /^(0|[1-9][0-9]*)+(\.[0-9]{1,2})?$/, message: '请输入正确的数值[格式:####.##]' },  //正则表达式大全https://c.runoob.com/front-end/854
              ],
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
          add: this.getAddUrl("/biz.ac/accPayable/add/"),//"/biz.po/bizPurchaseIn/add",

          // add: "/biz.ac/accPayable/add",
          edit: "/biz.ac/accPayable/edit",
          accPayableDetail: {
            list: '/biz.ac/accPayable/queryAccPayableDetailByMainId'
          },
        }
      }
    },
    mounted() {
      let title = this.getBizType()
      if (title == "YFK") this.detailTitle = "应付款明细"
      else if (title == "YSK") this.detailTitle = "应收款明细"

      this.initTableHeadTitle()
    },
    methods: {
      getBizType(){
        let routePath = this.$route.path
        let bizType = (routePath.toString().indexOf("YFK") >=0?"YFK":"YSK")
        return bizType
      },
      getDetailTraderInfo(dictItem){
        let result = dictItem + ",del_flag = '0' and gsdm = '" +  Vue.ls.get(USER_INFO).gsdm + "'"
        return result
      },
      initTableHeadTitle() {
        for (let key in this.accPayableDetailTable.columns) {
          let obj = this.accPayableDetailTable.columns[key]
          if (obj.key ==  "traderId") {
            obj.title = (this.getBizType() == "YFK" ? "供应商" : "客户")
          }else if (obj.key ==  "sourceAmount")
          {
            obj.title = (this.getBizType() == "YFK" ? "应付款金额" : "应收款金额")
          }
        }
      },

      validateTraderHandler(type, value, row, column, callback, target){

        let {values} = target.getValuesSync({validate: false})  //获得明细行事行数据,未显示字段无法获取
        let count = 0
        for (let val of values) {
          if (val['traderId'] === value) {
            if (++count >= 2) {
              callback(false, '${title}不能重复')
              return
            }
          }
        }
        callback(true) // true = 通过验证
      },
      getAddUrl(url){
        let baseRoute= url
        //这个$root.path取的是进来时的列表路由地址，即list
        let routePath = this.$route.path
        let bizType = routePath.toString().indexOf("YFK") >=0?"YFK":"YSK"
        return baseRoute +bizType
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