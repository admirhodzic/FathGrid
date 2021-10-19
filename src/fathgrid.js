/* eslint-disable new-cap */
import './fathgrid.css'
import fathForm from './fathform.js'

FathGrid.SUM = function (data, cname, el, _decimals = 2) { return (data.map(x => (typeof x[cname] !== 'number') ? parseFloat(x[cname].replace('$', '')) : x[cname]).reduce((x, s) => x + s, 0)).toFixed(_decimals) }
FathGrid.AVG = function (data, cname, el, _decimals = 2) { return data.length ? (data.map(x => (typeof x[cname] !== 'number') ? parseFloat(x[cname].replace('$', '')) : x[cname]).reduce((p, c) => p + c, 0) / data.length).toFixed(_decimals) : null }
FathGrid.COUNT = function (data, cname, el, _decimals = 2) { const y = []; return data.length ? (data.filter(x => { if (y.includes(x[cname])) return false; else y.push(x[cname]); return true }).length) : null }
FathGrid.FIRST = function (data, cname, el, _decimals = 2, fnValue = undefined) { return data.length ? (fnValue !== undefined ? (fnValue(data.find(x => true))) : ((data.find(x => true)[cname]))) : null }
FathGrid.LAST = function (data, cname, el, _decimals = 2, fnValue = undefined) { return data.length ? (fnValue !== undefined ? (fnValue(data.slice(-1).find(x => true))) : ((data.slice(-1).find(x => true)[cname]))) : null }
// eslint-disable-next-line no-return-assign
FathGrid.MIN = function (data, cname, el, _decimals = 2, fnValue = undefined) { let y = data[0][cname]; if (typeof y === 'number') return Math.min(...(data.map(x => x[cname]))).toFixed(_decimals); data.map(x => y = ((y < x[cname]) ? y : x[cname])); return y }
// eslint-disable-next-line no-return-assign
FathGrid.MAX = function (data, cname, el, _decimals = 2, fnValue = undefined) { let y = data[0][cname]; if (typeof y === 'number') return Math.max(...(data.map(x => x[cname]))).toFixed(_decimals); data.map(x => y = ((y > x[cname]) ? y : x[cname])); return y }
// eslint-disable-next-line no-eval
FathGrid.EXPR = function (item, col) { const x = (col.expr || '').replace(new RegExp('(' + Object.keys(item || {}).join('|') + ')', 'g'), (m, $1) => ((typeof (((item[$1] || (m)))) === 'number') ? ('(' + (item[$1] || (m)) + ')') : ("('" + (item[$1] || (m)) + "')"))); try { return eval(x) } catch (ex) { console.error('expr', x, ex) } }
FathGrid.Form = fathForm

