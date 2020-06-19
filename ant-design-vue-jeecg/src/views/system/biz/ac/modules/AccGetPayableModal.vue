<template>
  <div>

    <a-drawer
      :title="title"
      :width="720"
      :maskClosable = "false"
      :visible="visible"
      :placement="right"
      :keyboard = "true"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
    >
      <a-card :bordered="false">
        <div class="table-page-search-wrapper">
          <a-form layout="inline"  >
            <a-row :gutter="24">
              <a-col :xl="12" :lg="13" :md="14" :sm="24">
                <a-form-item label="往来单位">
                  <y-search-trader-select-tag  v-model="queryParam.traderId"    excludeDisable="true" />
                </a-form-item>
              </a-col>

              <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              </span>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div>
          <a-table
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="ipagination"
            :loading="loading"
            :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
            class="j-table-force-nowrap"
            @change="handleTableChange">

          </a-table>
        </div>

      </a-card>


      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 1,
        }"
      >
        <a-button :style="{ marginRight: '8px' }" @click="onClose">
          关闭
        </a-button>
        <a-button type="primary" @click="onConfirm">
          确定
        </a-button>
      </div>

    </a-drawer>



  </div>





</template>
<script>
  import { httpAction } from '@/api/manage'

  import { getAction,postAction } from '@/api/manage'
  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import YSearchTraderSelectTag from '@/components/youlan/YSearchTraderSelectTag'
  import YMultiSelectTag from "@/components/youlan/YMultiSelectTag";
  import JMultiSelectTag from "@/components/dict/JMultiSelectTag";

  export default {
    name: "AccGetPayableModal",
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      YMultiSelectTag,
      YSearchTraderSelectTag,
      JMultiSelectTag,
    },
    props: {
      getSelectPayableList: {
        type: Function,
        default: null
      }
    },
      data() {
      return {
        title:"acc-get-payable-modal-title",
        form: this.$form.createForm(this),
        dataSource: [],
        selectedRowKeys:[],
        selectionRows:[],
        visible: false,
        loading: false,
        columns: [

          {
            title:'单据',
            align:"center",
            dataIndex: 'bizNo',
            width:100,
          },
          {
            title:'往来单位',
            align:"left",
            dataIndex: 'traderName',
            width:150,
            ellipsis: true,
          },
          {
            title:'应付款',
            align:"right",
            width:60,
            dataIndex: 'sourceAmount'
          },
          {
            title:'已结款',
            align:"right",
            width:60,
            datIndex: 'targetAmount'
          },
          {
            title:'应结款',
            align:"right",
            width:60,
            dataIndex: 'diffAmount'
          },

        ],
        url: {
          list: this.getListUrl("/biz.ac/accSettle/selectAwaitSettlelist/"),
        },
      }
    },
    mounted() {
      //这里增加按钮  action-button-group
    },
    methods: {
      getListUrl(url){
        let baseRoute= url
        //这个$root.path取的是进来时的列表路由地址，即list
        let routePath = this.$route.path
        let bizType = routePath.toString().indexOf("FKD") >=0?"YFK":"YSK"
        return baseRoute +bizType
      },
      initValues(){
        this.selectedRowKeys=[]
        this.selectionRows=[]
        this.dataSource = []
      },

      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectionRows;
      },
      showDrawer() {
        this.visible = true;
      },
      onClose() {
        this.initValues()
        this.visible = false;

      },
      onConfirm() {
        //传给父组件执行AccSettleModal
        if (this.getSelectPayableList) {
          this.getSelectPayableList(this.selectionRows);
        }
        this.initValues()
        this.visible = false;
      },
    },
  };
</script>
