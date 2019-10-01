;var style = document.createElement('style');
style.setAttribute("id","FathGrid_styles");
style.innerHTML = `
  .fathgrid th.sorted, th.sorted-desc {position: relative;}
  .fathgrid th.sorted::after {content:"▲";position:absolute;right: 1em;}
  .fathgrid th.sorted-desc::after {content:"▼";position:absolute;right: 1em;}
  .fathgrid-export-nav, .fathgrid-columns-nav {float:right;}
  .fathgrid-wrapper {position:relative;}
  .fathgrid-wrapper .page-info {position:absolute;top:0}
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
        paginable:true,
        exportable:true,
        showFooter:false,
        selectColumns:false,
        showGroupFooter:false,
        sort:[],
        columns:[],
        onRender:function(){},
        onClick:function(data,col,el){editCell(data.rownum,col)},
        onChange:function(data,col,old,value){},
        rowClass:null,
        data:null,
        q:'',
        loading:'Loading...',
        ..._config
    };
    var selected_rownum=null, totalRecords=0, filteredRecords=0;
    var data=config.data===null?[]:config.data;
    if(typeof data==='string') {
      (async()=>{
        const res=await fetch(data).then(d=>d.json());
        data=await res.json();
      })();
    }

    var table=document.getElementById(id)||document.body.appendChild(table=document.createElement("TABLE"));
    var tbody=table.querySelector(":scope tbody") || table.appendChild(tbody=document.createElement("TBODY"));
    var thead=table.querySelector(":scope thead") || table.insertBefore(thead=document.createElement("THEAD"),tbody);
    
    if(thead.querySelectorAll(":scope th").length===0) {
      var tr=document.createElement("TR");
      thead.appendChild(tr);
      config.columns.forEach((c,i)=>{tr.appendChild(th=document.createElement("TH"));if(c.visible===false) th.style.display="none";th.dataset.name=c.name||i;(c.class||'').split(' ').filter(x=>x!='').forEach(c1=>th.classList.add(c1));});
    }
    
    var editinput=undefined;

    var renderPaginator=function(){
      return `
        <ul class="pagination" >
          <li class="page-item"><a class="page-link firstpage" title="First" href="#">&#x2503;&#x23F4;</a></li>
          <li class="page-item"><a class="page-link prevpage" title="Previous" href="#">&#x23F4;</a></li>
          <li class="page-item active"><a class="page-link gotopage" title="Goto page" href="javascript:void(0)">${config.page} / ${Math.floor((filteredRecords+(config.size-1))/config.size)}</a></li>
          <li class="page-item"><a class="page-link nextpage" title="Next" href="#">&#x23f5;</a></li>
          <li class="page-item"><a class="page-link lastpage" title="Last" href="#">&#x23f5;&#x2503;</a></li>
        </ul><span class="page-info">${(config.page-1)*config.size}-${Math.min(filteredRecords,config.page*config.size)} of ${totalRecords!=filteredRecords?`${filteredRecords}/ `:''} ${totalRecords}</span>
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

    var wrapper=this.document.createElement("DIV");wrapper.classList.add("fathgrid-wrapper");
    table.parentNode.insertBefore(wrapper,table);
    wrapper.appendChild(table);

    if(config.paginable) table.insertAdjacentHTML('afterend', `<nav id="paginator${id}">`+renderPaginator()+'</nav>');

    if(config.selectColumns) {
      table.insertAdjacentHTML("beforebegin",`<nav class="fathgrid-columns-nav dropdown" id="columns${id}"><a href="javascript:void(0)">
        <svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" ><g transform="rotate(90 16 16)"><path d="M0 0h8v8h-8zM12 2h20v4h-20zM0 12h8v8h-8zM12 14h20v4h-20zM0 24h8v8h-8zM12 26h20v4h-20z"></path></g></svg>
        </a><div class="dropdown-content">${config.columns.map((c,idx)=>`<a class="${c.visible!==false?'checked':''}" data-i="${idx}" href="#">${c.header||c.name}</a>`).join(' ')}</div></nav>`);
      wrapper.querySelectorAll(":scope .fathgrid-columns-nav a").forEach(x=>x.addEventListener("click",function(e){x.classList.toggle("checked");showColumn(x.dataset.i,x.classList.contains("checked"));stop(e);}));
    }

    if(config.exportable) table.insertAdjacentHTML('beforeBegin', `<nav class="fathgrid-export-nav dropdown" id="exporter${id}"><a href="javascript:void(0)">
    <svg style="display:block-inline;width:1.5em;margin:4px;stroke-width: 0;stroke: currentColor;fill: currentColor;" viewBox="0 0 32 32" ><path d="M23 14l-8 8-8-8h5v-12h6v12zM15 22h-15v8h30v-8h-15zM28 26h-4v-2h4v2z"></path></svg>
    </a><div class="dropdown-content"><a href="javascript:void(0)" title="Export" data-format="txt">TXT</a> <a href="javascript:void(0)" title="Export" data-format="csv">CSV</a> <a href="javascript:void(0)" title="Export" data-format="html">HTML</a> <a href="javascript:void(0)" title="Export" data-format="xls">XLS</a> ${(typeof window.jsPDF=='function')?`<a href="javascript:void(0)" title="Export" data-format="pdf">PDF</a>`:''}</div></nav>`);
    var paginator=table.parentElement.querySelector(`#paginator${id}`);
    var exporter=table.parentElement.querySelector(`#exporter${id}`);
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

        config.columns.forEach((c,idx)=>{var td=this.document.createElement("TH");td.dataset.i=idx;tfoot.appendChild(td);if(c.visible===false) td.style.display='none';(c.class||'').split(' ').filter(x=>x!='').forEach(c1=>td.classList.add(c1));});
        
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
          return await res.json();
        })();

        data=Array.isArray(ret)?ret:(ret.content!==undefined?ret.content:ret.data);
        
        data=data.map((x,idx)=>{x.rownum=idx+1;return x;});//add rownum prop

        filteredRecords=totalRecords;
        return data;
      }

      totalRecords=data.length;
      var fdata=data.filter(x=>{
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
            ok = (config.columns.find((f,ci)=>(typeof vv(x,ci) == 'number'?vv(x,ci)==config.q:(typeof vv(x,ci)=='string'?(vv(x,ci).includes(config.q)):(vv(x,ci)==config.q))))!==undefined);
          }
        });
        return ok;
      });
      filteredRecords=fdata.length;
      return fdata.slice((config.page-1)*config.size,config.page*config.size);
    }

    var renderBody=function(dd){

      [...tbody.children].forEach(x=>tbody.removeChild(x));
      if((config.page-1)*config.size >= filteredRecords) config.page=1;

      var lastgroup=null,gg,gtr,gtd,groupdata=[];
      dd.forEach((dr,idx)=>{
        
          if(typeof config.groupOn==='function' && lastgroup!==(gg=config.groupOn(dr,idx))){
            if(config.showGroupFooter===true && lastgroup!==null){
              tbody.appendChild(gtr=document.createElement("TR"));gtr.classList.add("group-footer");
              config.columns.forEach((c,i)=>{
                gtr.appendChild(gtd=document.createElement("TD"));gtd.style.display=c.visible!==false?gtd.style.display:'none';
                (c.class||'').split(' ').filter(x=>x!='').forEach(c=>gtd.classList.add(c));
                gtd.innerHTML=(typeof c.groupFooter=='function')?c.groupFooter(groupdata):(c.groupFooter===undefined?'':c.groupFooter);
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
          gtd.innerHTML=(typeof c.groupFooter=='function')?c.groupFooter(groupdata):(c.groupFooter===undefined?'':c.groupFooter);
        });
        groupdata=[];
      }
      


      if(config.paginable){
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
      }

      tbody.querySelectorAll("td").forEach(x=>{x.addEventListener("click",function(e){
        selectRow(e.srcElement.parentElement.closest("TR").dataset.rownum);
        config.onClick(data[selected_rownum-1],[...e.srcElement.parentElement.closest("TR").children].indexOf(e.srcElement.closest("TD"))+1,e.srcElement.closest("TD"));
      })});

      if(tfoot!==null){
        tfoot.querySelectorAll(":scope th").forEach((td,idx)=>{if(undefined!==config.columns[idx].footer) td.innerHTML=(typeof config.columns[idx].footer==='function')?config.columns[idx].footer(dd,td):config.columns[idx].footer});
      }
      config.onRender();            
    
    }

    var render=function(){
        table.querySelectorAll(":scope tbody tr").forEach(tr => {tr.parentNode.removeChild(tr);});

        tbody.innerHTML=`<tr><td colspan="${config.columns.length}">${config.loading}</td></tr>`;
        getData().then(dd=>{
          renderBody(dd);
        });

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


    if(config.sortBy!==this.undefined) {config.sortBy.map(c=>sort(c,false,true,false));}

    thead.querySelectorAll("tr th").forEach((th,i) => {if(undefined===config.columns[i]) config.columns[i]={};if(th.innerText==='')th.innerText=config.columns[i].header||config.columns[i].name;});

    if(config.sortable) thead.querySelectorAll("tr th").forEach((th,i) => {th.style.cursor="pointer";th.addEventListener('click',function(e){sort(i+1,undefined,e.shiftKey);stop(e);clearSelection()});});

    if(config.filterable){
        var r=document.createElement("TR");r.classList.add("filter");
        thead.querySelectorAll("tr th").forEach((th,idx) => {
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
          r.append(f);
        });
        thead.append(r);
        r.querySelectorAll(":scope input, select").forEach(i=>{i.addEventListener("change",function(e){render();});});
    }


    var stop=function(e){e.preventDefault();e.stopPropagation();};
    var isChecked=function(v){return v=='yes'||v=='true'||v===true||v=='on'||v==1||v=='1';};

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
        if(false!==config.onChange(data[editinput.dataset.rownum-1],editinput.dataset.col,old,newval)){
          var td=editinput.parentElement,dr=data[editinput.dataset.rownum-1],cr=editinput.dataset.col-1,column=config.columns[cr];
          editinput.remove();editinput=undefined;
          renderBody(data);
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
        i.addEventListener("change",function(e){config.onChange(data[rownum-1],col,data[rownum-1][col-1],e.srcElement.value);});
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
            if(el.nextSibling!==null) {
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
      if(fmt=="csv") {ret+="sep=,\n";data.forEach(r=>{Object.keys(r).forEach(k=>{ret+="\""+r[k].replace("\"","\\\"")+"\","});ret+="\n";});}
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
        var x=1;var y=1;var ii=0;
        var cw=[],cww=0;table.querySelectorAll(":scope thead tr:nth-child(1) th").forEach(x=>{cww+=x.clientWidth;cw.push(x.clientWidth)});
        table.querySelectorAll(":scope thead tr:nth-child(1) th").forEach(f=>{
          var w=doc.getTextWidth(f.innerText);
          doc.text(f.innerText,x,y,{maxWidth:(cw[ii]/cww)*20-0.1});
          x+=(cw[ii++]/cww)*20;
        });
        y+=0.3;
        data.forEach(r=>{
          ii=0;
          var lines=0;
          Object.keys(r).forEach(k=>{
            var w=doc.getTextWidth(r[k]);
            doc.text(''+r[k],x,y,{maxWidth:(cw[ii]/cww)*20-0.1});
            lines=Math.max(lines,w/((cw[ii]/cww)*20-0.1));
            x+=(cw[ii++]/cww)*20;
          });
          x=1;y+=.3*(1+Math.floor(lines+0.99));
          doc.line(1,y-.35,20,y-.35);

          if(y>28){doc.addPage();y=1;doc.setLineWidth(0.025);}
        });        
        doc.line(1,y-0.4,20,y-0.4);
        return doc;
      }
      return ret;
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
      setData:function(newdata){data=[];newdata.map(x=>data.push(x));render();},
      getExportData:getExportData,
      export:function(fmt='txt',filename='export'){downloadFile(getExportData(fmt),filename+'.'+fmt,(fmt=='xls'?'application/vnd.ms-excel;base64,':'text/plain'));},
      search:function(q){if(q===undefined) return config.q; config.q=q;render();},
      getSelectedItem:function(){return selected_rownum?data[selected_rownum-1]:null;},
      setServerURL:function(u){config.serverURL=u;render();},
      wrapperEl:wrapper,
      showSubgrid:function(el,tt,_html=''){
        var a=tbody.querySelectorAll(":scope tr.subgrid");
        el.insertAdjacentHTML('afterend',`<tr class="subgrid"><td colspan="${config.columns.length}" >${_html}</td></tr>`);
        el.nextSibling.querySelector(":scope td").appendChild(tt.wrapperEl);
        a.forEach(x=>x.parentElement.removeChild(x))
      },
      selectRow:selectRow,
      insertRow:function(rownum,item){ if(rownum===null) rownum=data.length+1;;data.splice(rownum-1,0,item);data.map((x,idx)=>{x.rownum=idx+1;return x;});render()},
      deleteRow:function(rownum){ data.splice(rownum-1,1);data.map((item,idx)=>{item.rownum=idx+1;return item;});render()},
    }
  }
})(typeof window !== "undefined" ? window : this));
