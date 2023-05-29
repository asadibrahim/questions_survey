let user_selected_answers = [];
$(document).ready(function () {
    // console.log('I am ready');
    // $.ajaxSetup({
    //     headers: {
    //         'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    //     }
    // });

    $.ajax({
        type: 'GET',
        url: '/indexonloadRequest',
        data: { task: 'get_questions' },
        success: function (data) {
            // alert(data.success);
            // console.log(data);
            let obj = JSON.parse(data);
            // console.group(user_selected_answers);
            let html = '';
            //console.log(obj)
            let m = 1;
            for (let j = 0; j < obj.this_user_answers.length; j++) {
                user_selected_answers.push(obj.this_user_answers[j]['question_id'])
            }
            // console.group(user_selected_answers);
            for (let j = 0; j < obj.data.length; j++) {
                let answers = obj.data[j]['top_answers'];
                let answersArr = answers.split(',');
                // answersArr = answersArr.sort();
                answersArr = answersArr.sort((a, b) => {
                    const votesA = parseInt(a.match(/\d+/));
                    const votesB = parseInt(b.match(/\d+/));
                    return votesB - votesA;
                });
                //console.log(answersArr)
                html += '<div class="container border mt-1" ><div class="question"><h6 class="p-3 border-bottom">Q: ' + obj.data[j]['question'] + ' (' + obj.data[j]['total_votes'] + ' votes)</h6><div class="suggestions">';
                if (user_selected_answers.includes(obj.data[j]['question_id'])) {
                    for (let i = 0; i < answersArr.length; i++) {
                        html += '<div class="hover p-1"><b> ' + m + ' ' + answersArr[i] + '</b></div>';
                        m++;
                    }

                } else {
                    answersArr.map((str, index) => {
                        let places = `${index + 1} Place (Votes: ${str.match(/\d+/)})`;
                        html += '<div class="hover p-1"><b> ' + places + '</b></div>';
                    });

                }

                html += '<button type="button" class="btn btn-primary mb-1" onclick="questions_modal(' + obj.data[j]['question_id'] + ')" data-bs-toggle="modal" data-bs-target="#exampleModal">Show More Answers</button></div></div></div>';
            }

            //display popular topics 
            const { topics } = obj;
            // console.log(obj.topics)
            const topic = [];
            for (let j = 0; j < obj.topics.length; j++) {

                // console.log(obj.topics[j]['topic_name'])
                if (!topic.includes(obj.topics[j]['topic_name'])) {
                    topic.push(obj.topics[j]['topic_name'])

                }
            }
            // console.log(topic)
            // const topic = ["movies", "Politics"];
            let hot_topics_dom = '';
            om = '';
            topic.forEach(item => {
                let filterdArray = topics.filter(objs => objs.topic_name === item);
                let counts = filterdArray.map(objs => objs.total_sum);
                let max = Math.max(...counts);
                let index = counts.indexOf(String(max));

                let hot_topics = filterdArray[index];
                // Iterate over the properties using for...in loop
                console.log(hot_topics);
                // console.log(hot_topics[0]['answers']);
                if (user_selected_answers.includes(hot_topics['question_id'])) {
                    hot_topics_dom += '<div class="container border mt-1"> <div class="question"><h6 class="mt-1">' + hot_topics["topic_name"] + '</h6><hr><h6 class="p-3 border-bottom">Q: ' + hot_topics['question'] + ' (' + hot_topics['total_sum'] + ' votes)</h6><div class="suggestions"><ol> <li class="hover"><b>' + hot_topics[0]["answers"] + ' </b>(' + hot_topics[0]["vote_count"] + ' votes)</li> <li class="hover"><b>' + hot_topics[1]["answers"] + ' </b>(' + hot_topics[0]["vote_count"] + ' votes)</li> <li class="hover"><b>' + hot_topics[2]["answers"] + ' </b>(' + hot_topics[2]["vote_count"] + ' votes)</li></ol><button type="button" class="btn btn-primary mb-1" onclick="questions_modal(' + hot_topics['question_id'] + ')" data-bs-toggle="modal" data-bs-target="#exampleModal">Show More Answers</button></div></div></div>';
                } else {
                    hot_topics_dom += '<div class="container border mt-1"> <div class="question"><h6 class="mt-1">' + hot_topics["topic_name"] + '</h6><hr><h6 class="p-3 border-bottom">Q: ' + hot_topics['question'] + ' (' + hot_topics['total_sum'] + ' votes)</h6><div class="suggestions"><ol> <li class="hover"><b>Place </b>(' + hot_topics[0]["vote_count"] + ' votes)</li> <li class="hover"><b>Place </b>(' + hot_topics[0]["vote_count"] + ' votes)</li> <li class="hover"><b>Place </b>(' + hot_topics[2]["vote_count"] + ' votes)</li></ol><button type="button" class="btn btn-primary mb-1" onclick="questions_modal(' + hot_topics['question_id'] + ')" data-bs-toggle="modal" data-bs-target="#exampleModal">Show More Answers</button></div></div></div>';
                }
            });
            // console.log(topic_name)
            $('#display_questions').empty()
            $('#display_questions').html(html)

            $('#popular_topics').empty()
            $('#popular_topics').html(hot_topics_dom)
        }
    });
})
$('.hover').hover(function () {
    $(this).css({ "background-color": "#ACACAC" });
}, function () {
    $(this).css({ "background-color": "white" });
})

