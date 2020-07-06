<template>
  <div>

    <!-- :placement="right" -->
    <a-drawer
      :title="title"
      :width="720"
      :maskClosable = "false"
      :visible="visible"

      :keyboard = "true"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
    >

      <a-card :bordered="false" style = "margin-top: -24px;">

        <div class="table-page-search-wrapper" style = "padding: 0 0 0 0;  !important">

            <a-row :gutter="24" >
              <a-col :xl="11" :lg="12" :md="13" :sm="24">
                <a-tag>商品名称:{{parentSku.skuFullName}}</a-tag>
                <a-tag color="#f50"> 数量:{{parentSku.skuQty}} </a-tag>
              </a-col>
            </a-row>

        </div>

      </a-card>

      <!-- 操作按钮区域 -->
      <div class="table-operator" >
        <a-button @click="handleAddSerial" type="primary" icon="plus">新增</a-button>
        <a-button type="primary" icon="download"  >导出</a-button>
        <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"  >
          <a-button type="primary" icon="import">导入</a-button>
        </a-upload>


        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="batchDelSerial"><a-icon type="delete"/>删除</a-menu-item>
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
        <div style = "padding-bottom: 5px;padding-top: 0px;margin-top: -8px;">
          <a-input style="width: 100%" v-model="inputSerial" @keyup.enter="handleAddSerial" />
        </div>
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :loading="loading"
          :pagination="ipagination"
          :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
          class="j-table-force-nowrap"
          @change="handleTableChange">

          <div
            slot="filterDropdown"
            slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
            style="padding: 8px"
          >
            <a-input
              v-ant-ref="c => (searchInput = c)"
              :placeholder="`搜索 ${column.title}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block;"
              @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
              type="primary"
              icon="search"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              搜索
            </a-button>
            <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">
              重置
            </a-button>
          </div>
          <a-icon
            slot="filterIcon"
            slot-scope="filtered"
            type="search"
            :style="{ color: filtered ? '#108ee9' : undefined }"
          />
          <span slot="action" slot-scope="text, record">
            <a @click="handleDeleteSerial(record)">删除</a>
          </span>
        </a-table>
      </div>
      <!--  , textAlign: 'right',-->
      <div
        :style="{
          position: 'absolute',
          right: 0,
          textAlign: 'right',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
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
  import {randomNumber, randomString} from '@/utils/util'
  import '@/assets/less/TableExpand.less'
  import {mixinDevice} from '@/utils/mixin'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'

  export default {
    name: "BizSerialSaleModal",
    mixins:[JeecgListMixin, mixinDevice],
    components: {

    },
    props: {
      getBizSerialModalInfo: {
        type: Function,
        default: null
      },
      setCurrentRowQty: {
        type: Function,
        default: null
      },
      izSerialsRepeat: {
        type: Function,
        default: null
      },

    },
    data() {
      return {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        title:"biz-serial-modal",
        form: this.$form.createForm(this),
        searchText: '',
        searchInput: null,
        searchedColumn: '',
        inputSerial:"",
        parentSku:{
          selectRowId:"",  //
          skuId:"",
          skuFullName:"",
          costFlag:"",
          skuQty:0,
        },
        caseId: `_jet-${randomString(6)}-`,
        tempId: `_tid-${randomString(6)}`,
        parentRowProps:null,
        dataSource: [],
        selectedRowKeys:[],
        selectionRows:[],
        visible: false,
        loading: false,
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
            title:'串号',
            align:"left",
            key:'serial',
            dataIndex: 'serial',
            customRender: function (text) {
              if (text == null || text == "" || text == undefined ) {
                return text
              }
              let value = text.split(',')
              let len =value.length
              if (len == 1){
                return <a-tag color="green">{value[0]}</a-tag>
              }
              if (len == 2){
                return  <div> <a-tag color="green">{value[0]}</a-tag><a-tag color="cyan">{value[1]}</a-tag></div>
              }
              if (len == 3){
                return  <div> <a-tag color="green">{value[0]}</a-tag><a-tag color="cyan">{value[1]}</a-tag><a-tag color="orange">{value[2]}</a-tag></div>
              }
            },

            scopedSlots: {
              filterDropdown: 'filterDropdown',
              filterIcon: 'filterIcon',
              customRender: 'customRender',
            },
            onFilter: (value, record) =>
              record.serial
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
            onFilterDropdownVisibleChange: visible => {
              if (visible) {
                setTimeout(() => {
                  this.searchInput.focus();
                }, 0);
              }
            },
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"left",
            // fixed:"right",
            width:80,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/",
        },
      }
    },
    mounted() {
      //这里增加按钮  action-button-group
      let routePath = this.$route.path
      //alert(routePath)
    },
    methods: {

      initValues(){
        this.selectedRowKeys=[]
        this.selectionRows=[]
        this.dataSource = []
      },
      generateId() {
        let timestamp = new Date().getTime()
        return `${this.caseId}${timestamp}${randomNumber(6)}${this.tempId}`
      },

      /** 获取干净的ID（不包含任何杂质的ID） */
      getCleanId(id) {
        id = id.replace(this.caseId,"")
        id = id.replace(this.tempId,"")
        return id
      },

      handleAddSerial(){

        let serial = {}
        serial.serial = "ssssss"
        let inputSerials = this.inputSerial.split(',')
        for(let index = 0 ; index < inputSerials.length; index++){
            if (inputSerials[index].length <5) {
              this.$message.error('串号长度必须在5位以上')
              return
            }
        }

        if (this.izSerialsRepeat) {
          let status = this.izSerialsRepeat(serial.serial);
          if (status.result){
            this.$message.error("重复串号:" + status.serial)
            return

          }
        }
        serial.headId =  this.parentSku.selectRowId
        serial.id = this.generateId()
        serial.skuId =  this.parentSku.skuId
        this.dataSource.push(serial)
        let len = this.dataSource.length
        let currentPage = Math.floor(len / this.ipagination.pageSize) + 1  //光标定位在最后一页
        this.ipagination.current = currentPage;
        this.inputSerial = ""
        this.parentSku.skuQty = this.dataSource.length
        if (this.setCurrentRowQty) {
          this.setCurrentRowQty(this.parentRowProps,this.dataSource.length);
        }
      },
      handleDeleteSerial(record)
      {
        let that= this.dataSource
        that.splice(that.findIndex(item => item.id == record.id), 1)

      },
      batchDelSerial(){
        let that= this.dataSource
        for(let index = 0 ; index <this.selectedRowKeys.length ; index++ ){
          that.splice(that.findIndex(item => item.id == this.selectedRowKeys[index]), 1)
        }
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

        if (this.getBizSerialModalInfo) {
          this.getBizSerialModalInfo(this.dataSource,this.parentSku.selectRowId );
        }
        this.initValues()
        this.visible = false;

      },
      handleSearch(selectedKeys, confirm, dataIndex) {
        confirm();
        this.searchText = selectedKeys[0];
        this.searchedColumn = dataIndex;
      },

      handleReset(clearFilters) {
        clearFilters();
        this.searchText = '';
      },
    },
  };


</script>

<style lang="less" scoped>


</style>
