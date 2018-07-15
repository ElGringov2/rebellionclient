const Config = require("electron-config");
const config = new Config();
const { app, BrowserWindow } = require('electron');

function Maximize() {
    const { remote } = require('electron')
    remote.BrowserWindow.getFocusedWindow().maximize();
}

function Disconnect(ConnectionGUID) {
    config.delete("connectionGuid");
    window.location.replace('./login.html');
}

function UpdateUserInfos() {
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getuserinfos.php",
        data: { guid: config.get("connectionGuid") },
        dataType: "xml",
        success: function (xmlData) {
            var xml = $(xmlData).find("userinfos");
            $("#username").text($(xml).attr("name"));
            $("#usercredits").text($(xml).attr("credits"));
            $("#usercratecount").text($(xml).attr("crate"));


        }
    });
}


function ClearDesktop() {
    ShowWaitIndicator("#desktop");
}

function ShowWaitIndicator(divID) {
    $(divID).html("<div class='h-100 row align-items-center'>" +
        " <div class='col'>" +
        "    <div class='loader'></div> " +
        "</div> " +
        "</div>");
}
function LoadGalaxy() {
    ClearDesktop();
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getgalaxy.php",
        data: { guid: config.get("connectionGuid") },
        dataType: "xml",
        success: function (GalaxyXML) {
            var template = $("#planetbasetemplate").html();

            var style = "left: calc([X]% - 8px); top: calc([Y]% - 8px);";



            $("#desktop").html("<div style='background: url(\"./starfield.jpg\") no-repeat center center fixed;-webkit-background-size: contain;-moz-background-size: contain;-o-background-size: contain;background-size: cover;height: 100%;width:  100%;'>");
            $(GalaxyXML).find("planets").children().each(function () {
                var res = template;
                var localStyle = style;
                localStyle = localStyle.replace("[X]", $(this).attr("x"));
                localStyle = localStyle.replace("[Y]", $(this).attr("y"));
                res = res.replace("\"planeticon\"", "\"planeticon_" + $(this).attr("guid") + "\"");
                res = res.replace("src=\"\"", "src=\"./" + $(this).attr("image") + "\"");
                res = res.replace("style=\"display: none;\"", "style=\"" + localStyle + "\"");
                res = res.replace("guid=\"\"", "guid=\"" + $(this).attr("guid") + "\"");
                res = res.replace("PlanetName", $(this).attr("name"));

                $("#desktop").append(res);
            });

            $(GalaxyXML).find("icons").children().each(function () {
                var res = $("#galaxyicontemplate").html();
                var localStyle = style + "position: absolute;";

                localStyle = localStyle.replace("[X]", $(this).attr("x"));
                localStyle = localStyle.replace("[Y]", $(this).attr("y"));
                var offset = 10 + parseInt($(this).attr("offset"));
                localStyle = localStyle.replace("- 8px", "+ " + offset + "px");
                localStyle = localStyle.replace("- 8px", "+ 12px");
                res = res.replace("style=\"display: none;\"", "style=\"" + localStyle + "\"");
                res = res.replace("IconName", $(this).attr("name"));
                res = res.replace("src=\"\" ", "src=\"" + $(this).attr("icon") + "\"");

                $("#desktop").append(res);

            });

            $("#desktop").append("</div>");
            $('[data-toggle="tooltip"]').tooltip();
            $(document).ready(function () {
                $(".planetdiv").click(function () {
                    $.ajax({
                        type: "POST",
                        url: config.get("ServerAdress") + "getplanetinfos.php",
                        data: {
                            planetGUID: $(this).attr("guid"),
                            guid: config.get("connectionGuid")
                        },
                        success: function (xml) {


                            $("#planetmodalinfos").html($("#planetModalTemplate").html());



                            $("#planetmodalinfos #planetName").text($(xml).attr("name"));
                            $("#planetmodalinfos #planetDesc").text($(xml).attr("description"));
                            $("#planetmodalinfos #planetFullImage").text($(xml).attr("image"));
                            $("#planetmodalinfos #planetHistory").text($(xml).attr("history"));


                            var sCampaign = "";
                            var row = 0;
                            $(xml).find("campaign").children().each(function () {
                                if ($(this).attr("Row") != row) {
                                    if (row != 0) {
                                        sCampaign += "</div>";

                                    }
                                    sCampaign += "<div class='row m-3 d-flex justify-content-left'>";
                                    row = $(this).attr("Row")
                                }
                                var template = $("#missiontemplate").html();
                                template = template.replace("src=\"\"", "src=\"./" + $(this).attr("gamelogo") + "\"");
                                template = template.replace("[DESCRIPTION]", $(this).attr("Description"));
                                template = template.replace("[NAME]", $(this).attr("Name"));
                                template = template.replace("[REWARD]", $(this).attr("Reward"));
                                // template = template.replace("[COLOR]", $(this).attr("Color"));
                                // template = template.replace("[TYPE]", $(this).attr("Border"));
                                template = template.replace("[CLASS]", $(this).attr("Class"));
                                sCampaign += template;
                            });
                            sCampaign += "</div>";
                            $("#planetmodalinfos #PlanetCampaign").append(sCampaign);


                            var buildingsString = "";
                            $(xml).find("buildings").children().each(function () {
                                var template = $("#buildingtemplate").html();

                                template = template.replace("src=\"\"", "src=\"./" + $(this).attr("img") + "\"");
                                template = template.replace("[BUILDINGNAME]", $(this).attr("name"));
                                template = template.replace("[BUILDINGQL]", $(this).attr("roundedQL"));
                                template = template.replace("[BUILDINGCONTENT]", $(this).attr("FullDescription"));


                                buildingsString += template;
                            });
                            $("#planetmodalinfos #buildings-list").html(buildingsString);
                            var assetId = 0;
                            var flightName = "";
                            $("#planetmodalinfos #assets-list").html("");
                            $(xml).find("assets").children().each(function () {
                                assetId++;
                                if (flightName != $(this).attr("squadron") + ", " + $(this).attr("flight")) {
                                    flightName = $(this).attr("squadron") + ", " + $(this).attr("flight")
                                    $("#planetmodalinfos #assets-list").append("<h6>Escadron " + flightName + " (vous appartient)</h6>");
                                }
                                //var xml = $(this).find("pilot");
                                var template = $("#pilotinlinetemplate").html();
                                template = template.replace("id='pilot'", "id='assetpilot_" + assetId + "'");
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
                                $("#planetmodalinfos #assets-list").append(template);
                            });
                            flightName = "";
                            $(xml).find("otherassets").children().each(function () {
                                assetId++;
                                if (flightName != $(this).attr("squadron") + ", " + $(this).attr("flight")) {
                                    flightName = $(this).attr("squadron") + ", " + $(this).attr("flight")
                                    $("#planetmodalinfos #assets-list").append("<h6>Escadron " + flightName + "</h6>");
                                } var template = $("#pilotinlinetemplate").html();
                                template = template.replace("id='pilot'", "id='assetpilot_" + assetId + "'");
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
                                $("#planetmodalinfos #assets-list").append(template);

                            });


                            $('#planetmodal').modal('show');
                        }
                    });

                });
            });
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            alert(err.Message);
        }

    });

};



