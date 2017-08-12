"use strict";

var fonts = ['Arial', 'Calibri', 'Tahoma', 'Verdana'];
var fileData;
var startX = 10;
var startY = 10;
var chat;
var colorcode;
var lineHeight = 1.5;
var chatY;
var imgStage;
var imgLayer;
var imageObj;
var imgGroup;
var isThereText = false;
var downloadFlag = 0;
var totalHeight = 0;
var imgId = -1;
var dataInfo;

function updateChat(target) {
    var textDraws = imgStage.find('.chatText');
    for (var i = 0; i < textDraws.length; i++) {
        var textLine = textDraws[i];
        textLine.position({
            x: target.position()['x'] + imgStage.find('.topLeft')[0].position()['x'] + Number($("#xpos").val()),
            y: target.position()['y'] + imgStage.find('.topLeft')[0].position()['y'] + chatY
        });
        chatY += lineHeight * Number($("#fontsize").val());
        textLine.getLayer().draw();
    }
    chatY = Number($("#ypos").val());
}

function update(activeAnchor) {
    var group = activeAnchor.getParent();
    var topLeft = group.get('.topLeft')[0];
    var topRight = group.get('.topRight')[0];
    var bottomRight = group.get('.bottomRight')[0];
    var bottomLeft = group.get('.bottomLeft')[0];
    var image = group.get('Image')[0];
    var anchorX = activeAnchor.getX();
    var anchorY = activeAnchor.getY();
    // update anchor positions
    switch (activeAnchor.getName()) {
        case 'topLeft':
            topRight.setY(anchorY);
            bottomLeft.setX(anchorX);
            break;
        case 'topRight':
            topLeft.setY(anchorY);
            bottomRight.setX(anchorX);
            break;
        case 'bottomRight':
            bottomLeft.setY(anchorY);
            topRight.setX(anchorX);
            break;
        case 'bottomLeft':
            bottomRight.setY(anchorY);
            topLeft.setX(anchorX);
            break;
    }
    image.position(topLeft.position());
    var width = topRight.getX() - topLeft.getX();
    var height = bottomLeft.getY() - topLeft.getY();
    if(width && height) {
        image.width(width);
        image.height(height);
        $("#width").val(String(width));
        $("#height").val(String(height));
    }
}

function addAnchor(group, x, y, name) {
    var stage = group.getStage();
    var layer = group.getLayer();
    var anchor = new Konva.Circle({
        x: x,
        y: y,
        stroke: '#666',
        fill: '#ddd',
        strokeWidth: 2,
        radius: 8,
        name: name,
        draggable: true,
        dragOnTop: false
    });
    anchor.on('dragmove', function() {
        update(this);
        layer.draw();
        if (isThereText) {
            updateChat(imgGroup.get('.topLeft')[0]);
        }
    });
    anchor.on('mousedown touchstart', function() {
        group.setDraggable(false);
        this.moveToTop();
    });
    anchor.on('dragend', function() {
        group.setDraggable(true);
        layer.draw();
        if (isThereText) {
            updateChat(imgGroup.get('.topLeft')[0]);
        }
    });
    // add hover styling
    anchor.on('mouseover', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'pointer';
        this.setStrokeWidth(4);
        layer.draw();
    });
    anchor.on('mouseout', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'default';
        this.setStrokeWidth(2);
        layer.draw();
    });

    group.add(anchor);
}

