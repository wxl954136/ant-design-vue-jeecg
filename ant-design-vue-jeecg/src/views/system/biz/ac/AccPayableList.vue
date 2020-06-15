<template>
  <a-card class="j-inner-table-wrapper" :bordered="false">

    <!-- 查询区域 begin -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="单据号">
          <a-input v-model="queryParam.bizNo" placeholder="请输入单据号"/>
        </a-form-item>
      </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="单据日期">
              <j-date v-model="queryParam.bizDate" placeholder="请选择单据日期"/>
        </a-form-item>
      </a-col>
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
      <a-button type="primary" icon="download" @click="handleExportXls('应付款头表')">导出</a-button>
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
            <a-tab-pane :tab="detailTitle" key="accPayableDetail" forceRender>
              <acc-payable-detail-sub-table :record="record"/>
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
    <acc-payable-modal ref="modalForm" @ok="modalFormOk"/>

  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AccPayableModal from './modules/AccPayableModal'
  import AccPayableDetailSubTable from './subTables/AccPayableDetailSubTable'
  import JDate from '@/components/jeecg/JDate.vue'
  import '@/assets/less/TableExpand.less'


  export default {
    name: 'AccPayableList',
    mixins: [JeecgListMixin],
    components: {
      AccPayableModal,
      AccPayableDetailSubTable,
      JDate,
    },
    data() {
      return {
        description: '应付款头表列表管理页面',
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
            title: '单据号',
            align: 'center',
            width:150,
            dataIndex: 'bizNo',
          },
          {
            title: '科目',
            align: 'left',
            width:200,
            dataIndex: 'subjectsId',
          },
          {
            title: '单据日期',
            align: 'center',
            width:100,
            dataIndex: 'bizDate',
          },
          {
            title: '经手人',
            align: 'center',
            width:100,
            dataIndex: 'handler',
          },
          {
            title: '备注',
            align: 'center',
            dataIndex: 'memo',
          },

          {
            title: '操作',
            dataIndex: 'action',
            width:147,

            align: 'center',
            scopedSlots: { customRender: 'action' },
          },
        ],
        // 字典选项
        dictOptions: {},
        // 展开的行
        expandedRowKeys: [],
        url: {
           // list: '/biz.ac/accPayable/list',
          list: this.getListUrl("/biz.ac/accPayable/list/"),
          delete: '/biz.ac/accPayable/delete',
          deleteBatch: '/biz.ac/accPayable/deleteBatch',
          exportXlsUrl: '/biz.ac/accPayable/exportXls',
          importExcelUrl: '/biz.ac/accPayable/importExcel',
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
      if (title == "YFK") this.detailTitle = "应付款明细"
      else if (title == "YSK") this.detailTitle = "应收款明细"

    },
    mounted() {

    },
    methods: {
      getBizType(){
        let routePath = this.$route.path
        let bizType = (routePath.toString().indexOf("YFK") >=0?"YFK":"YSK")
        return bizType
      },
      getListUrl(url){
        let baseRoute= url
        let routePath = this.$route.path
        let bizType = (routePath.toString().indexOf("YFK") >=0?"YFK":"YSK")
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