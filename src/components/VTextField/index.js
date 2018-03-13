import VTextField from './VTextField'
import VTextInput from './VTextInput'

/* istanbul ignore next */
VTextField.install = function install (Vue) {
  Vue.component(VTextField.name, VTextField)
  Vue.component(VTextInput.name, VTextInput)
}

export default VTextField
