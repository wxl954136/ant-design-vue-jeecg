<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="12">
            <a-form-item label="商品编码">
              <a-input placeholder="请输入商品编码" v-model="queryParam.code"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="12">
            <a-form-item label="品牌">
              <a-input placeholder="请输入品牌" v-model="queryParam.brand"></a-input>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="7" :md="8" :sm="12">
              <a-form-item label="商品名称">
                <a-input placeholder="请输入商品名称" v-model="queryParam.name"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="12">
              <a-form-item label="颜色">
                <a-input placeholder="请输入颜色" v-model="queryParam.color"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="12">
              <a-form-item label="商品分类">
                <j-category-select placeholder="请选择商品分类" v-model="queryParam.classifyId" pcode="A01"/>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="12">
              <a-form-item label="虚拟商品">
                <j-dict-select-tag placeholder="请选择虚拟商品" v-model="queryParam.virFlag" dictCode="sys_confirm_status"/>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="12">
              <a-form-item label="启用状态">
                <j-dict-select-tag placeholder="请选择启用状态" v-model="queryParam.enableFlag" dictCode="sys_enable_status"/>
              </a-form-item>
            </a-col>
          </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="12">
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
      <a-button type="primary" icon="download" @click="handleExportXls('商品信息')">导出</a-button>
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
        size="middle"
        :scroll="{x: 1300}"
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

    <sysSku-modal ref="modalForm" @ok="modalFormOk"></sysSku-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SysSkuModal from './modules/SysSkuModal'
  import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
  import { loadCategoryData } from '@/api/api'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import JCategorySelect from '@comp/jeecg/JCategorySelect'

  export default {
    name: "SysSkuList",
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      JDictSelectTag,
      JCategorySelect,
      SysSkuModal
    },
    data () {
      return {
        description: '商品信息管理页面',
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title:'商品编码',
            align:"left",
            width:120,
            sorter: true,
            dataIndex: 'code'
          },
          {
            title:'品牌',
            align:"left",
            width:90,
            sorter: true,
            dataIndex: 'brand'
          },
          {
            title:'商品名称',
            width:150,
            align:"left",
            dataIndex: 'name',
            sorter: true,
          },
          {
            title:'颜色',
            align:"left",
            width:90,
            sorter: true,
            dataIndex: 'color'
          },
          {
            title:'商品全称',
            align:"center",
            width:200,
            dataIndex: 'fullName',
            sorter: true,
          },
          {
            title:'商品分类',
            align:"left",
            width:100,
            dataIndex: 'classifyId',
            sorter: true,
            customRender: (text) => (text ? filterMultiDictText(this.dictOptions['classifyId'], text) : '')
          },
          {
            title:'库龄 ',
            align:"center",
            width:60,
            dataIndex: 'stockAge',


          },
          {
            title:'成本方式',
            align:"center",
            width:90,
            dataIndex: 'costFlag_dictText',
            customRender: function (text) {
              if (text == '个体计价') {
                return <a-tag color="green">{text}</a-tag>
              } else {
                return  <a-tag color='#f50'>{text}</a-tag>
              }
            }
          },
          {
            title:'虚拟商品',
            align:"center",
            width:90,
            dataIndex: 'virFlag_dictText',
            customRender: function (text) {
              if (text == '是') {
                return <a-tag color="#f50">{text}</a-tag>
              } else {
                return  <a-tag color='green'>{text}</a-tag>
              }
            }
          },

          {
            title:'排序',
            align:"center",
            width:60,
            sorter: true,
            dataIndex: 'skuSort'
          },
          {
            title:'状态',
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
            fixed:"right",
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/sku/sysSku/list",
          delete: "/sku/sysSku/delete",
          deleteBatch: "/sku/sysSku/deleteBatch",
          exportXlsUrl: "/sku/sysSku/exportXls",
          importExcelUrl: "sku/sysSku/importExcel",
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
        loadCategoryData({categoryType:'SPFL'}).then((res) => {
          if (res.success) {
            this.$set(this.dictOptions, 'classifyId', res.result)
          }
        })
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>