function questions_modal(x) {
    $.ajax({
        type: 'GET',
        url: '/getquestionanswers',
        data: { task: 'get_question_answers', question_id: x },
        success: function (data) {
            let obj = JSON.parse(data);
            console.log(obj)
            $('.question_modal_heading').empty();
            $('.question_modal_heading').html(obj.question[0].question)
            // let html = '<input type="text" class="form-control mb-1 questions_answer_search" onkeyup="answers_search(this,' + x + ')" placeholder="Search options">';
            let html = '';
            $('.questions_answer_search').attr('data-info', x);
            if (user_selected_answers.includes(x)) {
                for (let j = 0; j < obj.answers.length; j++) {
                    html += '<div class="hover p-1" onmouseover="highlight_sug(this)" onmouseout="nohighlight_sug(this)" onclick="add_vote(' + obj.answers[j]['answer_id'] + ')"><b>' + obj.answers[j]['answers'] + ' (Votes: ' + obj.answers[j]['vote_count'] + ')</b></div>';
                }
            } else {
                for (let j = 0; j < obj.answers.length; j++) {
                    html += '<div class="hover p-1" onmouseover="highlight_sug(this)" onmouseout="nohighlight_sug(this)" onclick="add_vote(' + obj.answers[j]['answer_id'] + ')"><b>' + obj.answers[j]['answers'] + '</b></div>';
                }
            }
            //html += '</ol>';
            $('.modal-suggestions').empty();
            $('.modal-suggestions').html(html);
        },
        error: function (error) {

        }
    })
}
$('.questions_answer_search').on('keyup', function () {
    let search = $(this).val();
    let id = $('.questions_answer_search').data('info');
    // console.log(id);
    // if (search.length >= 3) {
    $.ajax({
        type: 'GET',
        url: '/searchAnswers',
        data: { task: 'searchAnswers', question_id: id, search: search },
        success: function (data) {
            // console.log(data)
            let obj = JSON.parse(data);
            // console.log(obj)
            // html = '<input type="text" class="form-control mb-1 questions_answer_search" value="' + search + '" onkeyup="answers_search(this,' + id + ')" placeholder="Search options">';
            let html = '';
            if (obj.data.length > 0) {
                if (user_selected_answers.includes(id)) {
                    for (let j = 0; j < obj.data.length; j++) {
                        html += '<div class="hover p-1" onmouseover="highlight_sug(this)" onmouseout="nohighlight_sug(this)" onclick="add_vote(' + obj.data[j]['answer_id'] + ')"><b>' + obj.data[j]['answers'] + ' (Votes: ' + obj.data[j]['vote_count'] + ')</b></div>';
                    }
                } else {
                    for (let j = 0; j < obj.data.length; j++) {
                        html += '<div class="hover p-1" onmouseover="highlight_sug(this)" onmouseout="nohighlight_sug(this)" onclick="add_vote(' + obj.data[j]['answer_id'] + ')"><b>' + obj.data[j]['answers'] + '</b></div>';
                    }
                }
            } else {
                html += '<div class="hover p-1" ><b>No answer found</b></div>';
            }
            // html += '</ol>';
            $('.modal-suggestions').empty();
            $('.modal-suggestions').html(html);
        },
        error: function (error) {

        }
    })
    // } else {
    //     $.ajax({
    //         type: 'GET',
    //         url: '/searchAnswers',
    //         data: { task: 'searchAnswers', question_id: id, search: search },
    //         success: function (data) {
    //             // console.log(data)
    //             let obj = JSON.parse(data);
    //             console.log(obj)
    //            // html = '<input type="text" class="form-control mb-1 questions_answer_search" value="' + search + '" onkeyup="answers_search(this,' + id + ')" placeholder="Search options">';
    //            let html=''; 
    //            if (obj.data.length > 0) {
    //                 for (let j = 0; j < obj.data.length; j++) {
    //                     html += '<li class="hover"><b>' + obj.data[j]['answers'] + '</b></li>';
    //                 }

    //             } else {
    //                 html += '<li class="hover"><b>No answer found</b></li>';
    //             }
    //             html += '</ol>';
    //             $('.modal-suggestions').empty();
    //             $('.modal-suggestions').html(html);
    //         },
    //         error: function (error) {

    //         }
    //     })
    // }
})
// functions to change boats suggestions div background
function highlight_sug(x) {
    $(x).removeClass('bg-light')
    $(x).addClass('bg-dark text-white')
}
function nohighlight_sug(x) {
    $(x).removeClass('bg-dark text-white')
    // $(x).removeClass('text-whit')
    $(x).addClass('bg-light')
}