function parseChat(chat, color_code) {
    var split_chat = chat.split('\n');
    var color;
    chatY = Number($("#ypos").val());
    if (isThereText) {
        var textDraws = imgStage.find('.chatText');
        for (var i = 0; i < textDraws.length; i++) {
            var textLine = textDraws[i];
            var layer = textLine.getLayer();
            layer.destroy();
        }
    }
    else {
        isThereText = true;
    }
    for (var i = 0; i < split_chat.length; i++) {
        if (split_chat[i][0] === '*' && split_chat[i].match(new RegExp('\\* [A-Za-z]*_[A-Za-z]* attempted to [A-Za-z]* and')) === null && split_chat[i].match(new RegExp('\\* [A-Za-z]*_[A-Za-z]* whispers to [A-Za-z]*_[A-Za-z]ª')) === null) {
            color = '#C2A2DA';
        }
        else if (split_chat[i].slice(0,7) === '[PHONE]' || split_chat[i].match(new RegExp('\[[\d]*?[A-Za-z\d]*?\]\[[A-Za-z]* (Male|Female) Accent\] [A-Za-z]* [A-Za-z]* says:')) !== null || split_chat[i].match(new RegExp('\[[\d]*\][A-Za-z]* [A-Za-z]* says:')) !== null || split_chat[i].slice(0,15) === '[Speaker Phone]') {
            color = '#FFFFFF';
        }
        else if (split_chat[i].slice(0,9) === '[ATTEMPT]' || split_chat[i].match(new RegExp('\\* [A-Za-z]*_[A-Za-z]* attempted to [A-Za-z]* and')) !== null) {
            color = '#A65DDE';
        }
        else if (split_chat[i].match(new RegExp('RP (to|from) [A-Za-z]*_[A-Za-z]')) !== null || split_chat[i].match(new RegExp('\[RP (to|from) [A-Za-z]* [A-Za-z]*\] \\*')) !== null) {
            color = '#CC3DBC';
        }
        else if (split_chat[i].slice(0,7) === '[Radio]' || split_chat[i].slice(0,12) === '[Radio Chat]') {
            color = '#BA9649';
        }
        else if (split_chat[i].match(new RegExp('[A-Za-z]* [A-Za-z]* \[[A-Za-z]* (Male|Female) Accent\] says:')) !== null || split_chat[i].match(new RegExp('[A-Za-z]* [A-Za-z]* says:')) !== null) {
            color = '#FFFFFF';
        }
        else if (split_chat[i].match(new RegExp('[A-Za-z]*(_| )[A-Za-z]* shouts:')) !== null || split_chat[i].slice(0,8) === '[Walkie]') {
            color = '#FFFFFF';
        }
        else if (split_chat[i].match(new RegExp('[A-Za-z]*(_| )[A-Za-z]* whispers:')) !== null) {
            color = '#CECECE';
        }
        else if (split_chat[i].match(new RegExp('Whisper (to|from) [A-Za-z]*(_| )[A-Za-z]*:')) !== null) {
            color = '#FFFF00';
        }
        else if (split_chat[i].match(new RegExp('\\* [A-Za-z]*_[A-Za-z]* whispers to [A-Za-z]*_[A-Za-z]ª')) !== null) {
            color = '#A65DDE';
        }
        var textLayer = new Konva.Layer();
        if ($("#bold").prop("checked")) {
            var simpleText = new Konva.Text({
                x: imgGroup.position()['x'] + imgStage.find('.topLeft')[0].position()['x'] + Number($("#xpos").val()),
                y: imgGroup.position()['y'] + imgStage.find('.topLeft')[0].position()['y'] + chatY,
                text: split_chat[i],
                fontSize: Number($("#fontsize").val()),
                fontFamily: $("#font-family").val(),
                fill: color,
                stroke: 'black',
                strokeWidth:Number($("#strokesize").val()),
                fontStyle:'bold',
                name:'chatText'
            });
            textLayer.add(simpleText);
            chatY += lineHeight * Number($("#fontsize").val());
        }
        else {
            var simpleText = new Konva.Text({
                x: imgGroup.position()['x'] + Number($("#xpos").val()),
                y: imgGroup.position()['y'] + chatY,
                text: split_chat[i],
                fontSize: Number($("#fontsize").val()),
                fontFamily: $("#font-family").val(),
                fill: color,
                stroke: 'black',
                strokeWidth:Number($("#strokesize").val()),
                name:'chatText'
            });
            textLayer.add(simpleText);
            chatY += lineHeight * Number($("#fontsize").val());
        }
        imgStage.add(textLayer);
        textLayer.moveToTop();
        textLayer.draw();
    }
    chatY = Number($("#ypos").val());
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function downloadImage() {
    if (downloadFlag === 0) {
        var dataInfo = imgStage.toDataURL({
            mimeType:'image/png',
            x:imgGroup.position()['x'] + imgStage.find('.topLeft')[0].position()['x'],
            y:imgGroup.position()['y'] + imgStage.find('.topLeft')[0].position()['y'],
            width:imgGroup.get('Image')[0].width(),
            height:imgGroup.get('Image')[0].height()
        });
        $("#download").prop({
            'href':URL.createObjectURL(dataURLtoBlob(dataInfo)),
            'download':'screenshot.png'
        });
        downloadFlag += 1;
        $("#download").click();
    }
    else {
        downloadFlag = 0;
    }
}

function resize(width, height){
    var image = imgGroup.get('Image')[0];
    var topLeft = imgGroup.get('.topLeft')[0];
    var bottomLeft = imgGroup.get('.bottomLeft')[0];
    var topRight = imgGroup.get('.topRight')[0];
    var bottomRight = imgGroup.get('.bottomRight')[0];
    image.width(width);
    image.height(height);
    bottomLeft.setY(topLeft.getY() + height + 1);
    bottomLeft.setX(topLeft.getX());
    topRight.setY(topLeft.getY());
    topRight.setX(topLeft.getX() + width);
    bottomRight.setY(topLeft.getY() + height + 1);
    bottomRight.setX(topLeft.getX() + width);
    imgLayer.draw();
}

function loadImage(){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            if($("#pic-window").width() <= img.width){
                $("#pic-window").width(startX + img.width + 100);
                $(document).width($("#toolbox").width() + $("#pic-window").width());
            }
            if($("#pic-window").height() <= img.height){
                $("#pic-window").height(startY + img.height + 100);
            }
            $("#toolbox").offset({left:String($("#pic-window").width()),top:String($("#pic-window").offset().top)});
            $("#toolbox").height($("#pic-window").height());
            $("#guicontainer").width($("#toolbox").width() + $("#pic-window").width());
            $("#guicontainer").height($("#pic-window").height());
            $("html").height($("#pic-window").offset().top + $("#pic-window").height());
            imgStage = new Konva.Stage({
                container:'pic-window',
                width:$("#pic-window").width(),
                height:$("#pic-window").height()
            });
            imgLayer = new Konva.Layer();
            imgStage.add(imgLayer);
            imageObj = new Konva.Image({
                width:img.width,
                height:img.height
            });
            imgGroup = new Konva.Group({
                x:startX,
                y:startY,
                draggable:true
            });
            imgLayer.add(imgGroup);
            imgGroup.add(imageObj);
            addAnchor(imgGroup,0,0,'topLeft');
            addAnchor(imgGroup,img.width,0,'topRight');
            addAnchor(imgGroup,img.width,img.height+1,'bottomRight');
            addAnchor(imgGroup,0,img.height+1,'bottomLeft');
            imgGroup.on('dragmove', function(){
                updateChat(imgGroup);
            });
            imgGroup.on('dragend', function(){
                updateChat(imgGroup);
            });
            imageObj.image(img);
            imgLayer.draw();
            $("#width").val(String(img.width));
            $("#height").val(String(img.height));
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(fileData[0]);
    $("#chatbtn").toggleClass('disabled');
    $("#gtasacolor").prop('disabled',false);
    $("#gtampcolor").prop('disabled',false);
    $("#gtasacolor").prop('checked', true);
    $("#gtasacolor").click(function(){
       if ($("#gtampcolor").prop('checked')) {
           $("#gtampcolor").prop('checked',false);
       }
       else {
           $("#gtampcolor").prop('checked',true);
       }
    });
    $("#gtampcolor").click(function(){
        if ($("#gtasacolor").prop('checked')) {
            $("#gtasacolor").prop('checked',false);
        }
        else {
            $("#gtasacolor").prop('checked',true);
        }
    });
    $("#chatbtn").click(function(){
       if ($("#chat").val() !== '') {
           var colorCode;
           if($("#gtasacolor").prop('checked')) {
               colorCode = 'gtasa';
           }
           else {
               colorCode = 'gtamp'
           }
           parseChat($("#chat").val(), colorCode);
           chat = $("#chat").val();
           colorcode = colorCode
       }
    });
    $("#resize").toggleClass('disabled');
    $("#resize").click(function(){
        resize(Number($("#width").val()), Number($("#height").val()));
    });
    $("#download").toggleClass('disabled');
    $("#download").click(function(){
       downloadImage();
    });
    $("#bold").prop('disabled',false);
    $("#bold").prop('checked', true);
}

function glueDownload(){
    if (downloadFlag === 0) {
        dataInfo = imgStage.toDataURL({
            mimeType:'image/png',
            x:imgGroup.position()['x'] ,
            y:imgGroup.position()['y'],
            width:imgGroup.get('Image')[1].width(),
            height:totalHeight
        });

        $("#glueDownload").prop({
            'href':URL.createObjectURL(dataURLtoBlob(dataInfo)),
            'download':'screenshot.png'
        });
        downloadFlag += 1;
        $("#glueDownload").click();
    }
    else {
        downloadFlag = 0;
    }
}

function loadAndGlue() {
    imgStage = new Konva.Stage({
        container:'pic-window',
        width:$("#pic-window").width(),
        height:$("#pic-window").height()
    });
    imgLayer = new Konva.Layer();
    imgStage.add(imgLayer);
    imgGroup = new Konva.Group({
        x:10,
        y:10,
        draggable:true
    });
    imgLayer.add(imgGroup);
    for (var i = 0; i < fileData.length; i++) {
        var reader = new FileReader();
        reader.onload = function(event){
            var img = new Image();
            img.onload = function(){
                imgId += 1;
                var imageObject = new Konva.Image({
                    width:img.width,
                    height:img.height,
                    y:totalHeight
                });
                imgGroup.add(imageObject);
                imageObject.image(img);
                totalHeight += img.height;
                imgLayer.draw();
                if (imgId === fileData.length - 1) {
                    if (img.width >= $("#pic-window").width()){
                        $("#pic-window").width(imgGroup.position()['x'] + imgGroup.find('Image')[0].getAttr('width') + 100)
                        $(document).width($("#toolbox").width() + $("#pic-window").width());
                    }
                    if (totalHeight >= $("#pic-window").height()){
                        $("#pic-window").height(imgGroup.position()['y'] + totalHeight + 100);
                    }
                    $("#toolbox").offset({left:String($("#pic-window").width()),top:String($("#pic-window").offset().top)});
                    $("#toolbox").height($("#pic-window").height());
                    $("#guicontainer").width($("#toolbox").width() + $("#pic-window").width());
                    $("#guicontainer").height($("#pic-window").height());
                    $("html").height($("#pic-window").offset().top + $("#pic-window").height());
                    imgStage.setAttrs({
                        height:$("#pic-window").height(),
                        width:$("#pic-window").width()
                    });
                    imgLayer.draw();
                    imgStage.draw();
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(fileData[i]);
    }
    $("#glueDownload").toggleClass('disabled');
    $("#glueDownload").click(function(){
        glueDownload();
    });
}

function glueGUI(type) {
    $('body').append('<div class="row vertical-center-row" id="guicontainer" style="margin:2% 0 0 0;"><div class="col-md-9" id="pic-window" style="background-color:#2B2B2B;' +
        'border-top:1px solid black;border-left:1px solid black;padding:0;margin:0;"></div><div class="col-md-3" id="toolbox" style="background-color:#002836;border-left:1px solid black;' +
        'border-top:1px solid black;padding:0;margin:0;"></div></div>');
    var height = $(document).height() - $("#guicontainer").offset().top;
    $("#toolbox").height(height);
    $("#pic-window").height(height);
    $("#pic-window").append('<input type="file" id="files" class="inputClass" multiple/>');
    $("#files").offset({left:String($("#pic-window").width()/2), top:String($("#pic-window").offset().top + $("#pic-window").height()/2)});
    $("#files").on('change', function(e){
        handleFileSelect(e, type);
    });
    $("#toolbox").append('<span class="glyphicon glyphicon-scissors" style="color:white;margin:3% 3% 3% 3%"> ' +
    '<span style="color:white;font-family:\'Raleway\',sans-serif;font-size:18px;font-weight:bold">Download Area</span><br><br>' +
        '<a id="glueDownload" class="btn btn-primary disabled btn-lg">Download Image</a>');
}
function handleFileSelect(evt, type) {
        fileData = evt.target.files;
        $("#files").remove();
        if (type === 'edit') {
            loadImage();
        }
        else {
            loadAndGlue();
        }
}

function editGUI(type) {
    $('body').append('<div class="row vertical-center-row" id="guicontainer" style="margin:2% 0 0 0;"><div class="col-md-9" id="pic-window" style="background-color:#2B2B2B;' +
        'border-top:1px solid black;border-left:1px solid black;padding:0;margin:0;"></div><div class="col-md-3" id="toolbox" style="background-color:#002836;border-left:1px solid black;' +
        'border-top:1px solid black;padding:0;margin:0;"></div></div>');
    var height = $(document).height() - $("#guicontainer").offset().top;
    $("#toolbox").height(height);
    $("#pic-window").height(height);
    $("#pic-window").append('<input type="file" id="files" class="inputClass" />');
    $("#files").offset({left:String($("#pic-window").width()/2), top:String($("#pic-window").offset().top + $("#pic-window").height()/2)});
    $("#files").on('change', function(e){
       handleFileSelect(e, type);
    });
    $("#toolbox").append('<span class="glyphicon glyphicon-scissors" style="color:white;margin:3% 3% 3% 3%"> ' +
        '<span style="color:white;font-family:\'Raleway\',sans-serif;font-size:18px;font-weight:bold">Tools</span>' +
        '</span><div style="margin:3% 3% 3% 3%;border:2px dashed white;padding:10px 10px 10px 10px;border-radius:5px 5px 5px 5px;box-shadow:0 1px 5px rgba(0,0,0,0.46);">' +
        '<h4 style="font-family:\'Raleway\', sans-serif;color:white;">Picture Info & Resize</h4>' +
        '<span class="glyphicon glyphicon-resize-full" style="color:white;"> <label style="font-family:\'Raleway\', sans-serif;color:white;font-size:14px;"' +
        '>Width:</label> <input type="text" id="width" name="width" style="background-color:#2B2B2B;color:white;border:1px solid white;" size="4"> <span class="glyphicon glyphicon-link" style="color:white"></span> ' +
        '<label style="font-family:\'Raleway\', sans-serif;color:white;font-size:14px;">Height:</label> <input type="text" ' +
        'id="height" name="height" style="background-color:#2B2B2B;color:white;border:1px solid white;" size="4">  ' +
        '</span> <button id="resize" class="btn btn-primary btn-sm disabled">Resize</button><br><h4 style="font-family:\'Raleway\', sans-serif;color:white;">Text Position (X,Y)</h4>' +
        '<span class="glyphicon glyphicon-resize-horizontal" style="color:white"></span>  <input type="text" id="xpos" style="background-color:#2B2B2B;color:white;border' +
        ':1px solid white;" size="4" placeholder="X"> <span class="glyphicon glyphicon-resize-vertical" style="color:white"></span> <input type="text" id="ypos" placeholder="Y"' +
        ' size="4" style="background-color:#2B2B2B;color:white;border:1px solid white;">  ' +
        '<br><h4 style="font-family:\'Raleway\', sans-serif;color:white;">Font Properties</h4><div class="checkbox"><label style="color:white;font-family:\'Raleway\',sans-serif;font-size:14px;">' +
        '<input type="checkbox" id="bold" value="" disabled>Bold</label>  <label style="color:white;font-family:\'Raleway\',sans-serif;font-size:14px;"><input type="checkbox" id="gtampcolor" value="" disabled>GTA:MP Color Code</label>' +
        '  <label style="color:white;font-family:\'Raleway\',sans-serif;font-size:14px;"><input type="checkbox" id="gtasacolor" value="" disabled>GTA:SA Color Code</label></div><span class="glyphicon glyphicon-text-size" style="color:white"></span> <span ' +
        'style="font-family:\'Raleway\', sans-serif;font-size:14px;color:white;">Size: </span> <input type="text" id="fontsize" style="background-color:#2B2B2B;color:white;border:1px solid white;" size="2">' +
        '<br><br><span style="font-family:\'Raleway\', sans-serif;color:white;font-size:14px;">Stroke Size: </span> <input type="text" id="strokesize" size="2" style="background-color:#2B2B2B;color:white;' +
        'border:1px solid white;"><br><br><span class="glyphicon glyphicon-font" style="color:white;"></span> <span style="font-family:\'Raleway\', sans-serif;color:white;font-size:14px;">Font family: </span><select id="font"></select><br><br>' +
        '<span class="glyphicon glyphicon-console" style="color:white"></span> <textarea id="chat" style="resize:none" class="form-control" rows="4" ' +
        'placeholder="Type your chat here"></textarea><button class="btn btn-primary btn-sm disabled" id="chatbtn">Input Chat</button>' +
        '<br><br><span class="glyphicon glyphicon-download-alt" style="color:white"></span> <a class="btn btn-primary btn-sm disabled" id="download">Download Image</a></div>');
    for (var i = 0; i < fonts.length; i++) {
        $("#font").append('<option value="'+fonts[i]+'">'+fonts[i]+'</option>');
    }
    $("#ypos").val('50');
    $("#xpos").val('10');
    $("#fontsize").val('22');
    $("#strokesize").val('1');
}

function cardFaint(type){
    $(".card")
        .addClass("flipping")
        .bind("transitionend webkittransitionend", function () {
            $(".card")
                .unbind("transitionend webkittransitionend")
                .removeClass("flipping");
        });
    setTimeout(function(){
        $(".choice").remove();
        if (type === 'edit'){
            editGUI(type);
        }
        else {
            glueGUI(type);
        }
    },750);
}

function main(){
    $("#title-container").offset({left:String($("#logo").offset().left + $("#logo").width()/4)});
    $(window).resize(function(){
        $("#title-container").offset({left:String($("#logo").offset().left + $("#logo").width()/4)});
    });
    $("#edit").click(function(){
        cardFaint('edit');
        $("#edit").unbind('click');
    });
    $("#glue").click(function(){
       cardFaint('glue');
       $("#glue").unbind("click");
    });
}

$(document).ready(function(){main()});
