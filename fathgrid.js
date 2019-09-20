var style = document.createElement('style');
style.setAttribute("id","FathGrid_styles");
style.innerHTML = `
  .fathgrid th.sorted, th.sorted-desc {position: relative;}
  .fathgrid th.sorted::after {content:"▲";position:absolute;right: 1em;}
  .fathgrid th.sorted-desc::after {content:"▼";position:absolute;right: 1em;}
  .fathgrid-export-nav {float:right;}
  .fathgrid-wrapper {position:relative;}
  .fathgrid-wrapper .page-info {position:absolute;top:0}
`;
document.head.appendChild(style);
((function(win){
  win.FathGrid=function(id,_config){
    var config={
        id:id, 
        size:20, 
        page:1, 
        editable:false,
        filterable:true,
        sortable:true,
        columns:[],
        onRender:function(){},
        onClick:function(data,col,el){editCell(data.rownum,col,el)},
        onChange:function(data,col,old,value){},
        rowClass:null,
        data:null,
        editinput:undefined,
        ..._config
    };
    var data=config.data===null?[]:config.data;
    var fdata=data;//filtered data
    var table=document.getElementById(id);
    var thead=table.querySelector(":scope thead");
    var tbody=table.querySelector(":scope tbody");
    var editinput=undefined;

    var renderPaginator=function(){
      return `
        <ul class="pagination" >
          <li class="page-item"><a class="page-link firstpage" title="First" href="#">&#x2503;&#x23F4;</a></li>
          <li class="page-item"><a class="page-link prevpage" title="Previous" href="#">&#x23F4;</a></li>
          <li class="page-item active"><a class="page-link gotopage" title="Goto page" href="javascript:void(0)">${config.page} / ${Math.floor((fdata.length+(config.size-1))/config.size)}</a></li>
          <li class="page-item"><a class="page-link nextpage" title="Next" href="#">&#x23f5;</a></li>
          <li class="page-item"><a class="page-link lastpage" title="Last" href="#">&#x23f5;&#x2503;</a></li>
        </ul><span class="page-info">${(config.page-1)*config.size}-${Math.min(fdata.length,config.page*config.size)} of ${data.length!=fdata.length?`${fdata.length}/ `:''} ${data.length}</span>
      `;
    }
    var nextPage=function(){config.page=Math.floor(Math.min(config.page+1,(fdata.length+config.size-1)/config.size));render();};
    var prevPage=function(){config.page=Math.max(1, config.page-1);render();};
    var lastPage=function(){config.page=Math.floor((fdata.length+config.size-1)/config.size);render();};
    var firstPage=function(){config.page=1;render();};
    
    var getSort=function(){
      var e=thead.querySelector("thead tr:nth-child(1) th.sorted");
      if(e!==null) return [...e.parentNode.children].indexOf(e)+1;
      e=thead.querySelector("thead tr:nth-child(1) th.sorted-desc");
      if(e!==null) return -([...e.parentNode.children].indexOf(e)+1);
      return null;
    };

    var sort=function(i,desc){
      var isSorted=thead.querySelector("th:nth-child("+(i)+")").classList.contains("sorted");

      data.sort((a,b)=>{
        a=('number'==typeof a[i-1])?(a[i-1]):a[i-1].replace(/(<([^>]+)>)/gi,"");
        b=('number'==typeof b[i-1])?(b[i-1]):b[i-1].replace(/(<([^>]+)>)/gi,"");
        return ((isSorted || (desc===true))?-1:1)*(isNaN(parseFloat(a))? ( (a<b?-1:(a>b)?1:0) ) :(a-b));
      });

      if(thead.querySelector("th.sorted")!==null) thead.querySelector("th.sorted").classList.remove("sorted");
      if(thead.querySelector("th.sorted-desc")!==null) thead.querySelector("th.sorted-desc").classList.remove("sorted-desc");
      thead.querySelector(" th:nth-child("+(i)+")").classList.add((isSorted || desc===true)?"sorted-desc":"sorted");
      render();
    };

    var wrapper=this.document.createElement("DIV");wrapper.classList.add("fathgrid-wrapper");
    table.parentNode.insertBefore(wrapper,table);
    wrapper.appendChild(table);

    table.insertAdjacentHTML('afterend', `<nav id="paginator${id}">`+renderPaginator()+'</nav>');
    table.insertAdjacentHTML('beforeBegin', `<nav class="fathgrid-export-nav" id="exporter${id}"><a href="javascript:void(0)" title="Export" data-format="txt">TXT</a> <a href="javascript:void(0)" title="Export" data-format="csv">CSV</a> <a href="javascript:void(0)" title="Export" data-format="html">HTML</a> <a href="javascript:void(0)" title="Export" data-format="xls">XLS</a> ${(typeof window.jsPDF=='function')?`<a href="javascript:void(0)" title="Export" data-format="pdf">PDF</a>`:''}</nav>`);
    var paginator=table.parentElement.querySelector(`#paginator${id}`);
    var exporter=table.parentElement.querySelector(`#exporter${id}`);
    exporter.querySelectorAll(":scope a").forEach(a=>{a.addEventListener("click",function(e){downloadFile(getExportData(e.srcElement.dataset.format),"export."+e.srcElement.dataset.format)})});
    ("fathgrid ").split(" ").forEach(x=>{if(x!=='')table.classList.add(x)});

    if(data===null || data.length===0) table.querySelectorAll(":scope tbody tr").forEach((tr,idx) => {
      var row=[];
      tr.querySelectorAll(":scope td").forEach(td => {
        row.push(td.innerHTML);
      });
      row.id=(tr.dataset.id===undefined)?idx+1:tr.dataset.id;
      data.push(row);
    });
    else{
      data=data.map((x,idx)=>{if(undefined===x.id) x.id=idx+1;return x;}); //add IDs to data rows
    }
    data=data.map((x,idx)=>{x.rownum=idx+1;return x;});//add rownum prop

    thead.querySelectorAll("tr th").forEach((th,i) => {if(undefined===config.columns[i]) config.columns[i]={}});

    if(config.sortable) thead.querySelectorAll("tr th").forEach((th,i) => {th.style.cursor="pointer";th.addEventListener('click',function(e){sort(i+1);stop(e);});});

    if(config.filterable){
        var r=document.createElement("TR");r.classList.add("filter");
        thead.querySelectorAll("tr th").forEach((th,idx) => {
          var f=document.createElement("TH");
          var i=undefined;
          if(config.columns[idx]!==undefined && config.columns[idx].filter!==this.undefined) {
              i=document.createElement("SELECT");i.add(document.createElement("OPTION"));
              //i.setAttribute("multiple","multiple");
              var ff=config.columns[idx].filter;
              if(null===ff) {ff=[];fdata.forEach(v=>{if(!ff.includes(v[idx]))ff.push(v[idx])});ff.sort();}
              ff.forEach(v=>{var o=document.createElement("OPTION");o.innerText=((typeof v == 'object')?v.name:v);o.value=(typeof v =='object')?v.value:v;i.add(o);});
          } else {
            i=document.createElement("INPUT");
            i.setAttribute("type",(undefined===config.columns[idx])?'text':config.columns[idx].type);
          }
          i.classList.add("form-control");
          i.style.width="100%";

          i.dataset.i=idx;
          i.type
          f.append(i);r.append(f);
        });
        thead.append(r);
        r.querySelectorAll(":scope input, select").forEach(i=>{i.addEventListener("change",function(e){render();});});
    }

    var stop=function(e){e.preventDefault();e.stopPropagation();};
    var isChecked=function(v){return v=='yes'||v=='true'||v===true||v=='on'||v==1||v=='1';};
    var render=function(){
        table.querySelectorAll(":scope tbody tr").forEach(tr => {tr.parentNode.removeChild(tr);});

        fdata=data.filter(x=>{
            var ok=true;

            thead.querySelectorAll(":scope input, select").forEach((i)=>{
              var opts=Array.from(i.querySelectorAll(":scope option:checked"),y=>y.value);
              if(opts.filter(a=>a!='').length>1){
                var ok2=false;
                opts.forEach(y=>{if(y!='' && x[i.dataset.i].includes(y)) ok2=true;});
                if(!ok2) ok=false;
              }
              else if(i.type==='checkbox') {if(i.checked && !isChecked(x[i.dataset.i])) ok=false;}
              else if(config.columns[i.dataset.i].type==='checkbox'){ if(i.value!='' && !(x[i.dataset.i]==i.value)) ok=false;}
              else if(i.value!='' && (typeof x[i.dataset.i] =='number') && x[i.dataset.i]!=(i.value)) ok=false;
              else if(i.value!='' && (typeof x[i.dataset.i] =='string')&& !x[i.dataset.i].includes(i.value)) ok=false;
            });
            return ok;
        });
        fdata.slice((config.page-1)*config.size,config.page*config.size).forEach((dr,idx)=>{
            var r=document.createElement("tr");
            r.dataset.id=dr.id;
            r.dataset.rownum=dr.rownum;
            if(typeof config.rowClass=='function' && (cs=config.rowClass(dr,idx)) && typeof cs=='string') cs.split(" ").forEach(c=>(c!=''?r.classList.add(c):c));
            
            config.columns.forEach((column,col)=>{
              var c=document.createElement('td');
              var x=column.name!==undefined?dr[column.name]:dr[col];
              if(column.type=='checkbox') {
                c.innerHTML=`<input type="checkbox" ${(x=='1'||x=='true'||x===true||x=='yes'||x=='on')?'checked':''} ${((column.editable===false ||(typeof column.editable =='function' && column.editable(dr,col+1)===false)) || config.editable==false)?'disabled':''} />`;
                c.querySelector(":scope input[type=checkbox]").addEventListener("click",function(e){
                  config.onChange(dr,col,!e.srcElement.checked,e.srcElement.checked);
                });
              }
              else c.innerHTML=x;
              r.appendChild(c);
            })
            table.querySelector("tbody").appendChild(r);
        });

        paginator.innerHTML=renderPaginator();
        paginator.querySelectorAll(".nextpage").forEach(x=>{x.addEventListener('click',function(e){nextPage();stop(e);})});
        paginator.querySelectorAll(".prevpage").forEach(x=>{x.addEventListener('click',function(e){prevPage();stop(e);})});
        paginator.querySelectorAll(".lastpage").forEach(x=>{x.addEventListener('click',function(e){lastPage();stop(e);})});
        paginator.querySelectorAll(".firstpage").forEach(x=>{x.addEventListener('click',function(e){firstPage();stop(e);})});
        paginator.querySelectorAll(".gotopage").forEach(x=>{x.addEventListener('click',function(e){config.page=Math.max(1,Math.min(fdata.length/config.page,parseInt(prompt("Go to page number",config.page)||0)));render();stop(e);})});

        tbody.querySelectorAll("td").forEach(x=>{x.addEventListener("click",function(e){config.onClick(data[e.srcElement.parentNode.dataset.rownum-1],[...e.srcElement.parentNode.children].indexOf(e.srcElement)+1,e.srcElement);})});
        config.onRender();            
    };
    var editCell=function(rownum,col,el){
      if(!config.editable) return;
      if(editinput!==undefined) {
        editinput.parentNode.innerText=editinput.value!=''?editinput.value:editinput.dataset.originalvalue;
        editinput.remove();
        editinput=undefined;
      }
      
      var column=config.columns[col-1];
      if(undefined!==column && (column.editable===false || ((typeof column.editable ==="function") && column.editable(data[rownum-1],col,el)===false))) return;
      if(column.type==='checkbox') return;
      var coltype=(undefined!==column && undefined!==column.type)?(column.type):'text';
      var t=el.innerText;
      var i=null;
      if(undefined!==column && column.listOfValues!==undefined){
        el.innerHTML=`<select style="width:100%;" class="form-control" id="coledit" name="col" ></select>`;
        i=el.querySelector(":scope #coledit");
        var lov=column.listOfValues;if(typeof lov=="function") lov=lov(data[rownum-1],col,el);
        lov.forEach(v=>{var o=document.createElement("OPTION");o.innerText=v;o.value=v;i.add(o);});
        i.value=t;
        i.focus();
        i.addEventListener("change",function(e){config.onChange(data[rownum-1],col,data[rownum-1][col-1],e.srcElement.value);});
      }
      else {
        el.innerHTML=`<input type="${coltype}" style="width:100%;" class="form-control" id="coledit" name="col" value=""/>`;
        i=el.querySelector(":scope #coledit");
        i.value=t;
        i.focus();
        i.select();
      }
      i.addEventListener("click",function(ev){ev.stopPropagation();});
      i.dataset.originalvalue=t;

      i.addEventListener("keydown",function(e){
        if(undefined===rownum) return;
        if(13==e.which || 9==e.which) {
          var old=data[rownum-1][col-1];
          data[rownum-1][col-1]=e.srcElement.value;
          config.onChange(data[rownum-1],col,old,e.srcElement.value);
          render();
        }
        
        switch(e.which){
          
          case 27://esc
            render();
            break;
          case 38://up
            break;
          case 40://down
            break;
          case 37://left
            break;
          case 39://right
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
      if(fmt=="txt") data.forEach(r=>{ret+="\n";r.forEach(f=>{ret+=f+"\t"})});
      if(fmt=="csv") {ret+="sep=,\n";data.forEach(r=>{r.forEach(f=>{ret+="\""+f.replace("\"","\\\"")+"\","});ret+="\n";});}
      if(fmt=="html" || fmt=='xls') {ret+="<table><tbody>"+data.map(r=>{return "<tr>"+r.map(f=>{return "<td>"+f+"</td>"}).join('')+"</tr>";}).join('')+"</tbody></table>";}
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
          r.forEach(f=>{
            var w=doc.getTextWidth(f);
            doc.text(f,x,y,{maxWidth:(cw[ii]/cww)*20-0.1});
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
      getSort:getSort,
      filter:function(idx,str){thead.querySelector(".filter th:nth-child("+idx+")").querySelector(":scope input, select").value=str;render();},
      getFilter:function(){
        r={};
        thead.querySelectorAll(":scope input, select").forEach((i)=>{if(''!=i.value) r[i.dataset.i+1]=i.value});
        return r;
      },
      editCell:editCell,
      getData:function(){return data.map(x=>x);},
      setData:function(newdata){data=[];newdata.map(x=>data.push(x));render();},
      getExportData:getExportData,
      export:function(fmt='txt',filename='export'){downloadFile(getExportData(fmt),filename+'.'+fmt,(fmt=='xls'?'application/vnd.ms-excel;base64,':'text/plain'));},
    }
  }
})(typeof window !== "undefined" ? window : this));
