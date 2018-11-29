var currentIndex = 0;
var imgSize = {width:100,height:100};
var imgShowSize = {width:100,height:100};
var gap=4;
var zoomMax=1;
var zoomMin=0.4;
var animateTime=300;
//-------------------------------------
var PW,PH;
var prevLoc=0,currentLoc=0;
var startDrag = false;
var inDrag = false;
var centerRect = {x:0,y:0,width:0,height:0};
var imgCount;
var timerID;
var clientX = 0;
//-------------------------------------
$(document).ready(function(){
    $(window).bind("resize",resizeBody);
    var len = $(".imgWrapper li").length;
    imgCount = len;
    $("img").load(function(){
        if(!--len){
            initUI();
        }
    });
});
//INIT
function initUI() {
    $(".imgWrapper").css("display","block");
    var img = $(".imgWrapper img:eq(0)");
    imgSize.width = img.width();
    imgSize.height = img.height();
    for(var i=0;i<imgCount;i++) {
        $(".imgNav ul").append("<li></li>");
    }
    $(".imgNav li").bind("click",navClickHandler);
    $(".close").bind("click",closeHandler);
    if(isMobile()) {
        $(".imgWrapper").bind("touchstart",swipeStartHandler);
        $(".imgWrapper").bind("touchmove",swipeMoveHandler);
        $(document).bind("touchend",swipeEndHandler);
        $(".imgWrapper li").bind("touchend",imgMouseHandler);
    } else {
        $(".imgWrapper").bind("mousedown",swipeStartHandler);
        $(".imgWrapper").bind("mousemove",swipeMoveHandler);
        $(document).bind("mouseup",swipeEndHandler);
        $(document).bind("mouseleave",swipeEndHandler);
        $(".imgWrapper li").bind("mousedown",imgMouseHandler);
        $(".imgWrapper li").bind("mouseup",imgMouseHandler);
        $(".imgWrapper li").bind("click",imgMouseHandler);
    }
    resizeBody();
    $(".loading").css("display","none");
}
function closeHandler() {
    closeWebView();
}
function swipeStartHandler(e) {
    //console.log(e.type);
    clientX = e.type=="touchstart"?e.originalEvent.touches[0].clientX:e.clientX;
    clearInterval(timerID);
    startDrag = true;
    var ul = $(".imgWrapper ul");
    prevLoc = parseFloat(ul.css("margin-left").replace("px",""));
}
function swipeMoveHandler(e) {
    if(!startDrag) return;
    var touchX = e.type=="touchmove"?e.originalEvent.touches[0].clientX:e.clientX;
    var offset = touchX-clientX;
    clientX = touchX;
    if(offset==0) return;
    inDrag = true;
    var ul = $(".imgWrapper ul");
    var targetX = parseFloat(ul.css("margin-left").replace("px",""));
    currentLoc = targetX+offset;
    offset = currentLoc-prevLoc;
    var direct = offset>0?"R":"L";
    var iOffset = offset/PW*4;
    currentIndex -= iOffset;
    changeIndex();
    e.preventDefault();
}
function getZoom(li,i) {
    var ci = currentIndex;
    var zoom = zoomMax*((imgCount-Math.abs(i-ci)*4)/imgCount);
    zoom = Math.max(zoomMin,zoom);
    zoom = Math.min(zoomMax,zoom);
    return zoom;
}
function swipeEndHandler(e) {
    if(startDrag==false) return;
    setTimeout(endSwipe,10);
}
function endSwipe() {
    inDrag = false;
    var index = Math.round(currentIndex);
    index = Math.max(0,index);
    index = Math.min(imgCount-1,index);
    animateIndex(index);
    startDrag = false;
    prevLoc = 0;
    currentLoc = 0;
    console.log("SWIPE END INDEX:",index);
}
function imgMouseHandler(e) {
    if(!inDrag && (e.type=="click" || e.type=="touchend")) {
        //window.open();
        var appID = $("a",this).attr("appid");
        openStoreLink(appID);
    }
    e.preventDefault();
}
function navClickHandler() {
    var index = $(this).index();
    animateIndex(index);
    console.log("INDEX:",index);
}
function resizeBody() {
    PW = $(".imgWrapper").width();
    PH = $(".imgWrapper").height();
    //img size
    var prop = imgSize.width/imgSize.height;
    if(prop>(PW/PH)) {
        imgShowSize.width = PW*0.8;
        imgShowSize.height = imgShowSize.width/prop;
    } else {
        imgShowSize.height = PH*0.8;
        imgShowSize.width = imgShowSize.height*prop;
    }
    $(".imgWrapper ul img").css("width",imgShowSize.width+"px");
    $(".imgWrapper ul img").css("height",imgShowSize.height+"px");
    centerRect.width = imgShowSize.width*zoomMax;
    centerRect.height = imgShowSize.height*zoomMax;
    centerRect.x = (PW-centerRect.width)/2;
    centerRect.y = (PH-centerRect.height)/2;
    console.log("CONTAINER SIZE:",PW,PH);
    changeIndex();
}
function animateIndex(index) {
    clearInterval(timerID);
    timerID = setInterval(function(){
        var offset = index-currentIndex;
        if(Math.abs(offset)<=0.001) {
            currentIndex = index;
            clearInterval(timerID);
        } else {
            currentIndex += offset/4;
        }
        changeIndex();
    },20);
}
function changeIndex() {
    var currentItem = $(".imgWrapper li:eq("+Math.round(currentIndex)+")");
    $(".imgWrapper li").removeClass("current");
    $(".imgNav li").removeClass("current");
    $(".imgNav li:eq("+Math.round(currentIndex)+")").addClass("current");
    currentItem.addClass("current");
    var prevW = 0;
    $(".imgWrapper li").each(function(i){
        var zoom = getZoom(this,i);
        $("a",this).css("zoom",zoom);
        var deg = (i-currentIndex)*-15;
        deg = Math.min(15,deg);
        deg = Math.max(-15,deg);
        $("a",this).css("transform","perspective(600px) rotateY("+deg+"deg)");
        $(this).css("top",(PH-$(this).height())/2+"px");
        var w = $(this).width();
        var x = (i-currentIndex)*(centerRect.width/4)+centerRect.x;
        x += i<=currentIndex?0:(prevW*zoomMin*(i-currentIndex));
        prevW = w;
        $(this).css("left",x+"px");
        $(this).css("z-index",Math.abs(Math.round(i-currentIndex))*-1+100);
    });
    $(".close").css("z-index",imgCount+100);
    //console.log("INDEX:",currentIndex);
}
function isMobile() {
    return navigator.userAgent.match(/mobile/i);
}