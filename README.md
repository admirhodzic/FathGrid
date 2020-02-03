# FathGrid
No dependencies pure JavaScript data table/grid with:
- instant search, 
- paging, 
- sorting (by multiple columns), 
- filtering (with text input or selecting from a list),
- printing,
- export to txt, csv, pdf, xls, etc.,
- multiple rows selection,
- custom row highlights,
- show/hide columns,
- columns resizing,
- grouping and data aggregation (with group header/footer),
- in-place data edit mode,
- inline data, JSON fetching or server-side processing,
- sub-grid,
- interactive data graph.

![Sample screenshot](/fathgrid.png)
![Sample screenshot](/fathgrid2.gif)


Just include .js file in your HTML and initialize table with:

    var t1=FathGrid("table1",{});

where "table1" is an ID of HTML table. 

    <table id="table1">
    ...
    </table>

# Online demos

<a href="http://www.fathsoft.com/grid/demos/sample.html">Demo 1</a> | <a href="http://www.fathsoft.com/grid/demos/songs.html">Demo 2</a> |  <a href="http://www.fathsoft.com/grid/demos/edit-demo.html">Editing</a> | <a href="http://www.fathsoft.com/grid/demos/form-demo.html">Forms Demo</a> | 

# Table Data
Table data can be set inline, in your HTML, or dynamically loaded with setData method or configuration option.
## Inline Data
Simply add all your data in table body. FathGrid will load all content and show only first page.
Sample:

    <table id="table1">
        <thead>
            <tr><th>id</th><th>name</th></tr>
        </thead>
        <tbody>
            <tr><td>1</td><td>first row</td></tr>
            <tr><td>2</td><td>second row</td></tr>
            <tr><td>3</td><td>third row</td></tr>
        </tbody>
    </table>


## Dynamic data
Table content can be empty and data loaded from JavaScript array using setData method:

    <table id="table1">
        <thead>
            <tr><th>id</th><th>name</th></tr>
        </thead>
        <tbody>
        </tbody>
    </table>
    <script>
      var t1=FathGrid('table1',{data:[
        ['1','first row'],
        ['2','second row'],
        ['3','third row']
        ]
      });
      //or, calling a method
      t1.setData([['10','...'],['22','...'],['30','...']]);
    </script>

## JSON data objects
Table content can be set using array of JSON objects. In that case, columns definition must include "name" property which specifies object attribute name to display:

    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(json => {
        var t1=FathGrid("table1",{
          columns:[
              {editable:false, name:'id'},
              {
                name:'userId', 
                filter:users,
                listOfValues:users,
                value:function(item){return users.find(i=>i.value==item.userId).name;}
              },
              {name:'title'},
              {
                name:'body',
                html:function(item){return `<b>${item.body}</b>`}
              },
          ],
          data:json,
        });
      })
## Server-side data
For huge data amounts, use server-side processing (sorting, paginating and filtering) with **serverURL** configuration option:

    t1=FathGrid("table1",{
      serverURL:'https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${size}&_sort=${sort}&_order=${order}&q=${search}&${filters}',
      ...
    });


