const Config = require("electron-config");
const config = new Config();

const upgrades = new Array();
const ships = new Array();


$(function () {
    $.ajax({
        url: config.get("ServerAdress") + "getnewflight.php",
        data: { guid: config.get("connectionGuid") },
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


    return $("<div />").append($(template).clone()).html();
}


function SwitchTemplate(TemplateID, divID) {
    var data = $("#" + divID);
    var template = $.parseHTML($.trim($("#" + TemplateID).html()));
    $(template).first().attr("id", $(data).attr("id"));
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
    return $("<div />").append($(template).clone()).html();
}






function SelectShip(id, newXWS, ConnectionGUID) {
    $.ajax({
        url: "/createsquad",
        type: "POST",
        data: { guid: ConnectionGUID, setshipid: id, xws: newXWS },
        success: function (xml) {
            //les stats
            var pilotStatsTemplate = "";
            $.ajax({ url: "template_pilotstats.html", async: false, success: function (html) { pilotStatsTemplate = html; } });
            var stats = pilotStatsTemplate;
            stats = replaceAll(stats, "[SHIPLETTER]", $(xml).attr("shipletter"));
            stats = replaceAll(stats, "[PILOTSKILL]", $(xml).attr("pilotskill"));
            stats = replaceAll(stats, "[SHIPATTACK]", $(xml).attr("shipattack"));
            stats = replaceAll(stats, "[SHIPAGILITY]", $(xml).attr("shipagility"));
            stats = replaceAll(stats, "[SHIPHULL]", $(xml).attr("shiphull"));
            stats = replaceAll(stats, "[SHIPSHIELD]", $(xml).attr("shipshield"));
            $("#ShipName" + id).html($(xml).attr("shipname"));
            $("#stats" + id).html(stats);
        },
    });
}


var cost = 0;



function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();

    if (ev.target.id == "squadroncreate" || ev.target.id == "squadroncontent") {
        $("#" + ev.target.id).append(SwitchTemplate("pilotinlinetemplate",  ev.dataTransfer.getData("text")));
    }
    else {
        node = ev.target.parentNode;
        while (!node.id.toString().startsWith("pilot") && node.id != "squadroncontent")
            node = node.parentNode;
        node.parentNode.insertBefore(document.getElementById(ev.dataTransfer.getData("text")), node.nextSibling);
    }


    if (ev.target.id == "squadroncreate") {
        //creation
        cost += parseInt($("#" + data).find("#pilotcost").text());
    }
    else {
        cost -= parseInt($("#" + data).find("#pilotcost").text());

    }
    $("#totalcost").text(cost + "pts");
}