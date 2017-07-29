var baseUrl = window.location.protocol + "//" + window.location.host;
var socket = io.connect(baseUrl);
var btnAdd = document.getElementById("btn-add");
var inputTextAdd = document.getElementById("input-text-add");
var divMessage = document.getElementById("message-display");

btnAdd.addEventListener("click", function() {
    socket.emit("addComp", inputTextAdd.value);
    inputTextAdd.value = "";
});

socket.on("connect", function(data) {
    socket.emit("join", 'Hello World from client');
});

socket.on("invalidComp", function(message) {
    divMessage.innerText = message;
});

socket.on("update", function(compData) {
    parseData(compData);
    //Reset the message-display
    divMessage.innerText = "";
    
    //For each update add the delete event to the delete buttons
    var btnDelete = document.getElementsByClassName("btn-delete");
    for (var i = 0; i < btnDelete.length; i++) {
        btnDelete[i].addEventListener("click", function() {
            socket.emit('deleteComp', this.getAttribute("comp"));
        });
    }
});

function parseData(compData) {
    var parsedCompData = [];
    for (var comp in compData) {
        var oneComp = [];
        for (var i = 0; i < compData[comp].length; i++) {
            var unixDate = new Date(compData[comp][i].date).getTime();
            oneComp.push([unixDate, compData[comp][i].open]);
        }
        parsedCompData.push({
            name: comp,
            data: oneComp
        })
    }
    renderGraph(parsedCompData);
}

function renderGraph(parsedCompData) {
    Highcharts.stockChart('result', {
        rangeSelector: {
            selected: 1
        },
        title: {
            text: 'Stock Price'
        },
        series: parsedCompData
    });
    
    document.getElementById("list-comp").innerHTML = "";
    for (var i = 0; i < parsedCompData.length; i++) {
        var oneComp = document.createElement("div");
        oneComp.className = "one-comp";
        oneComp.innerHTML = "Company: " + parsedCompData[i].name + '<button class="btn-delete" comp="' + parsedCompData[i].name + '">X</button>';
        document.getElementById("list-comp").appendChild(oneComp);
    }
}
    