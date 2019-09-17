# FathGrid
No dependencies vanilla JavaScript grid with paging, sorting and filtering.

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

# Configuration options

size: page size (default 20)

page: initial page number (default 1)

tableClasses: classes to add to the table (default "table table-hover")

tableHeadClasses: classes to add to THEAD (default "thead-dark")

filter: true/false (deafult true)

columns: object (deafult {})

To add filter values to column 2, and let grid fill in values for filter of column 3, use:
columns:{
  2:{
    filter:['some',values','dummy']
  },
  3: {filter:null}
}
