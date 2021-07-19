let general_subjects = [];
let channel_subjects = [];

get_general_and_channel_subjects();

async function get_general_and_channel_subjects() {
    //https://quiz-on-stream.herokuapp.com/questions/subjects/channel?name=wcalixtoo"
    //http://localhost:3000/questions/subjects/channel?name=wcalixtoo"
    let api_url = "https://quiz-on-stream.herokuapp.com/questions/subjects/channel?name=wcalixtoo";


    const response = await fetch(api_url);
    
    // Storing data in form of JSON
    const data = await response.json();
    const subjects = data.response;
    for(let i = 0; i < subjects.length; i++) {
        if(subjects[i].is_general_subject) {
            general_subjects.push(subjects[i]);
        } else {
            channel_subjects.push(subjects[i]);
        }
    }
    
    load_subjects("channel");
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

function send_question() {
    descripion = document.querySelector('#description-input').value.toLowerCase();
    option_a = document.querySelector('#option_a-input').value.toLowerCase();
    option_b = document.querySelector('#option_b-input').value.toLowerCase();
    option_c = document.querySelector('#option_c-input').value.toLowerCase();
    option_d = document.querySelector('#option_d-input').value.toLowerCase();
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
    fetch("https://quiz-on-stream.herokuapp.com/question", {
                
        // Adding method type
        method: "POST",
            
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
            alert("Questão adicionada com sucesso!");
            clear_fields();
        }
        else
            alert("Erro ao adicionar. Status: " + response.status);
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

function clear_fields() {
    document.querySelector('#description-input').value = "";
    document.querySelector('#option_a-input').value = "";
    document.querySelector('#option_b-input').value = "";
    document.querySelector('#option_c-input').value = "";
    document.querySelector('#option_d-input').value = "";
    document.querySelector('#answer-input').value;
    document.querySelector('#difficulty-input').value;
    document.querySelector('#subject-input').value;
    document.querySelector('#author-input').value;
}


function send_subject() {
    subject_to_add = document.querySelector('#subject-to-add');

    if(subject_to_add.value.length < 1) {
        return;
    }

    subject_simplified = subject_to_add.value.toLowerCase();
    channel = 'wcalixtoo';
    
    //http://localhost:3000/questions/subject
    //https://quiz-on-stream.herokuapp.com/questions/subject
    fetch("https://quiz-on-stream.herokuapp.com/questions/subject", {
                
        // Adding method type
        method: "POST",
            
        // Adding body or contents to send
        body: JSON.stringify({
            subject: subject_to_add.value,
            subject_simplified: subject_simplified,
            channel: channel
        }),
            
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function (response) {
        if(response.status == 200) {
            alert("Assunto adicionado com sucesso!");
            subject_to_add.value = "";
        }
        else
            alert("Erro ao adicionar. Status: " + response.status);
    })

}