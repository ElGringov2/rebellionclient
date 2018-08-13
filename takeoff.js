const Config = require("electron-config");
const config = new Config();

const remote = require('electron').remote;




$(function () {


    $.ajax({
        url: config.get("ServerAdress") + "getnewflight.php",
        data: {
            guid: config.get("connectionGuid"),
            squadron: config.get("SquadronName"),
        },
        dataType: "xml",
        type: "POST",
        success: function (xml) {
            var assetID = 0;
            var contentString = "";
            $(xml).find("ships").children().each(function () {
                contentString += UpdatePilotTemplate("pilotblocktemplate", this, assetID);
                assetID++;
            })
            $("#squadroncontent").html(contentString);
        }
    })
})

/**
 * Remplit un template avec les infos du pilote
 * @param {string} TemplateID L'ID du div contenant le template
 * @param {string} xml le XML du pilote
 * @param {Number} id l'ID du pilote dans la liste
 * 
 */
function UpdatePilotTemplate(TemplateID, xml, id) {

    var template = $.parseHTML($.trim($("#" + TemplateID).html()));

    $(template).first().attr("id", "pilot_" + id);
    $(template).first().attr("databaseid", $(xml).attr("id"));
    $(template).find("#pilotname").text($(xml).attr("name"));
    $(template).find("#pilotship").text($(xml).attr("shipname"));
    $(template).find("#pilotshipletter").text($(xml).attr("shipletter"));
    $(template).find("#pilotskill").text($(xml).attr("pilotskill"));
    $(template).find("#shipattack").text($(xml).attr("shipattack"));
    $(template).find("#shipagility").text($(xml).attr("shipagility"));
    $(template).find("#shiphull").text($(xml).attr("shiphull"));
    $(template).find("#shipshield").text($(xml).attr("shipshield"));
    $(template).find("#pilotability").text($(xml).attr("pilotability"));
    $(template).find("#pilotcost").text($(xml).attr("cost"));

    var slotID = 0;
    $(xml).find("upgrades").children().each(function () {
        var upgradeContenairTemplate = $.parseHTML($.trim($("#upgradecontenair").html()));
        $(upgradeContenairTemplate).first().attr("id", "upgradeslot_" + slotID);
        $(upgradeContenairTemplate).first().attr("slot", slotID);
        $(upgradeContenairTemplate).first().attr("type", $(this).attr("type"));
        $(upgradeContenairTemplate).find("#upgradebutton").text($(this).attr("type"));

        // var upgradeTemplate = $.parseHTML($.trim($("#upgradetemplate").clone().html()));
        // $(upgradeTemplate).first().attr("id", "upgrade_" + $(this).attr("index"));
        // $(upgradeTemplate).first().attr("slot", slotID);
        // $(upgradeTemplate).first().attr("type", $(this).attr("type"));
        // $(upgradeTemplate).find("#upgradename").html($(this).attr("type"));
        $(template).find("#upgrades").append(upgradeContenairTemplate);
        slotID++;
    })

    return $("<div />").append($(template).clone()).html();
}


function SwitchTemplate(TemplateID, divID) {
    var data = $("#" + divID);
    var template = $.parseHTML($.trim($("#" + TemplateID).html()));
    $(template).first().attr("id", $(data).attr("id"));
    $(template).first().attr("databaseid", $(data).attr("databaseid"));
    $(template).find("#pilotname").text($(data).find("#pilotname").text());
    $(template).find("#pilotship").text($(data).find("#pilotship").text());
    $(template).find("#pilotshipletter").text($(data).find("#pilotshipletter").text());
    $(template).find("#pilotskill").text($(data).find("#pilotskill").text());
    $(template).find("#shipattack").text($(data).find("#shipattack").text());
    $(template).find("#shipagility").text($(data).find("#shipagility").text());
    $(template).find("#shiphull").text($(data).find("#shiphull").text());
    $(template).find("#shipshield").text($(data).find("#shipshield").text());
    $(template).find("#pilotability").text($(data).find("#pilotability").text());
    $(template).find("#pilotcost").text($(data).find("#pilotcost").text());
    $(template).find("#upgrades").html($(data).find("#upgrades").html());
    return $("<div />").append($(template).clone()).html();
}






// function SelectShip(id, newXWS, ConnectionGUID) {
//     $.ajax({
//         url: "/createsquad",
//         type: "POST",
//         data: { guid: ConnectionGUID, setshipid: id, xws: newXWS },
//         success: function (xml) {
//             //les stats
//             var pilotStatsTemplate = "";
//             $.ajax({ url: "template_pilotstats.html", async: false, success: function (html) { pilotStatsTemplate = html; } });
//             var stats = pilotStatsTemplate;
//             stats = replaceAll(stats, "[SHIPLETTER]", $(xml).attr("shipletter"));
//             stats = replaceAll(stats, "[PILOTSKILL]", $(xml).attr("pilotskill"));
//             stats = replaceAll(stats, "[SHIPATTACK]", $(xml).attr("shipattack"));
//             stats = replaceAll(stats, "[SHIPAGILITY]", $(xml).attr("shipagility"));
//             stats = replaceAll(stats, "[SHIPHULL]", $(xml).attr("shiphull"));
//             stats = replaceAll(stats, "[SHIPSHIELD]", $(xml).attr("shipshield"));
//             $("#ShipName" + id).html($(xml).attr("shipname"));
//             $("#stats" + id).html(stats);
//         },
//     });
// }


