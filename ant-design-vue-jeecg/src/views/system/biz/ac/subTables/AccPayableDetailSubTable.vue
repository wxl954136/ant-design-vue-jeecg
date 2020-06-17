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
    name: 'AccPayableDetailSubTable',
    mixins: [JeecgListMixin],
    props: {
      record: {
        type: Object,
        default: null,
      }
    },
    data() {
      return {
        description: '应付款明细表内嵌列表',
        disableMixinCreated: true,
        noteType:"",
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '供应商',
            key:'traderId',
            align: 'left',
            width:300,
            dataIndex: 'traderId_dictText'
          },
          {
            title: '应付款金额',
            align: 'right',
            key:'sourceAmount',
            width:120,
            dataIndex: 'sourceAmount',
          },
          {
            title: '备注',
            key:'memo',
            align: 'center',
            dataIndex: 'memo',
          },
        ],
        url: {
          listByMainId: '/biz.ac/accPayable/queryAccPayableDetailByMainId',
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
    created() {
      let routePath = this.$route.path
      this.noteType = routePath.toString().indexOf("YFK") >=0?"YFK":"YSK"
      this.initTableHeadTitle()
    },
    methods: {
      initTableHeadTitle() {
        for (let key in this.columns) {
          let obj = this.columns[key]
          if (obj.key ==  "traderId") {
            obj.title = (this.noteType == "YFK" ? "供应商" : "客户")
          }else if (obj.key ==  "sourceAmount")
          {
            obj.title = (this.noteType == "YFK" ? "应付款金额" : "应收款金额")
          }
        }
      },
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
