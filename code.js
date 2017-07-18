function setup(){
    plotArea.setup();
    document.getElementById("addPointer").addEventListener("click",function(){new Point(0,0);console.log("SDS")});
    document.getElementById("solveButton").addEventListener("click",function(){solve( (plotArea.points.length||1)-1)});
    document.getElementById("zoomin").addEventListener("click",function(){plotArea.scale+=5});
    document.getElementById("zoomout").addEventListener("click",function(){plotArea.scale-=5});

    var c=5;
    for(var i=0;i<c;i++)
        new Point(Math.random()*8-4,Math.random()*8-4);
    drawGrid();
    solve(c-1);
}

exp="1";
theta=[1,1,1];
startAlpha=1;
r=1.01;
e=0.8
function solve(d=0,iterations=1000000){
    var n=d+1;
    var m=plotArea.points.length;
    var X=new Array(m);
    var Y=new Array(m);
    avgF=new Array(n);
    minF=new Array(n);
    maxF=new Array(n);
    rangeF=new Array(n);
    for(i=0;i<plotArea.points.length;i++){
        X[i]=new Array(n);
        Y[i]=plotArea.points[i].y;
        for(var j=0;j<n;j++){
            var f=Math.pow(plotArea.points[i].x,j);
            X[i][j]=f;
            avgF[j]=(avgF[j]||0)+f
            if(minF[j]==undefined||minF[j]>f)
                minF[j]=f;
            if(maxF[j]==undefined||maxF[j]<f)
                maxF[j]=f;
        }
    }
    for(var j=0;j<n;j++){
        avgF[j]/=m;
        rangeF[j]=0;
        rangeF[j]=(maxF[j]-minF[j])||1;
    }

    for(i=0;i<plotArea.points.length;i++){
        for(var j=1;j<n;j++){
            X[i][j]=(X[i][j]-minF[j])/rangeF[j];
        }
    }
    // console.log(X);
    // return;


    // return;
    theta=new Array(n);
    prevTheta=new Array(n);
    for(var i=0;i<n;i++)
        theta[i]=0;
    for(var i=0;i<n;i++)
        prevTheta[i]=0;
    console.log(X,theta,Y);
    // return;
    var alpha=startAlpha;
    var prevJ=Infinity;

    for(f=0; f<iterations &&prevJ>0.001;f++){
        var [J,grad]=costFn(X,theta,Y,alpha);


        if(prevJ<J){
            // f-=1;
            alpha*=e;
            for(var i=0;i<n;i++)
                theta[i]=prevTheta[i];
        }
        // else {
        //     alpha*=1.01;
        // }
        else{
            alpha*=r;
            prevJ=J;

            for(var i=0;i<n;i++)
                prevTheta[i]=theta[i];
            for(var i=0;i<n;i++)
                theta[i]=grad[i];
        }

        // console.log(alpha)

    }
    console.log(J,f,alpha);
    console.log("theta:",theta);

    // return;

    exp=theta[0]+"";
    // exp="0.2*x+1";
    for (var i=1;i<theta.length;i++)
        exp+="+("+theta[i]+")*(Math.pow(x,"+i+")-("+minF[i]+"))/"+rangeF[i];

    scheduleDraw();


}


function costFn(X,theta,Y,alpha){
    // console.log(theta)
    var m=X.length;
    var H=new Array(m);
    var n=theta.length;
    for(var i=0;i<m;i++)
        for(var j=0;j<n;j++)
            H[i]=(H[i]||0)+X[i][j]*theta[j];
    J=0;
    for(var i=0;i<m;i++)
        J+=Math.pow(H[i]-Y[i],2)/(2*m);
    var grad=new Array(n);
    for(var i=0;i<n;i++)
        grad[i]=theta[i];
    // console.log(grad);
    for(var i=0;i<m;i++)
        for(var j=0;j<n;j++){
            // console.log("Z: ",(alpha/m)*(H[i]-Y[i])*X[i][j]);
            grad[j]-=(alpha/m)*(H[i]-Y[i])*X[i][j];
        }
    // // console.log(grad);
    // for(var i=0;i<n;i++)
    //     theta[i]=grad[i];

    return [J,grad];


}


willBeDrawn=false;

