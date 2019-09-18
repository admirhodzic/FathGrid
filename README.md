# FathGrid
No dependencies vanilla JavaScript data table/grid with paging, sorting, filtering and editing.

![Sample screenshot](/fathgrid.png)

Just include .js file in your HTML and initialize table with:

    var t1=FathTable("table1",{});

where "table1" is an ID of HTML table. Your table must have THEAD and TBODY tags like:

    <table id="table1">
        <thead>
            <tr><th>header</th></tr>
        </thead>
        <tbody>
            <tr><td>value1</td></tr>
        </tbody>
    </table>

## Configuration options
<table><thead><tr><th>Name</th><th>Description</th><th>Default</th></tr></thead>
<tbody>
<tr><td>size</td><td>page size</td><td>20</td></tr>
<tr><td>page</td><td>page number to show</td><td>1</td></tr>
<tr><td>file</td><td>show filter row in thead</td><td>true</td></tr>
<tr><td>columns</td><td>configure columns</td><td>{}</td></tr>
<tr><td>tableClasses</td><td>classes for table</td><td>table table-hover</td></tr>
<tr><td>tableHeadClasses</td><td>classes for table thead</td><td>thead-dark</td></tr>
</tbody>
</table>

### Columns
To add filter values to column 2, and let grid fill in values for filter of column 3, use:

    columns:{
        2:{
            filter:['some',values','dummy']
        },
        3: {filter:null}
     }


#License
    GPL

#Commercial use license
    $99 <a href="https://checkout.bluesnap.com/buynow/checkout?sku3644714=1&storeid=9104">Buy</a>

