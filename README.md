# FathGrid
No dependencies vanilla JavaScript data table/grid with paging, sorting, filtering, export and editing.

![Sample screenshot](/fathgrid.png)

Just include .js file in your HTML and initialize table with:

    var t1=FathGrid("table1",{});

where "table1" is an ID of HTML table. Your table must have THEAD and TBODY tags like:

    <table id="table1">
        <thead>
            <tr><th>header</th></tr>
        </thead>
        <tbody>
            <tr><td>value1</td></tr>
        </tbody>
    </table>

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




## Configuration options
<table><thead><tr><th>Name</th><th>Description</th><th>Default</th></tr></thead>
<tbody>
<tr><td>size</td><td>page size</td><td>20</td></tr>
<tr><td>page</td><td>page number to show</td><td>1</td></tr>
<tr><td>filterable</td><td>show filter row in thead</td><td>true</td></tr>
<tr><td>editable</td><td>allow edits</td><td>true</td></tr>
<tr><td>sortable</td><td>allow sorting</td><td>true</td></tr>
<tr><td>columns</td><td>configure columns</td><td>{}</td></tr>
<tr><td>data</td><td>table data</td><td>data from HTML table content</td></tr>
<tr><td>rowClass</td><td>function to return a string with row classes. Use it to change row appearance based on some criteria.</td><td>function(data,index){}</td></tr>
<tr><td>onChange</td><td>function to call when cell data is changed</td><td>function(data, col, old_value, new_value){}</td></tr>
</tbody>
</table>

### Columns
To add filter values to column 2, and let grid fill in values for filter of column 3, use:

    var t1=FathGrid("table1",{
      size:10,
      editable:true,
      filterable:true,
      sortable:true,
      columns:{
        1:{editable:false},
        2:{
          listOfValues:[1,2,3,4,5,"Abel","SomeName"], //list of values for edit, or a function(data,col) which returns list of values
        },
        3:{
          filter:null, //array or null for auto-generation of filter list
          editable:function(data,col,el){return data.rownum>3}, //is field editable
        },
        4:{
          type:'email', //edit input type: text, date, email, checkbox
        },
        5:{type:'checkbox',
          editable:true,
          filter:[{name:'no',value:0},{name:'yes',value:1}]
        },

      },
    });

# Export
Text, CSV, HTML and XLS export formats are supported.<br/>
To enable PDF export, include jsPDF.js in your page and PDF export functionality will be automatically enabled.

# API
  .getData() // returns table data 
  
  .setData(newData) // sets new table data, possibly after delete or creating a new record

  .export(format, filename) //export data
  
  .render() //redraw
  
  .sort(column_index, [asc|desc]) //sort data
  
  .filter(column_index, query) //add filter string to a column
  
  .editCell(rownum, col) //start editor in the cell

  
 
# License
    GPL

# Commercial use license
$99 <a href="https://checkout.bluesnap.com/buynow/checkout?sku3644722=1&storeid=9104">Buy</a>