var plotArea = {
    canvas: document.getElementById("plotArea"),
    scale:100,
    points:[],

    setup: function() {
        this.canvas=document.getElementById("plotArea");
        DPR=window.devicePixelRatio||1;
        width = document.getElementById("plotArea").clientWidth*DPR;
        height = document.getElementById("plotArea").clientHeight*DPR;
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        this.mouseDown = false;
        this.ox=width/2;
        this.oy=height/2;

    },
    clear: function() {
        if (!this.context) return;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

window.addEventListener("mousedown",function(e){
    plotArea.selected=undefined;
    plotArea.mouseDown=true;
    console.log(e.clientX,e.clientY,"this is mouse");
    plotArea.prevOx=plotArea.ox;
    plotArea.prevOy=plotArea.oy;
    var rect = plotArea.canvas.getBoundingClientRect();
    plotArea.mouseDownRawX = (e.clientX - rect.left)*DPR;
    plotArea.mouseDownRawY = (e.clientY - rect.top)*DPR;
    plotArea.mouseDownX = ((e.clientX - rect.left)*DPR-plotArea.ox)/plotArea.scale;
    plotArea.mouseDownY = ((e.clientY - rect.top)*DPR-plotArea.oy)/plotArea.scale;
    scheduleDraw()
    // plotArea.mouseDownX = Math.round(((plotArea.mouseDownRawX - globalScope.ox) / globalScope.scale) / unit) * unit;
    // plotArea.mouseDownY = Math.round(((plotArea.mouseDownRawY - globalScope.oy) / globalScope.scale) / unit) * unit;
}
)
window.addEventListener("mouseup",function(e){
    plotArea.mouseDown=false;
    solve( (plotArea.points.length||1)-1);
    scheduleDraw();
}
)

window.addEventListener("mousemove",function(e){
    var rect = plotArea.canvas.getBoundingClientRect();
    plotArea.mouseRawX = (e.clientX - rect.left)*DPR;
    plotArea.mouseRawY = (e.clientY - rect.top)*DPR;
    plotArea.mouseX = ((e.clientX - rect.left)*DPR-plotArea.ox)/plotArea.scale;
    plotArea.mouseY = ((e.clientY - rect.top)*DPR-plotArea.oy)/plotArea.scale;
    // console.log(plotArea.mouseX,plotArea.mouseY)

    if(plotArea.mouseDown){
        // solve( (plotArea.points.length||1)-1,1000);
        scheduleDraw();
    }
    // plotArea.mouseDownX = Math.round(((plotArea.mouseDownRawX - globalScope.ox) / globalScope.scale) / unit) * unit;
    // plotArea.mouseDownY = Math.round(((plotArea.mouseDownRawY - globalScope.oy) / globalScope.scale) / unit) * unit;
}
)

scheduleDraw=function(){
    if(willBeDrawn)return;
    willBeDrawn=true;
    setTimeout(drawGrid,100);
}
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
function drawGrid(){
    willBeDrawn=false;

        for(var i=0;i<plotArea.points.length;i++)
            plotArea.points[i].update();
        if(plotArea.mouseDown&&!plotArea.selected){
            plotArea.ox=plotArea.prevOx+    plotArea.mouseRawX-plotArea.mouseDownRawX;
            plotArea.oy=plotArea.prevOy+    plotArea.mouseRawY-plotArea.mouseDownRawY;

        }
    plotArea.clear();
    var ctx=plotArea.context;
    ctx.strokeStyle="#eee";
    ctx.lineWidth=1;
    ctx.beginPath();

    // console.log(ctx);
    var ox=plotArea.ox%plotArea.scale;
    var oy=plotArea.oy%plotArea.scale;
    console.log(ox,oy,"ox",height,width,plotArea.scale);
    for(var i=ox;i<width;i+=plotArea.scale){
        ctx.moveTo(i,0);
        ctx.lineTo(i,height);
    }
    for(var i=oy;i<height;i+=plotArea.scale){
        ctx.moveTo(0,i);
        ctx.lineTo(width,i);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle="black";
    ctx.lineWidth=2;
    ctx.moveTo(0,plotArea.oy);
    ctx.lineTo(width,plotArea.oy);
    ctx.moveTo(plotArea.ox,0);
    ctx.lineTo(plotArea.ox,height);
    ctx.stroke();

    ctx.textAlign='right';
    ctx.textBaseline='middle';
    var ynow=plotArea.oy-plotArea.scale;
    var no=1;
    while(ynow>0){
      ctx.beginPath();
      ctx.moveTo(plotArea.ox-8,ynow);
      ctx.lineTo(plotArea.ox+8,ynow);
      ctx.stroke();
      ctx.fillText(no.toString(),plotArea.ox-8-3,ynow);
      no+=1;
      ynow-=plotArea.scale;
    }
    ynow=plotArea.oy+plotArea.scale;
    no=-1;
    while(ynow<ctx.canvas.height){
      ctx.beginPath();
      ctx.moveTo(plotArea.ox-8,ynow);
      ctx.lineTo(plotArea.ox+8,ynow);
      ctx.stroke();
      ctx.fillText(no.toString(),plotArea.ox-8-3,ynow);
      no-=1;
      ynow+=plotArea.scale;
    }

    var xnow=plotArea.ox-plotArea.scale;
    var no=-1;
    while(xnow>0){
      ctx.beginPath();
      ctx.moveTo(xnow,plotArea.oy-8);
      ctx.lineTo(xnow,plotArea.oy+8);
      ctx.stroke();
      ctx.fillText(no.toString(),xnow,plotArea.oy+8+5);
      no-=1;
      xnow-=plotArea.scale;
    }
    xnow=plotArea.ox+plotArea.scale;
    no=1;
    while(xnow<width){
      console.log("hello");
      ctx.beginPath();
      ctx.moveTo(xnow,plotArea.oy-8);
      ctx.lineTo(xnow,plotArea.oy+8);
      ctx.stroke();
      ctx.fillText(no.toString(),xnow,plotArea.oy+8+5);
      no+=1;
      xnow+=plotArea.scale;
    }

    var ctx=plotArea.context;


    // console.log(exp)

    ctx.beginPath();
    ctx.lineWidth=4;
    var DD;
    var PD;
    var CD;
    var dx=0.05;
    var px;
    var py;
    itertations=0;

    for(var i=(-plotArea.ox)/(plotArea.scale);i<(width-plotArea.ox)/(plotArea.scale);i+=dx*100/plotArea.scale){
        itertations++;
        var y=eval(exp.replaceAll("x",i));
        ctx.lineTo(i*plotArea.scale+plotArea.ox,y*plotArea.scale+plotArea.oy);
    }
    // console.log("Iterations:",itertations);
    ctx.stroke();




    for(var i=0;i<plotArea.points.length;i++)
        plotArea.points[i].draw();
}


function Point(x, y) {
    // Data member initializations
    this.x = x;
    this.y = y;
    plotArea.points.push(this);
    this.hover = false;


    this.startDragging = function() {
        this.oldx = this.x;
        this.oldy = this.y;

    }
    this.drag = function() {
        console.log("HIT")
        this.x = this.oldx + plotArea.mouseX - plotArea.mouseDownX;
        this.y = this.oldy + plotArea.mouseY - plotArea.mouseDownY;

    }
    this.update = function() {

        // console.log(plotArea.mouseX,plotArea.mouseY,this.isHover());
        if(plotArea.selected==undefined&&plotArea.mouseDown&&this.isHover()){
            this.selected=true;
            plotArea.selected=this;
        }
        else if(!plotArea.mouseDown){
            this.selected=false;

        }
        if(this.selected){
            this.x=plotArea.mouseX;
            this.y=plotArea.mouseY;
        }
        // return update;
    }

    // The isHover method is used to check if the mouse is hovering over the object.
    // Return Value: true if mouse is hovering over object else false
    // NOT OVERIDABLE
    this.isHover = function() {

        if (plotArea.mouseX - this.x <= 20/plotArea.scale && this.x - plotArea.mouseX <= 20/plotArea.scale && plotArea.mouseY - this.y <= 20/plotArea.scale && this.y - plotArea.mouseY <= 20/plotArea.scale) return true;

        return false;
    };


    //Method that draws the outline of the module and calls draw function on module Nodes.
    //NOT OVERIDABLE
    this.draw = function() {

        var ctx=plotArea.context;
        ctx.beginPath();
        ctx.arc(this.x*plotArea.scale+plotArea.ox,this.y*plotArea.scale+plotArea.oy,10,0,2*Math.PI);
        ctx.fill();
    }

    //method to delete object
    //OVERRIDE WITH CAUTION
    this.delete = function() {
        plotArea.points.clean(this);
    }
}




//fn to remove elem in array
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
Array.prototype.extend = function(other_array) {
    /* you should include a test to check whether other_array really is an array */
    other_array.forEach(function(v) {
        this.push(v)
    }, this);
}

//fn to check if an elem is in an array
Array.prototype.contains = function(value) {
    return this.indexOf(value) > -1
};
