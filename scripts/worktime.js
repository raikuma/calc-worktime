const HOUR = 1000 * 60 * 60;
const MINUTE = 1000 * 60;

const date_id_list = [
    "mon_start", "mon_end",
    "tue_start", "tue_end",
    "wed_start", "wed_end",
    "thu_start", "thu_end",
    "fri_start", "fri_end",
];

function calc_worktime(start_time, end_time) {
    var start = new Date(start_time);
    var end = new Date(end_time);
    var rest_time = 0;

    // start and end time shoud be in same day
    if (start.getDate() != end.getDate()) {
        console.log("start and end time shoud be in same day")
        return {
            "work_time": 0,
            "rest_time": 0,
            "total_diff": 0
        };
    }

    var total_diff = end - start;

    // end time should be later than start time
    if (total_diff <= 0) {
        console.log("end time should be later than start time")
        return {
            "work_time": 0,
            "rest_time": 0,
            "total_diff": 0
        };
    }

    // work time is 6:00~24:00
    if (start.getHours() < 6) {
        start.setHours(6);
        start.setMinutes(0);
        start.setSeconds(0);
    }

    // launch time is 11:00~1:00, maximum 1hour acknowledge as worktime
    var { launch_start, launch_end } = get_launch_time(start_time);
    time_in_launch = Math.min(end, launch_end) - Math.max(start, launch_start);
    time_in_launch = Math.max(time_in_launch, 0);
    if (time_in_launch > HOUR) {
        work_time_in_launch = HOUR;
        rest_time = time_in_launch - HOUR;
    } else {
        work_time_in_launch = time_in_launch;
        rest_time = 0;
    }

    // dinner time is 18:00~20:00, maximum 1hour acknowledge as worktime
    var { dinner_start, dinner_end } = get_dinner_time(start_time);
    time_in_dinner = Math.min(end, dinner_end) - Math.max(start, dinner_start);
    time_in_dinner = Math.max(time_in_dinner, 0);
    if (time_in_dinner > HOUR) {
        work_time_in_dinner = HOUR;
        rest_time += time_in_dinner - HOUR;
    } else {
        work_time_in_dinner = time_in_dinner;
        rest_time += 0;
    }

    // there should be minimum 30min rest time
    if (rest_time < MINUTE * 30) {
        rest_time = MINUTE * 30;
    }

    work_time = Math.max(total_diff - rest_time, 0);

    // work time could be maximum 12hours
    if (work_time > HOUR * 12) {
        work_time = HOUR * 12;
    }

    return {
        'work_time': work_time,
        'rest_time': rest_time,
        'total_diff': total_diff,
    };
}

function get_launch_time(start_time) {
    // launch time is 11:00~1:00
    var launch_start = new Date(start_time);
    launch_start.setHours(11);
    launch_start.setMinutes(0);
    launch_start.setSeconds(0);
    var launch_end = new Date(start_time);
    launch_end.setHours(13);
    launch_end.setMinutes(0);
    launch_end.setSeconds(0);
    return { launch_start, launch_end };
}

function get_dinner_time(start_time) {
    // dinner time is 18:00~20:00
    var dinner_start = new Date(start_time);
    dinner_start.setHours(18);
    dinner_start.setMinutes(0);
    dinner_start.setSeconds(0);
    var dinner_end = new Date(start_time);
    dinner_end.setHours(20);
    dinner_end.setMinutes(0);
    dinner_end.setSeconds(0);
    return { dinner_start, dinner_end };
}

function sec_to_string(sec) {
    var hours = Math.floor(sec / 1000 / 60 / 60);
    var minutes = Math.floor(sec / 1000 / 60) - (hours * 60);
    return hours + "h " + minutes + "m";
}

function save_cookie()
{
    for (var i = 0; i < date_id_list.length; i += 2) {
        var start_time = $("#" + date_id_list[i]).val();
        var end_time = $("#" + date_id_list[i + 1]).val();
        var day = date_id_list[i].split("_")[0];
        var start_cookie_name = day + "_start";
        var end_cookie_name = day + "_end";
        Cookies.set(start_cookie_name, start_time, { expires: 365 });
        Cookies.set(end_cookie_name, end_time, { expires: 365 });
    }
}

function load_cookie()
{
    for (var i = 0; i < date_id_list.length; i += 2) {
        var day = date_id_list[i].split("_")[0];
        var start_cookie_name = day + "_start";
        var end_cookie_name = day + "_end";
        var start_time = Cookies.get(start_cookie_name);
        var end_time = Cookies.get(end_cookie_name);
        if (start_time != undefined) {
            $("#" + date_id_list[i]).val(start_time);
        }
        if (end_time != undefined) {
            $("#" + date_id_list[i + 1]).val(end_time);
        }
    }
}

$(document).ready(function () {
    $("#submit_btn").click(function (e) {
        // prevent default submit action
        e.preventDefault();

        var total_work_time = 0;
        var total_rest_time = 0;
        var total_total_diff = 0;

        for (var i = 0; i < date_id_list.length; i += 2) {
            var start_time = $("#" + date_id_list[i]).val();
            var end_time = $("#" + date_id_list[i + 1]).val();
            start_time = '2018-01-01 ' + start_time + ':00';
            end_time = '2018-01-01 ' + end_time + ':00';
            var result = calc_worktime(start_time, end_time);
            total_work_time += result.work_time;
            total_rest_time += result.rest_time;
            total_total_diff += result.total_diff;

            var day = date_id_list[i].split("_")[0];
            var result_txt = "work: " + sec_to_string(result.work_time) + " / ";
            result_txt += "rest: " + sec_to_string(result.rest_time) + " / ";
            result_txt += "total: " + sec_to_string(result.total_diff);
            $("#" + day + "_result").html(result_txt);
        }

        var result = "Total work time: " + sec_to_string(total_work_time) + "<br>";
        result += "Total rest time: " + sec_to_string(total_rest_time) + "<br>";
        result += "Total time: " + sec_to_string(total_total_diff) + "<br>";
        $("#result").html(result);

        save_cookie();
    });

    $("#text_submit_btn").click(function (e) {
        // prevent default submit action
        e.preventDefault();

        var text = $("#text_input").val().trim();
        var lines = text.split("\n");

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var line_split = line.split('\t');
            var start_time = line_split[1];
            var end_time = line_split[2];
            var day = date_id_list[i*2].split("_")[0];
            $("#" + day + "_start").val(start_time);
            $("#" + day + "_end").val(end_time);
        }
    });

    $("#time_reset_btn").click(function (e) {
        // prevent default submit action
        e.preventDefault();

        for (var i = 0; i < date_id_list.length; i+= 2) {
            $("#" + date_id_list[i]).val("10:00");
            $("#" + date_id_list[i+1]).val("19:00");
        }

        save_cookie();
    });

    $("input[type='time']").change(function (e) {
        save_cookie();
    });

    $("button").click(function (e) {
        // prevent default submit action
        e.preventDefault();

        var id = $(this).attr('id');
        var intput_id = id.split("_")[0] + "_" + id.split("_")[1];
        var now_str = new Date().toTimeString().substring(0, 5);
        $("#" + intput_id).val(now_str);

        save_cookie();
    });

    load_cookie();
});