## Configuration options
<table><thead><tr><th>Name</th><th>Description</th><th>Default</th></tr></thead>
<tbody>
<tr><td>size</td><td>page size</td><td>20</td></tr>
<tr><td>page</td><td>page number to show</td><td>1</td></tr>
<tr><td>filterable</td><td>show filter row in thead</td><td>true</td></tr>
<tr><td>editable</td><td>allow edits</td><td>true</td></tr>
<tr><td>pageable</td><td>allow pagination</td><td>true</td></tr>
<tr><td>printable</td><td>allow printing</td><td>true</td></tr>
<tr><td>exportable</td><td>allow data export</td><td>true</td></tr>
<tr><td>resizable</td><td>allow column resizing</td><td>true</td></tr>
<tr><td>restoreColumns</td><td>automatically restore column widths from previous user session with the same table</td><td>false</td></tr>
<tr><td>sortable</td><td>Allow sorting. Click on column header to sort, hold shift to add column to multisort.</td><td>true</td></tr>
<tr><td>multiselect</td><td>Allow selecting multiple rows. Adds select checkbox to the rows. Use <b>getSelectedItems</b> API to get selected data items.</td><td>false</td></tr>
<tr><td>showGraph</td><td>show graph tool in the toolbar</td><td>true</td></tr>
<tr><td>showGrouping</td><td>show grouping and aggregation tool in the toolbar</td><td>true</td></tr>
<tr><td>selectColumns</td><td>show columns list in the toolbar</td><td>true</td></tr>
<tr><td>showFooter</td><td>add footer row to table</td><td>false</td></tr>
<tr><td>showGroupFooter</td><td>add footer row after each group of records</td><td>false</td></tr>
<tr><td>showGroupHeader</td><td>add header row before each group of records</td><td>true</td></tr>
<tr><td>showGroupRows</td><td>display/hide data rows between group header and group footer</td><td>true</td></tr>
<tr><td>showTableTotal</td><td>add footer row at the end of a table with data aggregation values</td><td>false</td></tr>
<tr><td>data</td><td>table data</td><td>data from HTML table content</td></tr>
<tr><td>rowClass</td><td>function to return a string with row classes. Use it to change row appearance based on some criteria.</td><td>function(data,index){}</td></tr>
<tr><td>onChange</td><td>function to call when cell data is changed</td><td>function(data, col, old_value, new_value){}</td></tr>
<tr><td>groupOn</td><td>function which returns a HTML string to group records on</td><td>{}</td></tr>
<tr><td>sortBy</td><td>Array or column indices to sort always. Usable for grouping records.</td><td>{}</td></tr>
<tr><td>columns</td><td>configure columns</td><td>{}</td></tr>
<tr><td>serverURL</td><td>templated string URL for data retrieval</td><td>undefined</td></tr>
<tr><td>prepareData</td><td>custom function which converts received JSON object into data array</td><td>async function(json)</td></tr>
<tr><td>rtl</td><td>set to true for RTL languages</td><td>false</td></tr>
<tr><td>template</td><td>Templated HTML string for grid wrapper element. Use this to insert custom HTML between grid elements.</td><td>{tools}{info}{graph}{table}{pager}</td></tr>
<tr><td>graphType</td><td>graph type, line, bar, pie, etc</td><td>line</td></tr>
<tr><td>graphValues</td><td>function which returns an object to initialize data graph</td><td>{title: 'Graph Title', labels: ['Jan','Feb','Mar',...], values: [100,200,300,...]}</td></tr>
<tr><td>onInitFilter</td><td>function called after filter row is initialized. Function parameter is TR element of table filter.</td><td>function(Element){}</td></tr>
<tr><td>onInitTable</td><td>function called after table data is refreshed. Function paramter is TBODY element which contains data rows.</td><td>function(Element){}</td></tr>
<tr><td>onInitInput</td><td>function called after table cell editor is initialized. Function paramters are:<br/>- item : data item<br/>- idx : column index<br/>- el : TD cell element in which input is located</td><td>function(Item, Idx, El){}</td></tr>
<tr><td>lang</td><td>language translation object</td><td>
        {<br/>
          of:"of",<br/>
          yes:"yes",<br/>
          export:"Export",<br/>
          previous:"Previous",<br/>
          next:"Next",<br/>
          last:"Last",<br/>
          first:"First",<br/>
          gotoPage:"Goto Page",<br/>
          loading:'Loading...',<br/>
          selectRow:'Select Row',<br/>
          showSelectedOnly:'Show Only Selected Rows',<br/>
          groupby:'Group By',<br/>
          avg:'Avg',<br/>
          count:'Count',<br/>
          min:'Min',<br/>
          max:'Max',<br/>
          sum:'Sum',<br/>
          show_grouping_controls:'Show Grouping Controls',<br/>
          show_graph:'Show Graph',<br/>
          select_columns:'Select Columns',<br/>
          type:'Type',<br/>
          none:'None',<br/>
          line:'Line',<br/>
          bar:'Bar',<br/>
          pie:'Pie',<br/>
        }<br/>
</td></tr>
</tbody>
</table>

