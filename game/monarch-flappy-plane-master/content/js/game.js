$(document).ready(() => {
    const start = $(this).width() + 64;
    let started = false;
    let depressed = false;
    let event;
    let plane = $("#plane");
    let ticks = 0;
    let santa = 0;
    let score = 0;

    const overlay = function (cssClass, text) {
        clearInterval(event);
        $("#game").hide();
        $("#text").text(text);
        $("#show").addClass(cssClass).show();
    }

    $("#show").click(() => { location.reload(); });

    $(this).mousedown(() => {
        if (!started) {
            started = true;
            if (event == undefined) {
                let max = parseInt($(document).height());
                let top = parseInt(plane.css("top"));

                $("#show").hide();

                event = setInterval(() => {
                    ticks++;
                    santa++;

                    plane.css({
                        "top": (top = depressed ? (top < 41) ? 40 : top - 3 : top + 3),
                        "transform": depressed ? "rotate(-10deg)" : "rotate(10deg)"
                    });

                    $(".santa").each(function() {
                        const sl = $(this).position().left;
                        const st = $(this).position().top;
                        const pl = plane.position().left;
                        const pt = plane.position().top;

                        if(sl < 0) {
                            $(this).remove();
                            $("#score").text(score++);
                        } else {
                            $(this).css("left", sl - $(this).data("rate"));
                        }

                        if(sl > pl && sl < pl + 168 && st > pt && st < pt + 80) {
                            overlay("explode", "YOU KILLED SANTA");
                        }
                    });

                    if (top > max) { overlay("crash", "YOU KILLED EVERYONE"); }
                    if (ticks > 1000) { overlay("cheese", "THAT'S WHAT YOU GET FOR CAMPING"); }

                    if (santa > 250 - score) {
                        santa = 0;
                        $("#plane").before($("<div/>").addClass("santa").css({
                            "top": (Math.floor(Math.random() * 15) + 1) * 64,
                            "left": start
                        }).data("rate", (Math.floor(Math.random() * score / 10) + 2)));
                    }
                }, 1);
            }
        }

        depressed = true;
    });

    $(this).mouseup(() => {
        depressed = false;
        ticks = 0;
    });
});