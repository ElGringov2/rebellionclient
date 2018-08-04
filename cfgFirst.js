const Config = require("electron-config");
const config = new Config();


function Update(cmdId) {
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getupdatedata.php",
        data: {
            guid: config.get("connectionGuid"),
            cmdName: $("#txtCommander").val(),
            selectedCmd: cmdId
        },
        dataType: "text",
        success: function (data) {
            
            window.location.replace("login.html");
        }
    });
}

function ChooseCommander1() {
    Update($("#commander1text").attr("dbid"))
}


function ChooseCommander2() {
    Update($("#commander2text").attr("dbid"))

}

$(function () {
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getcommanders.php",
        data: {
            guid: config.get("connectionGuid")
        },
        dataType: "xml",
        success: function (data) {
            var i = 1;
            $(data).find("commanders").children().each(function () {
                $("#commander" + i + "name").text($(this).attr("name"));
                $("#commander" + i + "text").text($(this).attr("desc"));
                $("#commander" + i + "text").attr("dbid", $(this).attr("id"));
                i++;
            })
        },
        error: function (status, e) {
            alert (e);
        }
    });
})