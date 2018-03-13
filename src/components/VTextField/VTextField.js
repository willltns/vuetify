// Styles
import '../../stylus/components/_inputable.styl'
import '../../stylus/components/_text-fields.styl'

// Components
import VLabel from '../VLabel'
import VTextInput from './VTextInput'

// Mixins
import Inputable from '../../mixins/inputable'
import Maskable from '../../mixins/maskable'
import Soloable from '../../mixins/soloable'

const dirtyTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month']

export default {
  name: 'v-text-field',

  mixins: [
    Inputable,
    Maskable,
    Soloable
  ],

  inheritAttrs: false,

  data: vm => ({
    badInput: false,
    initialValue: null,
    inputHeight: null,
    internalChange: false,
    isClearing: false
  }),

  props: {
    autofocus: Boolean,
    autoGrow: Boolean,
    box: Boolean,
    color: {
      type: String,
      default: 'primary'
    },
    counter: [Boolean, Number, String],
    fullWidth: Boolean,
    multiLine: Boolean,
    noResize: Boolean,
    placeholder: String,
    prefix: String,
    rowHeight: {
      type: [Number, String],
      default: 24,
      validator: v => !isNaN(parseFloat(v))
    },
    rows: {
      type: [Number, String],
      default: 5,
      validator: v => !isNaN(parseInt(v, 10))
    },
    singleLine: Boolean,
    suffix: String,
    textarea: Boolean,
    type: {
      type: String,
      default: 'text'
    }
  },

  computed: {
    classes () {
      return {
        'v-input--text': true,
        'v-input--text--prefix': this.prefix,
        'v-input--text--single-line': this.isSingle,
        'v-input--text--solo': this.solo,
        'v-input--text--box': (this.box || this.solo)
      }
      // const classes = {
      // ...this.genSoloClasses(),
      // 'input-group--multi-line': this.multiLine,
      // 'input-group--full-width': this.fullWidth,
      // 'input-group--no-resize': this.noResizeHandle,
      // 'input-group--textarea': this.textarea
      // }

      // if (this.hasError) {
      //   classes['error--text'] = true
      // } else {
      //   return this.addTextColorClassChecks(classes)
      // }

      // return classes
    },
    count () {
      let inputLength
      if (this.inputValue) inputLength = this.inputValue.toString().length
      else inputLength = 0

      return `${inputLength} / ${this.counterLength}`
    },
    counterLength () {
      const parsedLength = parseInt(this.counter, 10)
      return isNaN(parsedLength) ? 25 : parsedLength
    },
    inputValue: {
      get () {
        return this.lazyValue
      },
      set (val) {
        if (this.mask) {
          this.lazyValue = this.unmaskText(this.maskText(this.unmaskText(val)))
          this.setSelectionRange()
        } else {
          this.lazyValue = val
          this.$emit('input', this.lazyValue)
        }
      }
    },
    isDirty () {
      return (this.lazyValue != null &&
        this.lazyValue.toString().length > 0) ||
        this.badInput ||
        dirtyTypes.includes(this.type)
    },
    isSingle () {
      return this.solo || this.singleLine
    },
    isTextarea () {
      return this.multiLine || this.textarea
    },
    noResizeHandle () {
      return this.isTextarea && (this.noResize || this.shouldAutoGrow)
    },
    shouldAutoGrow () {
      return this.isTextarea && this.autoGrow
    }
  },

  watch: {
    isFocused (val) {
      if (val) {
        this.initialValue = this.lazyValue
      } else if (this.initialValue !== this.lazyValue) {
        this.$emit('change', this.lazyValue)
      }
    },
    value (val) {
      if (this.mask && !this.internalChange) {
        const masked = this.maskText(this.unmaskText(val))
        this.lazyValue = this.unmaskText(masked)

        // Emit when the externally set value was modified internally
        String(val) !== this.lazyValue && this.$nextTick(() => {
          this.$refs.input.value = masked
          this.$emit('input', this.lazyValue)
        })
      } else this.lazyValue = val

      if (this.internalChange) this.internalChange = false

      !this.validateOnBlur && this.validate()
      this.shouldAutoGrow && this.calculateInputHeight()
    }
  },

  mounted () {
    this.shouldAutoGrow && this.calculateInputHeight()
    this.autofocus && this.focus()
  },

  render () {
    return this.genInputGroup()
  },

  methods: {
    calculateInputHeight () {
      this.inputHeight = null

      this.$nextTick(() => {
        const height = this.$refs.input
          ? this.$refs.input.scrollHeight
          : 0
        const minHeight = parseInt(this.rows, 10) * parseFloat(this.rowHeight)
        this.inputHeight = Math.max(minHeight, height)
      })
    },
    clearableCallback () {
      this.inputValue = null
      this.$nextTick(() => this.$refs.input.focus())
    },
    genLabel () {
      if (this.isDirty && this.isSingle) return null

      const isSingleLine = this.isSingle
      const data = {
        props: {
          color: this.color,
          focused: !isSingleLine && this.isFocused,
          value: !isSingleLine && (this.isFocused || this.isDirty)
        }
      }

      if ((this.attrs || {}).id) data.props.for = this.attrs.id

      return this.$createElement(VLabel, data, this.$slots.label || this.label)
    },
    genInput () {
      const input = this.$createElement(VTextInput, {
        attrs: this.$attrs,
        props: {
          label: this.label,
          value: this.lazyValue
        },
        ref: 'input'
      })

      // if (this.shouldAutoGrow) {
      //   data.style.height = this.inputHeight && `${this.inputHeight}px`
      // }

      // if (this.placeholder) data.attrs.placeholder = this.placeholder

      // if (!this.isTextarea) {
      //   data.attrs.type = this.type
      // } else {
      //   data.attrs.rows = this.rows
      // }

      // if (this.mask) {
      //   data.attrs.maxlength = this.masked.length
      // }

      const children = [input]

      this.prefix && children.unshift(this.genAffix('prefix'))
      this.suffix && children.push(this.genAffix('suffix'))

      return children
    },
    genAffix (type) {
      return this.$createElement('div', {
        'class': `v-input--text__${type}`,
        ref: type
      }, this[type])
    }
  }
}
