/*
// 1. Global variables
// 2. tmi Client
// 3. client.on 'message'
// 4. initialize_page()
// 5. get_question_by_id()
// 6. hideElements()
// 7. showElements()
// 8. load_question()
// 9. stop_question()
// 10. does_player_exist()
// 11. did_this_player_answer()
// 12. add_this_player_answer()
// 13. show_scores()
// 14. did_player_answer_correctly()
// 15. update_scores()
// 16. sort_scores()
// 17. next_question()
// 18. reset_players_answers()
// 19. manage_question_repetition()
// 20. clear_scores_list()
// 21. update_statistics()
// 22. end_quiz()
// 23. change_stop_button_action()
// 24. manage_time()
// 25. create_timer()
// 26. load_final_score_screen()
// 27. reset_statistics()
// 28. highlight_correct_option()
// 29. clear_correct_option_highlight()
// 30. clear_players_answers()
// 31. truncate_player_name()
// 32. answer_to_index()
// 33. get_answer_order()
// 34. sort_players_by_answers_order()
// 35. get_player_dinamic_score()
// 36. wrong_players_amount()
// 37. disregard_question()
// 38. empty_all_players_answers()
// 39. disregard_score()
// 40. report_question()
// 41. switch_on_off_audio()
// 42. show_general_score();
// 43. show_question_score();
// 44. get_score_li(element);
// . play_audio()
// . pause_audio()
// . choose_random_song()
// . fade_volume()
// . show_modal()
// . hide_modal()
// . window.onclick
*/

const questions_ids = JSON.parse(localStorage['questions_ids']);
let question_number = 1;
const players = [];
const options_statistics = [0, 0, 0, 0];  // 0 = A, 1 = B, 2 = C, 3 = D
let current_question = [];
let current_explanation = [];
const can_repeat_question = false;  // Assumindo que o usuário não quer repetição de questões
let is_time_to_answer_over = false;
let answers_order = 0;
let remaining_points_of_current_question = localStorage.getItem('points_per_question');
let should_disregard_question = false;
let was_question_disregarded = false;
let audio = false;
let score_context = 'general';
let audio_control = true;

initialize_page();

