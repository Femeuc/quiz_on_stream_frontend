const questions_ids = JSON.parse(localStorage['questions_ids']);
let question_number = 1;
const players = [];
const options_statistics = [0, 0, 0, 0];  // 0 = A, 1 = B, 2 = C, 3 = D
let current_question = [];
const can_repeat_question = false;  // Assumindo que o usuário não quer repetição de questões
let is_time_to_answer_over = false;

console.log(questions_ids);

initialize_page();

const client = new tmi.Client({
	channels: [ localStorage['username'] ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {

    if(is_time_to_answer_over) return;
    
    if(message.length == 1) {
        if (message.toLowerCase() == 'a' || message.toLowerCase() == 'b' 
        || message.toLowerCase() == 'c' || message.toLowerCase() == 'd') {

            const player_name = tags['display-name'];
            if(does_player_exist(player_name)) {
                console.log("Player exists");
                if(!did_this_player_answer(player_name)) {
                    add_this_player_answer(player_name, message.toLowerCase());
                    update_statistics(player_name, message);
                }

            } else {
                console.log("Player doesn't exist, Let's create one1");
                players.push(
                    {
                        name: player_name,
                        answer: message.toLowerCase(),
                        score: 0
                    }
                );    
                update_statistics(player_name, message);
            }
        }
    }
    console.log(players);
});

async function initialize_page() {
    hideElements();
    current_question = await get_question_by_id();
    load_question();

    is_time_to_answer_over = false;
    if(localStorage['time'] == 'predefined') {
        manage_time(localStorage.getItem('seconds'), question_number < 2); // Depois da segunda pergunta, o segundo parâmetro 
                                                                           // tem que ser sempre falso
    }

    console.log(current_question);
}

async function get_question_by_id() {
    let api_url = "https://quiz-on-stream.herokuapp.com/question";

    const random_number = Math.floor(Math.random() * questions_ids.length);
    const random_question_id = questions_ids[random_number].id;

    api_url += `/${random_question_id}`;

    const response = await fetch(api_url);
    
    // Storing data in form of JSON
    const data = await response.json();
    return data.response;
}

function hideElements() {
    //document.querySelector('#statistics').style.display = "none";
    document.querySelector('#scores').style.display = "none";
    document.querySelector('#buttons').style.display = "none";
}

function showElements() {
    //document.querySelector('#statistics').style.display = "block";
    document.querySelector('#scores').style.display = "block";
    document.querySelector('#buttons').style.display = "flex";
}

function load_question() {
    const description = current_question[0].description;
    const option_a = current_question[0].option_a;
    const option_b = current_question[0].option_b;
    const option_c = current_question[0].option_c;
    const option_d = current_question[0].option_d;
/*    const correct_option = current_question[0].correct_option;
    const difficulty = current_question[0].difficulty;
    const author = current_question[0].author;*/

    document.querySelector('#question-number').innerText = question_number;
    document.querySelector('#question-description').innerText = description;
    document.querySelector('#op_a').innerText = "A. " + option_a;
    document.querySelector('#op_b').innerText = "B. " + option_b;
    document.querySelector('#op_c').innerText = "C. " + option_c;
    document.querySelector('#op_d').innerText = "D. " + option_d;   
}

function stop_question() {
    is_time_to_answer_over = true;
    showElements();
    highlight_correct_option();
    update_scores();
    sort_scores();
    console.log(players);
    show_scores();
    console.log(players);
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
        }
    }
}

function show_scores() {
    const players_scores_list = document.querySelector('#players-scores-list');

    clear_scores_list(players_scores_list);

    for(let i = 0; i < players.length; i++) {
        
        const player_score_li = document.createElement('LI');
        const player_item_span = document.createElement('SPAN');
        const question_score_span = document.createElement('SPAN');
        const general_score_span = document.createElement('SPAN');

        player_score_li.className = "player-score-li";
        player_item_span.className = "player-item";
        question_score_span.className = did_player_answer_correctly(players[i].answer) ? "question-score-correct" : "question-score-wrong";
        general_score_span.className = "general-score";

        player_item_span.innerText = players[i].name;
        question_score_span.innerText = did_player_answer_correctly(players[i].answer) ? "+ 1" : "+ 0";
        general_score_span.innerText = players[i].score + " pts.";

        players_scores_list.appendChild(player_score_li);
        player_score_li.appendChild(player_item_span);
        player_score_li.appendChild(question_score_span);
        player_score_li.appendChild(general_score_span);
    }
}

function did_player_answer_correctly(answer) {
    return answer == current_question[0].correct_option;
}

function update_scores() {
    for(let i = 0; i < players.length; i++) {
        if(did_player_answer_correctly(players[i].answer)) {
            players[i].score += 1;
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
    
    if(manage_question_repetition()) return; // Retorna true quanod usuário esgota as questões e não deseja repetição

    clear_correct_option_highlight();
    clear_players_answers();

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
                                    
            if ( questions_ids[i].id == current_question[0].id) { 
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
    console.log(options_votes_total);
    document.querySelector('#A-stats').style.width = `${options_statistics[0] / options_votes_total * 100}%`;
    document.querySelector('#B-stats').style.width = `${options_statistics[1] / options_votes_total * 100}%`;
    document.querySelector('#C-stats').style.width = `${options_statistics[2] / options_votes_total * 100}%`;
    document.querySelector('#D-stats').style.width = `${options_statistics[3] / options_votes_total * 100}%`;

}

function end_quiz() {
    hideElements();
    document.querySelector('#statistics').style.display = "none";
    document.querySelector('#players-answers').style.display = "none";
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

    console.log(amount_of_seconds);
    if(is_countdown_creation) {
        create_timer(amount_of_seconds);
        amount_of_seconds--;
        setTimeout(manage_time, 1000, amount_of_seconds, false)
    }
    else {
        document.querySelector('#countdown').innerText = amount_of_seconds;
        if(amount_of_seconds  < 1) {
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
    time_span.style.right = '3%';
    time_span.style.top = '3%';
    time_span.style.borderRadius = '10%';

    document.querySelector('#page-container').appendChild(time_span);
}

function load_final_score_screen() {
    const final_score_heading = document.querySelector('.h2');
    final_score_heading.innerHTML = "Pontuação final:"

    const final_score_list = document.querySelector('#question-options');
    

    while (final_score_list.firstChild) {
        final_score_list.removeChild(final_score_list.firstChild);
    }

    for(let i = 0; i < players.length; i++) {
        const player_score_li = document.createElement('LI');
        const player_item_span = document.createElement('SPAN');
        const question_score_span = document.createElement('SPAN');
        const general_score_span = document.createElement('SPAN');

        player_score_li.className = "player-score-li";
        player_item_span.className = "player-item";
        question_score_span.className = did_player_answer_correctly(players[i].answer) ? "question-score-correct" : "question-score-wrong";
        general_score_span.className = "general-score";

        player_item_span.innerText = players[i].name;
        question_score_span.innerText = did_player_answer_correctly(players[i].answer) ? "+ 1" : "+ 0";
        general_score_span.innerText = players[i].score + " pts.";

        final_score_list.appendChild(player_score_li);
        player_score_li.appendChild(player_item_span);
        player_score_li.appendChild(question_score_span);
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