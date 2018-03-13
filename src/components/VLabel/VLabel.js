// Styles
import '../../stylus/components/_labels.styl'

// Mixins
import Colorable from '../../mixins/colorable'

export default {
  functional: true,

  name: 'v-label',

  props: {
    color: [Boolean, String],
    focused: Boolean,
    for: String,
    value: Boolean
  },

  render (h, { children, props }) {
    let classes = {
      'v-label--active': props.value
    }

    console.log(props.focused, props.color)

    if (props.focused && props.color) {
      console.log('focused')
      classes = Colorable.methods.addTextColorClassChecks(classes, props.color)
    }

    return h('label', {
      staticClass: 'v-label',
      'class': classes,
      attrs: {
        for: props.for
      }
    }, children)
  }
}
