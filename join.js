const Config = require("electron-config");
const config = new Config();


function CheckPassword() {
    var pass1 = $("#password").val();
    var pass2 = $("#passwordConfirm").val();
    if (pass1 != pass2) {
        $("#errorPassword").show();
        $("#errorPassword").text("Les mots de passe de correspondent pas");
    }
    else {
        $("#errorPassword").hide();


    }


}



function Create() {
    if ($("#errorMail").is(":visible") === true || $("#errorPassword").is(":visible") === true)
        return;


    $("#error").hide();

    const userName = $("#username").val();
    const password = $("#password").val();
    const mail = $("#mail").val();
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getcreate.php",
        dataType: "xml",
        data: {
            txtUser: userName,
            txtPassword: password,
            txtMail: mail
        },
        success: function (xml) {
            if ($(xml).find("create").attr("error") != "none") {
                $("#error").show();
                $("#error").text($(xml).find("create").attr("error"));
            }
            else {
                //login réussi.
                config.set("connectionGuid", $(xml).find("create").attr("userguid"));
                config.set("username", userName);

                window.location.replace("login.html");
            }
        },
        error: function (e) {
            alert(e);
        }
        
    })
}


function CheckMail() {
    var mail = $("#mail").val();

    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (!re.test(String(mail).toLowerCase())) {
        $("#errorMail").show();
    }
    else {
        $("#errorMail").hide();
    }
}

