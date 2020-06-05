<template>
  <a-table
    rowKey="id"
    size="middle"
    table-layout="fixed"
    bordered
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :pagination="false"
    style = "width:80%"
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
    name: 'BizSalesOutDetailSubTable',
    mixins: [JeecgListMixin],
    props: {
      record: {
        type: Object,
        default: null,
      }
    },
    data() {
      return {
        description: '销售明细表内嵌列表',
        disableMixinCreated: true,
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '商品名称',
            align: 'left',
            width:100,
            dataIndex: 'skuId_dictText'
          },
          {
            title: '数量',
            align: 'center',
            width:60,
            dataIndex: 'qty',
          },
          {
            title: '价格',
            align: 'center',
            width:60,
            dataIndex: 'price',
          },
          {
            title: '税率',
            align: 'center',
            width:60,
            dataIndex: 'rate',
          },
          {
            title: '金额',
            align: 'center',
            width:60,
            dataIndex:"",
            customRender: function (t, r, index) {
               return t.qty*t.price
            }
          },
          {
            title: '金额(含税)',
            align: 'center',
            width:60,
            customRender: function (t, r, index) {
              return t.qty*t.price*(1-t.rate)
            }
          },
          {
            title: '备注',
            align: 'center',
            width:150,
            dataIndex: 'memo',
          },
        ],
        url: {
          listByMainId: '/biz.so/bizSalesOut/queryBizSalesOutDetailByMainId',
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
          id: record.id
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