function add_vote(x) {
    $.ajax({
        type: 'POST',
        url: '/entervote',
        data: { '_token': $('meta[name="csrf-token"]').attr('content'), answer_id: x },
        success: function (data) {
            // $("#msg").html(data.msg);
            // console.log(data)
            let obj = JSON.parse(data);
            if (obj.success == 1) {
                toastr.success(obj.data)
                location.reload(true)
            } else {
                toastr.error(obj.data)
            }
        }
    });
}
$('#search_question_topics').on('keyup', function () {
    let to_search = $(this).val();
    $.ajax({
        type: 'GET',
        url: '/searchQuestionsTopics',
        data: { task: 'searchQuestionsTopics', search: to_search },
        success: function (data) {
            // console.log(data)
            let obj = JSON.parse(data);
            console.log(obj)
            // html = '<input type="text" class="form-control mb-1 questions_answer_search" value="' + search + '" onkeyup="answers_search(this,' + id + ')" placeholder="Search options">';
            let html = '';
            if (to_search.length > 0) {
                if (obj.data.length > 0) {
                    html += '<div class="p-2"><b>Questions</b></div>';
                    for (let j = 0; j < obj.data.length; j++) {
                        html += ' <div class="hover p-1 m-1" onmouseover="highlight_sug(this)" onmouseout="nohighlight_sug(this)" onclick="questions_modal(' + obj.data[j]['id'] + ')" data-bs-toggle="modal" data-bs-target="#exampleModal"">' + obj.data[j]['question'] + '</div>';
                    }
                } else {
                    html += '';
                }
                if (obj.topics.length > 0) {
                    html += '<div class="p-2"><b>Topics</b></div>';
                    for (let j = 0; j < obj.topics.length; j++) {
                        html += '<div class="hover p-1 m-1" onmouseover="highlight_sug(this)" onmouseout="nohighlight_sug(this)"">' + obj.topics[j]['topic_name'] + '</div>';
                    }
                }
                $('.set_suggestion_height').empty();
                $('.set_suggestion_height').html(html);
            } else {
                $('.set_suggestion_height').empty();
            }
        },
        error: function (error) {

        }
    })
})