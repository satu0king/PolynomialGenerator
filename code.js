function setup(){
    plotArea.setup();
}
willBeDrawn=false;

var plotArea = {
    canvas: document.getElementById("plotArea"),
    scale:100,

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
        scheduleDraw();
    },
    clear: function() {
        if (!this.context) return;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

window.addEventListener("mousedown",function(e){
    plotArea.mouseDown=true;
    plotArea.prevOx=plotArea.ox;
    plotArea.prevOy=plotArea.oy;
    var rect = plotArea.canvas.getBoundingClientRect();
    plotArea.mouseDownRawX = (e.clientX - rect.left)*DPR;
    plotArea.mouseDownRawY = (e.clientY - rect.top)*DPR;
    // plotArea.mouseDownX = Math.round(((plotArea.mouseDownRawX - globalScope.ox) / globalScope.scale) / unit) * unit;
    // plotArea.mouseDownY = Math.round(((plotArea.mouseDownRawY - globalScope.oy) / globalScope.scale) / unit) * unit;
}
)
window.addEventListener("mouseup",function(e){
    plotArea.mouseDown=false;
}
)

window.addEventListener("mousemove",function(e){
    var rect = plotArea.canvas.getBoundingClientRect();
    plotArea.mouseRawX = (e.clientX - rect.left)*DPR;
    plotArea.mouseRawY = (e.clientY - rect.top)*DPR;

    if(plotArea.mouseDown){
        plotArea.ox=plotArea.prevOx+    plotArea.mouseRawX-plotArea.mouseDownRawX;
        plotArea.oy=plotArea.prevOy+    plotArea.mouseRawY-plotArea.mouseDownRawY;
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
    plotArea.clear();
    var ctx=plotArea.context;
    ctx.strokeStyle="#eee";
    ctx.lineWidth=1;
    ctx.beginPath();

    // console.log(ctx);
    var ox=plotArea.ox%plotArea.scale;
    var oy=plotArea.oy%plotArea.scale;
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
    var exp="Math.pow(x,3)+Math.pow(x,2)+Math.pow(x,4)+Math.pow(x,5)+1";

    ctx.beginPath();
    ctx.lineWidth=4;
    var DD;
    var PD;
    var CD;
    var dx=0.05;
    var px;
    var py;
    itertations=0;
    for(var i=(-plotArea.ox)/(2*plotArea.scale);i<(width-plotArea.ox)/(2*plotArea.scale);i+=dx*100/plotArea.scale){
        itertations++;
        var y=eval(exp.replaceAll("x",i));
        ctx.lineTo(i*plotArea.scale+plotArea.ox,-y*plotArea.scale+plotArea.oy);


        if(py!==undefined)CD=(y-py)/(i-px);
        if(PD!==undefined)DD=(Math.atan(PD)-Math.atan(CD))*plotArea.scale;
        px=i;
        py=y;
        PD=CD;
        dx=.05;
        // console.log(i,DD)

        if(DD!==undefined){
            // if(Math.abs(DD)<0.0001){
            //     i+=2;
            // }
            // if(Math.abs(DD)<0.001){
            //     dx+=4;
            //
            // }
            // else if(Math.abs(DD)<0.01){
            //     dx+=2;
            //
            // }
            if(Math.abs(DD)<0.1){

                dx+=.5;
            }
            // else if(Math.abs(DD)<0.15){
            //
            //     dx+=0.2;
            // }
            // else if(Math.abs(DD)<0.3){
            //
            //     dx+=0.1;
            // }
            // else console.log("hit1");
            // else if(Math.abs(DD)<0.4){
            //     i+=0.05;
            // }
        }


    }
    console.log("Iterations:",itertations);
    ctx.stroke();
}
