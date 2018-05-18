var ordlist; //ordinals list
var fseq;    //fundamental sequences
var N=5;     //dimension
var zeros = Array.zeros([N]); // all zeros

/* entry point */
var dothemall=function(){
  var c=zeros.clone();

  //enumerating analyzed ordinals
  ordlist=[];
  var end=false;
  while(true){ //enumerating loop
    ordlist.push(c.clone()); //push
    c[0]++; //inclement
    for(var k=0;k<N;k++){ // carry up loop
      if(c[k]==N){
        if(k==N-1){
          end = true;
          break;
        }else{
          c[k  ]=0;
          c[k+1]++;
        }
      }
    }//carry up loop
    if(end)break;
  }//enumerating loop

  //making fundamental sequences
  var ords=ordlist.length;
  fseq=new Array(ords);
  for(var o=0;o<ords;o++){
    fseq[o]=new Array(N);
    var ord = ordlist[o];
    if(ord[0]==0 && !ord.eq(zeros)){//limit ordinal
      //find smallest omega
      var p;
      for(p=1;p<N;p++){
        if(ord[p]!=0) break;
      }
      for(var n=0;n<N;n++){
        fseq[o][n] = ord.clone();
        fseq[o][n][p  ]--;
        fseq[o][n][p-1]=n;
      }
    }else{//successor ordinal
      fseq[o][n]=[];
    }
  }    
  //print
  debug.value="";
  for(var o=0;o<ords;o++){
    var ord = ordlist[o];
    debug.value+=ord.toString()+"="+ord2str(ord)+"\n";
  }
}

/* ord2str(ord) = String expression of ordinal ord 
   ord = ƒ°k (ƒÖ^k)ord[k] */
var ord2str=function(ord){
  var out=""; //output
  var N=ord.length;
  
  var tmp=ord.clone(); //for checking [*,0,0,0,0]
  tmp[0]=0;
  if(tmp.eq(zeros)){//natural number
    out=ord[0];
  }else{//ordinal number
    var terms=0;
    for(var k=N-1;k>0;k--){
      var plus=(terms>0)?"+":"";
      if(ord[k]!=0){
        if(k>1&&ord[k]>1){
          out+=plus+"(ƒÖ^"+k+")"+ord[k];
          terms++;
        }else if(k==1 && ord[k]==1){
          out+=plus+"ƒÖ";
          terms++;
        }else if(k==1){
          out+=plus+"ƒÖ"+ord[k];
          terms++;
        }else if(ord[k]==1){
          out+=plus+"(ƒÖ^"+k+")";
          terms++;
        }
      }
    }//for k
    var plus=(terms>0)?"+":"";
    if(ord[0]>0){
      out+=plus+ord[0];
      terms++;
    }
  }
  return out;
}

//var ctx     = outcanvas.getContext('2d');

