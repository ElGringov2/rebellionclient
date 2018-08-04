const Config = require("electron-config");
const config = new Config();
const { app, BrowserWindow } = require('electron');


window.onload = function () {


    var guid = config.get("connectionGuid");
    if (guid == null) guid = "";

    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getvalidateguid.php",
        data: {
            verifyguid: guid
        },
        success: function (data) {
            if (data == "VALID")
                window.location.replace("index.html");
            else if (data == "CHOOSECOMMANDER")
                window.location.replace("configurefirst.html");
            else if (data == "DRAFTXWING")
                window.location.replace("draftxwing.html");
            else
                ShowLogin("Validation du GUID impossible. Veuillez vous reconnecter.");
        },
        error: function () {
            ShowLogin("Impossible de joindre le serveur.");
        }
    })
}

function ShowLogin(ErrorMessage) {

    var user = config.get("username");

    if (user == null)
        user = "";

    $("#username").val(user);

    $("body").show();
    if (ErrorMessage != "") {
        $("#error").attr("display", "inline");
        $("#error").text(ErrorMessage);
    }
}



function Login() {
    const userName = $("#username").val();
    const password = $("#password").val();
    $("#error").hide();

    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getlogin.php",
        data: {
            txtUser: userName,
            txtPassword: password
        },
        dataType: "text",
        success: function (xml) {
            if ($(xml).attr("error") != "") {
                $("#error").show();
                $("#error").text($(xml).attr("error"));
            }
            else {

                //login réussi.
                config.set("connectionGuid", $(xml).attr("guid"));
                config.set("username", userName);
                if ($(xml).attr("action") == "choosecommander")
                    window.location.replace("configurefirst.html");
                else if ($(xml).attr("action") == "draftxwing")
                    window.location.replace("draftxwing.html");
                else
                    window.location.replace("index.html");
            }
        },
        error: function () {
            $("#error").attr("display", "inline");
            $("#error").text("Impossible de joindre le serveur.");
        }

    });
}


function Create() {
    window.location.replace("join.html");
}