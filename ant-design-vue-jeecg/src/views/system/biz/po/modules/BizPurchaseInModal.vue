<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
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
              <a-input      v-decorator="['bizNo', validatorRules.bizNo]" placeholder="请输入单据号码" disabled ></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="单据日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-date placeholder="请选择单据日期" v-decorator="['bizDate', validatorRules.bizDate]"
                      :trigger-change="true"
                      date-format="YYYY-MM-DD"
                      style="width: 100%"/>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <!-- 做一个字段隐藏思路,这样弱关联,popupCallback注意添加辅助字段traderName,怎么模糊查询 -->
            <a-form-item label="供应商" :labelCol="labelCol" :wrapperCol="wrapperCol">
               <y-search-trader-select-tag v-decorator="['traderId', validatorRules.traderId]"
                                           :disabled="optionType?false:true"  />
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
              <j-search-select-tag v-decorator="['storeId', validatorRules.storeId]" :dict="storeInfo"
                                   :disabled="optionType?false:true" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="付款方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag type="list" v-decorator="['tradeMethod', validatorRules.tradeMethod]"
                                 :trigger-change="true" dictCode="sys_payable_type"
                                 placeholder="请选择付款方式"
                                 :disabled="optionType?false:true"

              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="经手人" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input  v-yenter-to-next = "true"  v-decorator="['handler']" placeholder="请输入经手人"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input ref = "memo" v-decorator="['memo']" placeholder="请输入备注"></a-input>
            </a-form-item>
          </a-col>

        </a-row>
      </a-form>

      <!-- 子表单区域 -->
      <a-tabs v-model="activeKey" @change="handleChangeTabs">
        <a-tab-pane :tab="detailTitle" :key="refKeys[0]" :forceRender="true" >
          <j-editable-table
            :customRow="rowClick"
            :ref="refKeys[0]"
            :loading="bizPurchaseInDetailTable.loading"
            :columns="bizPurchaseInDetailTable.columns"
            :dataSource="bizPurchaseInDetailTable.dataSource"
            :maxHeight="300"
            :rowNumber="true"
            :rowSelection="true"
            :actionButton="true" >
            <template v-slot:action="props">
              <a @click="handleSerial(props)">串号</a> &nbsp;
              <a @click="handleDelete(props)">删除</a>
            </template>
            <span slot="memo" slot-scope="text, record">
              <j-ellipsis :value="text" :length="50" />
            </span>
          </j-editable-table>
        </a-tab-pane>
        
      </a-tabs>

    </a-spin>
    <biz-serial-modal ref = "getBizSerialModalInfoForm"  :getBizSerialModalInfo = "getBizSerialModalInfo"  ></biz-serial-modal>

  </j-modal>
</template>

