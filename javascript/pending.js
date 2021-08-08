let q_suggestions = []; // q = question
let s_suggestions = []; // s = subject
let q_reports = [];
let page_context = 0;  // 0 = q_suggestions; 1 = s_suggestions; 2 = q_reports 
                       // direction: +1 -> right; -1 -> left;  

load_q_suggestions();

async function load_q_suggestions() {
    if(q_suggestions.length == 0) {
        const url = "https://quiz-on-stream.herokuapp.com/questions/suggestions";
        q_suggestions = await get_data(url);
    }

    document.querySelector('#h2-switch').innerText = "Questões Sugeridas";
    const suggestions_list = document.querySelector('ul');
    remove_all_children(suggestions_list);
    q_suggestions.forEach(element => {
        suggestions_list.appendChild(create_suggestion_li(element));
    });
}

async function load_s_suggestions() {
    if(s_suggestions.length == 0) {
        const url = "https://quiz-on-stream.herokuapp.com/questions/subjects/suggestions";
        s_suggestions = await get_data(url);
    }

    document.querySelector('#h2-switch').innerText = "Assuntos Sugeridos";
    const suggestions_list = document.querySelector('ul');
    remove_all_children(suggestions_list);
    s_suggestions.forEach(element => {
        suggestions_list.appendChild(create_suggestion_li(element));
    });
}

async function load_q_reports() {
    if(q_reports.length == 0) {
        const url = "https://quiz-on-stream.herokuapp.com/questions/reports";
        q_reports = await get_data(url);
    }

    document.querySelector('#h2-switch').innerText = "Reportes Enviados";
    const suggestions_list = document.querySelector('ul');
    remove_all_children(suggestions_list);
    q_reports.forEach(element => {
        suggestions_list.appendChild(create_suggestion_li(element));
    });
}

async function get_data(api_url) {
    const response = await fetch(api_url);
    const data = await response.json();   
    return data.response;
}

function remove_all_children(element) {
    while (element.firstChild) { element.removeChild(element.firstChild); }
}

function create_suggestion_li(suggestion) {
    const li = document.createElement('LI');
    const div = document.createElement('DIV');
    const button_edit = document.createElement('BUTTON');
    const button_delete = document.createElement('BUTTON');

    div.innerText = get_li_div_text(suggestion);

    button_edit.onclick = function() { 
        alert('Ver')
    };
    button_delete.onclick = function() { 
        alert('Deletar')
    };

    button_edit.innerText = "Ver";
    button_delete.innerText = "Deletar";

    div.className = "li-div";
    button_edit.className = "li-edit-btn";
    button_delete.className = "li-delete-btn";

    li.appendChild(div);
    li.appendChild(button_edit);
    li.appendChild(button_delete);

    return li;
}

function get_li_div_text(suggestion) {
    if(page_context == 0) {
        return suggestion.description.replace(/(\r\n|\n|\r)/gm, "");
    }

    if(page_context == 1) {
        return suggestion.subject;
    }

    if(page_context == 2) {
        return "REPORT";
    }
}

function switch_display(direction) {
    page_context += direction;

    if(page_context == 0) { load_q_suggestions(); return; }

    if(page_context == 1) { load_s_suggestions(); return; }

    if(page_context == 2) { load_q_reports(); return; }

    if(page_context == 3) { page_context = 0; load_q_suggestions(); return; }

    if(page_context == -1) { page_context = 2; load_q_reports(); return; }
}