const client = new tmi.Client({
	channels: [ localStorage['username'] ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {

    if(is_time_to_answer_over) return;
    
    if(message.length == 1) {
    /*if(message.length > 0) {
        if (message.length < 9) { message = 'a'; }
        else if (message.length < 16) { message = 'b'; }
        else if (message.length < 26) { message = 'c'; }
        else { message = 'd'; }*/

        if (message.toLowerCase() == 'a' || message.toLowerCase() == 'b' 
        || message.toLowerCase() == 'c' || message.toLowerCase() == 'd') {

            const player_name = tags['display-name'];
            if(does_player_exist(player_name)) {
                if(!did_this_player_answer(player_name)) {
                    add_this_player_answer(player_name, message.toLowerCase());
                    update_statistics(player_name, message);
                }

            } else {
        
                players.push(
                    {
                        name: player_name,
                        answer: message.toLowerCase(),
                        score: 0,
                        answers_order: get_answer_order(),
                        score_change: 0
                    }
                );    
                update_statistics(player_name, message);
            }
        }
    }
});

async function initialize_page() {
    hideElements();
    current_question = await get_question_by_id();
    current_explanation = await get_question_explanation(current_question[0].question_id);
    remaining_points_of_current_question = localStorage.getItem('points_per_question');
    was_question_disregarded = false;
    load_question();
    
    document.querySelector('#stop-button').style.display = "inline-block";
    is_time_to_answer_over = false;
    if(localStorage['time'] == 'predefined') {
        manage_time(localStorage.getItem('seconds'), question_number < 2); // Depois da segunda pergunta, o segundo parâmetro 
                                                                           // tem que ser sempre falso
    }
}

async function get_question_by_id() {
    let api_url = "https://quiz-on-stream.herokuapp.com/question/join/question-subject";

    const random_number = Math.floor(Math.random() * questions_ids.length);
    const random_question_id = questions_ids[random_number].id;

    api_url += `/${random_question_id}`;

    const response = await fetch(api_url);
    
    // Storing data in form of JSON
    const data = await response.json();
    return data.response;
}

async function get_question_explanation(question_id) {
    let api_url = "https://quiz-on-stream.herokuapp.com/questions/explanation/";
    api_url += question_id;

    const response = await fetch(api_url);
    const data = await response.json();
    return data.response;
}

function hideElements() {
    document.querySelector('#scores').style.display = "none";
    document.querySelector('#buttons').style.display = "none";
}

function showElements() {
    document.querySelector('#scores').style.display = "block";
    document.querySelector('#buttons').style.display = "flex";
}

function load_question() {
    const description = current_question[0].description;
    const option_a = current_question[0].option_a;
    const option_b = current_question[0].option_b;
    const option_c = current_question[0].option_c;
    const option_d = current_question[0].option_d;
    const difficulty = current_question[0].difficulty;
    const author = current_question[0].author;
    const subject = current_question[0].subject;

    document.querySelector('#question-number').innerText = question_number;
    document.querySelector('#question-description').innerText = description;
    document.querySelector('#op_a').innerText = "A. " + option_a;
    document.querySelector('#op_b').innerText = "B. " + option_b;
    document.querySelector('#op_c').innerText = "C. " + option_c;
    document.querySelector('#op_d').innerText = "D. " + option_d;   
    document.querySelector('#question-info-difficulty').innerText = difficulty;
    document.querySelector('#question-info-author').innerText = author;
    document.querySelector('#question-info-subject').innerText = subject;

    // explanation load
    const exp_div = document.querySelector('#exp-div');
    const exp_txt = document.querySelector('#explanation-txt');
    const exp_btn = document.querySelector('#explanation-btn');

    if(exp_div.style.display == 'block') {
        exp_div.style.display = 'none';
        exp_txt.style.display = 'none';
    }

    if(current_explanation.length < 1) return;
    exp_div.style.display = 'block';
    exp_btn.innerText = "Justificar";
    exp_txt.innerText = current_explanation[0].text;
    current_explanation = [];
}

function stop_question() {
    if(!is_time_to_answer_over) {
        if(!confirm("Confirme que deseja parar a questão.")) return;
        is_time_to_answer_over = true;
    }

    if(should_disregard_question) {
        empty_all_players_answers();
        should_disregard_question = false;
        was_question_disregarded = true;
    }

    document.querySelector('#stop-button').style.display = "none";

    if(audio) {
        if(audio_control)
            pause_audio();
    } 

    showElements();
    highlight_correct_option();
    update_scores();
    sort_scores();
    show_scores();
};

function does_player_exist(player_name) {
    for(let i = 0; i < players.length; i++) {
        if(players[i].name == player_name) {
            return true;
        }
    }
    
    return false;
}

function did_this_player_answer(player_name) {
    for(let i = 0; i < players.length; i++) {
        if(players[i].name == player_name && players[i].answer == "") {
            return false;
        } 
        else if(players[i].name == player_name && players[i].answer != "") {
            return true;
        }
    }

    throw "Erro ao verificar se player já respondeu: did_this_player_answer(player_name)";
}

function add_this_player_answer(player_name, player_answer) {
    for(let i = 0; i < players.length; i++) {
        if(players[i].name == player_name) {
            players[i].answer = player_answer;
            players[i].answers_order = get_answer_order();
        }
    }
}

function show_scores( switch_context = false ) {
    const scores_h3 = document.querySelector('#scores .h3');

    if(switch_context)
        score_context = score_context == 'general' ? 'current' : 'general';

    let h3_innerHTML = '<span class="score-context" onclick="show_scores(true)"><</span> ';
    h3_innerHTML += score_context == 'general' ? 'Pontuação Geral': 'Pontuação Dessa Questão';
    h3_innerHTML += ' <span class="score-context" onclick="show_scores(true)">></span>';

    scores_h3.innerHTML = h3_innerHTML;

    score_context == 'general' ? show_general_score() : show_question_score();
}

function did_player_answer_correctly(answer) {
    return answer == current_question[0].correct_option;
}

function update_scores() {

    if(localStorage.getItem('score_type') == 'dinamic') {
        sort_players_by_answers_order();

        for(let i = 0; i < players.length; i++) {
            if(players[i].answer.length < 1) {
                players[i].score_change = was_question_disregarded ? 0 : -localStorage['inactivity_debt'];
                players[i].score += players[i].score_change;
                continue; // this player hasn't even answered
            }
            const dinamic_score = get_player_dinamic_score(players[i]);
            players[i].score_change = dinamic_score;
            players[i].score += dinamic_score;
        }
        return;
    }

    // if score_type is default
    for(let i = 0; i < players.length; i++) {
        if(players[i].answer.length < 1) {
            players[i].score_change = 0;
            continue; // this player hasn't even answered
        } 
        if(did_player_answer_correctly(players[i].answer)) {
            players[i].score_change = 1;
            players[i].score += 1;
        } else {
            players[i].score_change = 0;
        }
    }
}

function sort_scores() {
    players.sort(function (a, b) {
       return b.score - a.score;
    })
}

function next_question() {
    reset_players_answers();
    
    if(manage_question_repetition()) return; // Retorna true quando usuário esgota as questões e não deseja repetição

    clear_correct_option_highlight();
    clear_players_answers();

    if(audio) play_audio();
    initialize_page();
    question_number += 1;
    reset_statistics();
}

function reset_players_answers() {
    for(let i = 0; i < players.length; i++) {
        players[i].answer = "";
    }
}

function manage_question_repetition() {

    if(!can_repeat_question) {
    
        for(let i = 0; i < questions_ids.length; i++){ 
                                    
            if ( questions_ids[i].id == current_question[0].question_id) { 
                questions_ids.splice(i, 1); 
            }
        }
    }

    if(questions_ids.length < 1) {
        if(confirm("Não há nenhuma questão nova com esses filtros. Deseja ver questões repetidas?")) {
            const ids = JSON.parse(localStorage['questions_ids']);
            
            for(let i = 0; i < ids.length; i ++) {
                questions_ids.push(ids[i]);
            }
        } else {
            end_quiz();
            return true;
        }
    }

}

function clear_scores_list(players_scores_list) {
    while (players_scores_list.firstChild) {
        players_scores_list.removeChild(players_scores_list.firstChild);
    }
}

function update_statistics(player_name, answer) {

    // Qual questão cada jogador marcou
    const A_players = document.querySelector('#A-players');
    const B_players = document.querySelector('#B-players');
    const C_players = document.querySelector('#C-players');
    const D_players = document.querySelector('#D-players');

    const player_name_span = document.createElement('SPAN');
    player_name_span.innerText = player_name;
    
    switch(answer.toLowerCase()) {
        case 'a':
            options_statistics[0] += 1;
            A_players.appendChild(player_name_span);
            break;
        case 'b':
            options_statistics[1] += 1;
            B_players.appendChild(player_name_span);
            break;
        case 'c':
            options_statistics[2] += 1;
            C_players.appendChild(player_name_span);
            break;
        case 'd':
            options_statistics[3] += 1;
            D_players.appendChild(player_name_span);
            break;
    }

    const options_votes_total = options_statistics[0] + options_statistics[1] + options_statistics[2] + options_statistics[3];

    const A_percentage = `${(options_statistics[0] / options_votes_total * 100).toFixed(1)}%`;
    const B_percentage = `${(options_statistics[1] / options_votes_total * 100).toFixed(1)}%`;
    const C_percentage = `${(options_statistics[2] / options_votes_total * 100).toFixed(1)}%`;
    const D_percentage = `${(options_statistics[3] / options_votes_total * 100).toFixed(1)}%`;

    document.querySelector('#A-stats').style.width = A_percentage;
    document.querySelector('#B-stats').style.width = B_percentage;
    document.querySelector('#C-stats').style.width = C_percentage;
    document.querySelector('#D-stats').style.width = D_percentage;

    document.querySelector('#A-percentage').innerText = A_percentage;
    document.querySelector('#B-percentage').innerText = B_percentage;
    document.querySelector('#C-percentage').innerText = C_percentage;
    document.querySelector('#D-percentage').innerText = D_percentage;
}

function end_quiz() {
    if(!confirm('Confirme que deseja terminar.')) return;
    
    hideElements();
    document.querySelector('#question-info').style.display = "none";
    document.querySelector('#statistics').style.display = "none";
    document.querySelector('#players-answers').style.display = "none";
    document.querySelector('#report-icon').style.display = "none";
    
    if(audio) {
        if(audio_control)
            pause_audio();
    }

    change_stop_button_action();
    load_final_score_screen();
}

function change_stop_button_action() {
    const stop_button = document.querySelector('#stop-button');
    stop_button.innerHTML = "< Voltar";
    stop_button.onclick = "";
    stop_button.addEventListener('click', function() {
        window.open('filters.html', '_self');
    })
}

function manage_time(amount_of_seconds, is_countdown_creation) {
    if(is_time_to_answer_over) { return;}

    if(is_countdown_creation) {
        create_timer(amount_of_seconds);
        amount_of_seconds--;
        setTimeout(manage_time, 1000, amount_of_seconds, false)
    }
    else {
        document.querySelector('#countdown').innerText = amount_of_seconds;
        if(amount_of_seconds  < 1) {
            is_time_to_answer_over = true;
            stop_question();
            return;
        }
        amount_of_seconds--;
        setTimeout(manage_time, 1000, amount_of_seconds, false);
    }   
}

function create_timer(amount_of_seconds) {
    const time_span = document.createElement('SPAN');
    time_span.id = 'countdown';
    time_span.display = 'inline-block';
    time_span.innerText = amount_of_seconds;
    time_span.style.padding = '15px';
    time_span.style.backgroundColor = 'rgb(0, 47, 142)';
    time_span.style.color = 'white';
    time_span.style.fontSize = '35px';
    time_span.style.position = 'fixed';
    time_span.style.left = '3%';
    time_span.style.top = '3%';
    time_span.style.borderRadius = '10%';

    document.querySelector('#page-container').appendChild(time_span);
}

function load_final_score_screen() {
    const final_score_heading = document.querySelector('.h2');
    final_score_heading.innerHTML = "Pontuação final:"

    const final_score_list = document.querySelector('#question-options');
    
    if(players.length > 25) {
        document.querySelector('#main').style.borderRadius = '1%';
        document.querySelector('#question-section').style.borderRadius = '1%';
    }

    while (final_score_list.firstChild) {
        final_score_list.removeChild(final_score_list.firstChild);
    }

    for(let i = 0; i < players.length; i++) {
        const player_score_li = document.createElement('LI');
        const player_item_span = document.createElement('SPAN');
        //const question_score_span = document.createElement('SPAN');
        const general_score_span = document.createElement('SPAN');

        player_score_li.className = "player-score-li";
        player_score_li.style = "grid-template-columns: 80% 20%;"
        player_item_span.className = "player-item";
        //question_score_span.className = did_player_answer_correctly(players[i].answer) ? "question-score-correct" : "question-score-wrong";
        general_score_span.className = "general-score";

        player_item_span.innerText = truncate_player_name(players[i].name, 32);
        //question_score_span.innerText = did_player_answer_correctly(players[i].answer) ? "+ 1" : "+ 0";
        general_score_span.innerText = players[i].score + " pts.";

        final_score_list.appendChild(player_score_li);
        player_score_li.appendChild(player_item_span);
        //player_score_li.appendChild(question_score_span);
        player_score_li.appendChild(general_score_span);
    }
}

function reset_statistics() {
    options_statistics[0] = 0;
    options_statistics[1] = 0;
    options_statistics[2] = 0;
    options_statistics[3] = 0;

    document.querySelector('#A-stats').style.width = `0%`;
    document.querySelector('#B-stats').style.width = `0%`;
    document.querySelector('#C-stats').style.width = `0%`;
    document.querySelector('#D-stats').style.width = `0%`;

    document.querySelector('#A-percentage').innerText = "0%";
    document.querySelector('#B-percentage').innerText = "0%";
    document.querySelector('#C-percentage').innerText = "0%";
    document.querySelector('#D-percentage').innerText = "0%";
}

function highlight_correct_option() {

    switch(current_question[0].correct_option.toLowerCase()) {
        case 'a':
            document.querySelector('#op_a').style.backgroundColor = 'green';;
            break;
        case 'b':
            document.querySelector('#op_b').style.backgroundColor = 'green';
            break;
        case 'c':
            document.querySelector('#op_c').style.backgroundColor = 'green';
            break;
        case 'd':
            document.querySelector('#op_d').style.backgroundColor = 'green';
            break;
    }
}

function clear_correct_option_highlight() {
    switch(current_question[0].correct_option.toLowerCase()) {
        case 'a':
            document.querySelector('#op_a').style.backgroundColor = '';;
            break;
        case 'b':
            document.querySelector('#op_b').style.backgroundColor = '';
            break;
        case 'c':
            document.querySelector('#op_c').style.backgroundColor = '';
            break;
        case 'd':
            document.querySelector('#op_d').style.backgroundColor = '';
            break;
    }
}

function clear_players_answers() {
    const option_players = document.querySelectorAll('.option-players');
    for(let i = 0; i < option_players.length; i++) {
        option_players[i].innerHTML = "";
        /*while (option_players.firstChild) {
            option_players.removeChild(option_players.firstChild);
        }*/
    }
}


function truncate_player_name(str, n){
    return (str.length > n) ? str.substr(0, n) + '...' : str;
};

function answer_to_index(answer) {
    if(answer == 'a')
        return 0;
    if(answer == 'b')
        return 1;
    if(answer == 'c')
        return 2;
    // if answer == 'd'
    return 3;
}

function get_answer_order() {
    answers_order++;
    return answers_order;
}

function sort_players_by_answers_order() {
    players.sort(function (a, b) {
        return a.answers_order - b.answers_order;
    })   
}

function get_player_dinamic_score(player) {
    if(player.answer == current_question[0].correct_option) {
        const correct_players_amount = options_statistics[answer_to_index(player.answer)];
        let score = 0;
        if(correct_players_amount < 2) {
            score = remaining_points_of_current_question;    
        } else {
            score = remaining_points_of_current_question / correct_players_amount * ( 100 + parseInt(localStorage.getItem('bonus_percentage')) ) /100;
        }
        score = parseFloat(Math.round((score * 10) / 10).toFixed(1));
        remaining_points_of_current_question -= score;
        options_statistics[answer_to_index(player.answer)]--;
        return score;
    }
    // if player voted wrong option
    const score = parseInt( localStorage.getItem('points_per_question')) / wrong_players_amount();
    return parseFloat(-Math.round((score * 10) / 10).toFixed(1));
}

function wrong_players_amount() {
    let amount = 0;
    const right_option = current_question[0].correct_option;

    if(right_option != 'a')
        amount += options_statistics[0];
    if(right_option != 'b')
        amount += options_statistics[1];
    if(right_option != 'c')
        amount += options_statistics[2];
    if(right_option != 'd')
        amount += options_statistics[3];

    return amount;
}

function disregard_question() {
    if(!is_time_to_answer_over) {
        modal.style.display = 'none';
        should_disregard_question = true;
        stop_question();
        return;
    }

    if(was_question_disregarded) return;

    disregard_score();
    empty_all_players_answers();
    modal.style.display = 'none';
    should_disregard_question = true;
    stop_question();
}

function empty_all_players_answers() {
    players.forEach(player => {
        player.answer = '';
    });
}

function disregard_score() {
    players.forEach(player => {
        player.score -= player.score_change;
    });
}

function report_question() {
    const question_id = current_question[0].question_id;
    const question_description = current_question[0].description.substring(0, 100);
    const motive = document.querySelector('#motive').value;

    fetch("https://quiz-on-stream.herokuapp.com/question/report", {
                
        // Adding method type
        method: "POST",
            
        // Adding body or contents to send
        body: JSON.stringify({
            question_id: question_id,
            question_description: question_description,
            motive: motive
        }),
            
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function (response) {
        if(response.status == 200) {
            alert("Reporte enviado!");
        }
        else
            alert("Erro ao enviar reporte. Status: " + response.status);
    })
    
    modal.style.display = 'none';
}

function show_general_score() {
    const players_scores_list = document.querySelector('#players-scores-list');
    clear_scores_list(players_scores_list);

    players.forEach(element => {
        players_scores_list.appendChild(get_score_li(element));
    }); 
}

function show_question_score() {
    const players_scores_list = document.querySelector('#players-scores-list');
    clear_scores_list(players_scores_list);

    const question_players = [...players];

    question_players.sort(function (a, b) {
        return b.score_change - a.score_change;
    })   

    question_players.forEach(element => {
        if (element.score_change == 0) return;
        players_scores_list.appendChild(get_score_li(element));
    }); 
}

function get_score_li(element) {
    const player_score_li = document.createElement('LI');
    const player_item_span = document.createElement('SPAN');
    const question_score_span = document.createElement('SPAN');
    const general_score_span = document.createElement('SPAN');

    player_score_li.className = "player-score-li";
    player_item_span.className = "player-item";
    
    if(element.score_change > 0) { question_score_span.className = "question-score-correct"; } 
    else if (element.score_change < 0) { question_score_span.className = 'question-score-wrong'; } 
    else { question_score_span.className = 'question-score-zero'; }

    general_score_span.className = "general-score";

    player_item_span.innerText = truncate_player_name(element.name, 20);
    if(localStorage.getItem('score_type') == 'dinamic') {
        question_score_span.innerText = did_player_answer_correctly(element.answer) ? `+${element.score_change}` : element.score_change;
    } else {
        question_score_span.innerText = did_player_answer_correctly(element.answer) ? `+ 1` : 0;
    }
    general_score_span.innerText = element.score + " pts.";
    
    player_score_li.appendChild(player_item_span);
    player_score_li.appendChild(question_score_span);
    player_score_li.appendChild(general_score_span);

    return player_score_li;
}

function switch_on_off_audio() {
    if(!is_time_to_answer_over)
        audio = !audio; 
    else
        audio = true;

    if (play_audio()) return;
    pause_audio(false);
}

// Returns true if completely executed
function play_audio() {
    const icon = document.querySelector('div#audio i');
    const audio = document.querySelector('audio');

    if( !(icon.innerText == 'volume_off') )  return false;

    icon.innerText = 'volume_up';
    audio.src = `../audio/${ choose_random_song() }`;
    audio.play();
    return true;
}

// Returns true if completely executed
function pause_audio(fade = true) {
    const icon = document.querySelector('div#audio i');
    const audio = document.querySelector('audio');

    if( !(icon.innerText == 'volume_up')) return false;

    icon.innerText = 'volume_off';
    audio.pause();
    return true;
}

function choose_random_song() {
    const songs = [
        'LsThemeA.mp3',
        'LsThemeB.mp3',
        'Among Us Main Menu Theme.mp3',
        'Castle Theme  Super Mario World.mp3',
        'Dragon ball Z soundtrack 10.mp3',
        'James Bond 007 Theme Tune original.mp3',
        'Naruto OST 1 Bad Situation.mp3',
        'Pou Words Sudoku Good Quality.mp3',
        'Resident Evil 3 Save Room Theme.mp3',
        'The Worlds Hardest Game Soundtrack.mp3'
    ]

    const random_song = songs[Math.floor(Math.random()*songs.length)];
    document.querySelector('#song-name').innerText = random_song.slice(0, random_song.length - 4);

    return random_song;
}

function fade_volume() {
    const audio = document.querySelector('audio');
    const interval = 200;

    const fadeout = setInterval( function() {
        if (audio.volume > 0.15) {
            audio.volume -= 0.1;
            return;
        }
        clearInterval(fadeout);
    }, interval);
}

function change_sound_control() {
    audio_control = !audio_control;
}


/* Modal logic */
let modal = document.querySelector("#myModal");

function show_modal() {
    modal.style.display = "flex";
}

function hide_modal() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
