const Config = require("electron-config");
const config = new Config();

$(function () {
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getdraft.php",
        data: { guid: config.get("connectionGuid") },
        dataType: "xml",
        success: function (xmlData) {
            var xml = $(xmlData).find("draft");
            if ($(xml).children().length == 0) {
                $("#content").text("En attente d'un autre joueur...");
            }
            else {
                var assetId = 0;
                var ship = "";
                $(xml).children().each(function () {
                    var template = $("#pilotinlinetemplate").html();
                    if (ship != $(this).attr("shipname"))
                        $("#content").append("<hr><p class='text-light'>" + $(this).attr("shipname") + "</p>");
                    ship = $(this).attr("shipname")
                    assetId++;
                    template = template.replace("id='inlinepilot'", "id='assetpilot_" + assetId + "'");
                    template = template.replace("[PILOTNAME]", $(this).attr("name"));
                    template = template.replace("[PILOTSHIPNAME]", $(this).attr("shipname"));
                    template = template.replace("[SHIPLETTER]", $(this).attr("shipletter"));
                    template = template.replace("[PILOTSKILL]", $(this).attr("pilotskill"));
                    template = template.replace("[SHIPATTACK]", $(this).attr("shipattack"));
                    template = template.replace("[SHIPAGILITY]", $(this).attr("shipagility"));
                    template = template.replace("[SHIPHULL]", $(this).attr("shiphull"));
                    template = template.replace("[SHIPSHIELD]", $(this).attr("shipshield"));
                    template = template.replace("[PILOTABILITY]", $(this).attr("pilotability"));
                    template = template.replace("[PILOTCOST]", $(this).attr("cost"));
                    template += "<button class='btn btn-primary col-1' onclick='ChoosePilot(" + $(this).attr("id") + ");'>Choisir</button>";
                    $("#content").append("<div class='row'>" + template + "</div>");

                });

            }


        }
    });

    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getsquadrons.php",
        data: { guid: config.get("connectionGuid") },
        dataType: "xml",
        success: function (xmlData) {
            var assetId = 0;
            $(xmlData).find("squadrons").children().each(function () {
                $(this).find("flight").each(function () {
                    $(this).find("pilot").each(function () {
                        var template = $("#pilotinlinetemplate").html();
                        assetId++;
                        template = template.replace("id='inlinepilot'", "id='assetpilot_" + assetId + "'");
                        template = template.replace("[PILOTNAME]", $(this).attr("name"));
                        template = template.replace("[PILOTSHIPNAME]", $(this).attr("shipname"));
                        template = template.replace("[SHIPLETTER]", $(this).attr("shipletter"));
                        template = template.replace("[PILOTSKILL]", $(this).attr("pilotskill"));
                        template = template.replace("[SHIPATTACK]", $(this).attr("shipattack"));
                        template = template.replace("[SHIPAGILITY]", $(this).attr("shipagility"));
                        template = template.replace("[SHIPHULL]", $(this).attr("shiphull"));
                        template = template.replace("[SHIPSHIELD]", $(this).attr("shipshield"));
                        template = template.replace("[PILOTABILITY]", $(this).attr("pilotability"));
                        template = template.replace("[PILOTCOST]", $(this).attr("cost"));
                        $("#mycontent").append("<div class='row'>" + template + "</div>");
    
                    });

                });





            });

        }
    });
});


function ChoosePilot(id) {
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getdraft.php",
        data: {
            guid: config.get("connectionGuid"),
            selectedPilotID: id
        },
        dataType: "text",
        success: function () {
            window.location.reload();
        }
    });
}