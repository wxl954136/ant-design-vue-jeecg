<template>
  <a-card class="j-inner-table-wrapper" :bordered="false">

    <!-- 查询区域 begin -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="单据号码">
          <a-input v-model="queryParam.bizNo" placeholder="请输入单据号码"/>
        </a-form-item>
      </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="单据日期">
              <j-date v-model="queryParam.bizDate" placeholder="请选择单据日期"/>
        </a-form-item>
      </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="往来单位">
            <a-input v-model="queryParam.traderId" placeholder="请输入往来单位"/>
          </a-form-item>
        </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="仓库">
          <a-input v-model="queryParam.storeId" placeholder="请输入仓库"/>
        </a-form-item>
      </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="付款方式">
          <j-dict-select-tag v-model="queryParam.tradeMethod" placeholder="请选择付款方式" dictCode="sys_payable_type"/>
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
      <a-button type="primary" icon="download" @click="handleExportXls('采购信息主表')">导出</a-button>
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
            <a-tab-pane tab="采购入库明细表" key="bizPurchaseInDetail" forceRender>
              <biz-purchase-in-detail-sub-table :record="record"/>
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
    <biz-purchase-in-modal ref="modalForm" @ok="modalFormOk"/>

  </a-card>
</template>

<script>
  import Vue from 'vue'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import BizPurchaseInModal from './modules/BizPurchaseInModal'
  import BizPurchaseInDetailSubTable from './subTables/BizPurchaseInDetailSubTable'
  import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
  import JDate from '@/components/jeecg/JDate.vue'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import '@/assets/less/TableExpand.less'

  import { USER_INFO,ACCESS_TOKEN,USER_NAME } from "@/store/mutation-types"
  export default {
    name: 'BizPurchaseInList',
    mixins: [JeecgListMixin],
    components: {
      BizPurchaseInModal,
      BizPurchaseInDetailSubTable,
      JDate,
      JDictSelectTag,
    },
    data() {
      return {
        description: '采购信息主表列表管理页面',
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
            title: '单据号码',
            align: 'center',
            dataIndex: 'bizNo',
          },
          {
            title: '单据日期',
            align: 'center',
            dataIndex: 'bizDate',
          },
          {
            title: '往来单位',
            align: 'center',
            dataIndex: 'traderId_dictText'
          },
          {
            title: '仓库',
            align: 'center',
            dataIndex: 'storeId_dictText'
          },
          {
            title: '付款方式',
            align: 'center',
            dataIndex: 'tradeMethod_dictText'
          },
          {
            title: '经手人',
            align: 'center',
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
            align: 'center',
            scopedSlots: { customRender: 'action' },
          },
        ],
        // 字典选项
        dictOptions: {},
        // 展开的行
        expandedRowKeys: [],
        url: {
          list: '/biz.po/bizPurchaseIn/list',
          delete: '/biz.po/bizPurchaseIn/delete',
          deleteBatch: '/biz.po/bizPurchaseIn/deleteBatch',
          exportXlsUrl: '/biz.po/bizPurchaseIn/exportXls',
          importExcelUrl: '/biz.po/bizPurchaseIn/importExcel',
        },
      }
    },
    computed: {

      importExcelUrl() {
        /**
         * 取值请注意：
         * 1.import Vue from 'vue'
         * 2.import { USER_INFO,ACCESS_TOKEN,USER_NAME } from "@/store/mutation-types"
         *  let userInfo = Vue.ls.get(USER_INFO)
         * console.info(userInfo.gsdm)
         */


        // console.info("1======================")
        // console.info("2======================" + Vue.ls.get(USER_NAME))
        //

        return window._CONFIG['domianURL'] + this.url.importExcelUrl
      }
    },
    methods: {
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