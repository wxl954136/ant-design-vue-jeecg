<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="名称">
              <a-input placeholder="请输入名称" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="供应商">
              <j-dict-select-tag placeholder="请选择供应商" v-model="queryParam.salerFlag" dictCode="sys_confirm_status"/>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="客户">
                <j-dict-select-tag placeholder="请选择客户" v-model="queryParam.buyerFlag" dictCode="sys_confirm_status"/>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="帐期(天)">
                <a-input placeholder="请输入帐期(天)" v-model="queryParam.period"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="联系人">
                <a-input placeholder="请输入联系人" v-model="queryParam.contacter"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="电话">
                <a-input placeholder="请输入电话" v-model="queryParam.tel"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="银行名称">
                <a-input placeholder="请输入银行名称" v-model="queryParam.bankName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="银行卡号">
                <a-input placeholder="请输入银行卡号" v-model="queryParam.bankCardNo"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="启用">
                <j-dict-select-tag placeholder="请选择启用" v-model="queryParam.enableFlag" dictCode="sys_enable_status"/>
              </a-form-item>
            </a-col>
          </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->
    
    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('往来单位')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        :scroll="{x: 1650}"
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

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="uploadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <sysTrader-modal ref="modalForm" @ok="modalFormOk"></sysTrader-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SysTraderModal from './modules/SysTraderModal'
  import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'

  export default {
    name: "SysTraderList",
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      JDictSelectTag,
      SysTraderModal
    },
    data () {
      return {
        description: '往来单位管理页面',
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            fixed:"left",
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },

          {
            title:'名称',
            align:"left",
            dataIndex: 'name',
            width:200,
            ellipsis: true,
            // fixed:"left",
          },
          {
            title:'供应商',
            align:"center",
            dataIndex: 'salerFlag_dictText',
            width:60,
            customRender: function (text) {
              if (text == '是') {
                return "✔"
              } else {
                return  ""
              }
            }
          },

          {
            title:'客户',
            align:"center",
            width:60,
            ellipsis: true,

            dataIndex: 'buyerFlag_dictText',
            customRender: function (text) {
              if (text == '是') {
                return "✔"
              } else {
                return  ""
              }
            }
          },
          {
            title:'帐期(天)',
            align:"center",
            width:90,
            dataIndex: 'period'
          },
          {
            title:'信用额(元)',
            align:"right",
            width:90,
            dataIndex: 'creditAmout'
          },
          {
            title:'联系人',
            align:"center",
            width:100,
            dataIndex: 'contacter'
          },
          {
            title:'电话',
            align:"left",
            width:100,
            dataIndex: 'tel'
          },
          {
            title:'地址',
            align:"left",
            width:150,
            dataIndex: 'address'
          },
          {
            title:'银行名称',
            align:"left",
            width:150,
            dataIndex: 'bankName'
          },
          {
            title:'开户行',
            align:"left",
            width:150,
            dataIndex: 'bankAddress'
          },
          {
            title:'银行卡号',
            align:"center",
            width:180,
            dataIndex: 'bankCardNo'
          },
          {
            title:'银行归属',
            align:"center",
            width:100,
            dataIndex: 'bankBelong'
          },
          {
            title:'备注',
            align:"left",
            dataIndex: 'memo'
          },
          {
            title:'启用',
            align:"center",
            width:90,
            dataIndex: 'enableFlag_dictText',
            customRender: function (text) {
              if (text == '启用') {
                return <a-tag color='#108ee9'>{text}</a-tag>
              } else {
                return  <a-tag color='#f50'>{text}</a-tag>
              }
            }
          },

          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed: 'right',
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/trader/sysTrader/list",
          delete: "/trader/sysTrader/delete",
          deleteBatch: "/trader/sysTrader/deleteBatch",
          exportXlsUrl: "/trader/sysTrader/exportXls",
          importExcelUrl: "trader/sysTrader/importExcel",
        },
        dictOptions:{},
      }
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
    },
    methods: {
      initDictConfig(){
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>