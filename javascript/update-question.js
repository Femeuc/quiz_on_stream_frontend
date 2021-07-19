const question_to_update = JSON.parse(localStorage.getItem('update_question'));
let general_subjects = [];
let channel_subjects = [];

setTimeout(function(){ localStorage.removeItem('update_question'); }, 10);

load_question_data();

function load_question_data() {
    const description = document.querySelector('#description-input');
    const option_a = document.querySelector('#option_a-input');
    const option_b = document.querySelector('#option_b-input');
    const option_c = document.querySelector('#option_c-input');
    const option_d = document.querySelector('#option_d-input');
    const answer = document.querySelector('#answer-input');
    const author = document.querySelector('#author-input');

    description.innerText = question_to_update.description;
    option_a.value = question_to_update.option_a;
    option_b.value = question_to_update.option_b;
    option_c.value = question_to_update.option_c;
    option_d.value = question_to_update.option_d;
    answer.value = question_to_update.correct_option;
    author.value = question_to_update.author;

    laod_question_difficulty();
    load_subject_from_question_to_update();
}


async function get_general_and_channel_subjects() {
    //https://quiz-on-stream.herokuapp.com/questions/subjects/channel?name=wcalixtoo"
    //http://localhost:3000/questions/subjects/channel?name=wcalixtoo"
    let api_url = "http://localhost:3000/questions/subjects/channel?name=wcalixtoo";


    const response = await fetch(api_url);
    
    // Storing data in form of JSON
    const data = await response.json();
    return data.response;
}


async function load_question_subjects(which_subject) {

    const subjects = await get_general_and_channel_subjects();
    
    for(let i = 0; i < subjects.length; i++) {
        if(subjects[i].is_general_subject) {
            general_subjects.push(subjects[i]);
        } else {
            channel_subjects.push(subjects[i]);
        }
    }

    const subjects_select = document.querySelector('#subject-input');
    
    if(which_subject == 'channel') {
        for(let i = 0; i < channel_subjects.length; i++) {
            const subject_option = document.createElement('OPTION');
            subject_option.value = channel_subjects[i].subject;
            subject_option.innerText = channel_subjects[i].subject;
            subjects_select.appendChild(subject_option);
        }
    } else if(which_subject == 'general') {
        for(let i = 0; i < general_subjects.length; i++) {
            const subject_option = document.createElement('OPTION');
            subject_option.value = general_subjects[i].subject;
            subject_option.innerText = general_subjects[i].subject;
            subjects_select.appendChild(subject_option);
        }
    }

    for(let i = 0; i < subjects.length; i++) {
        if(subjects[i].id == question_to_update.subject){
            subjects_select.value = subjects[i].subject;
        } 
    } 
}

function load_subjects(which_subject) {
    const subjects_select = document.querySelector('#subject-input');

    while (subjects_select.firstChild) {
        subjects_select.removeChild(subjects_select.firstChild);
    }
    
    if(which_subject == 'channel') {
        for(let i = 0; i < channel_subjects.length; i++) {
            const subject_option = document.createElement('OPTION');
            subject_option.value = channel_subjects[i].subject;
            subject_option.innerText = channel_subjects[i].subject;
            subjects_select.appendChild(subject_option);
        }
    } else if(which_subject == 'general') {
        for(let i = 0; i < general_subjects.length; i++) {
            const subject_option = document.createElement('OPTION');
            subject_option.value = general_subjects[i].subject;
            subject_option.innerText = general_subjects[i].subject;
            subjects_select.appendChild(subject_option);
        }
    }
}


function handleCheckboxChange(){
    const which_subjects_input = document.querySelectorAll('.radio-subject-input');
    if(which_subjects_input[0].checked) {
        load_subjects(which_subjects_input[0].value);
    } else {
        load_subjects(which_subjects_input[1].value);
    }
}

function laod_question_difficulty() {
    const difficulty = question_to_update.difficulty;
    if(difficulty == 1) document.querySelector('#difficulty-input').value = 'easy';
    else if(difficulty == 2) document.querySelector('#difficulty-input').value = 'normal';
    else if(difficulty == 3) document.querySelector('#difficulty-input').value = 'hard';
}

async function load_subject_from_question_to_update() {
    if(question_to_update.is_general_subject){
        await load_question_subjects('general');
    } else {
        await load_question_subjects('channel');
    }

}

function update_question() {
    descripion = document.querySelector('#description-input').value;
    option_a = document.querySelector('#option_a-input').value;
    option_b = document.querySelector('#option_b-input').value;
    option_c = document.querySelector('#option_c-input').value;
    option_d = document.querySelector('#option_d-input').value;
    answer = document.querySelector('#answer-input').value;
    difficulty = document.querySelector('#difficulty-input').value;
    subject = document.querySelector('#subject-input').value;
    author = document.querySelector('#author-input').value.toLowerCase();
    
    diff = adapt_inputs_to_database(difficulty);
    subj = adapt_inputs_to_database(subject);
    
    if(descripion.length < 1 || option_a.length < 1 || option_b.length < 1 || option_c.length < 1 || option_d.length < 1
        || answer.length != 1 || isNaN(diff) || isNaN(subj) || author.length < 1) {

        alert("Sua questão não foi enviada porque você deixou algum campo vazio ou escreveu algo inválido.");
        return;
    }

    //http://localhost:3000/question
    //https://quiz-on-stream.herokuapp.com/question
    fetch("http://localhost:3000/question/" + question_to_update.id, {
                
        // Adding method type
        method: "PUT",
            
        // Adding body or contents to send
        body: JSON.stringify({
            description: descripion,
            option_a: option_a,
            option_b: option_b,
            option_c: option_c,
            option_d: option_d,
            answer: answer,
            difficulty: diff,
            subject: subj,
            author: author
        }),
            
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function (response) {
        if(response.status == 200) {
            alert("Questão atualizada com sucesso!");
        }
        else
            alert("Erro ao atualizar. Status: " + response.status);
    })
}

function adapt_inputs_to_database(input_to_addapt) {
    if(input_to_addapt == 'easy' || input_to_addapt == 'normal' || input_to_addapt == 'hard') {
        if(input_to_addapt == 'easy') return 1;
        else if(input_to_addapt == 'normal') return 2;
        else if(input_to_addapt == 'hard') return 3;
    } 

    else {
        const all_subjects = channel_subjects.concat(general_subjects);
        for(let i = 0; i < all_subjects.length; i++) {
            if(input_to_addapt == all_subjects[i].subject) return all_subjects[i].id;
        }
    }
}
