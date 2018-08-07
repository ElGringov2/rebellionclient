const Config = require("electron-config");
const config = new Config();

(function () {
    var original = Date.prototype.getDay;
    var daysOfWeek = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
    };

    Date.prototype.getDay = function (weekBegins) {
        weekBegins = (weekBegins || "sunday").toLowerCase();
        return (original.apply(this) + 7 - daysOfWeek[weekBegins]) % 7;
    };
})();
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
$(function () {
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getprefs.php",
        data: { guid: config.get("connectionGuid") },
        dataType: "xml",
        success: function (xmlData) {
            var xml = $(xmlData).find("userprefs");
            iDay = 0;
            var str = "<div class=\"row\">";

            var now = new Date(Date.now() );
            now.setDate(now.getDate()+ iDay);
            for (var i = 0; i < now.getDay("monday"); i++)
                str += "<div class=\"col card p-1 bg-secondary \"></div>";

            $(xml).find("dispos").children().each(function () {

                var template = $("#dispotemplate").html();

                template = template.replace("[DATE]", $(this).attr("day"));
                template = replaceAll(template, "[DAY]", iDay);



                for (var i = 0; i < 5; i++)
                    if ($(this).attr("pref") == i) {
                        template = template.replace("[ACTIVE" + i + "]", "active");
                        template = template.replace("[CHECKED" + i + "]", "checked");
                    }
                    else {
                        template = template.replace("[ACTIVE" + i + "]", "");
                        template = template.replace("[CHECKED" + i + "]", "");
                    }

                now = new Date(Date.now());
                now.setDate(now.getDate() + iDay);



                if (now.getDay("monday") == 0) {
                    str += "</div>";
                    str += "<div class=\"row\">";
                }



                str += template;
                iDay++;
            })


            now = new Date(Date.now());
            now.setDate(now.getDate() + iDay);

            for (var i = now.getDay("monday"); i < 7; i++)
                str += "<div class=\"col card p-1 bg-secondary \"></div>";


            str += "</div>";

            $("#dispolist").html(str);

        },
        error: function (status, error) {
            alert(error);
        }
    });
})



function setPlanning(day, pref) {
    $.ajax({
        type: "POST",
        url: config.get("ServerAdress") + "getprefs.php",
        data: {
            guid: config.get("connectionGuid"),
            jour: day,
            dispo: pref
        },
        dataType: "xml"
    });
}