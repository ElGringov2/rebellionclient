const Config = require("electron-config");
const config = new Config();
const { app, BrowserWindow } = require('electron');


window.onload = function () {


    var user = config.get("username");

    if (user == null)
        user = "";

    $("#username").val(user);

}



function Login() {
    var userName = $("#username").val();
    var password = $("#password").val();
    $("#error").hide();

    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "loginweb",
        data: {
            txtUser: userName,
            txtPassword: password
        },
        dataType: "xml",
        success: function (xml) {
            var result = $(xml).find("login");
            if ($(result).attr("error") != "") {
                $("#error").show();
                $("#error").text($(result).attr("error"));
            }
            else {
                //login réussi.
                config.set("connectionGuid", $(result).attr("guid"));
                
                window.location.replace("index.html");
            }
        },
        error: function () {
            $("#error").attr("display", "inline");
            $("#error").text("Impossible de joindre le serveur.");
        }

    });
}