function ShowBase() {
    $("#desktop").html($("#base").html());
    ShowWaitIndicator("#desktop #hangar_left_col");
    ShowWaitIndicator("#desktop #hangar_right_col");
    ShowWaitIndicator("#desktop #medbay_content");
    ShowWaitIndicator("#desktop #squadron_content");
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getbase.php",
        data: { guid: config.get("connectionGuid") },
        dataType: "xml",
        success: function (xmlData) {
            var xml = $(xmlData).find("opbase");

            $("#desktop #basename").text($(xml).attr("PlanetName"))

            $("#desktop #hangar_left_col").text("");


            $("#desktop #hangar_left_col").append("Capacité du hangar: " + $(xml).attr("HangarSize"));
            $("#desktop #hangar_left_col").append("<br> Nombre de mécaniciens: " + $(xml).attr("HangarMechanics"));

            var hangarDescription = "";
            var flightName = "";
            var iGrounded = 0;
            $(xml).find("Grounded").children().each(function () {
                iGrounded = iGrounded + 1;
                if (flightName != $(this).attr("squadron") + ", " + $(this).attr("flight")) {
                    flightName = $(this).attr("squadron") + ", " + $(this).attr("flight")
                    hangarDescription += "<h6>Escadron " + flightName + "</h6>";
                }
                var template = $("#pilotinlinetemplate").html();
                template = template.replace("id='pilot'", "id='groundedpilot_" + iGrounded + "'");
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
                template = template.replace("[ACTIONS]", "");

                hangarDescription += template;
            });

            hangarDescription += "";

            // if ($(xml).attr("Grounded") != "") {
            //     hangarDescription += "<br> Actuellement au sol:";
            //     $(xml).attr("Grounded").split("|").forEach(function (pilot) {
            //         hangarDescription += "<ul>" + pilot + "</ul>";
            //     })
            // }
            $("#desktop #hangar_right_col").html(hangarDescription);

            var medbayDescription = "Capacité de l'infirmerie: " + $(xml).attr("MedbayCapacity") + " (Cuves à bacta: ";
            if ($(xml).attr("MedbayBactaTanks") == "0") medbayDescription += "Aucune.)"; else medbayDescription += $(xml).attr("MedbayBactaTanks") + ")";
            // if ($(xml).attr("Sick") != "") {
            //     medbayDescription += "<br> Actuellement en convalescence:";
            //     $(xml).attr("Sick").split("|").forEach(function (pilot) {
            //         medbayDescription += "<ul>" + pilot + "</ul>";
            //     })
            // }

            $("#desktop #medbay_content").html(medbayDescription);



        },
        error: (error) => alert(error)
    });
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getsquadrons.php",
        data: { guid: config.get("connectionGuid") },
        dataType: "xml",
        success: function (xmlData) {
            $("#desktop #squadron_content").text("");

            var i = 0;
            $(xmlData).find("squadrons").children().each(function () {
                i = i + 1;

                $("#desktop #assetbasetabcontent").append($("#squadronbasetemplate").html());
                $("#desktop #assetbasetabcontent #squadron").attr("id", "squadron_" + i)
                $("#desktop #assetbasetabcontent #asset_id").attr("id", "asset_" + i)
                $("#desktop #assetbasetabcontent #asset_tab_id").attr("id", "asset_tab_" + i)

                $("#squadron_" + i + " #squadronname").text($(this).attr("name"));

                $("#desktop #assetbasetab").append("<li class=\"nav-item\"><a class=\"nav-link\" id=\"asset_tab_" + i + "\" data-toggle=\"tab\" href=\"#asset_" + i + "\" role=\"tab\" aria-controls=\"asset_" + i + "\" aria-selected=\"false\">" + $(this).attr("fullname") + "</a></li>");


                var iFlight = 0;
                var iPilot = 0;
                $(this).find("flight").each(function () {
                    iFlight = iFlight + 1;
                    $("#squadron_" + i + " #squadroncontent").append($("#flightbasetemplate").html());
                    $("#squadron_" + i + " #flight").attr("id", "flight" + iFlight);
                    $("#squadron_" + i + " #flight" + iFlight + " #flightname").text($(this).attr("name"));



                    var action = "<a href='#' id='btnGoBack" + i + "_" + iFlight + "'><img src='./17699.svg' style='width: 21px; height: 21px;' title='Retour à la base' ></a>";
                    $("#squadron_" + i + " #flight" + iFlight + " #flightactions").html(action);
                    $("#squadron_" + i + " #flight" + iFlight + " #btnGoBack" + i + "_" + iFlight).click(function () {
                        alert("ca marche! - " + this.id);
                    });

                    $(this).find("pilot").each(function () {
                        iPilot = iPilot + 1;
                        $("#squadron_" + i + " #flight" + iFlight + " #flightcontent").append($("#pilotbasetemplate").html());
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot").attr("id", "pilot" + iPilot);
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotname").text($(this).attr("name"));
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotship").text($(this).attr("shipname"));
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotshipletter").text($(this).attr("shipletter"));
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotskill").text($(this).attr("pilotskill"));
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #shipattack").text($(this).attr("shipattack"));
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #shipagility").text($(this).attr("shipagility"));
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #shiphull").text($(this).attr("shiphull"));
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #shipshield").text($(this).attr("shipshield"));
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotability").text($(this).attr("pilotability"));
                        $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #commands").text("");



                    });

                });

                // iFlight = iFlight + 1;
                // $("#squadron_" + i + " #squadroncontent").append($("#flightbasetemplate").html());
                // $("#squadron_" + i + " #flight").attr("id", "flight" + iFlight);
                // $("#squadron_" + i + " #flight" + iFlight + " #flightname").text("Au sol");

                // var action = "Nouveau vol: <label id='newSquadronCost'>0</label>pts<a href='#' id='btnTakeOff" + i + "'><img src='./takeoff.png' style='width: 21px; height: 21px;' title='Décoller' ></a>";
                // $("#squadron_" + i + " #flight" + iFlight + " #flightactions").html(action);
                // $("#squadron_" + i + " #flight" + iFlight + " #btnTakeOff" + i).click(function () {
                //     alert("ca marche! - " + this.id);
                // });
                // $(this).find("Grounded").children().each(function () {
                //     iPilot = iPilot + 1;
                //     $("#squadron_" + i + " #flight" + iFlight + " #flightcontent").append($("#pilotbasetemplate").html());
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot").attr("id", "pilot" + iPilot);
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotname").text($(this).attr("name"));
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotship").text($(this).attr("shipname"));
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotshipletter").text($(this).attr("shipletter"));
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotskill").text($(this).attr("pilotskill"));
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #shipattack").text($(this).attr("shipattack"));
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #shipagility").text($(this).attr("shipagility"));
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #shiphull").text($(this).attr("shiphull"));
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #shipshield").text($(this).attr("shipshield"));
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotability").text($(this).attr("pilotability"));

                //     var commands = "<input class='form-check-input' type='checkbox' value='" + $(this).attr("cost") + "' name='CheckForTakeoff'><label class='form-check-label' for='CheckForTakeoff'>Prêt à décoller</label>";
                //     $("#squadron_" + i + " #flight" + iFlight + " #pilot" + iPilot + " #pilotcommands").html(commands);


                // });




            });

            $('input[name=CheckForTakeoff]').each(function () {
                $(this).click(function () {
                    var totalCost = parseInt($("#newSquadronCost").text());
                    if (this.checked)
                        totalCost += parseInt(this.value);
                    else
                        totalCost -= parseInt(this.value);
                    $("#newSquadronCost").text(totalCost);
                });
            });
        }
    });
}