export default function FathGrid (id, _config) {
  let config = {
    id: id,
    size: 20,
    page: 1,
    multiselect: false,
    editable: false,
    filterable: true,
    sortable: true,
    pageable: true,
    exportable: true,
    printable: true,
    graphType: 'line',
    graphValues: undefined,
    showGraph: true,
    showGrouping: true,
    showFooter: false,
    selectColumns: true,
    showGroupFooter: false,
    showTableTotal: false,
    showGroupHeader: true,
    showGroupRows: true,
    onInitFilter: function (el) {},
    onInitTable: function (el) {},
    onInitInput: function (item, idx, el) {},
    prepareData: async function (data) { return data },
    sort: [],
    columns: [],
    onRender: function () {},
    onClick: function (data, col, el) { editCell(data.rownum, col) },
    onChange: function (data, col, old, value) {},
    rowClass: null,
    data: null,
    q: '',
    rtl: false,
    decimals: 2,

    graphHeight: '200px',
    template: '{tools}{info}{graph}{table}{pager}',
    language: 'auto',
    restoreColumns: false,
    resizable: true,
    fetchOptions: { headers: { Accept: 'application/json' } },
    filterParamPrefix: '',
    pageNumberBase: 1,

    // icons from https://icomoon.io/app/#/select
    iconGroup: '<svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" >      <path d="M16 0c-8.837 0-16 2.239-16 5v3l12 12v10c0 1.105 1.791 2 4 2s4-0.895 4-2v-10l12-12v-3c0-2.761-7.163-5-16-5zM2.95 4.338c0.748-0.427 1.799-0.832 3.040-1.171 2.748-0.752 6.303-1.167 10.011-1.167s7.262 0.414 10.011 1.167c1.241 0.34 2.292 0.745 3.040 1.171 0.494 0.281 0.76 0.519 0.884 0.662-0.124 0.142-0.391 0.38-0.884 0.662-0.748 0.427-1.8 0.832-3.040 1.171-2.748 0.752-6.303 1.167-10.011 1.167s-7.262-0.414-10.011-1.167c-1.24-0.34-2.292-0.745-3.040-1.171-0.494-0.282-0.76-0.519-0.884-0.662 0.124-0.142 0.391-0.38 0.884-0.662z"></path>      </svg>',
    iconGraph: '<svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" ><path d="M4 28h28v4h-32v-32h4zM9 26c-1.657 0-3-1.343-3-3s1.343-3 3-3c0.088 0 0.176 0.005 0.262 0.012l3.225-5.375c-0.307-0.471-0.487-1.033-0.487-1.638 0-1.657 1.343-3 3-3s3 1.343 3 3c0 0.604-0.179 1.167-0.487 1.638l3.225 5.375c0.086-0.007 0.174-0.012 0.262-0.012 0.067 0 0.133 0.003 0.198 0.007l5.324-9.316c-0.329-0.482-0.522-1.064-0.522-1.691 0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.657-1.343 3-3 3-0.067 0-0.133-0.003-0.198-0.007l-5.324 9.316c0.329 0.481 0.522 1.064 0.522 1.691 0 1.657-1.343 3-3 3s-3-1.343-3-3c0-0.604 0.179-1.167 0.487-1.638l-3.225-5.375c-0.086 0.007-0.174 0.012-0.262 0.012s-0.176-0.005-0.262-0.012l-3.225 5.375c0.307 0.471 0.487 1.033 0.487 1.637 0 1.657-1.343 3-3 3z"></path></svg>',
    iconColumns: '<svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" ><g transform="rotate(90 16 16)"><path d="M0 0h8v8h-8zM12 2h20v4h-20zM0 12h8v8h-8zM12 14h20v4h-20zM0 24h8v8h-8zM12 26h20v4h-20z"></path></g></svg>',
    iconExport: '<svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" ><path d="M23 14l-8 8-8-8h5v-12h6v12zM15 22h-15v8h30v-8h-15zM28 26h-4v-2h4v2z"></path></svg>',
    iconPrint: '<svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" >      <path d="M8 2h16v4h-16v-4z"></path>      <path d="M30 8h-28c-1.1 0-2 0.9-2 2v10c0 1.1 0.9 2 2 2h6v8h16v-8h6c1.1 0 2-0.9 2-2v-10c0-1.1-0.9-2-2-2zM4 14c-1.105 0-2-0.895-2-2s0.895-2 2-2 2 0.895 2 2-0.895 2-2 2zM22 28h-12v-10h12v10z"></path></svg>',

    ..._config
  }
  const langs = {
    en: {
      of: 'of',
      yes: 'yes',
      export: 'Export',
      previous: 'Previous',
      next: 'Next',
      last: 'Last',
      first: 'First',
      gotoPage: 'Goto Page',
      loading: 'Loading...',
      selectRow: 'Select Row',
      showSelectedOnly: 'Show Only Selected Rows',
      groupby: 'Group By',
      avg: 'Avg',
      count: 'Count',
      min: 'Min',
      max: 'Max',
      sum: 'Sum',
      show_grouping_controls: 'Show Grouping Controls',
      show_graph: 'Show Graph',
      select_columns: 'Select Columns',
      type: 'Type',
      none: 'None',
      line: 'Line',
      bar: 'Bar',
      pie: 'Pie'
    },
    de: {
      of: 'von',
      yes: 'Ja',
      export: 'Export',
      previous: 'Bisherige',
      next: 'Nächster',
      last: 'Zuletzt',
      first: 'Zuerst',
      gotoPage: 'gehe zu Seite',
      loading: 'Wird geladen...',
      selectRow: 'Zeile auswählen',
      showSelectedOnly: 'Nur ausgewählte Zeilen anzeigen'
    },
    fr: {
      of: 'de',
      yes: 'Oui',
      export: 'exportation',
      previous: 'précédent',
      next: 'suivant',
      last: 'dernier',
      first: 'première',
      gotoPage: 'aller à la page',
      loading: 'chargement...',
      selectRow: 'sélectionner la ligne',
      showSelectedOnly: 'afficher uniquement les lignes sélectionnées'
    },
    ar: {
      of: 'من',
      yes: 'نعم',
      export: 'تصدير',
      previous: 'السابق',
      next: 'التالى',
      last: 'الاخير',
      first: 'أول',
      gotoPage: 'انتقل إلى صفحة',
      loading: 'جار التحميل',
      selectRow: 'حدد الصف',
      showSelectedOnly: 'إظهار الصفوف المحددة فقط'
    },
    es: {
      of: 'de',
      yes: 'si',
      export: 'exportat',
      previous: 'anterior',
      next: 'próximo',
      last: 'último',
      first: 'primero',
      gotoPage: 'Ir a la página',
      loading: 'cargando...',
      selectRow: 'seleccione fila',
      showSelectedOnly: 'muestra solo las filas seleccionadas'
    }
  }
  if (config.language === 'auto') config.language = navigator.language.substr(0, 2)
  config.lang = langs[config.language] !== undefined ? { ...langs[config.language], ...langs.en } : langs.en

  let selectedRows = []; let totalRecords = 0; let filteredRecords = 0
  let data = config.data === null ? [] : config.data; let fdata = data
  if (typeof data === 'string') {
    (async () => {
      const res = await fetch(data).then(d => d.json())
      data = await res.json()
    })()
  }
  const graphCanvasHTML = `<canvas style="width:100%;height:${config.graphHeight};" ></canvas>`

  const table = document.getElementById(id) || document.body.appendChild(document.createElement('TABLE'))
  const tbody = table.querySelector(':scope tbody') || table.appendChild(document.createElement('TBODY'))
  const thead = table.querySelector(':scope thead') || table.insertBefore(document.createElement('THEAD'), tbody)

  let editinput

  const renderPageinfo = function () {
    return `<span class="page-info">${(config.page - 1) * config.size + 1}-${Math.min(filteredRecords, config.page * (config.size > 0 ? config.size : filteredRecords))} ${config.lang.of} ${totalRecords !== filteredRecords ? `${filteredRecords}/` : ''}${totalRecords}</span>`
  }
  const renderPaginator = function () {
    const rr = '&#x23f5;'; const ll = '&#x23F4;'
    return (config.size >= filteredRecords || config.size === 0)
      ? ''
      : `
      <ul class="pagination" >
        <li class="page-item"><a class="page-link firstpage" title="${config.lang.first}" href="#">&#x2503;${config.rtl ? rr : ll}</a></li>
        <li class="page-item"><a class="page-link prevpage" title="${config.lang.previous}" href="#">${config.rtl ? rr : ll}</a></li>
        <li class="page-item active"><a class="page-link gotopage" title="${config.lang.gotoPage}" href="javascript:void(0)">${config.page} / ${Math.floor((filteredRecords + (config.size - 1)) / config.size)}</a></li>
        <li class="page-item"><a class="page-link nextpage" title="${config.lang.next}" href="#">${config.rtl ? ll : rr}</a></li>
        <li class="page-item"><a class="page-link lastpage" title="${config.lang.last}" href="#">${config.rtl ? ll : rr}&#x2503;</a></li>
      </ul>
    `
  }
  const nextPage = function () { config.page = Math.floor(Math.min(config.page + 1, (filteredRecords + config.size - 1) / config.size)); render() }
  const prevPage = function () { config.page = Math.max(1, config.page - 1); render() }
  const lastPage = function () { config.page = Math.floor((filteredRecords + config.size - 1) / config.size); render() }
  const firstPage = function () { config.page = 1; render() }
  const getSelectedItems = function () { return selectedRows }

  function clearSelection () { if (window.getSelection) { if (window.getSelection().empty) { window.getSelection().empty() } else if (window.getSelection().removeAllRanges) { window.getSelection().removeAllRanges() } } else if (document.selection) { document.selection.empty() } }

  const getSort = function () { return config.sort }
  const selectRow = function (rownum, selected = true) {
    let x
    if (selected) {
      if (!config.multiselect) selectedRows = []
      selectedRows.push(data[rownum - 1])
    } else selectedRows = selectedRows.filter(x => x.rownum !== rownum);

    (tbody.querySelectorAll(':scope tr.selected') || []).forEach(e => e.classList.remove('selected'))
    // eslint-disable-next-line array-callback-return
    selectedRows.map(s => { if ((x = (tbody.querySelector(":scope > tr[data-rownum='" + s.rownum + "']"))) !== null) x.classList.add('selected') })
    // eslint-disable-next-line no-return-assign
    if (tfoot !== null) tfoot.querySelectorAll('.selected-count').forEach(x => x.innerText = `${getSelectedItems().length}`);
    // eslint-disable-next-line no-return-assign
    (tbody.querySelectorAll(':scope tr.selected td.multiselect input.selector') || []).forEach(e => e.checked = true)
  }
  const showColumn = function (idx, bShow, bRedraw) {
    const x = wrapper.querySelector(":scope .fathgrid-columns-nav .dropdown-content a[data-i='" + idx + "']")
    if (x !== null) {
      bShow ? x.classList.add('checked') : x.classList.remove('checked')
    }

    config.columns[idx].visible = bShow
    if (bRedraw === undefined || bRedraw) redraw()
  }
  const redraw = function () {
    thead.querySelectorAll(':scope tr').forEach((tr, tridx) => { tr.querySelectorAll(':scope th:not(.multiselect)').forEach((th, idx) => { th.style.display = (config.columns[idx].visible === false ? 'none' : 'table-cell') }) })
    drawFooter()
    render()
  }

  const vv = function (item, idx) { return config.columns[idx].name !== undefined ? (item[config.columns[idx].name]) : (item[idx]) }
  const vv2 = function (item, idx) { return (config.columns[idx].value !== undefined) ? (config.columns[idx].value(item, config.columns[idx])) : (vv(item, idx)) }
  const ss = function (rownum, idx, v) {
    if (config.columns[idx].name !== undefined) data[rownum][config.columns[idx].name] = v
    else data[rownum][idx] = v
  }

  let chart
  const wrapper = document.createElement('DIV'); wrapper.classList.add('fathgrid-wrapper')
  if (config.rtl) wrapper.setAttribute('dir', 'rtl')

  table.parentNode.insertBefore(wrapper, table)

  thead.querySelectorAll(':scope tr th').forEach((th, i) => {
    if (undefined === config.columns[i]) config.columns[i] = {}
    if (th.innerText === '') th.innerText = config.columns[i].header || config.columns[i].name
    else config.columns[i].header = th.innerText
  })

  const parts = {
    graph: `<div class="graphplaceholder">${graphCanvasHTML}</div>`,
    tools: `
    ${config.showGrouping
? `<nav class="fathgrid-grouping-nav" id="grouping${id}"><a href="javascript:void(0)" title="${config.lang.show_grouping_controls}">
      ${config.iconGroup}
      </a></nav>
      `
: ''}
    ${config.graphValues !== undefined && typeof Chart === 'function'
? `<nav class="fathgrid-graph-nav dropdown" id="graphs${id}"><a href="javascript:void(0)" title="${config.lang.show_graph}">
      ${config.iconGraph}
      </a></nav>
      `
: ''}
    ${config.showGraph && typeof Chart === 'function'
? `<nav class="fathgrid-graph2-nav dropdown" id="graphs${id}"><a href="javascript:void(0)" title="${config.lang.show_graph}">
      ${config.iconGraph}
      </a><div class="dropdown-content">
          <div>
              <label>X</label><select id="${config.id}__select_graph_x">${config.columns.map((c, i) => `<option value="${i}">${c.header || c.name}</option>`).join('')}</select>
              <label>Y</label><select id="${config.id}__select_graph_y">${config.columns.map((c, i) => `<option value="${i}">${c.header || c.name}</option>`).join('')}</select>
              <label>Y2</label><select id="${config.id}__select_graph_y2"><option value=""></option>${config.columns.map((c, i) => `<option value="${i}">${c.header || c.name}</option>`).join('')}</select>
              <label>${config.lang.type}</label><select id="${config.id}__select_graph_type">${[config.lang.none, config.lang.line, config.lang.bar, config.lang.pie].map((t, i) => `<option value="${i}">${t}</option>`).join('')}</select>
          </div>
      </div></nav>`
      : ''}
    ${config.selectColumns
? `<nav class="fathgrid-columns-nav dropdown" id="columns${id}"><a href="javascript:void(0)" title="${config.lang.select_columns}">
      ${config.iconColumns}
      </a><div class="dropdown-content">${config.columns.map((c, idx) => `<a class="${c.visible !== false ? 'checked' : ''}" data-i="${idx}" href="#">${c.header || c.name}</a>`).join(' ')}</div></nav>`
      : ''}
    ${config.exportable
? `<nav class="fathgrid-export-nav dropdown" id="exporter${id}"><a href="javascript:void(0)">
      ${config.iconExport}
      </a><div class="dropdown-content"><a href="javascript:void(0)" title="${config.lang.export}" data-format="txt">TXT</a> <a href="javascript:void(0)" title="${config.lang.export}" data-format="csv">CSV</a> <a href="javascript:void(0)" title="${config.lang.export}" data-format="html">HTML</a> <a href="javascript:void(0)" title="${config.lang.export}" data-format="xls">XLS</a> ${(typeof window.jsPDF === 'function') ? `<a href="javascript:void(0)" title="${config.lang.export}" data-format="pdf">PDF</a>` : ''}</div></nav>`
      : ''}
    ${config.printable
? `<nav class="fathgrid-print-nav dropdown printgrid${id}"><a href="javascript:void(0)" title="Print">
      ${config.iconPrint}
      </a></nav>
      `
: ''}
    `,
    info: (config.pageable) ? `<div class="pageinfo${id}">` + renderPageinfo() + '</div>' : '',
    table: `<div id="table-container${id}"></div>`,
    pager: (config.pageable) ? `<nav class="paginator${id}">` + renderPaginator() + '</nav>' : ''
  }
  wrapper.innerHTML = config.template.replace(/{(\w+)}/g, (x, y) => parts[y])
  wrapper.querySelector(':scope #table-container' + id).appendChild(table)
  wrapper.querySelectorAll(':scope .fathgrid-columns-nav .dropdown-content a').forEach(x => x.addEventListener('click', function (e) { showColumn(x.dataset.i, !x.classList.contains('checked')); stop(e) }))
  wrapper.querySelectorAll(':scope .fathgrid-graph-nav a').forEach(x => x.addEventListener('click', function (e) { x.parentElement.classList.toggle('active'); showGraph(x.parentElement.classList.contains('active')); stop(e) }))
  wrapper.querySelectorAll(':scope .fathgrid-graph2-nav select').forEach(x => x.addEventListener('change', function (e) {
    showGraph2()
    stop(e)
  }))
  wrapper.querySelectorAll(':scope .fathgrid-grouping-nav a').forEach(x => x.addEventListener('click', function (e) { showGrouping(!x.parentElement.classList.contains('active')); stop(e) }))
  wrapper.querySelectorAll(':scope .fathgrid-print-nav a').forEach(x => x.addEventListener('click', function (e) { printGrid(); stop(e) }))

  const pageinfos = wrapper.querySelectorAll(`:scope .pageinfo${id}`)
  const paginators = wrapper.querySelectorAll(`:scope .paginator${id}`)
  const exporter = wrapper.querySelector(`#exporter${id}`)
  if (exporter !== null) exporter.querySelectorAll(':scope a').forEach(a => { a.addEventListener('click', function (e) { if (undefined !== e.srcElement.dataset.format) downloadFile(getExportData(e.srcElement.dataset.format), 'export.' + e.srcElement.dataset.format) }) });
  ('fathgrid ' + (config.tableClass || '')).split(' ').forEach(x => { if (x !== '') table.classList.add(x) })

  if (data === null || totalRecords === 0) {
    table.querySelectorAll(':scope tbody tr').forEach((tr, idx) => {
      const row = []
      tr.querySelectorAll(':scope td').forEach(td => {
        row.push(td.innerText)
      })
      row.id = (tr.dataset.id === undefined) ? idx + 1 : tr.dataset.id
      data.push(row)
    })
  } else {
    data = data.map((x, idx) => { if (undefined === x.id) x.id = idx + 1; return x }) // add IDs to data rows
  }
  data = data.map((x, idx) => { x.rownum = idx + 1; return x })// add rownum prop

  let tfoot = table.querySelector('TFOOT')

  const drawFooter = function () {
    if (config.showFooter) {
      if (tfoot === null) {
        tfoot = document.createElement('TFOOT')
        table.appendChild(tfoot)
        tfoot.innerHTML = '<tr></tr>'
      } else tfoot.innerHTML = '<tr></tr>'
      if (config.multiselect) {
        const td = document.createElement('TH')
        td.dataset.i = -1
        td.classList.add('selected-count')
        tfoot.appendChild(td)
      }
      config.columns.forEach((c, idx) => { const td = document.createElement('TH'); td.dataset.i = idx; tfoot.appendChild(td); if (c.visible === false) td.style.display = 'none'; if (c.printable === false) td.classList.add('noprint'); (c.class || '').split(' ').filter(x => x !== '').forEach(c1 => td.classList.add(c1)) })
    }
  }
  drawFooter()

  const getFilter = function () {
    const r = []
    thead.querySelectorAll(':scope tr.filter th:not(.multiselect) input, :scope tr.filter th:not(.multiselect) select').forEach((i) => { if (i.value !== '') r[config.columns[i.dataset.i].name || i.dataset.i] = i.value })
    return r
  }

  const getData = async function () {
    if (config.serverURL !== undefined) {
      const parameters = {
        page: config.page - (1 - config.pageNumberBase),
        size: config.size,
        search: config.q,
        sort: config.sort.map(i => config.columns[Math.abs(i) - 1].name || ('(' + config.columns[Math.abs(i) - 1].expr + ')')).join(','),
        sortAndOrder: config.sort.map(i => (config.columns[Math.abs(i) - 1].name || ('(' + config.columns[Math.abs(i) - 1].expr + ')')) + (i < 0 ? ' desc' : '')).join(','),
        order: config.sort.map(i => i < 0 ? 'desc' : 'asc'),
        filters: Object.keys(getFilter()).filter(k => (typeof k !== 'number')).map(k => config.filterParamPrefix + k + '=' + getFilter()[k]).join('&')
      }
      const url = config.serverURL.replace(/\${(\w+)}/g, (x, y) => parameters[y])
      const ret = await (async function () {
        const res = await fetch(url, config.fetchOptions)
        totalRecords = parseInt(res.headers.get('x-total-count'))
        res.headers.get('Content-Range')
        return await config.prepareData(await res.json())
      })()

      if (isNaN(totalRecords) || undefined === totalRecords) totalRecords = ret.totalRecords
      data = Array.isArray(ret) ? ret : (ret.content !== undefined ? ret.content : ret.data)

      data = data.map((x, idx) => { x.rownum = idx + 1; return x })// add rownum prop

      if (isNaN(totalRecords) || undefined === totalRecords) totalRecords = data.length

      filteredRecords = totalRecords
      fdata = data
      return data
    }

    totalRecords = data.length
    fdata = data.filter(x => {
      let ok = true
      if (config.multiselect && thead.querySelector(':scope tr.filter .selector').checked && !selectedRows.includes(x)) return false

      thead.querySelectorAll(':scope tr.filter th:not(.multiselect) input, :scope tr.filter th:not(.multiselect) select').forEach((i) => {
        const opts = Array.from(i.querySelectorAll(':scope option:checked'), y => y.value)
        if (opts.filter(a => a !== '').length > 1) {
          let ok2 = false
          opts.forEach(y => { if (y !== '' && x[i.dataset.i].includes(y)) ok2 = true })
          if (!ok2) ok = false
        // eslint-disable-next-line eqeqeq
        } else if (i.type === 'checkbox') { if (i.checked && !isChecked(vv(x, i.dataset.i))) ok = false } else if (i.type === 'color') { if (i.value !== '#000000' && !(vv(x, i.dataset.i) === i.value)) ok = false } else if (config.columns[i.dataset.i].type === 'checkbox') { if (i.value !== '' && !(vv(x, i.dataset.i) === i.value)) ok = false } else if (i.value !== '' && (typeof vv(x, i.dataset.i) === 'number')) ok = (vv(x, i.dataset.i) == ((typeof i.value !== 'number') ? parseFloat(i.value) : i.value))
        else if (i.value !== '' && !('' + vv(x, i.dataset.i)).includes(i.value)) ok = false

        if (ok && config.q !== '') {
          ok = (config.columns.find((f, ci) => (typeof vv(x, ci) === 'number' ? vv(x, ci) === config.q : (typeof vv(x, ci) === 'string' ? (vv(x, ci).toLowerCase().includes(config.q.toLowerCase())) : (vv(x, ci) === config.q)))) !== undefined)
        }
      })
      return ok
    })
    filteredRecords = fdata.length
    return config.size === 0 ? fdata : fdata.slice((config.page - 1) * config.size, config.page * config.size)
  }

  function updateGraph () {
    if (chart === undefined) { return }
    const dd = config.graphValues(getGraphData()); let ci = 0
    chart.data = {
      labels: dd.labels,
      datasets: Array.isArray(dd.values[0])
        ? dd.values.map((x, idx) => (
          {
            label: dd.title[idx],
            data: x,
            borderWidth: 1,
            fill: false,
            backgroundColor: config.graphType === 'pie' ? x.map((v, i) => colors[i % colors.length]) : colors[ci],
            borderColor: config.graphType === 'pie' ? x.map((v, i) => colors[i % colors.length]) : colors[ci++]
          }
        ))
        : [{
            label: dd.title,
            data: dd.values,
            borderWidth: 1,
            backgroundColor: config.graphType === 'pie' ? dd.values.map((v, i) => colors[i % colors.length]) : colors[ci],
            borderColor: config.graphType === 'pie' ? dd.values.map((v, i) => colors[i % colors.length]) : colors[ci++]
          }]
    }
    chart.update({ duration: 0 })
  }

  let _renderData = []; let _graphData = []

  function renderBody (dd = null, bUpdateGraph = true) {
    if (dd === null) { dd = _renderData } else { _renderData = dd }
    [...tbody.children].forEach(x => tbody.removeChild(x)); editinput = undefined // just in case
    if ((config.page - 1) * config.size >= filteredRecords) { config.page = 1 }
    let lastgroup = null; let gg; let gtr; let gtd; let groupdata = []
    _graphData = []

    dd.forEach((dr, idx) => {
      if (typeof config.groupOn === 'function' && lastgroup !== (gg = config.groupOn(dr, idx))) {
        if (config.showGroupFooter === true && lastgroup !== null) {
          tbody.appendChild(gtr = document.createElement('TR')); gtr.classList.add('group-footer')
          const _grpFoot = {}
          config.columns.forEach((c, i) => {
            gtr.appendChild(gtd = document.createElement('TD')); gtd.style.display = c.visible !== false ? gtd.style.display : 'none'
            if (c.printable === false) { gtd.classList.add('noprint') }
            (c.class || '').split(' ').filter(x => x !== '').forEach(c => gtd.classList.add(c))
            let xx
            if ((xx = ((typeof c.groupFooter === 'function') ? c.groupFooter(groupdata, c.name || i, gtd, config.decimals, c.value) : (c.groupFooter || null))) !== null) {
              gtd.innerHTML = '' + xx + ''
              _grpFoot[c.name || i] = xx
            }
          })
          _graphData.push(_grpFoot)
        }
        if (config.showGroupHeader || config.columns.find((c, i) => c.visible === false && config._gr && config._gr.includes(i + 1))) {
          tbody.appendChild(gtr = document.createElement('TR')); gtr.classList.add('group-header'); gtr.appendChild(gtd = document.createElement('TD'))
          gtd.setAttribute('colspan', config.columns.filter(x => x.visible !== false).length + (config.multiselect ? 1 : 0))
          const h = config.columns.filter((c, i) => c.visible === false && config._gr.includes(i + 1)).map(c => c.value ? c.value(dr, c) : dr[c.name]).join(', ')
          gtd.innerHTML = `${h || gg}`
        }
        lastgroup = gg
        groupdata = []
      }

      const r = document.createElement('tr'); let cs
      r.dataset.id = dr.id
      r.dataset.rownum = dr.rownum
      if ((typeof config.rowClass === 'function') && (cs = config.rowClass(dr, idx)) && typeof cs === 'string') { cs.split(' ').forEach(c => (c !== '' ? (c.startsWith('#') ? (r.style.backgroundColor = c) : r.classList.add(c)) : c)) }
      if (getSelectedItems().includes(dr)) { r.classList.add('selected') }
      if (config.multiselect) {
        const c = document.createElement('td'); c.title = `${config.lang.selectRow}`; c.classList.add('multiselect'); c.innerHTML = `<input type="checkbox" class="selector" data-rownum="${dr.rownum}" name="select_${dr.id}" ${getSelectedItems().includes(dr) ? 'checked' : ''} />`
        r.appendChild(c)
      }
      config.columns.forEach((column, col) => {
        const c = document.createElement('td')
        if (column.visible === false) { c.style.display = 'none' }
        (column.class || '').split(' ').filter(x => x !== '').forEach(c1 => c.classList.add(c1))
        const x = column.value !== undefined ? (column.value(dr, column)) : (column.name !== undefined ? dr[column.name] : dr[col])
        if (column.type === 'checkbox') {
          c.innerHTML = `<input type="checkbox" ${(x === '1' || x === 'true' || x === true || x === 'yes' || x === 'on') ? 'checked' : ''} ${((column.editable === false || (typeof column.editable === 'function' && column.editable(dr, col + 1) === false)) || config.editable === false) ? 'disabled' : ''} />`
          c.querySelector(':scope input[type=checkbox]').addEventListener('click', function (e) {
            config.onChange(dr, col, !e.srcElement.checked, e.srcElement.checked)
          })
        } else if (column.html !== undefined) { c.innerHTML = column.html(dr) } else { c.innerText = x }
        if (column.printable === false) { c.classList.add('noprint') }
        r.appendChild(c)
      })
      if (!config.showGroupRows) { r.classList.add('hidden') }
      tbody.appendChild(r)
      if (undefined !== config.groupOn && config.showGroupFooter === true) { groupdata.push(dr) }
    })
    // copy of code from above to draw last group footer
    if (undefined !== config.groupOn && config.showGroupFooter === true) {
      tbody.appendChild(gtr = document.createElement('TR')); gtr.classList.add('group-footer')
      const _grpFoot = {}
      config.columns.forEach((c, i) => {
        gtr.appendChild(gtd = document.createElement('TD')); gtd.style.display = c.visible !== false ? gtd.style.display : 'none';
        (c.class || '').split(' ').filter(x => x !== '').forEach(c1 => gtd.classList.add(c1))
        if (c.printable === false) { gtd.classList.add('noprint') }
        let xx
        if ((xx = ((typeof c.groupFooter === 'function') ? c.groupFooter(groupdata, c.name || i, gtd, config.decimals, c.value) : (c.groupFooter || null))) !== null) {
          gtd.innerHTML = '' + xx + ''
          _grpFoot[c.name || i] = xx
        }
      })
      _graphData.push(_grpFoot)
      groupdata = []
    }
    // copy of code from above to draw table total group footer
    if (undefined !== config.groupOn && config.showGroupFooter === true && config.showTableTotal) {
      tbody.appendChild(gtr = document.createElement('TR')); gtr.classList.add('group-footer'); gtr.classList.add('table-total')
      config.columns.forEach((c, i) => {
        gtr.appendChild(gtd = document.createElement('TD')); gtd.style.display = c.visible !== false ? gtd.style.display : 'none';
        (c.class || '').split(' ').filter(x => x !== '').forEach(c1 => gtd.classList.add(c1))
        if (c.printable === false) { gtd.classList.add('noprint') }
        let xx
        if (config._gr && !config._gr.includes(i + 1)) {
          if ((xx = ((typeof c.groupFooter === 'function') ? c.groupFooter(dd, c.name || i, gtd, config.decimals, c.value) : (c.groupFooter || null))) !== null) { gtd.innerHTML = '' + xx + '' }
        }
      })
    }

    if (chart !== undefined && bUpdateGraph) { updateGraph() }

    if (config.pageable) {
      // eslint-disable-next-line no-return-assign
      pageinfos.forEach(pageinfo => pageinfo.innerHTML = renderPageinfo())
      paginators.forEach(paginator => {
        paginator.innerHTML = renderPaginator()
        paginator.querySelectorAll('.nextpage').forEach(x => { x.addEventListener('click', function (e) { nextPage(); stop(e) }) })
        paginator.querySelectorAll('.prevpage').forEach(x => { x.addEventListener('click', function (e) { prevPage(); stop(e) }) })
        paginator.querySelectorAll('.lastpage').forEach(x => { x.addEventListener('click', function (e) { lastPage(); stop(e) }) })
        paginator.querySelectorAll('.firstpage').forEach(x => { x.addEventListener('click', function (e) { firstPage(); stop(e) }) })
        paginator.querySelectorAll('.gotopage').forEach(x => {
          x.addEventListener('click', function (e) {
            x.innerHTML = `<input id="gotopage" style="width:3em;text-align:center;" type="number" min="1" max="${(filteredRecords + config.size - 1) / config.size}" value="${config.page}"/>`
            const gti = x.querySelector(':scope input')
            gti.focus()
            gti.select()
            gti.addEventListener('change', function (e) {
              config.page = Math.max(1, parseInt(e.srcElement.value)); stop(e); render()
            })
          })
        })
      })
    }

    tbody.querySelectorAll('input.selector').forEach(i => i.addEventListener('click', function (e) { selectRow(e.srcElement.dataset.rownum, e.srcElement.checked) }))

    tbody.querySelectorAll('td').forEach(x => {
      x.addEventListener('click', function (e) {
        const tr = e.srcElement.parentElement.closest('TR')
        if (config.multiselect && x.classList.contains('multiselect')) {
          if (e.srcElement === x) { x.querySelector(':scope input.selector').click() }
        } else {
          if (tr.classList.contains('group-footer')) {
            let trc = tr.previousSibling
            while (trc !== null && !trc.classList.contains('group-footer') && !trc.classList.contains('group-header')) {
              trc.classList.toggle('hidden')
              trc = trc.previousSibling
            }
          } else if (tr.classList.contains('group-header')) {
            let trc = tr.nextSibling
            while (trc !== null && !trc.classList.contains('group-footer')) {
              trc.classList.toggle('hidden')
              trc = trc.nextSibling
            }
          } else {
            selectRow(tr.dataset.rownum)
            config.onClick(data[e.srcElement.parentElement.closest('TR').dataset.rownum - 1], [...e.srcElement.parentElement.closest('TR').children].indexOf(e.srcElement.closest('TD')) + 1, e.srcElement.closest('TD'))
          }
        }
      })
    })

    if (tfoot !== null) {
      let xx
      tfoot.querySelectorAll(':scope th').forEach((td, idx) => {
        if (undefined !== config.columns[idx].footer) {
          if ((xx = ((typeof config.columns[idx].footer === 'function') ? config.columns[idx].footer(fdata, config.columns[idx].name || idx, td, config.decimals) : config.columns[idx].footer || null)) !== null) { td.innerHTML = xx }
        }
      })
    }
    config.onRender()
    config.onInitTable(tbody)
  }

  const render = function (complete) {
    // table.querySelectorAll(":scope tbody tr").forEach(tr => {tr.parentNode.removeChild(tr);});
    // tbody.innerHTML=`<tr><td colspan="${config.columns.length+(config.multiselect?1:0)}">${config.loading||config.lang.loading}</td></tr>`;
    getData().then(dd => { renderBody(dd); if (undefined !== complete) complete() }).catch((err) => { console.log('error getting data:', err) })
  }
  const sortData = function () {
    data.sort((a, b) => {
      let a1, b1
      for (let f = 0; f < config.sort.length; f++) {
        const i1 = Math.abs(config.sort[f]) - 1; const ds = config.sort[f] < 0
        a1 = (typeof vv2(a, i1) === 'number') ? (vv2(a, i1)) : vv2(a, i1).replace(/(<([^>]+)>)/gi, '')
        b1 = (typeof vv2(b, i1) === 'number') ? (vv2(b, i1)) : vv2(b, i1).replace(/(<([^>]+)>)/gi, '')

        if (a1 !== b1) return (((ds === true)) ? -1 : 1) * (typeof a1 !== 'number' ? ((a1 < b1 ? -1 : (a1 > b1) ? 1 : 0)) : (a1 - b1))
      }
      return 0
    })
    data = data.map((x, idx) => { x.rownum = idx + 1; return x })// add rownum prop
  }

  const sort = function (i, desc, multisort, wantRender) {
    const ss = config.sort
    config.sort = ss.map(x => (x === i || x === -i) ? -x : x)
    if (!multisort) config.sort = [(desc === true || (ss.find(x => x === i) !== undefined)) ? -i : i]

    if ((ss.find(x => x === i || x === -i) === undefined)) if (multisort) config.sort.push((desc === true) ? -i : i)

    if (config.sortBy !== undefined) config.sort = [...(config.sortBy.filter(x => !config.sort.includes(x))), ...config.sort]

    sortData()

    if (thead.querySelector(':scope th.sorted') !== null) thead.querySelectorAll(':scope th.sorted').forEach(a => a.classList.remove('sorted'))
    if (thead.querySelector(':scope th.sorted-desc') !== null) thead.querySelectorAll(':scope th.sorted-desc').forEach(a => a.classList.remove('sorted-desc'))
    config.sort.forEach(x => {
      thead.querySelector(':scope tr:nth-child(1) th:nth-child(' + (Math.abs(x) + (config.multiselect ? 1 : 0)) + ')').classList.add((x < 0) ? 'sorted-desc' : 'sorted')
    })

    if (wantRender !== false) render()
  }

  thead.innerHTML = ''
  if (thead.querySelectorAll(':scope th').length === 0) {
    const tr = document.createElement('TR'); let th
    thead.appendChild(tr)
    if (config.multiselect) {
      tr.innerHTML = '<th class="multiselect"></th>'
    }
    config.columns.forEach((c, i) => { tr.appendChild(th = document.createElement('TH')); th.innerText = c.header || c.name; if (c.visible === false) th.style.display = 'none'; th.dataset.name = c.name || i; if (c.printable === false) th.classList.add('noprint'); (c.class || '').split(' ').filter(x => x !== '').forEach(c1 => th.classList.add(c1)) })
  }
  thead.querySelectorAll(':scope th').forEach((th, i) => {
    if (config.columns[i].width !== undefined) th.style.width = ('' + config.columns[i].width) + (typeof config.columns[i].width === 'number' ? 'px' : '')
  })

  if (config.sortBy !== undefined) { config.sortBy.map(c => sort(c, false, true, false)) }

  if (config.sortable) thead.querySelectorAll('tr th').forEach((th, i) => { th.style.cursor = 'pointer'; th.addEventListener('click', function (e) { sort(i + 1, undefined, e.shiftKey); stop(e); clearSelection() }) })

  if (config.filterable) {
    const r = document.createElement('TR'); r.classList.add('filter')
    if (config.multiselect) {
      r.innerHTML = `<th title="${config.lang.showSelectedOnly}" class="multiselect"><input type="checkbox" title="${config.lang.showSelectedOnly}" class="selector" /></th>`
    }
    config.columns.forEach((c, idx) => {
      const f = document.createElement('TH')
      let i
      if (config.columns[idx].filterable === undefined || config.columns[idx].filterable !== false) {
        if (config.columns[idx] !== undefined && config.columns[idx].filter !== undefined) {
          i = document.createElement('SELECT'); i.add(document.createElement('OPTION'))
          // i.setAttribute("multiple","multiple");
          let ff = config.columns[idx].filter
          if (ff === null) { ff = []; data.forEach(v => { if (!ff.includes(vv(v, idx)))ff.push(vv(v, idx)) }); ff.sort() }
          if (typeof ff === 'object' && !Array.isArray(ff)) { Object.keys(ff).forEach(k => { const v = ff[k]; const o = document.createElement('OPTION'); o.innerText = ((typeof v === 'object') ? v.name : v); o.value = (typeof v === 'object') ? v.value : k; i.add(o) }) } else { ff.forEach(v => { const o = document.createElement('OPTION'); o.innerText = ((typeof v === 'object') ? v.name : v); o.value = (typeof v === 'object') ? v.value : v; i.add(o) }) }
        } else {
          i = document.createElement('INPUT')
          i.setAttribute('type', (undefined === config.columns[idx] || undefined === config.columns[idx].type) ? 'text' : config.columns[idx].type)
        }

        i.style.width = '100%'
        if (config.columns[idx].visible === false) f.style.display = 'none'

        i.dataset.i = idx
        i.title = `Filter value for field ${config.columns[idx].name}`;
        ((config.columns[idx].filterInputClass || '') + ' ' + (config.inputClass || '')).split(' ').filter(x => x !== '').forEach(c1 => i.classList.add(c1))
        f.append(i)
      }
      if (c.printable === false) f.classList.add('noprint')
      r.append(f)
    })
    thead.append(r)
    r.querySelectorAll(':scope input, select').forEach(i => { i.addEventListener('change', function (e) { render() }) })
    config.onInitFilter(r)
  }

  const stop = function (e) { e.preventDefault(); e.stopPropagation() }
  const isChecked = function (v) { return v === config.lang.yes || v === 'yes' || v === 'true' || v === true || v === 'on' || v === 1 || v === '1' }

  const editNext = function (rownum, col) {
    const r = rownum; const c = col
    while (undefined !== data[rownum - 1]) {
      col++
      const column = config.columns[col - 1]
      if ((undefined !== column && (column.editable !== false || ((typeof column.editable === 'function') && column.editable(data[rownum - 1], col) !== false)) && (column.type !== 'checkbox'))) {
        return editCell(rownum, col)
      }
      if (col > config.columns.length) { col = 0; rownum++ }
    }
    editCell(r, c)
  }
  const editPrev = function (rownum, col) {
    const r = rownum; const c = col
    while (undefined !== data[rownum - 1]) {
      col--
      if (col < 1) { col = config.columns.length + 1; rownum-- }
      const column = config.columns[col - 1]
      if ((undefined !== column && (column.editable !== false || ((typeof column.editable === 'function') && column.editable(data[rownum - 1], col) !== false)) && (column.type !== 'checkbox'))) {
        return editCell(rownum, col)
      }
    }
    editCell(r, c)
  }

  const editCell = function (rownum, col) {
    if (editinput !== undefined) {
      const newval = editinput.value// editinput.value!==''?editinput.value:editinput.dataset.originalvalue;

      if (!editinput.checkValidity()) return editinput.classList.add('error')

      const old = vv(data[editinput.dataset.rownum - 1], editinput.dataset.col - 1)
      ss(editinput.dataset.rownum - 1, editinput.dataset.col - 1, newval)
      if (old === newval || config.onChange(data[editinput.dataset.rownum - 1], editinput.dataset.col, old, newval) !== false) {
        if (editinput) editinput.remove(); editinput = undefined
        renderBody()
      } else {
        ss(editinput.dataset.rownum - 1, editinput.dataset.col - 1, old)
        editinput.classList.add('error')
        return// reject edit
      }
    }

    const column = config.columns[col - 1]
    if (column === undefined || (undefined !== column && (column.editable === false || ((typeof column.editable === 'function') && column.editable(data[rownum - 1], col) === false)))) return
    if (column.type === 'checkbox') return

    const coltype = (undefined !== column && undefined !== column.type) ? (column.type) : 'text'
    const t = vv(data[rownum - 1], col - 1)
    const el = tbody.querySelector(":scope > tr[data-rownum='" + rownum + "'] td:nth-child(" + (col + (config.multiselect ? 1 : 0)) + ')')
    let i = null
    if (undefined !== column && column.listOfValues !== undefined) {
      el.innerHTML = '<select style="width:100%;" id="coledit"  ></select>'
      i = el.querySelector(':scope #coledit')
      let lov = column.listOfValues; if (typeof lov === 'function') lov = lov(data[rownum - 1], col, el)

      lov.forEach(v => { const o = document.createElement('OPTION'); o.innerText = (undefined === v.name) ? v : v.name; o.value = (undefined === v.value) ? v : v.value; if (o.value === vv(data[rownum - 1], col - 1))o.setAttribute('selected', 'selected'); i.add(o) })
      i.focus()
    } else {
      el.innerHTML = column.type === 'textarea' ? (`<textarea id="coledit" style="width:${el.clientWidth}px;height:${el.clientHeight}px" ></textarea>`) : `<input type="${coltype}" ${column.title !== undefined ? `title="${column.title}"` : ''} ${column.pattern !== undefined ? `pattern="${column.pattern}"` : ''} style="width:100%;" id="coledit" />`
      i = el.querySelector(':scope #coledit')
      i.value = t
      i.focus()
      i.select()
    }

    i.addEventListener('change', function (e) {
      const rownum = e.srcElement.dataset.rownum; const col = e.srcElement.dataset.col
      if (vv(data[rownum - 1], col - 1) !== e.srcElement.value) {
        if (!e.srcElement.checkValidity()) return e.srcElement.classList.add('error')
        ss(rownum - 1, col - 1, e.srcElement.value)
        if (config.onChange(data[rownum - 1], col, vv(data[rownum - 1], col - 1), e.srcElement.value) === false) {
          ss(rownum - 1, col - 1, vv(data[rownum - 1], col - 1))
          e.srcElement.classList.add('error')
        }
      }
    })

    i.addEventListener('click', function (ev) { ev.stopPropagation() })
    i.dataset.originalvalue = t; i.dataset.rownum = rownum; i.dataset.col = col

    i.addEventListener('keydown', function (e) {
      if (undefined === rownum) return

      switch (e.which) {
        case 27:// esc
          editinput = undefined; render()
          break
        case 38:// up
          if ([...el.parentElement.parentElement.children].indexOf(el.parentElement) > 0) {
            stop(e)
            editCell(rownum - 1, col)
          }
          break
        case 40:// down
          if (el.parentElement.nextSibling !== null) {
            stop(e)
            editCell(rownum + 1, col)
          }
          break
        case 37:// left
          if (e.shiftKey) {
            stop(e)
            editPrev(rownum, col)
          }
          break
        case 13: case 9:
          stop(e)
          editNext(rownum, col)
          break
        case 39:// right
          if (e.shiftKey && el.nextSibling !== null) {
            stop(e)
            editNext(rownum, col)
          }
          break
        default:
          break
      }
    })
    editinput = i;
    ((config.inputClass || '')).split(' ').filter(x => x !== '').forEach(c1 => editinput.classList.add(c1))
    config.onInitInput(data[rownum - 1], column.name || col, el)
  }
  const downloadFile = function (blob, filename, type = 'text/plain') {
    if (typeof blob === 'object') { blob.save(filename); return }
    const url = window.URL.createObjectURL(new Blob([blob], { type }))
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = (undefined === filename) ? 'export.txt' : filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }
  const getExportData = function (fmt) {
    let ret = ''
    if (fmt === 'txt') data.forEach(r => { ret += '\n'; Object.keys(r).forEach(k => { ret += r[k] + '\t' }) })
    if (fmt === 'csv') { ret += 'sep=,\n'; data.forEach(r => { Object.keys(r).forEach(k => { ret += '"' + ('' + r[k]).replace('"', '\\"') + '",' }); ret += '\n' }) }
    if (fmt === 'html' || fmt === 'xls') { ret += '<table><tbody>' + data.map(r => { return '<tr>' + Object.keys(r).map(k => { return '<td>' + (r[k] || '') + '</td>' }).join('') + '</tr>' }).join('') + '</tbody></table>' }
    if (fmt === 'xls') {
      const TEMPLATE_XLS = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
      <head><!--[if gte mso 9]><xml>
      <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{title}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>
      <![endif]--></head>
      <body>{table}</body></html>`

      const parameters = {
        title: 'Export',
        table: ret
      }
      return TEMPLATE_XLS.replace(/{(\w+)}/g, (x, y) => parameters[y])
    }
    if (fmt === 'pdf') {
      const jsPDF = window.jsPDF
      const doc = new jsPDF('p', 'cm', 'A4')
      const PAGEW = 19; const STARTY = 1.35
      doc.setLineWidth(0.025)
      let x = 1; let y = STARTY; let ii = 0; let pg = 1
      doc.setFontSize(18)
      doc.text(config.reportTitle === undefined ? ((document.querySelector('h1') || document.querySelector('TITLE')).innerText) : config.reportTitle, x, y, {})
      y += 1.0

      const canvas = wrapper.querySelector(':scope .graphplaceholder canvas')
      if (canvas.clientHeight > 0) {
        const canvasImg = canvas.toDataURL('image/png', 1.0); const gh = 19 * (canvas.clientHeight / canvas.clientWidth)
        doc.addImage(canvasImg, 'PNG', 1, y + 0.5, 19, gh)
        y += gh + 2
      }
      doc.setFontSize(9)

      const cw = []; let cww = 0; table.querySelectorAll(':scope thead tr:nth-child(1) th').forEach(x => { cww += x.clientWidth; cw.push(x.clientWidth) })

      const showHeader = function () {
        x = 1; ii = 0
        doc.setFontType('bold')
        table.querySelectorAll(':scope thead tr:nth-child(1) th').forEach(f => {
          if (cw[ii]) doc.text(f.innerText, x, y, { maxWidth: (cw[ii] / cww) * PAGEW - 0.1 })
          x += (cw[ii++] / cww) * PAGEW
        })
        doc.line(1, y + 0.2, PAGEW + 1, y + 0.2)
        y += 0.5
        doc.setFontType('normal')
      }
      showHeader()
      let lastgroup = null; let groupdata = []; let gg; let lines
      data.forEach((r, idx) => {
        if (typeof config.groupOn === 'function' && lastgroup !== (gg = config.groupOn(r, idx))) {
          doc.setFontType('bold')
          if (config.showGroupFooter === true && lastgroup !== null) {
            doc.line(1, y - 0.4, PAGEW + 1, y - 0.4)
            x = 1
            lines = 0; ii = 0
            config.columns.forEach((c, ic) => {
              const ct = '' + (typeof c.groupFooter === 'function' ? c.groupFooter(groupdata, c.name || ic, null, config.decimals, c.value) : (undefined === c.groupFooter ? '' : c.groupFooter))
              doc.text(ct, x, y, { maxWidth: (cw[ii] / cww) * PAGEW - 0.1 })
              lines = Math.max(lines, doc.splitTextToSize(ct || '', (cw[ii] / cww) * PAGEW - 0.1).length)
              x += (cw[ii++] / cww) * PAGEW
            })
            doc.line(1, y + 0.2, PAGEW + 1, y + 0.2)
            x = 1; y += 0.3 * (1 + Math.floor(lines + 0.9999))
          }
          if (config.showGroupHeader) {
            doc.text(gg, 1, y, { maxWidth: PAGEW - 0.1 })
            y += 0.5
          }
          x = 1
          doc.setFontType('normal')
          lastgroup = gg
          groupdata = []
        }

        ii = 0
        x = 1
        if (config.showGroupRows) {
          lines = 0
          config.columns.forEach((c, ic) => {
            const ct = vv2(r, ic)
            if (undefined !== ct) {
              if (cw[ii]) {
                doc.text('' + (ct || ''), x, y, { maxWidth: ((cw[ii] / cww) * PAGEW - 0.1) })
                lines = Math.max(lines, doc.splitTextToSize(ct || '', (cw[ii] / cww) * PAGEW - 0.1).length)
              }
            }
            x += (cw[ii++] / cww) * PAGEW
          })
          x = 1; y += 0.3 * (1 + Math.floor(lines + 0.9999))
          doc.line(1, y - 0.35, PAGEW + 1, y - 0.35)
        }

        if (y > 28) { doc.text('' + pg++, 10, 29); doc.addPage(); y = STARTY; doc.setLineWidth(0.025); showHeader() }
        if (undefined !== config.groupOn && config.showGroupFooter === true) groupdata.push(r)
      })
      doc.text('' + pg++, 10, 29)
      doc.setFontType('bold')
      if (config.showGroupFooter === true && lastgroup !== null) {
        doc.line(1, y - 0.4, PAGEW + 1, y - 0.4)
        x = 1; ii = 0; lines = 0
        config.columns.forEach((c, ic) => {
          const ct = '' + (typeof c.groupFooter === 'function' ? c.groupFooter(groupdata, c.name || ic, null, config.decimals, c.value) : (undefined === c.groupFooter ? '' : c.groupFooter))
          doc.text(ct, x, y, { maxWidth: (cw[ii] / cww) * PAGEW - 0.1 })
          lines = Math.max(lines, doc.splitTextToSize(ct || '', (cw[ii] / cww) * PAGEW - 0.1).length)
          x += (cw[ii++] / cww) * PAGEW
        })
        y += 0.3 * (1 + Math.floor(lines + 0.9999))
        doc.line(1, y - 0.4, PAGEW + 1, y - 0.4)
      }

      return doc
    }
    return ret
  }

  const colors = [
    '#1D741B', '#FE840E', '#1E3D58', '#DD4132', '#9E1030', '#FF6F61', '#C62168', '#8D9440', '#FFD662', '#00539C', '#755139', '#D69C2F', '#616247', '#E8B5CE', '#D2C29D', '#343148', '#F0EAD6', '#615550', '#9B1B30', '#77212E', '#F5D6C6', '#FA9A85', '#5A3E36', '#CE5B78', '#935529', '#E08119', '#2A4B7C', '#577284', '#F96714', '#264E36', '#F3E0BE', '#2A293E', '#9F9C99', '#797B3A'
  ]
  const getGraphData = function () {
    return _graphData.length > 0 ? _graphData : fdata
  }
  const showGraph2 = function () {
    const x = wrapper.querySelector(`:scope #${id}__select_graph_x`).value
    const y = wrapper.querySelector(`:scope #${id}__select_graph_y`).value
    const y2 = wrapper.querySelector(`:scope #${id}__select_graph_y2`).value
    const t = wrapper.querySelector(`:scope #${id}__select_graph_type`).value
    if (t === 0) {
      showGraph(false)
      wrapper.querySelector(':scope .fathgrid-graph2-nav').classList.remove('active')
    } else {
      wrapper.querySelector(':scope .fathgrid-graph2-nav').classList.add('active')
      config.graphType = (['none', 'line', 'bar', 'pie'])[t]
      config.graphValues = function (fd) {
        return {
          title: y2 !== '' ? [config.columns[y].header, config.columns[y2].header] : config.columns[y].header,
          labels: fd.map(i => i[config.columns[x].name]),
          values: y2 !== '' ? [fd.map(i => i[config.columns[y].name]), fd.map(i => i[config.columns[y2].name])] : fd.map(i => i[config.columns[y].name])
        }
      }
      showGraph(true)
    }
  }
  const showGraph = function (bShow) {
    if (chart !== undefined) { chart.destroy(); chart = undefined; wrapper.querySelector('.graphplaceholder').innerHTML = graphCanvasHTML }
    if (wrapper.querySelector(':scope .graphplaceholder').style.display === 'block' && !bShow) { wrapper.querySelector(':scope .graphplaceholder').style.display = 'none'; return }
    if (!bShow) return
    const ctx = wrapper.querySelector(':scope .graphplaceholder canvas')
    wrapper.querySelector(':scope .graphplaceholder').style.display = 'block'
    const dd = config.graphValues(getGraphData())
    let ci = 0
    const chartConfig = {
      type: config.graphType,
      data: {
        labels: dd.labels,
        datasets: Array.isArray(dd.values[0])
          ? dd.values.map((x, idx) => (
            {
              label: dd.title[idx],
              data: x,
              borderWidth: 1,
              fill: false,
              backgroundColor: config.graphType === 'pie' ? x.map((v, i) => colors[i % colors.length]) : colors[ci],
              borderColor: config.graphType === 'pie' ? x.map((v, i) => colors[i % colors.length]) : colors[ci++]
            }
          ))
          : [{
              label: dd.title,
              data: dd.values,
              borderWidth: 1,
              backgroundColor: config.graphType === 'pie' ? dd.values.map((v, i) => colors[i % colors.length]) : colors[ci],
              borderColor: config.graphType === 'pie' ? dd.values.map((v, i) => colors[i % colors.length]) : colors[ci++]
            }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    }
    const Chart = window.Chart
    chart = new Chart(ctx, chartConfig)
  }

  const printGrid = function () {
    const _page = config.page; const _size = config.size
    config.page = 1; config.size = fdata.length || data.length
    getData().then(dd => {
      renderBody(dd, false)
      const WinPrint = window.open()
      WinPrint.document.write(`<!doctype html><html lang="en"><head>${document.head.innerHTML}<style>table .noprint {display:none}</style></head><body>`)
      WinPrint.document.write(`<h1>${(document.querySelector('h1') || document.querySelector('TITLE')).innerText}</h1><div class="fathgrid-wrapper">`)
      WinPrint.document.write(((chart !== undefined) ? wrapper.querySelector(':scope .graphplaceholder').innerHTML : '') + table.parentElement.innerHTML)
      WinPrint.document.write('</div></body></html>')
      WinPrint.document.close()
      WinPrint.setTimeout(() => {
        if (chart !== undefined && WinPrint.document.querySelector('canvas')) WinPrint.document.querySelector('canvas').getContext('2d').drawImage(wrapper.querySelector('canvas'), 0, 0)
        WinPrint.focus()
        WinPrint.print()
        WinPrint.close()
      }, 1000)
      config.page = _page; config.size = _size
      render()
    })
  }

  render()

  if (config.resizable) {
    let currCol; let nextCol; let startX; let currW; let nextW
    thead.querySelectorAll(':scope tr:nth-child(1) th').forEach(h => {
      h.style.position = 'relative'
      const div = document.createElement('div')
      div.classList.add('fathgrid-col-divider')
      div.style.height = thead.offsetHeight + 'px'
      h.appendChild(div)
      div.addEventListener('click', function (e) { stop(e) })
      function getPadding (el) {
        if (window.getComputedStyle(el, null).getPropertyValue('box-sizing') === 'border-box') return 0
        return parseInt(window.getComputedStyle(el, null).getPropertyValue('padding-left')) + parseInt(window.getComputedStyle(el, null).getPropertyValue('padding-right'))
      }
      div.addEventListener('mousedown', e => {
        currCol = h
        nextCol = h.nextElementSibling
        startX = e.pageX
        currW = h.offsetWidth - getPadding(h)
        if (nextCol !== null) nextW = nextCol.offsetWidth - getPadding(nextCol)
      })
    })
    document.addEventListener('mouseup', e => { currCol = undefined; nextCol = undefined })
    document.addEventListener('mousemove', e => {
      if (currCol !== undefined) {
        const d = e.pageX - startX
        if (nextCol) nextCol.style.width = (nextW - d) + 'px'
        currCol.style.width = (currW + d) + 'px'
        const s = {}
        // eslint-disable-next-line no-return-assign
        thead.querySelectorAll(':scope tr:nth-child(1) th').forEach(c => s[c.cellIndex] = c.style.width)
        localStorage.setItem('__fathgrid_columns_' + config.id, JSON.stringify(s))
      }
    })
    if (config.restoreColumns) {
      let s = localStorage.getItem('__fathgrid_columns_' + config.id)
      if (s !== null) {
        try {
          s = JSON.parse(s)
          // eslint-disable-next-line no-return-assign
          thead.querySelectorAll(':scope tr:nth-child(1) th').forEach(c => c.style.width = s[c.cellIndex])
        } catch (ex) {}
      }
    }
  }

  const updateGrouping = function (ev) {
    config._gr = []
    // add column.groupFooter function to non-groupby columns
    config.columns.forEach((c, idx) => {
      const sel = (thead.querySelector(":scope tr.grouping th[data-i='" + idx + "'] select"))
      if (sel !== null) {
        const func = sel.value
        c.groupFooter = ([FathGrid.FIRST, FathGrid.AVG, FathGrid.COUNT, FathGrid.FIRST, FathGrid.LAST, FathGrid.MIN, FathGrid.MAX, FathGrid.SUM])[func]
        if (sel.value === 0 && c.visible !== false) config._gr.push(idx + 1)
      } else c.groupFooter = undefined
    })
    config.showGroupFooter = true
    config.showGroupHeader = false
    config.showGroupRows = false
    // create single grouping value from groupby columns
    config.groupOn = config._gr.length === 0
      ? undefined
      : function (item, idx) {
        return config._gr.reduce((x, ci) => (x + ((item[config.columns[ci - 1].name]) || (ci - 1)) + '\n'), '')
      }
    config.sort = config._gr
    config.sortBy = config._gr
    sortData()
    render()
  }

  const showGrouping = function (bshow) {
    if (thead.querySelector(':scope tr.grouping') !== null) thead.querySelector(':scope tr.grouping').remove()
    bshow ? wrapper.querySelector(':scope .fathgrid-grouping-nav').classList.add('active') : wrapper.querySelector(':scope .fathgrid-grouping-nav').classList.remove('active')
    if (!bshow) { updateGrouping(); config.showGroupRows = true; return }
    const tr = document.createElement('TR')
    thead.appendChild(tr)
    tr.classList.add('grouping')
    config.columns.forEach((c, idx) => {
      const td = document.createElement('TH'); td.dataset.i = idx; tr.appendChild(td); if (c.visible === false) td.style.display = 'none'; if (c.printable === false) td.classList.add('noprint'); (c.class || '').split(' ').filter(x => x !== '').forEach(c1 => td.classList.add(c1))
      td.innerHTML = '<select class="' + ((c.filterInputClass || '') + ' ' + (config.inputClass)).split(' ').filter(x => x !== '').join(' ') + '">' + ([config.lang.groupby, config.lang.avg, config.lang.count, config.lang.first, config.lang.last, config.lang.min, config.lang.max, config.lang.sum]).map((t, i) => ('<option value="' + i + `">${t}</option>`)) + '</select>'
      td.querySelector(':scope select').addEventListener('change', function (ev) { updateGrouping(ev) })
    })
  }

  const getGrouping = function () {
    const gr = {}
    config.columns.forEach((c, idx) => {
      const sel = (thead.querySelector(":scope tr.grouping th[data-i='" + idx + "'] select"))
      if (sel !== null) {
        gr[idx] = sel.value
      }
    })
    return {
      showGroupFooter: config.showGroupFooter,
      showGroupHeader: config.showGroupHeader,
      showGroupRows: config.showGroupRows,
      ...gr
    }
  }

  const setGrouping = function (obj) {
    if (undefined === obj[0]) { showGrouping(false); return }
    showGrouping(true)
    config.columns.forEach((c, idx) => {
      const sel = (thead.querySelector(":scope tr.grouping th[data-i='" + idx + "'] select"))
      if (sel !== null) {
        sel.value = obj[idx]
      }
    })
    config.showGroupFooter = obj.showGroupFooter
    config.showGroupHeader = obj.showGroupHeader
    config.showGroupRows = obj.showGroupRows
    updateGrouping()
  }

  return {
    id: id,
    setConfig: function (newConfig) { config = { ...config, ...newConfig }; render() },
    render: render,
    nextPage: nextPage,
    prevPage: prevPage,
    lastPage: lastPage,
    firstPage: firstPage,
    sort: sort,
    setPageSize: function (x) { config.size = parseInt(x); config.page = 1; render() },
    getPageSize: function () { return config.size },
    getSort: getSort,
    setSort: function (ss) { if (typeof ss === 'number') ss = [ss]; config.sort = []; ss.map(x => sort(Math.abs(x), x < 0, true)); render() },
    filter: function (idx, str) { thead.querySelector(':scope tr.filter th:nth-child(' + (idx + (config.multiselect ? 1 : 0)) + ')').querySelector(':scope input, select').value = str; render() },
    getFilter: getFilter,
    editCell: editCell,
    getData: function () { return data.map(x => x) },
    // eslint-disable-next-line array-callback-return
    setData: function (newdata) { data = []; (newdata || []).map((x, idx) => { x.rownum = idx + 1; data.push(x) }); render() },
    setCell: function (rownum, col, v) { ss(rownum - 1, col - 1, v) },
    getCell: function (rownum, col) { return data[rownum - 1][(config.columns[col - 1].name) || (col - 1)] },
    getExportData: getExportData,
    exportData: function (fmt = 'txt', filename = 'export') { downloadFile(getExportData(fmt), filename + '.' + fmt, (fmt === 'xls' ? 'application/vnd.ms-excel;base64,' : 'text/plain')) },
    search: function (q) { if (q === undefined) return config.q; config.q = q; render() },
    getSelectedItem: function () { return selectedRows.length ? selectedRows[0] : null },
    getSelectedItems: getSelectedItems,
    setServerURL: function (u) { config.serverURL = u; render() },
    wrapperEl: wrapper,
    showSubgrid: function (tt, _html = '') {
      const a = tbody.querySelectorAll(':scope tr.subgrid')
      const el = tbody.querySelector(':scope > tr.selected')
      el.insertAdjacentHTML('afterend', `<tr class="subgrid"><td colspan="${config.columns.length + (config.multiselect ? 1 : 0)}" >${_html}</td></tr>`)
      el.nextSibling.querySelector(':scope td').appendChild(tt.wrapperEl)
      a.forEach(x => x.parentElement.removeChild(x))
    },
    selectRow: selectRow,
    insertRow: function (rownum, item, complete) { if (rownum === null) rownum = data.length + 1; data.splice(rownum - 1, 0, item); data.map((x, idx) => { x.rownum = idx + 1; return x }); render(complete) },
    deleteRow: function (rownum, complete) { data.splice(rownum - 1, 1); data.map((item, idx) => { item.rownum = idx + 1; return item }); render(complete) },
    refresh: renderBody,
    saveConfig: function () {
      return JSON.stringify({
        grouping: getGrouping(),
        size: config.size,
        sort: config.sort,
        visible: config.columns.map((x, idx) => x.visible === undefined ? true : x.visible),
        columnWidths: [...thead.querySelectorAll(':scope tr:nth-child(1) th')].map((e) => e.clientWidth),
        graphValues: [
          wrapper.querySelector(`:scope #${id}__select_graph_x`).value,
          wrapper.querySelector(`:scope #${id}__select_graph_y`).value,
          wrapper.querySelector(`:scope #${id}__select_graph_y2`).value,
          wrapper.querySelector(`:scope #${id}__select_graph_type`).value
        ]
      })
    },
    loadConfig: function (objConfig) {
      const o = typeof objConfig === 'string' ? JSON.parse(objConfig) : objConfig
      config.size = o.size
      config.sort = o.sort
      setGrouping(o.grouping)
      config.columns.map((c, idx) => showColumn(idx, o.visible[idx], false))
      // eslint-disable-next-line no-return-assign
      if (undefined !== o.columnWidths) thead.querySelectorAll(':scope tr:nth-child(1) th').forEach((e, i) => e.style.width = o.columnWidths[i] + 'px')
      if (undefined !== o.graphValues) {
        wrapper.querySelector(`:scope #${id}__select_graph_x`).value = o.graphValues[0]
        wrapper.querySelector(`:scope #${id}__select_graph_y`).value = o.graphValues[1]
        wrapper.querySelector(`:scope #${id}__select_graph_y2`).value = o.graphValues[2]
        wrapper.querySelector(`:scope #${id}__select_graph_type`).value = o.graphValues[3]
        showGraph2()
      }

      redraw()
    },
    destroy: function (replaceWith) {
      (replaceWith === undefined) ? wrapper.parentNode.removeChild(wrapper) : wrapper.parentNode.replaceChild(replaceWith, wrapper)
    }
  }
}
