const enterToNext = {
  install(Vue, options) {
    console.log(options);
    Vue.directive('enterToNext', {
      inserted: function (el) {
        console.log("enterToNext...")
        //let frm = el.querySelector('.el-form');
        let inputs = el.querySelectorAll('input');
        console.log(inputs);
        //绑定回写事件
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].setAttribute("keyFocusIndex", i);
          inputs[i].addEventListener('keyup', (ev) => {
            if (ev.keyCode === 13) {
              let targetTo = ev.srcElement.getAttribute('keyFocusTo');
              if (targetTo) {
                this.$refs[targetTo].$el.focus();
              } else {
                var attrIndex = ev.srcElement.getAttribute('keyFocusIndex');
                var ctlI = parseInt(attrIndex);
                if (ctlI < inputs.length - 1)
                  inputs[ctlI + 1].focus();
              }
            }
          });
        }

      },
    });
  }
};


export default enterToNext;
/**
 * 调用方法
 * v-enter-to-next  = "true"
 */