<script>
  import Vue from 'vue'
  import pick from 'lodash.pick'
  import {getAction} from '@/api/manage'
  import {FormTypes, getRefPromise} from '@/utils/JEditableTableUtil'
  import {JEditableTableMixin} from '@/mixins/JEditableTableMixin'
  import JDate from '@/components/jeecg/JDate'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import JSearchSelectTag from '@/components/dict/JSearchSelectTag'
  import YSearchTraderSelectTag from '@/components/youlan/YSearchTraderSelectTag'
  import BizSerialModal from '../../core/BizSerialModal'
  import {USER_INFO} from "@/store/mutation-types"
  //支持转换为拼音
  const mapPinyinOfTrader = new Map()


  export default {
    name: 'BizPurchaseInModal',
    mixins: [JEditableTableMixin],
    components: {
      JDate,
      JDictSelectTag,
      JSearchSelectTag,
      YSearchTraderSelectTag,
      BizSerialModal,

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
            ],
            initialValue: 'NEW'
          },
          bizDate: {
            rules: [
              { required: true, message: '请输入单据日期!'},
            ],
            initialValue: new Date()
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
            ],
            initialValue: '0'

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
              dictCode: this.getDetailSkuInfo("sys_sku,full_name___code,enable_flag,id"), //___三个下划线表示多字段拼接,表示一个字段，table_name,查询字段，enableFlag,id(注意顺序，和后台封装的对应queryTableDictItemsByCodeEnableAndFilter)
              width:"300px",
              placeholder: '请输入${title}',
              defaultValue: '',
              disabledEdit:true,  //当更新时是否锁定旧数据列，新数据不用锁定
              validateRules: [
                { required: true, message: '${title}不能为空' },
                { handler: this.validateSkuHandler }
                ]
            },
            {
              title: '数量',
              key: 'qty',
              type: FormTypes.input,
              width:"100px",
              placeholder: '请输入${title}',
              defaultValue: 1,
              validateRules: [
                { required: true, message: '${title}不能为空' },
                { pattern: /^(0|[1-9][0-9]*)+(\.[0-9]{1,2})?$/, message: '请输入正确的数值[格式:####.##]' },  //正则表达式大全https://c.runoob.com/front-end/854
              ],
            },
            {
              title: '单价',
              key: 'price',
              type: FormTypes.input,
              width: "100px",
              defaultValue: 0,
              placeholder: '请输入${title}',
              validateRules: [
                { required: true, message: '${title}不能为空' },
                { pattern: /^(0|[1-9][0-9]*)+(\.[0-9]{1,2})?$/, message: '请输入正确的数值[格式:####.##]' },  //正则表达式大全https://c.runoob.com/front-end/854
                //{ pattern: /^(?!0+$)(?!0*\.0*$)\d{1,8}(\.\d{1,2})?$/, message: '请输入正确的数值[格式:####.##]' },
              ],
            },
            {
              title: '税率',
              key: 'rate',
              type: FormTypes.input,
              width:"100px",
              defaultValue: 0,
              placeholder: '请输入${title}',
              validateRules: [
                { required: true, message: '${title}不能为空' },
                { pattern: /^(0|[1-9][0-9]*)+(\.[0-9]{1,2})?$/, message: '请输入正确的数值[格式:####.##]' },  //正则表达式大全https://c.runoob.com/front-end/854
              ],
            },
            {
              title: '备注',
              key: 'memo',
              type: FormTypes.input,
              placeholder: '请输入${title}',
              scopedSlots: {customRender: 'memo'},
            },

            {
              title: '操作',
              key: 'action',
              // width: '8%',
              width: '100px',
              type: FormTypes.slot,
              slotName: 'action',
            }
          ]
        },
        url: {
          add: this.getAddUrl("/biz.po/bizPurchaseIn/add/"),//"/biz.po/bizPurchaseIn/add",
          edit: "/biz.po/bizPurchaseIn/edit",
          bizPurchaseInDetail: {//获得后台数据？ yes
            list: '/biz.po/bizPurchaseIn/queryBizPurchaseInDetailByMainId'
          },
          traderList:"/trader/sysTrader/querySysTraderList"
        }
      }
    },
    mounted(){
      //这里做初始加载，改为插件模式
      //this.getTraderList()
      let title = this.getBizType()
      if (title == "CGRK") this.detailTitle = "采购入库明细"
      else if (title == "CGTH") this.detailTitle = "采购退货明细"
    },

    methods: {
      //当单元格事件发生变化 时,补充校验规则
      addAfter()
      {
        //  //this.add()
        // this.eachAllTable((item) => {
        //   item.add(1)
        // })

      },




      validateSkuHandler(type, value, row, column, callback, target) {

        let {values} = target.getValuesSync({validate: false})  //获得明细行事行数据,未显示字段无法获取
        let count = 0
        for (let val of values) {
          if (val['skuId'] === value) {
            if (++count >= 2) {
              callback(false, '${title}不能重复')
              return
            }
          }
        }
        callback(true) // true = 通过验证
      },


      getBizType(){
        let routePath = this.$route.path
        let bizType = (routePath.toString().indexOf("CGRK") >=0?"CGRK":"CGTH")
        return bizType
      },
      getDetailSkuInfo(dictItem){
        let result = dictItem + ",del_flag = '0' and gsdm = '" +  Vue.ls.get(USER_INFO).gsdm + "'"
        return result
      },
      getAddUrl(url){
        let baseRoute= url
        //这个$root.path取的是进来时的列表路由地址，即list
        let routePath = this.$route.path
        let bizType = routePath.toString().indexOf("CGRK") >=0?"CGRK":"CGTH"
        return baseRoute +bizType
      },

      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      addBefore(){
         // alert("x这个问题目前未找到答案，就新增时，第一次没有加载商品型")
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        console.log("JEditableTableMixin.js，即新增按钮后，会调用此方法")
        let fieldval = pick(this.model,'bizNo','bizDate','traderId','storeId','tradeMethod','handler','memo')
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldval)
        })
        // 加载子表数据

        if (this.model.id) {
          let params = { id: this.model.id } // 执行结果？怎么看，没明白  //放在？
          this.requestSubTableData(this.url.bizPurchaseInDetail.list, params, this.bizPurchaseInDetailTable)
        }


      },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let sourceDetail = this.bizPurchaseInDetailTable.dataSource
        let detail = allValues.tablesValue[0].values
        for(let i = 0 ; i< detail.length ; i++){
          let record = sourceDetail.find(item => {
            return item.id == detail[i].id;
          });
          if (null != record && undefined != record){
            detail[i].listBizFlowSerial = []
            detail[i].listBizFlowSerial = record.listBizFlowSerial}
        }
        let main = Object.assign(this.model, allValues.formValue)
        return {
          ...main, // 展开
          bizPurchaseInDetailList: detail,
         // bizPurchaseInDetailList: allValues.tablesValue[0].values,

        }
      },
      validateError(msg){
        this.$message.error(msg)
      },
     popupCallback(row){
       this.form.setFieldsValue(pick(row,'bizNo','bizDate','traderId','storeId','tradeMethod','handler','memo'))
     },
      getFormFieldValue(field){
        return this.form.getFieldValue(field)
      },
      handleDelete(props) {
        let { rowId, target } = props
        let values=[]
        //特别注意，inputValues和dataSources是分离的
        target.inputValues.forEach((item, index) => {
          if (props.index == index){
            // item.qty = 1000
            // item.memo = "input再不显示，我要疯了"
            // alert(item.listBizFlowSerial.length)
          }
          values.push(item)
        })
        this.$refs.bizPurchaseInDetail.setValues(values)


        //let { rowId, target } = props
        //target.removeRows(props.rowId) // 删除时注意放开
        //target.dataSource[0].qty = 10000



        //alert(target.getDeleteIds())
        // target.getDeleteIds() 里面的方法
        // 参数解释
        // props.index ：当前行的下标
        // props.text ：当前值，可能是defaultValue定义的值，也可能是从dataSource中取出的值
        // props.rowId ：当前选中行的id，如果是新增行则是临时id
        // props.column ：当前操作的列
        // props.getValue ：这是一个function，执行后可以获取当前行的所有值（禁止在template中使用）
        //                  例：const value = props.getValue()
        // props.target ：触发当前事件的实例，可直接调用该实例内的方法（禁止在template中使用）
        //                  例：target.add()
        // 使用实例：删除当前操作的行
        // let { rowId, target } = props
        //target.removeRows(rowId)  //暂时保留 不要删除 ，此方法中放置将来的串号信息
      },
      handleSerial(props){
        let record = props.getValue()
        let skuInfoUrl =  "/sku/sysSku/queryById"
        let params = {};//查询条件
        params.id = record.skuId;
        let  that  = this.$refs.getBizSerialModalInfoForm
        that.parentSku.selectRowId = record.id
        getAction(skuInfoUrl, params).then((res) => {
          if (res.success && res.result) {
            that.parentSku.skuFullName = res.result.fullName
          }
        })
        that.parentSku.skuId = record.skuId
        if (record.listBizFlowSerial == null || undefined == record.listBizFlowSerial )
        {
          Object.assign(record, {listBizFlowSerial:[]});
        }
        //动态添加属性
        if (record.listBizFlowSerial == null || undefined == record.listBizFlowSerial )
        {
          that.dataSource = record.listBizFlowSerial   //没有 jiran baocunle ,zai load yici
        }else {
          Object.assign(record, {listBizFlowSerial:[]});  //添加属性
          that.dataSource = record.listBizFlowSerial
        }
        that.title = "串号信息" ;
        that.visible = true;
      },

      /**
       * @serialRecords : 串号记录
       *  @selectRowId：到串号组件时的行id,再回传回来进行相应的判断
       * */
      getBizSerialModalInfo(serialRecords,selectRowId){

        let that = this.bizPurchaseInDetailTable.dataSource
        let record = that.find(item => {
         return item.id == selectRowId;
        });
        let serial = {listBizFlowSerial:[]}
        serial.listBizFlowSerial = serialRecords
        Object.assign(record, serial);  //添加属性







        /*
        alert(record.listBizFlowSerial.length)
        for(let k = 0 ; k <that.length ; k++ ){
          that[k].qty = that[k].qty * 2
        }
*/
        // let serial = {listBizFlowSerial:[]}
        // serial.listBizFlowSerial = serialRecords
        // Object.assign(record, serial);  //添加属性
      },

    }
  }

/*
  function enterCallback(e) {
    if (e.keyCode === 13) {
      let activeEl = document.activeElement;
      let nextEl = activeEl.nextElementSibling;
      nextEl && nextEl.focus();
    }
  }
  window.addEventListener("keydown", enterCallback);

 */

</script>

