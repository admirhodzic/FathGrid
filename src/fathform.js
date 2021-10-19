/* eslint-disable eqeqeq */
import './fathform.css'

// icons from https://icomoon.io/app/#/select

export default function FathForm (obj, id, _config) {
  const config = {
    method: 'GET',
    action: '',
    fieldSeparator: '',
    radioTemplate: `
            <div class="form-check">
                <input class="form-check-input" id="{id}" type="{type}" name="{name}" value="{value}" {disabled} {required} {attrs} {checked}/>
                <label class="form-check-label" for="{id}">{label}</label>
            </div>
        `,
    checkboxTemplate: `
            <div class="form-group form-check">
                <input class="form-check-input" id="{id}" type="{type}" placeholder="{placeholder}" name="{name}" {disabled} {required} {attrs} {checked}/>
                <label class="form-check-label" for="{id}">{label}</label>
            </div>`,
    inputTemplate: `
            <div class="form-group {classes}">
                <label for="{id}">{label}</label>
                <input class="form-control" id="{id}" type="{type}" placeholder="{placeholder}" name="{name}" value="{value}" {disabled} {required} {attrs}/>
                <small class="form-text text-muted">{hint}</small>
                <small class="error-msg form-text ">{error}</small>
            </div>`,
    selectTemplate: `
            <div class="form-group {classes}">
                <label for="{id}">{label}</label>
                <select  class="form-control" id="{id}"  placeholder="{placeholder}" name="{name}" {disabled} {required} {attrs}>{options}</select>
                <small class="form-text text-muted">{hint}</small>
                <small class="error-msg form-text ">{error}</small>
            </div>`,
    textareaTemplate: `
            <div class="form-group {classes}">
                <label for="{id}">{label}</label>
                <textarea class="form-control" id="{id}" placeholder="{placeholder}" name="{name}" {disabled} {required} {attrs}>{value}</textarea>
                <small class="form-text text-muted">{hint}</small>
                <small class="error-msg form-text ">{error}</small>
            </div>`,
    save: function (item) { console.log('Saving data called', item) },
    validate: function (item, errors) { console.log('validate called', item) },
    ..._config
  }
  let model = obj
  const wrapper = document.querySelector(`#${id}`)

  const errors = {
    err: [],
    add: function (field, msg) { this.err.push({ f: field, m: msg }) },
    clear: function () { this.err = [] }
  }
  function renderField (f, model) {
    const parts = {
      classes: (f.classes || '') + (f.error !== undefined ? ' error' : ''),
      label: f.label || f.name,
      name: f.name,
      id: f.id || f.name,
      type: f.type || 'text',
      placeholder: f.placeholder || '',
      hint: f.hint || '',
      value: model[f.name],
      checked: model[f.name] ? 'checked' : '',
      options: '{options}',
      disabled: f.disabled === true ? 'disabled' : '',
      required: f.required === true ? 'required' : '',
      error: f.error || '',
      attrs: `${f.height ? `height="${f.height}"` : ''} ${f.style ? `style="${f.style}"` : ''}`
    }
    if (f.type == 'radio') {
      return f.list.map(o => {
        parts.value = o.value
        parts.label = o.name
        parts.checked = (model[f.name] == o.value) ? ' checked ' : ''
        return `${config.radioTemplate.replace(/{(\w+)}/g, (x, y) => parts[y])}`
      }).join('')
    } ;
    if (f.list !== undefined) return `${config.selectTemplate.replace(/{(\w+)}/g, (x, y) => parts[y])}`.replace('{options}', f.list.map(o => `<option ${parts.value == o.value ? 'selected' : ''} value=${o.value}>${o.name}</option>`).join(''))
    if (f.type == 'textarea') return `${config.textareaTemplate.replace(/{(\w+)}/g, (x, y) => parts[y])}`
    if (f.type == 'checkbox') return `${config.checkboxTemplate.replace(/{(\w+)}/g, (x, y) => parts[y])}`
    return `${config.inputTemplate.replace(/{(\w+)}/g, (x, y) => parts[y])}`
  }

  function render () {
    wrapper.innerHTML = `
          <form class="FathForm" method="${config.method}" action="${config.action}" >
          ${config.fields.map(f => renderField(f, model)).join(`${config.fieldSeparator}`)}
          </form>`
  }
  function validate () {
    wrapper.querySelectorAll('input, select, textarea').forEach(i => { i.classList.remove('error'); if (!i.checkValidity()) i.classList.add('error') })

    errors.clear()
    const mm = { ...model }
    config.fields.forEach(f => { mm[f.name] = wrapper.querySelector(`:scope *[name='${f.name}']`).value })
    config.validate(mm, errors)
    if (errors.err.length > 0) {
      config.fields.forEach(f => { f.error = undefined })
      errors.err.forEach(e => {
        wrapper.querySelector(`:scope *[name='${e.f}']`).classList.add('error')
        wrapper.querySelector(`:scope *[name='${e.f}']`).parentElement.querySelector(':scope .error-msg').innerText = e.m
      })
      return false
    }
    return true
  }
  function doSave () {
    if (!validate()) return

    // eslint-disable-next-line no-return-assign
    config.fields.forEach(f =>
      (f.type === 'checkbox')
        ? model[f.name] = wrapper.querySelector(`:scope *[name='${f.name}']`).checked
        : (f.type == 'radio'
            ? (wrapper.querySelector(`:scope *[name='${f.name}']:checked`) != null ? model[f.name] = wrapper.querySelector(`:scope *[name='${f.name}']:checked`).value : null)
            : model[f.name] = wrapper.querySelector(`:scope *[name='${f.name}']`).value
          )
    )
    config.save(model)
  }

  render()
  return {
    id: id,
    render: render,
    wrapperEl: wrapper,
    save: doSave,
    reset: function () { model = obj; render() }
  }
}
