// Styles
import '../../stylus/components/_inputable.styl'
import '../../stylus/components/_text-inputs.styl'

// Components
import VLabel from '../VLabel'

// Mixins
import Colorable from '../../mixins/colorable'

export default {
  name: 'v-text-input',

  mixins: [
    Colorable
  ],

  data: vm => ({
    isFocused: false,
    lazyValue: vm.value
  }),

  props: {
    color: {
      type: String,
      default: 'primary'
    },
    label: {
      type: String,
      default: ''
    },
    value: {
      required: false
    }
  },

  computed: {
    inputValue: {
      get () {
        return this.lazyValue
      },
      set (val) {
        this.lazyValue = val
        this.$emit('input', this.lazyValue)
      }
    },
    isDirty () {
      return !!this.lazyValue
    }
  },

  methods: {
    genInput () {
      const listeners = Object.assign({}, this.$listeners)
      delete listeners['change'] // Change should not be bound externally

      return this.$createElement('input', {
        attrs: {
          ...this.$attrs,
          'aria-label': (!this.$attrs || !this.$attrs.id) && this.label, // Label `for` will be set if we have an id
          placeholder: this.$attrs.placeholder || this.label,
          type: 'text'
        },
        domProps: {
          value: this.value
        },
        on: Object.assign({}, listeners, {
          blur: this.onBlur,
          input: this.onInput,
          focus: this.onFocus,
          keydown: this.onKeyDown
        }),
        ref: 'input'
      })
    },
    genLabel () {
      return this.$createElement(VLabel, {
        props: {
          color: this.isFocused ? this.color : false,
          focused: this.isFocused,
          value: this.isFocused || this.isDirty
        }
      }, this.label)
    },
    onBlur (e) {
      this.isFocused = false
      // Reset internalChange state
      // to allow external change
      // to persist
      this.internalChange = false

      this.$nextTick(this.validate)
      this.$emit('blur', e)
    },
    onClick () {
      !this.isFocused &&
        !this.disabled &&
        this.onFocus()
    },
    onFocus (e) {
      if (!this.$refs.input) return

      this.isFocused = true
      if (document.activeElement !== this.$refs.input) {
        this.$refs.input.focus()
      }
      this.$emit('focus', e)
    },
    onInput (e) {
      this.mask && this.resetSelections(e.target)
      this.inputValue = e.target.value
      this.badInput = e.target.validity && e.target.validity.badInput
      this.shouldAutoGrow && this.calculateInputHeight()
    },
    onKeyDown (e) {
      // Prevents closing of a
      // dialog when pressing
      // enter
      if (this.isTextarea &&
        this.isFocused &&
        e.keyCode === 13
      ) {
        e.stopPropagation()
      }

      this.internalChange = true
    }
  },

  render (h) {
    return h('div', {
      staticClass: 'v-text-input',
      'class': this.addTextColorClassChecks({
        'v-text-input--is-focused': this.isFocused
      })
    }, [
      this.genLabel(),
      this.genInput()
    ])
  }
}
