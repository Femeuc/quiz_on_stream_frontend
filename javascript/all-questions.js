let questions;
let subjects;

initialize_page();

async function initialize_page() {
    document.querySelector('.p').style.display = 'none';

    questions = await get_all_questions();
    show_questions();
    subjects = await get_all_subjects();
}

async function get_all_questions() {
    //https://quiz-on-stream.herokuapp.com/questions
    //http://localhost:3000/questions
    const api_url = "https://quiz-on-stream.herokuapp.com/questions";

    const response = await fetch(api_url);
    
    // Storing data in form of JSON
    const data = await response.json();
    
    return data.response;
}

async function get_all_subjects() {
    //https://quiz-on-stream.herokuapp.com//questions/subjects/channel
    //http://localhost:3000//questions/subjects/channel
    const api_url = "https://quiz-on-stream.herokuapp.com/questions/subjects";

    const response = await fetch(api_url);
    
    // Storing data in form of JSON
    const data = await response.json();
    
    return data.response;
}

function show_questions() {
    const ul_display = document.querySelector('#display-list');

    document.querySelector('.p').style.display = 'none';

    remove_all_children(ul_display);

    questions.forEach(question => {
        const question_li = create_question_li(question);
        ul_display.appendChild(question_li);
    });
    
}

function create_question_li(question) {
    const li = document.createElement('LI');
    const div = document.createElement('DIV');
    const button_edit = document.createElement('BUTTON');
    const button_delete = document.createElement('BUTTON');

    button_edit.className = "buttons";
    button_edit.id = "edit-button";
    button_edit.onclick = function() { 
        localStorage.setItem('update_question', JSON.stringify(question));
        window.open(`update-question.html`); 
    };
    button_delete.onclick = function() { 
        delete_item("question", question.id, li);
    };

    button_delete.className = "buttons delete-button";
    //button_delete.id = "delete-button";

    div.innerText = question.description.replace(/(\r\n|\n|\r)/gm, "");
    button_edit.innerText = "Editar";
    button_delete.innerText = "Deletar";

    li.appendChild(div);
    li.appendChild(button_edit);
    li.appendChild(button_delete);

    return li;
}

function switch_display() {
    const h2_switch = document.querySelector('#h2-switch');

    const text_1 = "Questões de Wcalixtoo";
    const text_2 = "Todos os assuntos";

    if(h2_switch.innerText == text_1) {
        h2_switch.innerText = text_2;
        show_subjects();
        return;
    } 

    h2_switch.innerText = text_1;
    show_questions();
}

function remove_all_children(element) {
    while (element.firstChild) { element.removeChild(element.firstChild); }
}

function show_subjects() {
    const ul_display = document.querySelector('#display-list');

    document.querySelector('.p').style.display = 'block';
    remove_all_children(ul_display);

    subjects.forEach(subject => {
        const subject_li = create_subject_li(subject);
        ul_display.appendChild(subject_li);
    });
    
}

function create_subject_li(subject) {

    console.log(subject);

    const li = document.createElement('LI');
    const subject_name_div = document.createElement('DIV');
    const subject_owner_div = document.createElement('DIV');
    const button_delete = document.createElement('BUTTON');

    button_delete.onclick = function() { 
        delete_item("subject", subject.id, li);
    };

    button_delete.className = "buttons delete-button";

    subject_name_div.innerHTML = `NOME: <span style="color: rgb(255, 232, 118);"> ${subject.subject} </span>`;
    subject_owner_div.innerHTML = subject.is_general_subject ? `CANAL: <span style="color: rgb(255, 232, 118);"> Todos </span>` : 
    `CANAL: twitch.tv/<span style="color: rgb(255, 232, 118); font-size: 25px;">${subject.channel}</span>`;
    button_delete.innerHTML = "Deletar";

    li.appendChild(subject_name_div);
    li.appendChild(subject_owner_div);
    li.appendChild(button_delete);

    return li;
}

function delete_item(type, item_id, li) {
    if(!window.confirm("Tem certeza que quer deletar?")) return;

    if (type != "question" && type != "subject") return;
    const route = type == "question" ? "question/" : "questions/subject/";


    //https://quiz-on-stream.herokuapp.com/questions
    //http://localhost:3000/question/
    fetch(`https://quiz-on-stream.herokuapp.com/${route}` + item_id, {
        method: 'DELETE',
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function (response) {
        if(response.status == 200) {
            document.querySelector('#display-list').removeChild(li);
        }
    })
}