<template>
  <a-table
    rowKey="id"
    size="middle"
    bordered
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :pagination="false"
  >

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

  </a-table>
</template>

<script>
  import { getAction } from '@api/manage'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'

  export default {
    name: 'BizPurchaseInDetailSubTable',
    mixins: [JeecgListMixin],
    props: {
      record: {
        type: Object,
        default: null,
      }
    },
    data() {
      return {
        description: '采购入库明细表内嵌列表',
        disableMixinCreated: true,
        loading: false,
        dataSource: [],
        columns: [

          {
            title: '商品名称',
            align: 'left',
            ellipsis: true,
            width:300,
            dataIndex: 'skuId_dictText'
          },
          {
            title: '数量',
            align: 'right',
            width:90,
            dataIndex: 'qty',
          },
          {
            title: '单价',
            align: 'right',
            width:90,
            dataIndex: 'price',
          },
          {
            title: '税率',
            align: 'right',
            width:90,
            dataIndex: 'rate',
          },
          {
            title: '备注',
            align: 'left',
            width:300,
            ellipsis: true,
            dataIndex: 'memo',
          },
        ],
        url: {
          listByMainId: '/biz.po/bizPurchaseIn/queryBizPurchaseInDetailByMainId',
        },
      }
    },
    watch: {
      record: {
        immediate: true,
        handler() {
          if (this.record != null) {
            this.loadData(this.record)
          }
        }
      }
    },
    methods: {

      loadData(record) {
        this.loading = true
        this.dataSource = []
        getAction(this.url.listByMainId, {
          id: record.id,
        }).then((res) => {
          if (res.success) {
            this.dataSource = res.result.records
          }
        }).finally(() => {
          this.loading = false
        })
      },

    },
  }
</script>

<style scoped>

</style>
