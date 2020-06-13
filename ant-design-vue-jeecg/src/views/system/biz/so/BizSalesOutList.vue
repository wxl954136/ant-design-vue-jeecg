<template>
  <a-card class="j-inner-table-wrapper" :bordered="false">

    <!-- 查询区域 begin -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :xl="7" :lg="8" :md="9" :sm="24">
            <a-form-item label="单据日期">
              <j-date class="query-group-cust" v-model="queryParam.bizDate_begin" placeholder="选择开始日期"/>
              <span class="query-group-split-cust"></span>
              <j-date class="query-group-cust" v-model="queryParam.bizDate_end" placeholder="选择结束日期"/>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="仓库">
          <a-input v-model="queryParam.storeId" placeholder="请输入仓库"/>
        </a-form-item>
      </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="客户">
            <a-input v-model="queryParam.traderId" placeholder="请输入客户"/>
          </a-form-item>
        </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="收款方式">
          <j-dict-select-tag v-model="queryParam.tradeMethod" placeholder="请选择收款方式" dictCode="sys_receivable_type"/>
        </a-form-item>
      </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="经手人">
          <a-input v-model="queryParam.handler" placeholder="请输入经手人"/>
        </a-form-item>
      </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="收款银行">
          <a-input v-model="queryParam.bankId" placeholder="请输入收款银行"/>
        </a-form-item>
      </a-col>
          </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span class="table-page-search-submitButtons table-operator">
              <a-button type="primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button type="primary" icon="reload" @click="searchReset">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                <span>{{ toggleSearchStatus ? '收起' : '展开' }}</span>
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域 end -->

    <!-- 操作按钮区域 begin -->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleAdd">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('销售主表')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete"/>
            <span>删除</span>
          </a-menu-item>
        </a-menu>
        <a-button>
          <span>批量操作</span>
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>
    <!-- 操作按钮区域 end -->

    <!-- table区域 begin -->
    <div>

      <a-alert type="info" showIcon style="margin-bottom: 16px;">
        <template slot="message">
          <span>已选择</span>
          <a style="font-weight: 600;padding: 0 4px;">{{ selectedRowKeys.length }}</a>
          <span>项</span>
          <a style="margin-left: 24px" @click="onClearSelected">清空</a>
        </template>
      </a-alert>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        class="j-table-force-nowrap"
        :loading="loading"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :expandedRowKeys="expandedRowKeys"
        :rowSelection="{selectedRowKeys, onChange: onSelectChange}"
        @expand="handleExpand"
        @change="handleTableChange"
      >

        <!-- 内嵌table区域 begin -->
        <template slot="expandedRowRender" slot-scope="record">
          <a-tabs tabPosition="top">
            <a-tab-pane :tab="detailTitle" key="bizSalesOutDetail" forceRender>
              <biz-sales-out-detail-sub-table :record="record"/>
            </a-tab-pane>
          </a-tabs>
        </template>
        <!-- 内嵌table区域 end -->

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>

        <template slot="imgSlot" slot-scope="text">
          <div style="font-size: 12px;font-style: italic;">
            <span v-if="!text">无图片</span>
            <img v-else :src="getImgView(text)" alt="" style="max-width:80px;height:25px;"/>
          </div>
        </template>

        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            ghost
            type="primary"
            icon="download"
            size="small"
            @click="uploadFile(text)"
          >
            <span>下载</span>
          </a-button>
        </template>

        <template slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              <span>更多 <a-icon type="down"/></span>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>

        </template>

      </a-table>
    </div>
    <!-- table区域 end -->

    <!-- 表单区域 -->
    <biz-sales-out-modal ref="modalForm" @ok="modalFormOk"/>

  </a-card>
</template>

<script>

  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import BizSalesOutModal from './modules/BizSalesOutModal'
  import BizSalesOutDetailSubTable from './subTables/BizSalesOutDetailSubTable'
  import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
  import JDate from '@/components/jeecg/JDate.vue'
  import '@/assets/less/TableExpand.less'


  export default {
    name: 'BizSalesOutList',
    mixins: [JeecgListMixin],
    components: {
      BizSalesOutModal,
      BizSalesOutDetailSubTable,
      JDate,
      JDictSelectTag,
    },
    data() {
      return {
        description: '销售主表列表管理页面',
        detailTitle:"",
        // 表头
        columns: [
          {
            title: '#',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: (t, r, index) => parseInt(index) + 1
          },

          {
            title: '单据编号',
            align: 'center',
            width:150,
            dataIndex: 'bizNo',
          },
          {
            title: '单据日期',
            align: 'center',
            width:100,
            dataIndex: 'bizDate',
          },

          {
            title: '客户',
            align: 'left',
            width:200,
            dataIndex: 'traderId_dictText'
          },
          {
            title: '仓库',
            align: 'center',
            width:120,
            dataIndex: 'storeId_dictText'
          },
          {
            title: '经手人',
            align: 'center',
            dataIndex: 'handler',
          },
          {
            title: '收款银行',
            align: 'left',
            width:120,
            dataIndex: 'bankId_dictText'
          },
          {
            title: '收款方式',
            align: 'left',
            width:90,
            dataIndex: 'tradeMethod_dictText'
          },
          {
            title: '备注',
            align: 'center',
            dataIndex: 'memo',
          },

          {
            title: '创建人',
            align: 'center',
            dataIndex: 'createBy',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' },
          },
        ],
        // 字典选项
        dictOptions: {},
        // 展开的行
        expandedRowKeys: [],
        url: {
          //list: '/biz.so/bizSalesOut/list',
          list: this.getListUrl("/biz.so/bizSalesOut/list/") ,
          delete: '/biz.so/bizSalesOut/delete',
          deleteBatch: '/biz.so/bizSalesOut/deleteBatch',
          exportXlsUrl: '/biz.so/bizSalesOut/exportXls',
          importExcelUrl: '/biz.so/bizSalesOut/importExcel',
        },
      }
    },
    computed: {
      importExcelUrl() {
        return window._CONFIG['domianURL'] + this.url.importExcelUrl
      }
    },
    created(){
      let title = this.getBizType()
      if (title == "CKD") this.detailTitle = "出库明细"
      else if (title == "CKD") this.detailTitle = "退货明细"

    },
    methods: {
      getBizType(){
        let routePath = this.$route.path
        let bizType = (routePath.toString().indexOf("CKD") >=0?"CKD":"THD")
        return bizType
      },
      getListUrl(url){
        let baseRoute= url
        let routePath = this.$route.path
        let bizType = (routePath.toString().indexOf("CKD") >=0?"CKD":"THD")

        return baseRoute +bizType
      },
      initDictConfig() {
      },

      handleExpand(expanded, record) {
        this.expandedRowKeys = []
        if (expanded === true) {
          this.expandedRowKeys.push(record.id)
        }
      },
    }
  }
</script>
<style lang="less" scoped>
  @import '~@assets/less/common.less';
</style>