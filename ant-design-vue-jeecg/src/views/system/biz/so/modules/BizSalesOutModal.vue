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
            <a-form-item label="单据编号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入单据编号"
                       v-decorator="['bizNo', validatorRules.bizNo]"
                       disabled></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="单据日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-date placeholder="请选择单据日期"
                      v-decorator="['bizDate', validatorRules.bizDate]"
                      date-format="YYYY-MM-DD"
                      :trigger-change="true" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="仓库" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-search-select-tag v-decorator="['storeId', validatorRules.storeId]"
                                   :disabled="optionType?false:true"
                                   dict="sys_store,name,id" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="客户" :labelCol="labelCol" :wrapperCol="wrapperCol">

              <y-search-trader-select-tag v-decorator="['traderId', validatorRules.traderId]"
                                          :disabled="optionType?false:true"  />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="收款方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['tradeMethod', validatorRules.tradeMethod]"
                                 :disabled="optionType?false:true"
                                 :trigger-change="true" dictCode="sys_receivable_type" placeholder="请选择收款方式"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="经手人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['handler']" placeholder="请输入经手人"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="收款银行" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-search-select-tag v-decorator="['bankId', validatorRules.bankId]" dict="sys_bank,bank_name,id" />
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
            :loading="bizSalesOutDetailTable.loading"
            :columns="bizSalesOutDetailTable.columns"
            :dataSource="bizSalesOutDetailTable.dataSource"
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
  import JDate from '@/components/jeecg/JDate'  
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import JSearchSelectTag from '@/components/dict/JSearchSelectTag'
  import YSearchTraderSelectTag from '@/components/youlan/YSearchTraderSelectTag'
  import {USER_INFO} from "@/store/mutation-types"
  export default {
    name: 'BizSalesOutModal',
    mixins: [JEditableTableMixin],
    components: {
      JDate,
      JDictSelectTag,
      JSearchSelectTag,
      YSearchTraderSelectTag,
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
        detailTitle:"",
        // 新增时子表默认添加几行空数据
        addDefaultRowNum: 1,
        validatorRules: {
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
          storeId: {
            rules: [
              { required: true, message: '请输入仓库!'},
            ]
          },
          traderId: {
            rules: [
              { required: true, message: '请输入客户!'},
            ]
          },
          tradeMethod: {
            rules: [
              { required: true, message: '请输入收款方式!'},
            ],
            initialValue: '0'  //现金
          },
          bankId: {
            rules: [
              { required: true, message: '请输入收款银行!'},
            ]
          },
        },
        refKeys: ['bizSalesOutDetail', ],
        tableKeys:['bizSalesOutDetail', ],
        activeKey: 'bizSalesOutDetail',
        // 销售明细表
        bizSalesOutDetailTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '商品名称',
              key: 'skuId',
              type: FormTypes.sel_search,
              dictCode: this.getDetailSkuInfo("sys_sku,full_name___code,enable_flag,id"), //___三个下划线表示多字段拼接,表示一个字段，table_name,查询字段，enableFlag,id(注意顺序，和后台封装的对应queryTableDictItemsByCodeEnableAndFilter)
              width:"300px",
              placeholder: '请输入${title}',
              defaultValue: '',
              disabledEdit:true,  //当更新时是否锁定旧数据列，新数据不用锁定
              validateRules: [
                { required: true, message: '${title}不能为空' },
              ]
            },
            {
              title: '数量',
              key: 'qty',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [{ required: true, message: '${title}不能为空' }],
            },
            {
              title: '价格',
              key: 'price',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [{ required: true, message: '${title}不能为空' }],
            },
            {
              title: '税率',
              key: 'rate',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [{ required: true, message: '${title}不能为空' }],
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
          add: this.getAddUrl("/biz.so/bizSalesOut/add/"),//"/biz.po/bizPurchaseIn/add",
          // add: "/biz.so/bizSalesOut/add",
          edit: "/biz.so/bizSalesOut/edit",
          bizSalesOutDetail: {
            list: '/biz.so/bizSalesOut/queryBizSalesOutDetailByMainId'
          },
        }
      }
    },
    created(){
      //这里做初始加载，改为插件模式
      //this.getTraderList()
      let title = this.getBizType()
      if (title == "CKD") this.detailTitle = "出库明细"
      else if (title == "THD") this.detailTitle = "换货明细"

    },
    methods: {
      getDetailSkuInfo(dictItem){
        let result = dictItem + ",del_flag = '0' and gsdm = '" +  Vue.ls.get(USER_INFO).gsdm + "'"
        return result
      },
      getBizType(){
        let routePath = this.$route.path
        let bizType = (routePath.toString().indexOf("CKD") >=0?"CKD":"THD")
        return bizType
      },
      getAddUrl(url){
        let baseRoute= url
        //这个$root.path取的是进来时的列表路由地址，即list
        let routePath = this.$route.path
        let bizType = routePath.toString().indexOf("CKD") >=0?"CKD":"THD"
        return baseRoute +bizType
      },
      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        let fieldval = pick(this.model,'createBy','bizNo','bizDate','storeId','traderId','tradeMethod','handler','bankId','memo')
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
        })
        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.id }
          this.requestSubTableData(this.url.bizSalesOutDetail.list, params, this.bizSalesOutDetailTable)
        }
      },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)

        return {
          ...main, // 展开
          bizSalesOutDetailList: allValues.tablesValue[0].values,
        }
      },
      validateError(msg){
        this.$message.error(msg)
      },
     popupCallback(row){
       this.form.setFieldsValue(pick(row,'createBy','bizNo','bizDate','storeId','traderId','tradeMethod','handler','bankId','memo'))
     },

    }
  }
</script>

<style scoped>
</style>