### Columns
Columns definition is an array of objects defining column appereance and functions.
<table><thead><tr><th>Name</th><th>Description</th><th>Default</th></tr></thead><tbody>
<tr><td>name</td><td>field name in data record</td><td></td></tr>
<tr><td>visible</td><td>boolean. if set to false, column is not visible </td><td></td></tr>
<tr><td>filter</td><td>list of values for filter select, or a null to automatically build the list from table data</td><td></td></tr>
<tr><td>value</td><td>function which returns cell text content</td><td>function(item){}</td></tr>
<tr><td>html</td><td>function which returns cell HTML content</td><td>function(item){}</td></tr>
<tr><td>header</td><td>header text</td><td></td></tr>
<tr><td>footer</td><td>function which returns footer cell HTML content</td><td>function(data,element){}</td></tr>
<tr><td>groupFooter</td><td>function which returns group footer cell HTML content. Pre-defined values that can be used are:<br/>- FathGrid.SUM<br/>- FathGrid.AVG<br/>- FathGrid.MIN<br/>- FathGrid.MAX<br/>- FathGrid.COUNT<br/>- FathGrid.FIRST<br/>- FathGrid.LAST</td><td>function(data,element){}</td></tr>
<tr><td>editable</td><td>boolean if edit is allowed, or a function(item,col) which returns boolean</td><td></td></tr>
<tr><td>type</td><td>input type for cell editor. supported values are: text, color, image, date, email, number, checkbox, textarea.</td><td></td></tr>
<tr><td>pattern</td><td>regular expression to check the input value against when editing cell content</td><td></td></tr>
<tr><td>title</td><td>help string for input in edit mode</td><td></td></tr>
<tr><td>width</td><td>column width. if value is number, in pixel units, or set velue to string with custom units (eg. '10rem').</td><td>auto</td></tr>
<tr><td>printable</td><td>include this column in print</td><td>true</td></tr>
<tr><td>listOfValues</td><td>array of selectable values when editing</td><td></td></tr>
<tr><td>class</td><td>string of CSS classes to add to column cells. Eg. 'text-right text-bold'</td><td></td></tr>
<tr><td>filterInputClass</td><td>string of CSS classes to add to column filter input. Eg. 'form-control text-right text-bold'</td><td></td></tr>
</tbody></table>

To add filter values to column 5, and let grid fill in values for filter of column 3, use:

    var t1=FathGrid("table1",{
      size:10,
      editable:true,
      filterable:true,
      sortable:true,
      columns:[
        {editable:false, header:'ID#'},
        {
          listOfValues:[1,2,3,4,5,"Abel","SomeName"], //list of values for edit, or a function(data,col) which returns list of values
        },
        {
          filter:null, //array or null for auto-generation of filter list
          editable:function(data,col){return data.rownum>3}, //is field editable
        },
        {
          type:'text', //edit input type: text, date, email, checkbox, textarea
          pattern:'[0-9]*',
          title:'only numbers, please!'
        },
        {type:'checkbox',
          editable:true,
          filter:[{name:'no',value:0},{name:'yes',value:1}],
          footer: FathGrid.SUM, //display sum of field "amount"

        },
      ],
    });

# Export
Text, CSV, HTML and XLS export formats are supported.<br/>
To enable PDF export, include jsPDF.js in your page and PDF export functionality will be automatically enabled.

# API
  .getData() // returns table data 
  
  .setData(newData) // sets new table data, possibly after delete or creating a new record

  .exportData(format, filename) //export data
  
  .render() //redraw
  
  .sort(column_index [, asc|desc][, multisort] ) //sort data, set multisort to sort by multiple columns
  
  .getSort() //returns array of 1-based column indices, negative if using descending sort order

  .setSort(indices) // eg. .setSort([2,1]) to sort by second then first column
  
  .filter(column_index, query) //add filter string to a column
  
  .getFilter() //returns array of column query strings
  
  .editCell(rownum, col) //start editor in the cell

  .search([query string]) //instant search in all columns. Calling this method without argument returns current search string.

  .getSelectedItem() //return data item of selected row or null if no row is selected

  .deleteRow(rownum) //deletes row specified by rownum parameter (1 = first row, 2= second row, ...)

  .insertRow(rownum, item) //inserts new item into row number specified by rownum parameter (1=first row)

  .selectRow(rownum)

  .restoreColumns() //restores column widths from local storage of previous session on this table

  .saveConfig()

  .loadConfig(objConfig)

  .destroy()

  
 
# License
    MIT

