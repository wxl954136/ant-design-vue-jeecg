<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" >
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="商品名称">
              <a-input placeholder="请输入商品名称" v-model="parameters.full_name"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="请选择仓库">
              <a-input placeholder="选择仓库" v-model="queryParam.storeId"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary"  icon="search" @click="queryResult">查询</a-button>
              <a-button type="primary" icon="reload" style="margin-left: 8px">重置</a-button>
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
    <!--
    <div class="table-operator">

    </div>
    -->

    <!-- table区域-begin -->
    <div>
      <iframe  ref = "report" id="report" :src="url.report" frameborder="0" width="100%" height="700px" scrolling="auto"></iframe>
    </div>


  </a-card>
</template>

<script>
  import Vue from 'vue'
  import { httpAction,postAction,getAction } from '@/api/manage'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import '@/assets/less/TableExpand.less'
  import {USER_INFO} from "@/store/mutation-types"

  export default {
    name: "CoreStockSkuList",
    mixins:[JeecgListMixin ],
    components: {

    },
    data () {
      return {

        url: {
          report: this.getReportUrl(),
        },
        parameters:{
          gsdm:'',
          full_name:"",
        }
      }
    },
    created(){



    },
    methods: {
      loadData()
      {

      },
      getReportUrl(){
        let reportLink = "46dc26a9a8821de38f73772953907aa4"
        let report =  `${window._CONFIG['reportDomainURL']}` +  reportLink
        return report
      },
      queryResult(){
        this.parameters.gsdm = Vue.ls.get(USER_INFO).gsdm
        let condition = "?gsdm=" + this.parameters.gsdm
        condition = condition + "&full_name=" + this.parameters.full_name
        this.url.report = this.getReportUrl(this.reportLink) + condition
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>