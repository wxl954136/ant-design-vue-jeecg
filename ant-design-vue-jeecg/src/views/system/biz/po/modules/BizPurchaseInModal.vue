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
            <a-form-item label="单据号码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['bizNo', validatorRules.bizNo]" placeholder="请输入单据号码"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="单据日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-date placeholder="请选择单据日期" v-decorator="['bizDate', validatorRules.bizDate]" :trigger-change="true" style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <!-- 做一个字段隐藏思路,这样弱关联,popupCallback注意添加辅助字段traderName,怎么模糊查询 -->
            <a-form-item label="供应商" :labelCol="labelCol" :wrapperCol="wrapperCol">
               <y-search-trader-select-tag v-decorator="['traderId', validatorRules.traderId]"    />
               <!--
              <a-select v-decorator="['traderId', validatorRules.traderId]"
                        show-search
                        placeholder="选择供应商"
                        option-filter-prop="children"
                        :filter-option="filterOption"
                        allowClear>
                <a-select-option v-for="data in traderDataList" :key="data.id"
                                 :disabled="data.enableFlag?false:true">{{data.name}}
                </a-select-option>
              </a-select>
              -->

            <!--
                <j-search-select-tag v-decorator="['traderId', validatorRules.traderId]"
                :dict="traderInfo"   />


              模糊查询怎么搞  youlan
              <a-input v-show="true" v-decorator="['traderId']" placeholder="这里是往来单位信息[隐藏]"></a-input>
              <j-popup
                v-decorator="['traderName', validatorRules.traderName]"
                :trigger-change="true"
                org-fields="id,name"
                dest-fields="traderId,traderName"
                code="rpt_sys_trader_info"
                @callback="popupCallback"/>
                -->
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="仓库" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <!--  :disabled = "true" 某一子行怎么控制 呢  -->
              <j-search-select-tag v-decorator="['storeId', validatorRules.storeId]" :dict="storeInfo" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="付款方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['tradeMethod', validatorRules.tradeMethod]" :trigger-change="true" dictCode="sys_payable_type" placeholder="请选择付款方式"/>
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
        <a-tab-pane tab="采购入库明细表" :key="refKeys[0]" :forceRender="true">
          <j-editable-table
            :ref="refKeys[0]"
            :loading="bizPurchaseInDetailTable.loading"
            :columns="bizPurchaseInDetailTable.columns"
            :dataSource="bizPurchaseInDetailTable.dataSource"
            :maxHeight="300"
            :rowNumber="true"
            :rowSelection="true"
            :actionButton="true" />
        </a-tab-pane>
        
      </a-tabs>

    </a-spin>
  </j-modal>
</template>

<script>
  import Vue from 'vue'
  import pick from 'lodash.pick'
  import { FormTypes,getRefPromise } from '@/utils/JEditableTableUtil'
  import { httpAction } from '@/api/manage'
  import { JEditableTableMixin } from '@/mixins/JEditableTableMixin'
  import { validateDuplicateValue } from '@/utils/util'
  import JDate from '@/components/jeecg/JDate'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import JSearchSelectTag from '@/components/dict/JSearchSelectTag'
  import YSearchTraderSelectTag from '@/components/youlan/YSearchTraderSelectTag'
  import { USER_INFO } from "@/store/mutation-types"

  //支持转换为拼音
  import pinyin from '@/components/_util/pinyin.js'
  const mapPinyinOfTrader = new Map()


  export default {
    name: 'BizPurchaseInModal',
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
        // 注意，userInfo同级变量只可以在自己的method方法中调用，在vue中直接变量即可，见范例
        userInfo:Vue.ls.get(USER_INFO),
        storeInfo:"sys_store,name,id,del_flag='0' and  gsdm = '" + Vue.ls.get(USER_INFO).gsdm + "'",
        traderInfo:"sys_trader,name,id,saler_flag='1' and del_flag = '0'  and gsdm = '" + Vue.ls.get(USER_INFO).gsdm + "'",
        traderDataList:[],
        addDefaultRowNum: 1,
        validatorRules: {
          bizNo: {
            rules: [
              { required: true, message: '请输入单据号码!'},
            ]
          },
          bizDate: {
            rules: [
              { required: true, message: '请输入单据日期!'},
            ]
          },
          traderId: {
            rules: [
              { required: true, message: '请输入往来单位!'},
            ]
          },
          storeId: {
            rules: [
              { required: true,  message: '请输入仓库!'},
            ]
          },
          tradeMethod: {
            rules: [
              { required: true, message: '请输入付款方式!'},
            ]
          },
        },
        refKeys: ['bizPurchaseInDetail', ],
        tableKeys:['bizPurchaseInDetail', ],
        activeKey: 'bizPurchaseInDetail',
        // 采购入库明细表
        bizPurchaseInDetailTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '商品名称',
              key: 'skuId',
              type: FormTypes.sel_search,
              dictCode:"sys_sku,full_name,id",
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue: '',
              validateRules: [{ required: true, message: '${title}不能为空' }],
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
              title: '单价',
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
          add: "/biz.po/bizPurchaseIn/add",
          edit: "/biz.po/bizPurchaseIn/edit",
          bizPurchaseInDetail: {
            list: '/biz.po/bizPurchaseIn/queryBizPurchaseInDetailByMainId'
          },
          traderList:"/trader/sysTrader/querySysTraderList"
        }
      }
    },
    mounted(){
         //这里做初始加载
         this.getTraderList()
    },
    methods: {

      filterOption(input, option) {
        let select_drop_text = option.componentOptions.children[0].text.toLowerCase().trim()
        let select_drop_pinyin = ""
        if (mapPinyinOfTrader.has(select_drop_text)){
            select_drop_pinyin = mapPinyinOfTrader.get(select_drop_text)
        }
        let iz_cn = select_drop_text.indexOf(input.toLowerCase().trim()) >= 0
        let iz_pinyin = select_drop_pinyin.indexOf(input.toLowerCase().trim()) >=0
        return (  iz_cn || iz_pinyin);
      },

      //直接action的访问东西， 同时自己定义a-select
      getTraderList(){
        let formData = {};//传条件，公司代码等一律从后台取
        let method = "get"
        let httpurl = this.url.traderList
        httpAction(httpurl, formData, method).then((res) => {
            if (res.success) {
              for(let i=0;i<res.result.length;i++){
                let enable = (res.result[i].enableFlag=="1"?true:false)
                mapPinyinOfTrader.set(res.result[i].name.toLowerCase().trim(),pinyin.ConvertPinyin(res.result[i].name.toLowerCase()))
                this.traderDataList.push({
                  id: res.result[i].id,
                  name: res.result[i].name,
                  enableFlag: enable
                })
              }
            }
        })
      },

      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        let fieldval = pick(this.model,'bizNo','bizDate','traderId','storeId','tradeMethod','handler','memo')
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
        })
        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.id }
          this.requestSubTableData(this.url.bizPurchaseInDetail.list, params, this.bizPurchaseInDetailTable)
        }
      },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)

        return {
          ...main, // 展开
          bizPurchaseInDetailList: allValues.tablesValue[0].values,
        }
      },
      validateError(msg){
        this.$message.error(msg)
      },
     popupCallback(row){
       this.form.setFieldsValue(pick(row,'bizNo','bizDate','traderId','storeId','tradeMethod','handler','memo'))
     },

    }
  }
</script>

<style scoped>
</style>