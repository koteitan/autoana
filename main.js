// draw
var canvas;
var ctx;
var frameRate = 60; // [fps]
var isRequestedDraw=true;
// ordinals
var ordlist; //ordinals list
var ords;    //number of enumerated ordinals
var fseq;    //fundamental sequences
var fseqi;   //fundamental sequences reference
var N=4;     //orders
var zeros = Array.zeros([N]); // all zeros
//draw
var gS;
var gW;
/* entry point */
window.onload=function(){
  initOrd();
  initPhysics();
  initDraw();
  setInterval(procAll, 1000/frameRate);
}

/* gameloop */
var procAll=function(){
  procPhysics();
  if(isRequestedDraw){
    procDraw();
    isRequestedDraw = true;
  }
}

/* physics */
var dims=2;
var q;
var v;
var eps=1e-20;
var Frep=0.001;
var Fatt=1;
var radius=10;
var speedcoef =0.01;
var speeddecay=0.9;
var procPhysics=function(){
  var f=Array.zeros([ords, dims]);
  //repulsion
  for(var o1=0;o1<ords;o1++){
    for(var o2=0;o2<ords;o2++){
      if(o1!=o2){
        var dq=sub(q[o1],q[o2]);
        var l=abs(dq);
        if(l<radius){
          f[o1]=add(f[o1], mulkv(+Frep/(l+eps),dq));
        }
      }
    }
  }
  //attraction
  for(var o=0;o<ords;o++){
    if(fseqi[o].length!=0){
      for(var n=0;n<N;n++){
        var dq=sub(q[o],q[fseqi[o][n]]);
        var l=abs(dq);
        f[o]=add(f[o], mulkv(-Fatt/(l+eps),dq));
      }
    }
  }
  //move
  f=mulkx(speedcoef ,f);
  v=add  (v         ,f);
  v=mulkx(speeddecay,v);
  q=add  (q         ,v);
  //wall reflection
  for(var o=0;o<ords;o++){
    if(q[o][0]<gW.w[0][0]){q[o][0]=gW.w[0][0];v[o][0]=+Math.abs(v[o][0]);}
    if(q[o][1]<gW.w[0][1]){q[o][1]=gW.w[0][1];v[o][1]=+Math.abs(v[o][1]);}
    if(q[o][0]>gW.w[1][0]){q[o][0]=gW.w[1][0];v[o][0]=-Math.abs(v[o][0]);}
    if(q[o][1]>gW.w[1][1]){q[o][1]=gW.w[1][1];v[o][1]=-Math.abs(v[o][1]);}
  }
}
// init
var initPhysics=function(){
  q=new Array(ords);
  v=new Array(ords);
  for(var o=0;o<ords;o++){
    q[o]=new Array(dims);
    v[o]=new Array(dims);
    for(var d=0;d<dims;d++){
      q[o][d]=Math.random()*2-1;
      v[o][d]=0;
    }
  }
}
var initDraw=function(){
  canvas = document.getElementById("outcanvas");
  if(!canvas||!canvas.getContext) return false;
  ctx = canvas.getContext('2d');
  gS = new Geom(2,[[0,0],[outcanvas.width,outcanvas.height]]);
  gW = new Geom(2,[[-1,-1],[+1,+1]]);
}
var procDraw=function(){
  //clear
  ctx.clearRect(gS.w[0][0], gS.w[0][1],gS.w[1][0]-1,gS.w[1][1]-1);
  
  for(var o=0;o<ords;o++){
    //circle
    var s=transPos(q[o],gW,gS);
    ctx.strokeStyle="black";
    ctx.beginPath();
    ctx.arc(Math.floor(s[0]),Math.floor(s[1]),radius,0,2*Math.PI,false);
    ctx.stroke();
    //text
    ctx.fillText(ord2str(ordlist[o]),Math.floor(s[0]),Math.floor(s[1]));
    //fundamental sequence connection
    if(!fseqi[o].eq([])){
      for(var n=0;n<N;n++){
        var s0 = transPos(q[o],gW,gS);
        var s1 = transPos(q[fseqi[o][n]],gW,gS);
        ctx.strokeStyle="black";
        ctx.beginPath();
        ctx.moveTo(Math.floor(s0[0]),Math.floor(s0[1]));
        ctx.lineTo(Math.floor(s1[0]),Math.floor(s1[1]));
        ctx.stroke();
      }
    }
  }
}
var initOrd=function(){
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
  ords=ordlist.length;
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
      fseq[o]=[];
    }
  }    

  //convert fseq to reference
  fseqi=new Array(ords);
  for(var o=0;o<ords;o++){
    if(!fseq[o].eq([])){
      fseqi[o]=new Array(N);
      for(var n=0;n<N;n++){
        fseqi[o][n] = ordlist.findIndex(function(e,i,a){return e.eq(fseq[o][n])});
      }
    }else{
      fseqi[o]=[];
    }
  }

  //print
  debug.value="";
  for(var o=0;o<ords;o++){
    var ord = ordlist[o];
    debug.value+=ord2str(ord);
    if(!fseq[o].eq([])){
      debug.value+=" = {";
      for(var n=0;n<N;n++){
        debug.value+=ord2str(fseq[o][n]);
        if(n!=N-1)debug.value+=", ";
      }
      debug.value+=", c}\n";
    }else{
      debug.value+="\n";
    }
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


