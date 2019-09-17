      var style = document.createElement('style');
      style.setAttribute("id","FathGrid_styles");
      style.innerHTML = `
        th.sorted, th.sorted-desc {position: relative;}
        th.sorted::after {content:"▲";position:absolute;right: 1em;}
        th.sorted-desc::after {content:"▼";position:absolute;right: 1em;}
      `;
      document.head.appendChild(style);
    (function(win){
      win.FathTable=function(id,_config){
        var config={
            id:id, 
            size:20, 
            page:1, 
            tableClasses:"table table-hover",
            tableHeadClasses:"thead-dark",
            filter:true,
            columns:{},
            ..._config
        };
        var data=[];
        var fdata=data;//filtered data
        var table=document.getElementById(id);
        var thead=table.querySelector(":scope thead");
        var tbody=table.querySelector(":scope tbody");

        var renderPaginator=function(){
          return `
            <ul class="pagination" >
              <li class="page-item"><a class="page-link firstpage" title="First" href="#">&#x2503;&#x23F4;</a></li>
              <li class="page-item"><a class="page-link prevpage" title="Previous" href="#">&#x23F4;</a></li>
              <li class="page-item active"><a class="page-link" href="javascript:void(0)">${config.page}</a></li>
              <li class="page-item"><a class="page-link nextpage" title="Next" href="#">&#x23f5;</a></li>
              <li class="page-item"><a class="page-link lastpage" title="Last" href="#">&#x23f5;&#x2503;</a></li>
            </ul><span>${(config.page-1)*config.size}-${Math.min(fdata.length,config.page*config.size)} of ${data.length!=fdata.length?`${fdata.length}/ `:''} ${data.length}</span>
          `;
        }
        var nextPage=function(){config.page=Math.floor(Math.min(config.page+1,(fdata.length+config.size-1)/config.size));render();};
        var prevPage=function(){config.page=Math.max(1, config.page-1);render();};
        var lastPage=function(){config.page=Math.floor((fdata.length+config.size-1)/config.size);render();};
        var firstPage=function(){config.page=1;render();};
        var sort=function(i,desc){
          var isSorted=thead.querySelector("th:nth-child("+(i)+")").classList.contains("sorted");

          data.sort((a,b)=>{
            a=a[i-1].replace(/(<([^>]+)>)/gi,"");b=b[i-1].replace(/(<([^>]+)>)/gi,"");
            return ((isSorted || (desc===true))?-1:1)*(isNaN(parseFloat(a))? ( (a<b?-1:(a>b)?1:0) ) :(a-b));
          });

          if(thead.querySelector("th.sorted")!==null) thead.querySelector("th.sorted").classList.remove("sorted");
          if(thead.querySelector("th.sorted-desc")!==null) thead.querySelector("th.sorted-desc").classList.remove("sorted-desc");
          thead.querySelector(" th:nth-child("+(i)+")").classList.add((isSorted || desc===true)?"sorted-desc":"sorted");
          render();
        };

        table.insertAdjacentHTML('afterend', `<nav id="paginator${id}">`+renderPaginator()+'</nav>');
        var paginator=table.parentElement.querySelector(`#paginator${id}`);

        ("fathgrid "+config.tableClasses).split(" ").forEach(x=>table.classList.add(x));

        config.tableHeadClasses.split(" ").forEach(x=>thead.classList.add(x));
        
        table.querySelectorAll(":scope tbody tr").forEach(tr => {
          var row=[];
          tr.querySelectorAll(":scope td").forEach(td => {
            row.push(td.innerHTML);
          });
          data.push(row);
        });
        thead.querySelectorAll("tr th").forEach((th,i) => {th.style.cursor="pointer";th.addEventListener('click',function(e){sort(i+1);stop(e);});});

        if(config.filter){
            var r=document.createElement("TR");r.classList.add("filter");
            thead.querySelectorAll("tr th").forEach((th,idx) => {var f=document.createElement("TH");
            var i=undefined;
            if(config.columns[idx+1]!==undefined && config.columns[idx+1].filter!==this.undefined) {
                i=document.createElement("SELECT");i.add(document.createElement("OPTION"));
                var ff=config.columns[idx+1].filter;
                if(null===ff) {ff=[];fdata.forEach(v=>{if(!ff.includes(v[idx]))ff.push(v[idx])});}
                ff.sort();
                ff.forEach(v=>{var o=document.createElement("OPTION");o.innerText=v;o.value=v;i.add(o);});
            } else i=document.createElement("INPUT");
            i.dataset.i=idx;i.style.width="100%";
            f.append(i);r.append(f);});
            thead.append(r);
            r.querySelectorAll(":scope input, select").forEach(i=>{i.addEventListener("change",function(e){render();});});
        }

        var stop=function(e){e.preventDefault();e.stopPropagation();};
        var render=function(){
            console.log("render");
            table.querySelectorAll(":scope tbody tr").forEach(tr => {tr.parentNode.removeChild(tr);});
            fdata=data.filter(x=>{
                var ok=true;
                thead.querySelectorAll(":scope input, select").forEach(i=>{if(i.value!='' && !x[i.dataset.i].includes(i.value)) ok=false;});
                return ok;
            });
            fdata.slice((config.page-1)*config.size,config.page*config.size).forEach(dr=>{
                var r=document.createElement("tr");
                dr.forEach(x=>{var c=document.createElement('td');c.innerHTML=x;r.appendChild(c);})
                table.querySelector("tbody").appendChild(r);
            });

            paginator.innerHTML=renderPaginator();
            paginator.querySelectorAll(".nextpage").forEach(x=>{x.addEventListener('click',function(e){nextPage();stop(e);})});
            paginator.querySelectorAll(".prevpage").forEach(x=>{x.addEventListener('click',function(e){prevPage();stop(e);})});
            paginator.querySelectorAll(".lastpage").forEach(x=>{x.addEventListener('click',function(e){lastPage();stop(e);})});
            paginator.querySelectorAll(".firstpage").forEach(x=>{x.addEventListener('click',function(e){firstPage();stop(e);})});
            
        };
        render();
        return {
          render:render,
          nextPage:nextPage,
          prevPage:prevPage,
          lastPage:lastPage,
          firstPage:firstPage,
          sort:sort,
          filter:function(idx,str){thead.querySelector("input:nth-child("+idx+")").value=str;render();},
          data:data,
        }
      }
    })(window);
