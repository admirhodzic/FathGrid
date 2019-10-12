;var style = document.createElement('style');
style.setAttribute("id","FathGrid_styles");
style.innerHTML = `
  .fathgrid-wrapper .fathgrid thead th {padding:0.5em 1.5em;}  
  .fathgrid-wrapper .fathgrid thead th.sorted, th.sorted-desc {position: relative;}
  .fathgrid-wrapper .fathgrid thead th.sorted::after {content:"▲";position:absolute;right: 0.4em;}
  .fathgrid-wrapper[dir=rtl] .fathgrid thead th.sorted::after {right:auto;left: 0.4em;}
  .fathgrid-wrapper .fathgrid thead th.sorted-desc::after {content:"▼";position:absolute;right: 0.4em;}
  .fathgrid-wrapper[dir=rtl] .fathgrid thead th.sorted-desc::after {right:auto;left: 0.4em;}
  .fathgrid-wrapper .fathgrid-export-nav, .fathgrid-wrapper .fathgrid-columns-nav, .fathgrid-wrapper .fathgrid-graph-nav, .fathgrid-wrapper .fathgrid-print-nav {float:right;}
  .fathgrid-wrapper[dir=rtl] .fathgrid-export-nav, .fathgrid-wrapper[dir=rtl] .fathgrid-columns-nav, .fathgrid-wrapper[dir=rtl] .fathgrid-graph-nav, .fathgrid-wrapper[dir=rtl] .fathgrid-print-nav {float:left;}
  .fathgrid-wrapper {position:relative;}
  .fathgrid-wrapper .page-info {}
  
  .fathgrid-wrapper .dropdown {    position: relative;    display: inline-block;  }
  .fathgrid-wrapper .dropdown-content {
    display: none;
    position: absolute;
    right:0;
    background-color: #f9f9f9;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }
  
  .fathgrid-wrapper .dropdown:hover .dropdown-content {    display: block;  }  
  .fathgrid-wrapper .dropdown:hover .dropdown-content a {display:block;padding:0.1em 2em;margin:2px 0;}
  .fathgrid-wrapper .dropdown:hover .dropdown-content a:hover {background-color:#eee;}
  .fathgrid-wrapper .error {border-color:red;}

  .fathgrid-wrapper input, .fathgrid-wrapper textarea , .fathgrid-wrapper select {border:0;}

  .fathgrid-wrapper nav a.checked::before{content:'✓';position:absolute;left:1em;}  
  .fathgrid-wrapper[dir=rtl] nav a.checked::before{left:auto;right:1em;}  

  .fathgrid-wrapper .pagination {
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    display: flex;
    list-style:none;
    padding-inline-start:0;
  }
  .fathgrid-wrapper .page-link:not(.gotopage):hover {  background:#eee;}
  .fathgrid-wrapper .page-link {
    position: relative;
    color: #007bff;
    display: block;
    padding: 4px 8px;
    margin-left: -1px;
    line-height: 1.4em;
    border: 1px solid #ddd;
    text-decoration:none;
  }
  
  .fathgrid-wrapper .graphplaceholder  {background:white;display:none;transition-duration:0.4s;width:100%;border:solid 1px #bbb;margin:15px 0;padding:1em;}
  
  .fathgrid-wrapper nav.active {background:#bcf;}
`;
document.head.appendChild(style);
//icons from https://icomoon.io/app/#/select

