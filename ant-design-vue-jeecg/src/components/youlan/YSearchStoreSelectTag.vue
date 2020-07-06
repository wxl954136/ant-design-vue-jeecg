<template>
  <a-select
    showSearch
    labelInValue
    :disabled="disabled"
    :getPopupContainer="(node) => node.parentNode"
    @search="loadData"
    :placeholder="placeholder"
    v-model="selectedAsyncValue"
    style="width: 100%"
    @change="handleChange"
    :filterOption="filterOption"
    allowClear
    :notFoundContent="loading ? undefined : null"
  >
    <a-spin v-if="loading" slot="notFoundContent" size="small"/>
    <a-select-option v-for="d in options" :key="d.id"   :disabled="excludeDisable?false:((d.enableFlag=='1')?false:true)">{{ d.name }}</a-select-option>
  </a-select>
</template>

<script>
  import {ajaxGetStoresByUserId} from '@/api/api'
  import debounce from 'lodash/debounce';
  import {getAction} from '../../api/manage'
  //支持转换为拼音
  import pinyin from '@/components/_util/pinyin.js'

  const mapPinyinOfTrader = new Map()

  export default {
    name: 'YSearchStoreSelectTag',
    props:{
      disabled: Boolean,
      value: [String, Number],
      dict: String,
      dictOptions: Array,
      async: Boolean,
      excludeDisable:Boolean,  //不考虑enableFlag,即disable属性,查询时均可选
      placeholder:{
        type:String,
        default:"请选择",
        required:false
      }
    },
    data(){
      this.loadData = debounce(this.loadData, 800);//消抖
      this.lastLoad = 0;
      return {
        loading:false,
        selectedValue:[],
        selectedAsyncValue:[],
        options: [],
      }
    },
    created(){
      //this.initDictData();
      this.initData()
    },
    watch:{
      "value":{
        immediate:true,
        handler(val){
          if(!val){
            if(val==0){
              this.initSelectValue()
            }else{
              this.selectedValue=[]
              this.selectedAsyncValue=[]
            }
          }else{
            this.initSelectValue()
          }
        }
      },

    },
    methods:{
      initSelectValue(){
        if(this.async){
          if(!this.selectedAsyncValue || !this.selectedAsyncValue.key || this.selectedAsyncValue.key!=this.value){
            console.log("这才请求后台")
            ajaxGetStoresByUserId(null).then((res) => {
              if (res.success) {
                let obj = {
                  key: this.value,
                  label: res.result  //辅助字段，暂未用，按照模板来
                }
                this.selectedAsyncValue = {...obj}
                this.selectedValue = this.value
              }
            })

            // getAction(`/store/sysStore/queryStoresByUserId`,null).then(res=>{
            //   if(res.success){
            //     let obj = {
            //       key:this.value,
            //       label:res.result  //辅助字段，暂未用，按照模板来
            //     }
            //     this.selectedAsyncValue = {...obj}
            //     this.selectedValue = this.value
            //   }
            // })
          }
        }
      },
      loadData(value){
        console.log("数据加载",value)
        this.lastLoad +=1
        const currentLoad = this.lastLoad
        this.options = []
        this.loading=true
        ajaxGetStoresByUserId(null).then((res) => {
          this.loading=false
          if(res.success){
            if(currentLoad!=this.lastLoad){
              return
            }
            this.options = res.result

          }else{
            this.$message.warning(res.message)
          }
        })
        /*
        getAction(`/store/sysStore/queryStoresByUserId`,{}).then(res=>{
          this.loading=false
          if(res.success){
            if(currentLoad!=this.lastLoad){
              return
            }
            this.options = res.result

          }else{
            this.$message.warning(res.message)
          }
        })

         */

      },
      initData(){
        this.lastLoad +=1
        const currentLoad = this.lastLoad
        this.options = []
        this.loading=true
        //初始化的时候请求数据，必须加条件，因为需要值

        ajaxGetStoresByUserId(null).then((res) => {
          this.loading=false
          if(res.success){
            if(currentLoad!=this.lastLoad){
              return
            }
            this.options = res.result
          }else{
            this.$message.warning(res.message)
          }
        })



        /*
        getAction(`/store/sysStore/queryStoresByUserId`,null).then(res=>{
          this.loading=false
          if(res.success){
            if(currentLoad!=this.lastLoad){
              return
            }
            this.options = res.result
          }else{
            this.$message.warning(res.message)
          }
        })

         */
      },
      /*
      initDictData(){
        if(!this.async){
          //如果字典项集合有数据
          if(this.dictOptions && this.dictOptions.length>0){
            this.options = [...this.dictOptions]
          }else{
            //根据字典Code, 初始化字典数组
            let dictStr = ''
            if(this.dict){
                let arr = this.dict.split(',')
                if(arr[0].indexOf('where')>0){
                  let tbInfo = arr[0].split('where')
                  dictStr = tbInfo[0].trim()+','+arr[1]+','+arr[2]+','+encodeURIComponent(tbInfo[1])
                }else{
                  dictStr = this.dict
                }
                if (this.dict.indexOf(",") == -1) {
                  //优先从缓存中读取字典配置
                  if (getDictItemsFromCache(this.dictCode)) {
                    this.options = getDictItemsFromCache(this.dictCode);
                    return
                  }
                }
                ajaxGetDictItems(dictStr, null).then((res) => {
                  if (res.success) {
                    this.options = res.result;
                  }
                })
            }
          }
        }
      },
      */
      filterOption(input, option) {
        let select_drop_text = option.componentOptions.children[0].text.toLowerCase().trim()
        let select_drop_pinyin = ""
        if (mapPinyinOfTrader.has(select_drop_text)){
          select_drop_pinyin = mapPinyinOfTrader.get(select_drop_text)
        }else {
          select_drop_pinyin = pinyin.ConvertPinyin(select_drop_text)
          mapPinyinOfTrader.set(select_drop_text,pinyin.ConvertPinyin(select_drop_text))
        }

        let array  =  input.toLowerCase().trim().split(" ")
        let iz_pinyin = false
        for (let item of array) {
          if (item.length >0 && item != "" )
          {
            iz_pinyin = (select_drop_pinyin.indexOf(item) >=0)
            if (!iz_pinyin) break
          }
        }
        let iz_cn = false
        if (!iz_pinyin){
          for (let item of array) {
            if (item.length >0 && item != "" )
            {
              iz_cn = (select_drop_text.indexOf(item) >=0)
              if (!iz_cn) break
            }
          }
        }
       // let iz_cn = select_drop_text.indexOf(input.toLowerCase().trim()) >= 0
        return (  iz_cn || iz_pinyin);
        //源码就下面句话
        //return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      },
      handleChange (selectedValue) {
        this.selectedValue = selectedValue.key
        this.callback()
      },
      /*
      handleAsyncChange(selectedObj){
        this.selectedAsyncValue = selectedObj
        this.selectedValue = selectedObj.key
        this.callback()
      },
       */
      callback(){
        this.$emit('change', this.selectedValue);
      },
    },
    model: {
      prop: 'value',
      event: 'change'
    }
  }
</script>

<style scoped>

</style>