function LoadResume() {
    ClearDesktop();
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "/getresume",
        data: { guid: config.get("connectionGuid") },
        dataType: "html",
        success: function (html) {
            $("#desktop").html(html);

        }
    });
}


function ShowCrates(ConnectionGUID) {
    ShowWaitIndicator("#planetmodalinfos");

    $("#planetmodal").modal();

    $.ajax({
        url: "getcrates",
        dataType: "html",
        type: "POST",
        data: { guid: ConnectionGUID },
        success: function (html) {
            $("#planetmodalinfos").html(html);

        }
    });
}


function OpenCrate(ConnectionGUID, CrateID) {

    $.ajax({
        url: "opencrate",
        dataType: "html",
        type: "POST",
        data: { guid: ConnectionGUID, crateid: CrateID },
        success: function (html) {
            $("#planetmodalinfos").fadeOut(10);
            setTimeout(function () {

                $("#planetmodalinfos").fadeIn(500);
                $("#planetmodalinfos").html(html);
            }, 10);



        }
    });


}

function ShowSquadrons(ConnectionGUID) {
    $.ajax({
        url: "squadrons",
        dataType: "xml",
        type: "POST",
        data: { guid: ConnectionGUID },
        success: function (xml) {
            var squadTemplate = "";
            var flightTemplate = "";
            var pilotTemplate = "";
            var pilotStatsTemplate = "";
            $.ajax({ url: "template_squadron.html", async: false, success: function (html) { squadTemplate = html; } });
            $.ajax({ url: "template_flight.html", async: false, success: function (html) { flightTemplate = html; } });
            $.ajax({ url: "template_pilot.html", async: false, success: function (html) { pilotTemplate = html; } });
            $.ajax({ url: "template_pilotstats.html", async: false, success: function (html) { pilotStatsTemplate = html; } });
            var res = "";
            $(xml).find("squadrons").children().each(
                function (squadIndex) {
                    res += squadTemplate;
                    res = replaceAll(res, "[SQUADRONNAME]", $(this).attr("name"));
                    var flights = "";
                    $(this).children().each(function (flightIndex) {
                        flights += flightTemplate;
                        flights = replaceAll(flights, "[FLIGHTNAME]", $(this).attr("name"));
                        var pilots = "";
                        $(this).children().each(function (pilotIndex) {
                            pilots += pilotTemplate;
                            pilots = replaceAll(pilots, "[PILOTSHIPNAME]", $(this).attr("shipname"));
                            pilots = replaceAll(pilots, "[PILOTNAME]", $(this).attr("name"));
                            pilots = replaceAll(pilots, "[PILOTABILITY]", $(this).attr("pilotability"));
                            var stats = pilotStatsTemplate;
                            stats = replaceAll(stats, "[SHIPLETTER]", $(this).attr("shipletter"));
                            stats = replaceAll(stats, "[PILOTSKILL]", $(this).attr("pilotskill"));
                            stats = replaceAll(stats, "[SHIPATTACK]", $(this).attr("shipattack"));
                            stats = replaceAll(stats, "[SHIPAGILITY]", $(this).attr("shipagility"));
                            stats = replaceAll(stats, "[SHIPHULL]", $(this).attr("shiphull"));
                            stats = replaceAll(stats, "[SHIPSHIELD]", $(this).attr("shipshield"));

                            pilots = replaceAll(pilots, "[PILOTSTATS]", stats);
                        });

                        flights = replaceAll(flights, "[PILOTS]", pilots);
                    });
                    res = replaceAll(res, "[FLIGHTS]", flights)
                }
            );
            // $("#squadronmodalcontent").append(res + "</div>");


            // $("#squadronmodalcontent").append("</div>");
            $("#squadronmodalcontent").html("<div class='squadrons'>" + res + "</div>");


            $("#squadronmodal").modal();
        }
    })
}



function CreateSquadron(ConnectionGUID) {
    $(".navbar").hide();

    ClearDesktop();

    $.ajax({
        url: "/createsquad",
        dataType: "text",
        type: "POST",
        data: { guid: ConnectionGUID },
        success: function (html) {
            $("#desktop").html(html);
        },
    });
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