((function(win){
  win.FathGrid=function(id,_config){
    var config={
        id:id, 
        size:20, 
        page:1, 
        editable:false,
        filterable:true,
        sortable:true,
        pageable:true,
        exportable:true,
        printable:true,
        graphType:'line',
        graphValues:this.undefined,
        showFooter:false,
        selectColumns:false,
        showGroupFooter:false,
        onInitFilter:function(el){},
        onInitTable:function(el){},
        onInitInput:function(item,idx,el){},
        prepareData:async function(data){return data;},
        sort:[],
        columns:[],
        onRender:function(){},
        onClick:function(data,col,el){editCell(data.rownum,col)},
        onChange:function(data,col,old,value){},
        rowClass:null,
        data:null,
        q:'',
        rtl:false,
        decimals:2,
        
        graphHeight:'200px',
        template:'{tools}{info}{graph}{table}{pager}',
        lang:{
          of:"of",
          yes:"yes",
          export:"Export",
          previous:"Previous",
          next:"Next",
          last:"Last",
          first:"First",
          gotoPage:"Goto Page",
          loading:'Loading...',
        },
        ..._config
    };

    var selected_rownum=null, totalRecords=0, filteredRecords=0;
    var data=config.data===null?[]:config.data,fdata=data;
    if(typeof data==='string') {
      (async()=>{
        const res=await fetch(data).then(d=>d.json());
        data=await res.json();
      })();
    }
    const graphCanvasHTML=`<canvas style="width:100%;height:${config.graphHeight};" ></canvas>`;

    var table=document.getElementById(id)||document.body.appendChild(table=document.createElement("TABLE"));
    var tbody=table.querySelector(":scope tbody") || table.appendChild(tbody=document.createElement("TBODY"));
    var thead=table.querySelector(":scope thead") || table.insertBefore(thead=document.createElement("THEAD"),tbody);
    
    var editinput=undefined;

    var renderPageinfo=function(){
      return `<span class="page-info">${(config.page-1)*config.size}-${Math.min(filteredRecords,config.page*config.size)} ${config.lang.of} ${totalRecords!=filteredRecords?`${filteredRecords}/`:''}${totalRecords}</span>`;
    }
    var renderPaginator=function(){
      var rr=`&#x23f5;`,ll=`&#x23F4;`;
      return `
        <ul class="pagination" >
          <li class="page-item"><a class="page-link firstpage" title="${config.lang.first}" href="#">&#x2503;${config.rtl?rr:ll}</a></li>
          <li class="page-item"><a class="page-link prevpage" title="${config.lang.previous}" href="#">${config.rtl?rr:ll}</a></li>
          <li class="page-item active"><a class="page-link gotopage" title="${config.lang.gotoPage}" href="javascript:void(0)">${config.page} / ${Math.floor((filteredRecords+(config.size-1))/config.size)}</a></li>
          <li class="page-item"><a class="page-link nextpage" title="${config.lang.next}" href="#">${config.rtl?ll:rr}</a></li>
          <li class="page-item"><a class="page-link lastpage" title="${config.lang.last}" href="#">${config.rtl?ll:rr}&#x2503;</a></li>
        </ul>
      `;
    }
    var nextPage=function(){config.page=Math.floor(Math.min(config.page+1,(filteredRecords+config.size-1)/config.size));render();};
    var prevPage=function(){config.page=Math.max(1, config.page-1);render();};
    var lastPage=function(){config.page=Math.floor((filteredRecords+config.size-1)/config.size);render();};
    var firstPage=function(){config.page=1;render();};
    function clearSelection(){if (window.getSelection) {if (window.getSelection().empty) { window.getSelection().empty();} else if (window.getSelection().removeAllRanges) {  window.getSelection().removeAllRanges();}} else if (document.selection) {  document.selection.empty();}}
    
    var getSort=function(){      return config.sort;    };
    var selectRow=function(rownum){
      selected_rownum=rownum;
      (tbody.querySelectorAll(":scope tr.selected")||[]).forEach(e=>e.classList.remove("selected"));
      if(null!==(x=(tbody.querySelector(":scope > tr[data-rownum='"+rownum+"']")))) x.classList.add("selected");
    };
    var showColumn=function(idx,bShow){
      config.columns[idx].visible=bShow;
      redraw();
    };
    var redraw=function(){
      thead.querySelectorAll(":scope tr:not(.filter) th").forEach((th,idx)=>{th.style.display=(config.columns[idx].visible===false?'none':'table-cell')});
      thead.querySelectorAll(":scope tr.filter th").forEach((th,idx)=>{th.style.display=(config.columns[idx].visible===false?'none':'table-cell')});
      drawFooter();
      render();
    };

    var vv=function(item,idx){return config.columns[idx].name!==undefined?(item[config.columns[idx].name]):(item[idx]);};
    var vv2=function(item,idx){return (config.columns[idx].value!==undefined)?(config.columns[idx].value(item)):(vv(item,idx));};
    var ss=function(rownum,idx,v){
      if(config.columns[idx].name!==undefined) data[rownum][config.columns[idx].name]=v; 
      else data[rownum][idx]=v;
    };

    var chart=undefined;
    var wrapper=this.document.createElement("DIV");wrapper.classList.add("fathgrid-wrapper");
    if(config.rtl) wrapper.setAttribute("dir","rtl");
    
    table.parentNode.insertBefore(wrapper,table);

    thead.querySelectorAll("tr th").forEach((th,i) => {if(undefined===config.columns[i]) config.columns[i]={};if(th.innerText==='')th.innerText=config.columns[i].header||config.columns[i].name; else config.columns[i].header=th.innerText;});


    const parts={
      graph:`<div class="graphplaceholder">${graphCanvasHTML}</div>`,
      tools:`
      ${config.graphValues!==undefined && typeof Chart=='function'?`<nav class="fathgrid-graph-nav dropdown" id="graphs${id}"><a href="javascript:void(0)" title="Show graph">
        <svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" >
        <path d="M4 28h28v4h-32v-32h4zM9 26c-1.657 0-3-1.343-3-3s1.343-3 3-3c0.088 0 0.176 0.005 0.262 0.012l3.225-5.375c-0.307-0.471-0.487-1.033-0.487-1.638 0-1.657 1.343-3 3-3s3 1.343 3 3c0 0.604-0.179 1.167-0.487 1.638l3.225 5.375c0.086-0.007 0.174-0.012 0.262-0.012 0.067 0 0.133 0.003 0.198 0.007l5.324-9.316c-0.329-0.482-0.522-1.064-0.522-1.691 0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.657-1.343 3-3 3-0.067 0-0.133-0.003-0.198-0.007l-5.324 9.316c0.329 0.481 0.522 1.064 0.522 1.691 0 1.657-1.343 3-3 3s-3-1.343-3-3c0-0.604 0.179-1.167 0.487-1.638l-3.225-5.375c-0.086 0.007-0.174 0.012-0.262 0.012s-0.176-0.005-0.262-0.012l-3.225 5.375c0.307 0.471 0.487 1.033 0.487 1.637 0 1.657-1.343 3-3 3z"></path></svg>
        </a></nav>
        `:''}
      ${config.selectColumns?`<nav class="fathgrid-columns-nav dropdown" id="columns${id}"><a href="javascript:void(0)">
        <svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" ><g transform="rotate(90 16 16)"><path d="M0 0h8v8h-8zM12 2h20v4h-20zM0 12h8v8h-8zM12 14h20v4h-20zM0 24h8v8h-8zM12 26h20v4h-20z"></path></g></svg>
        </a><div class="dropdown-content">${config.columns.map((c,idx)=>`<a class="${c.visible!==false?'checked':''}" data-i="${idx}" href="#">${c.header||c.name}</a>`).join(' ')}</div></nav>`
        :''}
      ${config.exportable?`<nav class="fathgrid-export-nav dropdown" id="exporter${id}"><a href="javascript:void(0)">
        <svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" ><path d="M23 14l-8 8-8-8h5v-12h6v12zM15 22h-15v8h30v-8h-15zM28 26h-4v-2h4v2z"></path></svg>
        </a><div class="dropdown-content"><a href="javascript:void(0)" title="${config.lang.export}" data-format="txt">TXT</a> <a href="javascript:void(0)" title="${config.lang.export}" data-format="csv">CSV</a> <a href="javascript:void(0)" title="${config.lang.export}" data-format="html">HTML</a> <a href="javascript:void(0)" title="${config.lang.export}" data-format="xls">XLS</a> ${(typeof window.jsPDF=='function')?`<a href="javascript:void(0)" title="${config.lang.export}" data-format="pdf">PDF</a>`:''}</div></nav>`
        :''}
      ${config.printable?`<nav class="fathgrid-print-nav dropdown printgrid${id}"><a href="javascript:void(0)" title="Print">
        <svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" >
        <path d="M8 2h16v4h-16v-4z"></path>
        <path d="M30 8h-28c-1.1 0-2 0.9-2 2v10c0 1.1 0.9 2 2 2h6v8h16v-8h6c1.1 0 2-0.9 2-2v-10c0-1.1-0.9-2-2-2zM4 14c-1.105 0-2-0.895-2-2s0.895-2 2-2 2 0.895 2 2-0.895 2-2 2zM22 28h-12v-10h12v10z"></path>        </svg>        </a></nav>
        `:''}
      `,
      info:(config.pageable)?`<div class="pageinfo${id}">`+renderPageinfo()+`</div>`:'',
      table:`<div id="table-container${id}"></div>`,
      pager:(config.pageable)?`<nav class="paginator${id}">`+renderPaginator()+'</nav>':''
    };
    wrapper.innerHTML=config.template.replace(/{(\w+)}/g, (x, y) => parts[y]);        
    wrapper.querySelector(":scope #table-container"+id).appendChild(table);
    wrapper.querySelectorAll(":scope .fathgrid-columns-nav a").forEach(x=>x.addEventListener("click",function(e){x.classList.toggle("checked");showColumn(x.dataset.i,x.classList.contains("checked"));stop(e);}));
    wrapper.querySelectorAll(":scope .fathgrid-graph-nav a").forEach(x=>x.addEventListener("click",function(e){x.parentElement.classList.toggle('active'); showGraph();stop(e);}));
    wrapper.querySelectorAll(":scope .fathgrid-print-nav a").forEach(x=>x.addEventListener("click",function(e){printGrid();stop(e);}));


    var pageinfos=wrapper.querySelectorAll(`:scope .pageinfo${id}`);
    var paginators=wrapper.querySelectorAll(`:scope .paginator${id}`);
    var exporter=wrapper.querySelector(`#exporter${id}`);
    if(exporter!==null) exporter.querySelectorAll(":scope a").forEach(a=>{a.addEventListener("click",function(e){if(undefined!==e.srcElement.dataset.format) downloadFile(getExportData(e.srcElement.dataset.format),"export."+e.srcElement.dataset.format)})});
    ("fathgrid ").split(" ").forEach(x=>{if(x!=='')table.classList.add(x)});
    
    if(data===null || totalRecords===0) table.querySelectorAll(":scope tbody tr").forEach((tr,idx) => {
      var row=[];
      tr.querySelectorAll(":scope td").forEach(td => {
        row.push(td.innerText);
      });
      row.id=(tr.dataset.id===undefined)?idx+1:tr.dataset.id;
      data.push(row);
    });
    else{
      data=data.map((x,idx)=>{if(undefined===x.id) x.id=idx+1;return x;}); //add IDs to data rows
    }
    data=data.map((x,idx)=>{x.rownum=idx+1;return x;});//add rownum prop

    var tfoot=table.querySelector("TFOOT");;

    var drawFooter=function(){
      if(config.showFooter){
        if(tfoot===null) {
          tfoot=document.createElement("TFOOT");
          table.appendChild(tfoot);
          tfoot.innerHTML=`<tr></tr>`;
        }
        else tfoot.innerHTML='<tr></tr>';

        config.columns.forEach((c,idx)=>{var td=this.document.createElement("TH");td.dataset.i=idx;tfoot.appendChild(td);if(c.visible===false) td.style.display='none';if(c.printable===false) td.classList.add('noprint');  (c.class||'').split(' ').filter(x=>x!='').forEach(c1=>td.classList.add(c1));});
        
      }
    };
    drawFooter();

    var getFilter=function(){
      r=[];
      thead.querySelectorAll(":scope input, select").forEach((i)=>{if(''!=i.value) r[config.columns[i.dataset.i].name]=i.value});
      return r;
    };

    var getData=async function(){
      if(config.serverURL!==undefined){
        const parameters = {
          page: config.page,
          size: config.size,
          search: config.q,
          sort:config.sort.map(i=>config.columns[Math.abs(i)-1].name).join(','),
          order:config.sort.map(i=>i<0?'desc':'asc'),
          filters: Object.keys(getFilter()).map(k=>k+"="+getFilter()[k]).join("&"),
        };
        var url=config.serverURL.replace(/\${(\w+)}/g, (x, y) => parameters[y]),range;
        const ret=await (async function(){
          const res=await fetch(url);
          totalRecords=parseInt(res.headers.get("x-total-count"));
          range=res.headers.get("Content-Range");
          return await config.prepareData( await res.json());
        })();

        data=Array.isArray(ret)?ret:(ret.content!==undefined?ret.content:ret.data);
        
        data=data.map((x,idx)=>{x.rownum=idx+1;return x;});//add rownum prop

        filteredRecords=totalRecords;
        return data;
      }

      totalRecords=data.length;
      fdata=data.filter(x=>{
        var ok=true;

        thead.querySelectorAll(":scope input, select").forEach((i)=>{
          var opts=Array.from(i.querySelectorAll(":scope option:checked"),y=>y.value);
          if(opts.filter(a=>a!='').length>1){
            var ok2=false;
            opts.forEach(y=>{if(y!='' && x[i.dataset.i].includes(y)) ok2=true;});
            if(!ok2) ok=false;
          }
          else if(i.type==='checkbox') {if(i.checked && !isChecked(vv(x,i.dataset.i))) ok=false;}
          else if(i.type==='color') {if(i.value!='#000000' && !(vv(x,i.dataset.i)==i.value)) ok=false;}
          else if(config.columns[i.dataset.i].type==='checkbox'){ if(i.value!='' && !(vv(x,i.dataset.i)==i.value)) ok=false;}
          else if(i.value!='' && (typeof vv(x,i.dataset.i) =='number') && vv(x,i.dataset.i)!=(i.value)) ok=false;
          else if(i.value!='' && (typeof vv(x,i.dataset.i) =='string')&& !vv(x,i.dataset.i).includes(i.value)) ok=false;
          
          if(ok && config.q!=''){
            ok = (config.columns.find((f,ci)=>(typeof vv(x,ci) == 'number'?vv(x,ci)==config.q:(typeof vv(x,ci)=='string'?(vv(x,ci).toLowerCase().includes(config.q.toLowerCase())):(vv(x,ci)==config.q))))!==undefined);
          }
        });
        return ok;
      });
      filteredRecords=fdata.length;
      return fdata.slice((config.page-1)*config.size,config.page*config.size);
    }

    var _renderData=[];
    var renderBody=function(dd=null, update_graph=true){
      if(dd===null) dd=_renderData; else _renderData=dd;
      [...tbody.children].forEach(x=>tbody.removeChild(x));editinput=undefined;//just in case
      if((config.page-1)*config.size >= filteredRecords) config.page=1;
      var lastgroup=null,gg,gtr,gtd,groupdata=[];
      if(chart!==undefined && update_graph) updateGraph();
      dd.forEach((dr,idx)=>{
        
          if(typeof config.groupOn==='function' && lastgroup!==(gg=config.groupOn(dr,idx))){
            if(config.showGroupFooter===true && lastgroup!==null){
              tbody.appendChild(gtr=document.createElement("TR"));gtr.classList.add("group-footer");
              config.columns.forEach((c,i)=>{
                gtr.appendChild(gtd=document.createElement("TD"));gtd.style.display=c.visible!==false?gtd.style.display:'none';
                if(c.printable===false) gtd.classList.add('noprint');
                (c.class||'').split(' ').filter(x=>x!='').forEach(c=>gtd.classList.add(c));
                if((xx=((typeof c.groupFooter=='function')?c.groupFooter(groupdata,c.name||i,gtd,config.decimals):(c.groupFooter||null)))!==null) gtd.innerHTML='<b>'+xx+'</b>';
              });
            }
            tbody.appendChild(gtr=document.createElement("TR"));gtr.appendChild(document.createElement("TD"));
            gtr.classList.add("group-row");
            gtr.querySelector(":scope TD").setAttribute("colspan",config.columns.filter(x=>x.visible!==false).length);
            gtr.querySelector(":scope TD").innerHTML=`<b>${gg}</b>`;
            lastgroup=gg;
            groupdata=[];
          }

          var r=document.createElement("tr");
          r.dataset.id=dr.id;
          r.dataset.rownum=dr.rownum;
          if(typeof config.rowClass=='function' && (cs=config.rowClass(dr,idx)) && typeof cs=='string') cs.split(" ").forEach(c=>(c!=''?r.classList.add(c):c));
          
          config.columns.forEach((column,col)=>{
            var c=document.createElement('td');
            if(column.visible===false) c.style.display="none";
            (column.class||'').split(' ').filter(x=>x!='').forEach(c1=>c.classList.add(c1));
            var x=column.value!==undefined?(column.value(dr)):(column.name!==undefined?dr[column.name]:dr[col]);
            if(column.type=='checkbox') {
              c.innerHTML=`<input type="checkbox" ${(x=='1'||x=='true'||x===true||x=='yes'||x=='on')?'checked':''} ${((column.editable===false ||(typeof column.editable =='function' && column.editable(dr,col+1)===false)) || config.editable==false)?'disabled':''} />`;
              c.querySelector(":scope input[type=checkbox]").addEventListener("click",function(e){
                config.onChange(dr,col,!e.srcElement.checked,e.srcElement.checked);
              });
            }
            else if(column.html!==undefined) c.innerHTML=column.html(dr);
            else c.innerText=x;
            if(column.printable===false) c.classList.add('noprint');
            r.appendChild(c);

          })
          tbody.appendChild(r);
          if(undefined!==config.groupOn && config.showGroupFooter===true) groupdata.push(dr);
      });
      //copy of code from above to draw last group footer
      
      if(undefined!==config.groupOn && config.showGroupFooter===true){
        tbody.appendChild(gtr=document.createElement("TR"));gtr.classList.add("group-footer");
        config.columns.forEach((c,i)=>{
          gtr.appendChild(gtd=document.createElement("TD"));gtd.style.display=c.visible!==false?gtd.style.display:'none';
          (c.class||'').split(' ').filter(x=>x!='').forEach(c1=>gtd.classList.add(c1));
          if(c.printable===false) gtd.classList.add('noprint');
          if((xx=((typeof c.groupFooter=='function')?c.groupFooter(groupdata,c.name||i,gtd,config.decimals):(c.groupFooter||null)))!==null) gtd.innerHTML='<b>'+xx+'</b>';
        });
        groupdata=[];
      }
      


      if(config.pageable){
        pageinfos.forEach(pageinfo=>pageinfo.innerHTML=renderPageinfo());
        paginators.forEach(paginator=>{
          paginator.innerHTML=renderPaginator();
          paginator.querySelectorAll(".nextpage").forEach(x=>{x.addEventListener('click',function(e){nextPage();stop(e);})});
          paginator.querySelectorAll(".prevpage").forEach(x=>{x.addEventListener('click',function(e){prevPage();stop(e);})});
          paginator.querySelectorAll(".lastpage").forEach(x=>{x.addEventListener('click',function(e){lastPage();stop(e);})});
          paginator.querySelectorAll(".firstpage").forEach(x=>{x.addEventListener('click',function(e){firstPage();stop(e);})});
          paginator.querySelectorAll(".gotopage").forEach(x=>{x.addEventListener('click',function(e){
            x.innerHTML=`<input id="gotopage" style="width:3em;text-align:center;" type="number" min="1" max="${(filteredRecords+config.size-1)/config.size}" value="${config.page}"/>`;
            var gti=x.querySelector(":scope input");
            gti.focus();
            gti.select();
            gti.addEventListener("change",function(e){
              config.page=Math.max(1,parseInt(e.srcElement.value));stop(e);render()
            })
          })});
        });
      }

      tbody.querySelectorAll("td").forEach(x=>{x.addEventListener("click",function(e){
        selectRow(e.srcElement.parentElement.closest("TR").dataset.rownum);
        config.onClick(data[selected_rownum-1],[...e.srcElement.parentElement.closest("TR").children].indexOf(e.srcElement.closest("TD"))+1,e.srcElement.closest("TD"));
      })});

      if(tfoot!==null){
        tfoot.querySelectorAll(":scope th").forEach((td,idx)=>{if(undefined!==config.columns[idx].footer) 
          if((xx=((typeof config.columns[idx].footer==='function')?config.columns[idx].footer(fdata,config.columns[idx].name||idx,td,config.decimals):config.columns[idx].footer||null))!==null) td.innerHTML=xx;
        });
      }
      config.onRender();
      config.onInitTable(tbody);
    
    }

    var render=function(){
        table.querySelectorAll(":scope tbody tr").forEach(tr => {tr.parentNode.removeChild(tr);});
        tbody.innerHTML=`<tr><td colspan="${config.columns.length}">${config.loading||config.lang.loading}</td></tr>`;
        getData().then(dd=>{          renderBody(dd);        });
        

    };
    var sort=function(i,desc,multisort,wantRender){
      var ss=config.sort;
      config.sort=ss.map(x=>(x==i || x==-i)?-x:x);
      if(!multisort) config.sort=[(desc===true || (ss.find(x=>x==i)!==undefined))?-i:i];

      if((ss.find(x=>x==i||x==-i)===undefined)) if(multisort) config.sort.push((desc===true)?-i:i);

      if(config.sortBy!==undefined) config.sort=[...(config.sortBy.filter(x=>!config.sort.includes(x))), ...config.sort];

      data.sort((a,b)=>{
        for(var f=0;f<config.sort.length;f++){
          var i1=Math.abs(config.sort[f])-1,ds=config.sort[f]<0;
          a1=('number'==typeof vv2(a,i1))?(vv2(a,i1)):vv2(a,i1).replace(/(<([^>]+)>)/gi,"");
          b1=('number'==typeof vv2(b,i1))?(vv2(b,i1)):vv2(b,i1).replace(/(<([^>]+)>)/gi,"");
          if(a1!==b1) return (((ds===true))?-1:1)*(isNaN(parseFloat(a1))? ( (a1<b1?-1:(a1>b1)?1:0) ) :(a1-b1));
        }
        return 0;
      });
      data=data.map((x,idx)=>{x.rownum=idx+1;return x;});//add rownum prop

      if(thead.querySelector("th.sorted")!==null) thead.querySelectorAll(":scope th.sorted").forEach(a=>a.classList.remove("sorted"));
      if(thead.querySelector("th.sorted-desc")!==null) thead.querySelectorAll(":scope th.sorted-desc").forEach(a=>a.classList.remove("sorted-desc"));
      config.sort.forEach(x=>{
        thead.querySelector(":scope th:nth-child("+(Math.abs(x))+")").classList.add((x<0)?"sorted-desc":"sorted");
      });
      
      if(wantRender!==false) render();
    };

    thead.innerHTML='';
    if(thead.querySelectorAll(":scope th").length===0) {
      var tr=document.createElement("TR");
      thead.appendChild(tr);
      config.columns.forEach((c,i)=>{tr.appendChild(th=document.createElement("TH"));th.innerText=c.header||c.name;if(c.visible===false) th.style.display="none";th.dataset.name=c.name||i;if(c.printable===false) th.classList.add('noprint');(c.class||'').split(' ').filter(x=>x!='').forEach(c1=>th.classList.add(c1));});
    }

    if(config.sortBy!==this.undefined) {config.sortBy.map(c=>sort(c,false,true,false));}

    if(config.sortable) thead.querySelectorAll("tr th").forEach((th,i) => {th.style.cursor="pointer";th.addEventListener('click',function(e){sort(i+1,undefined,e.shiftKey);stop(e);clearSelection()});});

    if(config.filterable){
        var r=document.createElement("TR");r.classList.add("filter");
        config.columns.forEach((c,idx) => {
          var f=document.createElement("TH");
          var i=undefined;
          if(config.columns[idx].filterable===undefined || config.columns[idx].filterable!==false){
            if(config.columns[idx]!==undefined && config.columns[idx].filter!==this.undefined) {
                i=document.createElement("SELECT");i.add(document.createElement("OPTION"));
                //i.setAttribute("multiple","multiple");
                var ff=config.columns[idx].filter;
                if(null===ff) {ff=[];data.forEach(v=>{if(!ff.includes(vv(v,idx)))ff.push(vv(v,idx))});ff.sort();}
                ff.forEach(v=>{var o=document.createElement("OPTION");o.innerText=((typeof v == 'object')?v.name:v);o.value=(typeof v =='object')?v.value:v;i.add(o);});
            } else {
              i=document.createElement("INPUT");
              i.setAttribute("type",(undefined===config.columns[idx])?'text':config.columns[idx].type);
            }
            
            i.style.width="100%";
            if(config.columns[idx].visible===false) f.style.display='none';

            i.dataset.i=idx;
            f.append(i);
          }
          if(c.printable===false) f.classList.add("noprint");
          r.append(f);
        });
        thead.append(r);
        r.querySelectorAll(":scope input, select").forEach(i=>{i.addEventListener("change",function(e){render();});});
        config.onInitFilter(r);
    }


    var stop=function(e){e.preventDefault();e.stopPropagation();};
    var isChecked=function(v){return v==config.lang.yes||v=='yes'||v=='true'||v===true||v=='on'||v==1||v=='1';};

    var editNext=function(rownum,col){
      var r=rownum,c=col;
      while(undefined!==data[rownum-1]){
        col++;
        var column=config.columns[col-1];
        if((undefined!==column && (column.editable!==false || ((typeof column.editable ==="function") && column.editable(data[rownum-1],col)!==false)) && (column.type!=='checkbox'))) {
          return editCell(rownum,col);
        }
        if(col>config.columns.length) {col=0;rownum++;}
      }
      editCell(r,c);
    }
    var editPrev=function(rownum,col){
      var r=rownum,c=col;
      while(undefined!==data[rownum-1]){
        col--;
        if(col<1) {col=config.columns.length+1;rownum--;}
        var column=config.columns[col-1];
        if((undefined!==column && (column.editable!==false || ((typeof column.editable ==="function") && column.editable(data[rownum-1],col)!==false)) && (column.type!=='checkbox'))) {
          return editCell(rownum,col);
        }
      }
      editCell(r,c);
    }

    var editCell=function(rownum,col){
      if(!config.editable) return;

      if(editinput!==undefined) {
        var newval=editinput.value;//editinput.value!=''?editinput.value:editinput.dataset.originalvalue;
        
        if(!editinput.checkValidity()) return editinput.classList.add("error");

        var old=vv(data[editinput.dataset.rownum-1],editinput.dataset.col-1);
        ss(editinput.dataset.rownum-1,editinput.dataset.col-1,newval);
        if(old==newval || false!==config.onChange(data[editinput.dataset.rownum-1],editinput.dataset.col,old,newval)){
          editinput.remove();editinput=undefined;
          renderBody();
        }else {
          ss(editinput.dataset.rownum-1,editinput.dataset.col-1,old);
          editinput.classList.add("error");
          return;//reject edit
        }
      }
      
      var column=config.columns[col-1];
      if(undefined!==column && (column.editable===false || ((typeof column.editable ==="function") && column.editable(data[rownum-1],col)===false))) return;
      if(column.type==='checkbox') return;
      

      var coltype=(undefined!==column && undefined!==column.type)?(column.type):'text';
      var t=vv(data[rownum-1],col-1);
      var el=tbody.querySelector(":scope > tr[data-rownum='"+rownum+"'] td:nth-child("+col+")");
      var i=null;
      if(undefined!==column && column.listOfValues!==undefined){
        el.innerHTML=`<select style="width:100%;" id="coledit"  ></select>`;
        i=el.querySelector(":scope #coledit");
        var lov=column.listOfValues;if(typeof lov=="function") lov=lov(data[rownum-1],col,el);

        lov.forEach(v=>{var o=document.createElement("OPTION");o.innerText=(undefined===v.name)?v:v.name;o.value=(undefined==v.value)?v:v.value;if(o.value==vv(data[rownum-1],col-1))o.setAttribute("selected","selected");i.add(o);});
        i.focus();
        i.addEventListener("change",function(e){if(vv(data[rownum-1],col-1)!=e.srcElement.value) config.onChange(data[rownum-1],col,vv(data[rownum-1],col-1),e.srcElement.value);});
      }
      else {
        
        el.innerHTML=column.type=='textarea'?(`<textarea id="coledit" style="width:${el.clientWidth}px;height:${el.clientHeight}px" ></textarea>`):`<input type="${coltype}" ${column.title!==undefined?`title="${column.title}"`:''} ${column.pattern!==undefined?`pattern="${column.pattern}"`:''} style="width:100%;" id="coledit" value=""/>`;
        i=el.querySelector(":scope #coledit");
        i.value=t;
        i.focus();
        i.select();
      }
      
      i.addEventListener("click",function(ev){ev.stopPropagation();});
      i.dataset.originalvalue=t;i.dataset.rownum=rownum;i.dataset.col=col;

      i.addEventListener("keydown",function(e){
        if(undefined===rownum) return;

        switch(e.which){
          case 27://esc
            editinput=undefined;render();
            break;
          case 38://up
            if([...el.parentElement.parentElement.children].indexOf(el.parentElement) > 0) {
              stop(e);
              editCell(rownum-1,col);
            }
            break;
          case 40://down
            if(el.parentElement.nextSibling!==null) {
              stop(e);
              editCell(rownum+1,col);
            }
            break;
          case 37://left
            if(e.shiftKey) {
              stop(e);
              editPrev(rownum,col);
            }
            break;
          case 13: case 9:
            {
              stop(e);
              editNext(rownum,col);
            }
            break;
          case 39://right
            if(e.shiftKey && el.nextSibling!==null) {
              stop(e);
              editNext(rownum,col);
            }
            break;
        }
      });
      editinput=i;
      config.onInitInput(data[rownum-1],column.name||col,el);
    };
    var downloadFile=function(blob,filename,type="text/plain"){
        if(typeof blob=='object') {blob.save(filename);return;}
        const url = win.URL.createObjectURL(new Blob([blob], { type }));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = (undefined===filename)?'export.txt':filename;
        document.body.appendChild(a);
        a.click();
        win.URL.revokeObjectURL(url);
    }
    var getExportData=function(fmt){
      var ret="";
      if(fmt=="txt") data.forEach(r=>{ret+="\n";Object.keys(r).forEach(k=>{ret+=r[k]+"\t"})});
      if(fmt=="csv") {ret+="sep=,\n";data.forEach(r=>{Object.keys(r).forEach(k=>{ret+="\""+(''+r[k]).replace("\"","\\\"")+"\","});ret+="\n";});}
      if(fmt=="html" || fmt=='xls') {ret+="<table><tbody>"+data.map(r=>{return "<tr>"+Object.keys(r).map(k=>{return "<td>"+r[k]+"</td>"}).join('')+"</tr>";}).join('')+"</tbody></table>";}
      if(fmt=='xls'){
        const TEMPLATE_XLS = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <head><!--[if gte mso 9]><xml>
        <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{title}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>
        <![endif]--></head>
        <body>{table}</body></html>`;

        const parameters = {
          title: "Export",
          table: ret,
        };
        return TEMPLATE_XLS.replace(/{(\w+)}/g, (x, y) => parameters[y]);        
      }
      if(fmt=='pdf'){
        var doc = new jsPDF('p','cm','A4');  
        doc.setFontSize(9);
        doc.setLineWidth(0.025);
        var x=1;var y=1;var ii=0,pg=1;
        var cw=[],cww=0;table.querySelectorAll(":scope thead tr:nth-child(1) th").forEach(x=>{cww+=x.clientWidth;cw.push(x.clientWidth)});
        table.querySelectorAll(":scope thead tr:nth-child(1) th").forEach(f=>{
          var w=doc.getTextWidth(f.innerText);
          if(cw[ii]) doc.text(f.innerText,x,y,{maxWidth:(cw[ii]/cww)*20-0.1});
          x+=(cw[ii++]/cww)*20;
        });
        y+=0.3;
        var lastgroup=null,groupdata=[];
        data.forEach((r,idx)=>{
          if(typeof config.groupOn==='function' && lastgroup!==(gg=config.groupOn(r,idx))){
            doc.setFontType("bold")
            if(config.showGroupFooter===true && lastgroup!==null){
              doc.line(1,y-.4,20,y-.4);
              config.columns.forEach((c,ic)=>{
                doc.text(''+(typeof c.groupFooter=='function'?c.groupFooter(groupdata,c.name||ic,null,config.decimals):(undefined===c.groupFooter?'':c.groupFooter)),x,y,{});
                x+=(cw[ic]/cww)*20;
              });
              doc.line(1,y+.2,20,y+.2);
              y+=0.5;
            }
            doc.text(gg,1,y,{maxWidth:(cw[ii]/cww)*20-0.1});
            doc.setFontType("normal")
            y+=0.5;
            x=1;
            lastgroup=gg;
            groupdata=[];
          }


          ii=0;
          var lines=0;
          config.columns.forEach((c,ic)=>{
            var ct=vv2(r,ic);
            if(undefined!==ct){
              var w=doc.getTextWidth(ct);
              if(cw[ii]) {
                doc.text(''+ct,x,y,{maxWidth:(cw[ii]/cww)*20-0.1});
                lines=Math.max(lines,w/((cw[ii]/cww)*20-0.1));
              }
            }
            x+=(cw[ii++]/cww)*20;
          });
          x=1;y+=.3*(1+Math.floor(lines+0.9999));
          doc.line(1,y-.35,20,y-.35);

          if(y>28){doc.text(''+pg++,10,29); doc.addPage();y=1;doc.setLineWidth(0.025);doc.line(1,y-.35,20,y-.35);}
          if(undefined!==config.groupOn && config.showGroupFooter===true) groupdata.push(r);
        });        
        doc.text(''+pg++,10,29);
        doc.setFontType("bold")
        if(config.showGroupFooter===true && lastgroup!==null){
          doc.line(1,y-.4,20,y-.4);
          x=1;
          config.columns.forEach((c,ic)=>{
            doc.text(''+(typeof c.groupFooter=='function'?c.groupFooter(groupdata,c.name||ic,null,config.decimals):(c.groupFooter===undefined?'':c.groupFooter)),x,y,{});
            x+=(cw[ic]/cww)*20;
          });
          doc.line(1,y+.2,20,y+.2);
        }

        doc.line(1,y-0.4,20,y-0.4);
        return doc;
      }
      return ret;
    }

    const colors=[
      'rgb(54, 162, 235)',
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(153, 102, 255)',
      'rgb(75, 192, 192)',
      'rgb(201, 203, 207)'
    ];
    var updateGraph=function(){
      if (chart===undefined) return;
      var dd=config.graphValues(fdata),ci=0;
      chart.data={
        labels: dd.labels,
        datasets: Array.isArray(dd.values[0])?dd.values.map((x,idx)=>({label:dd.title[idx],data:x,borderWidth:1,backgroundColor: colors[ci],borderColor: colors[ci++],fill:false})):[{
          label: dd.title,
          data: dd.values,
          borderWidth: 1,
          backgroundColor: colors[ci],borderColor: colors[ci++],
        }]
      };
      chart.update({duration:0});
    }
    var showGraph=function(){
      var dd=config.graphValues(fdata);
      if (chart!==undefined) {chart.destroy();chart=undefined;wrapper.querySelector(".graphplaceholder").innerHTML=graphCanvasHTML; }
      var ctx=wrapper.querySelector(":scope .graphplaceholder canvas");
      if(wrapper.querySelector(":scope .graphplaceholder").style.display=='block') {wrapper.querySelector(":scope .graphplaceholder").style.display='none';return;}
      wrapper.querySelector(":scope .graphplaceholder").style.display='block';
      var ci=0;
      chartConfig={
        type: config.graphType,
        data: {
            labels: dd.labels,
            datasets: Array.isArray(dd.values[0])?dd.values.map((x,idx)=>({label:dd.title[idx],data:x,borderWidth:1,backgroundColor: colors[ci],borderColor: colors[ci++],fill:false})):[{
              label: dd.title,
              data: dd.values,
              borderWidth: 1,
              backgroundColor: colors[ci],borderColor: colors[ci++],
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
      };
      chart = new Chart(ctx, chartConfig);
  
    }


    var printGrid=function(){
      var _page=config.page,_size=config.size;
      config.page=1;config.size=fdata.length;
      getData().then(dd=>{
        renderBody(dd,false);       
        var WinPrint = window.open();
        WinPrint.document.write(`<!doctype html><html lang="en"><head>${document.head.innerHTML}<style>table .noprint {display:none}</style></head><body>`);
        WinPrint.document.write(`<h1>${(document.querySelector("h1")||document.querySelector("TITLE")).innerText}</h1><div class="fathgrid-wrapper">`);
        WinPrint.document.write(((chart!==undefined)?wrapper.querySelector(":scope .graphplaceholder").innerHTML:'')+table.parentElement.innerHTML);
        WinPrint.document.write(`</div></body></html>`);
        WinPrint.document.close();
        WinPrint.setTimeout(()=>{
          if(chart!==undefined && WinPrint.document.querySelector("canvas")) WinPrint.document.querySelector("canvas").getContext('2d').drawImage(wrapper.querySelector("canvas"),0,0);
          WinPrint.focus();
          WinPrint.print();
          WinPrint.close();
        },1000);
        config.page=_page;config.size=_size;
        render();
      });
    }


    render();
    return {
      id:id,
      render:render,
      nextPage:nextPage,
      prevPage:prevPage,
      lastPage:lastPage,
      firstPage:firstPage,
      sort:sort,
      setPageSize:function(x){config.size=parseInt(x);config.page=1;render();},
      getPageSize:function(){return config.size;},
      getSort:getSort,
      setSort:function(ss){if(typeof ss=='number') ss=[ss];config.sort=[];ss.map(x=>sort(Math.abs(x),x<0,true));render();},
      filter:function(idx,str){thead.querySelector(".filter th:nth-child("+idx+")").querySelector(":scope input, select").value=str;render();},
      getFilter:getFilter,
      editCell:editCell,
      getData:function(){return data.map(x=>x);},
      setData:function(newdata){data=[];newdata.map((x,idx)=>{x.rownum=idx+1;data.push(x)});render();},
      getExportData:getExportData,
      export:function(fmt='txt',filename='export'){downloadFile(getExportData(fmt),filename+'.'+fmt,(fmt=='xls'?'application/vnd.ms-excel;base64,':'text/plain'));},
      search:function(q){if(q===undefined) return config.q; config.q=q;render();},
      getSelectedItem:function(){return selected_rownum?data[selected_rownum-1]:null;},
      setServerURL:function(u){config.serverURL=u;render();},
      wrapperEl:wrapper,
      showSubgrid:function(tt,_html=''){
        var a=tbody.querySelectorAll(":scope tr.subgrid");
        var el=tbody.querySelector(":scope > tr.selected");
        el.insertAdjacentHTML('afterend',`<tr class="subgrid"><td colspan="${config.columns.length}" >${_html}</td></tr>`);
        el.nextSibling.querySelector(":scope td").appendChild(tt.wrapperEl);
        a.forEach(x=>x.parentElement.removeChild(x))
      },
      selectRow:selectRow,
      insertRow:function(rownum,item){ if(rownum===null) rownum=data.length+1;;data.splice(rownum-1,0,item);data.map((x,idx)=>{x.rownum=idx+1;return x;});render()},
      deleteRow:function(rownum){ data.splice(rownum-1,1);data.map((item,idx)=>{item.rownum=idx+1;return item;});render()},
      refresh:renderBody
    }
  }
  win.FathGrid.SUM=function(data,cname,el,_decimals=2){return (data.map(x=>parseFloat(x[cname].replace('$',''))).reduce((x,s)=>x+s,0)).toFixed(_decimals)}
  win.FathGrid.AVG=function(data,cname,el,_decimals=2){return data.length?(data.map(x=>parseFloat(x[cname].replace('$',''))).reduce( ( p, c ) => p + c, 0 ) / data.length).toFixed(_decimals):null;}
  win.FathGrid.MIN=function(data,cname,el,_decimals=2){var y=data[0][cname];if( typeof y=='number') return Math.min(...(data.map(x=>x[cname]))).toFixed(_decimals);data.map(x=>y=((y<x[cname])?y:x[cname]));return y;}
  win.FathGrid.MAX=function(data,cname,el,_decimals=2){var y=data[0][cname];if( typeof y=='number') return Math.max(...(data.map(x=>x[cname]))).toFixed(_decimals);data.map(x=>y=((y>x[cname])?y:x[cname]));return y;}
  
})(typeof window !== "undefined" ? window : this));