var cost = 0;



function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");

    if (ev.target.id == "squadroncreate" || ev.target.id == "squadroncontent") {
        $("#" + ev.target.id).append(SwitchTemplate("pilotinlinetemplate", data));
        $("#" + data).remove();
    }
    else {
        node = ev.target.parentNode;
        while (!node.id.toString().startsWith("pilot") && node.id != "squadroncontent")
            node = node.parentNode;
        node.parentNode.insertBefore(document.getElementById(data), node.nextSibling);
    }


    if (ev.target.id == "squadroncreate") {
        //creation
        cost += parseInt($("#" + data).find("#pilotcost").text());
        //upgrades:



        $.ajax({
            url: config.get("ServerAdress") + "getmyxwingstock.php",
            data: {
                guid: config.get("connectionGuid"),
                ship: $("#" + data).first().attr("databaseid")
            },
            dataType: "xml",
            type: "POST",
            success: function (xml) {


                $(xml).find("stock").children().each(function () {
                    // if ($("#" + data + " #upgrades #upgrade_" + $(this).attr("type")).length == 0) {
                    //     var upgradeTemplate = $.parseHTML($.trim($("#upgradecontenair").html()));
                    //     $(upgradeTemplate).first().attr("id", "upgrade_" + $(this).attr("type"));
                    //     $(upgradeTemplate).find("#upgradebutton").text($(this).attr("type"));

                    //     $("#" + data + " #upgrades").append(upgradeTemplate[0]);
                    // }

                    var item = this;

                    $("#" + data + " #upgrades").children().each(function () {
                        if ($(this).attr("type") == $(item).attr("type")) {
                            var upgradeItemTemplate = $.parseHTML($.trim($("#upgradetemplate").html()));
                            $(upgradeItemTemplate).first().attr("xws", $(item).attr("xws"));
                            $(upgradeItemTemplate).first().attr("ship", $("#" + data).first().attr("databaseid"));
                            $(upgradeItemTemplate).first().attr("upgradeid", $(this).attr("slot"));
                            $(upgradeItemTemplate).first().attr("name", $(item).attr("name"));
                            $(upgradeItemTemplate).find("#upgradename").html($(item).attr("name"));
                            $(upgradeItemTemplate).find("#upgradedesc").html($(item).attr("desc"));
                            $(upgradeItemTemplate).find("#upgradecost").html($(item).attr("cost"));
                            $(this).find("#upgrademenu").append(upgradeItemTemplate[0])
                        }
                    });


                    // $("#" + data + " #upgrades #upgrade_" + $(item).attr("type") + " #upgrademenu").append(upgradeItemTemplate[0])
                });
            },
            error: function (status, error) {
                alert(error);
            }
        });
        $("#totalcost").text(cost + "pts");


    }
    else {
        //remove

        $.ajax({
            url: config.get("ServerAdress") + "getmyxwingstock.php",
            data: {
                guid: config.get("connectionGuid"),
                shiptoremove: $("#" + data).attr("databaseid"),
                clear: 1
            },
            type: "POST",
            success: function (data) {
                cost -= parseInt(data);
                $("#totalcost").text(cost + "pts");
            }
        });
    }


}




function SelectUpgrade(elem) {


    $.ajax({
        url: config.get("ServerAdress") + "getmyxwingstock.php",
        data: {
            guid: config.get("connectionGuid"),
            xws: $(elem).attr("xws"),
            shipid: $(elem).attr("ship"),
            upgradeid: $(elem).attr("upgradeid"),
        },
        type: "POST",
        success: function (data) {
            var parent = $(elem).parent();
            var target = $(parent).prev();
            $(target).html($(elem).attr("name"))
            cost += parseInt(data);
            $("#totalcost").text(cost + "pts");
        },
        error: function (status, error) {
            alert(error);
        }
    });

}



function Cancel() {


    $.ajax({
        url: config.get("ServerAdress") + "getmyxwingstock.php",
        data: {
            guid: config.get("connectionGuid"),
            cancel: 1,
        },
        type: "POST",
        success: function (data) {
            var window = remote.getCurrentWindow();
            window.close();

        },
        error: function (status, error) {
            alert(error);
        }
    });

}

$(window).on("beforeunload", function () {

    Cancel();
})

function TakeOff() {
    $.ajax({
        url: config.get("ServerAdress") + "getmyxwingstock.php",
        data: {
            guid: config.get("connectionGuid"),
            takeoff: 1,
            squadron: config.get("SquadronName"),
        },
        type: "POST",
        success: function (data) {
            var window = remote.getCurrentWindow();
            window.close();


        },
        error: function (status, error) {
            alert(error);
        }
    });
}