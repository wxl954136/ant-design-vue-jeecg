const focusNextOnEnter = {
  install(Vue, options) {
    console.log(options);
    Vue.directive('focusNextOnEnter', {
      bind: function(el, {
        value
      }, vnode) {
        el.addEventListener('keyup', (ev) => {
          if (ev.keyCode === 13) {
            let nextInput = vnode.context.$refs[value]
            if (nextInput && typeof nextInput.focus === 'function') {
              nextInput.focus()
              nextInput.select()
            }
          }
        })
      }
    })
  }
};
export default focusNextOnEnter;
/**
 *
 *
 * 调用方法
 *<div class="app">
 <div>
 <input type="text" v-focus-next-on-enter="'input2'" ref="input1">
 </div>
 <div>
 <input type="text" v-focus-next-on-enter="'input1'" ref="input2">
 </div>
 </div>
 *
 *
 *
 */

