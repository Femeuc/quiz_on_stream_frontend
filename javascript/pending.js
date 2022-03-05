let q_suggestions = []; // q = question
let exp_suggestions = [] // exp = explanations
let s_suggestions = []; // s = subject
let q_reports = [];
let page_context = 0;  // 0 = q_suggestions; 1 = s_suggestions; 2 = q_reports 
                       // direction: +1 -> right; -1 -> left;  

load_q_suggestions();

async function load_q_suggestions() {
    if(q_suggestions.length == 0) {
        const url1 = "https://quiz-on-stream.herokuapp.com/questions/suggestions";
        const url2 = "https://quiz-on-stream.herokuapp.com/questions/explanations/suggestions";
        q_suggestions = await get_data(url1);
        exp_suggestions = await get_data(url2);
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
        get_button_action(suggestion, 0, li) // 0 -> edit
    };
    button_delete.onclick = function() { 
        get_button_action(suggestion, 1, li) // 1 -> delete
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
        return suggestion.motive;
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

function get_button_action(suggestion, action, li) {
    if(page_context == 0) { 
        if(action == 0) {
            edit_question(suggestion, li);
        } else {
            delete_question(suggestion, li);
        }
    }

    if(page_context == 1) {
        if(action == 0) {
            edit_suggestion(suggestion);
        } else {
            delete_suggestion(suggestion.id, li);
        }
    }

    if(page_context == 2) {
        if(action == 0) {
            see_report(suggestion);
        } else {
            delete_report(suggestion.id, li);
        }
    }
}

function edit_suggestion(suggestion) {
    localStorage.setItem('s_suggestion', JSON.stringify(suggestion));
    window.open(`subject-suggestion.html`); 
}

function delete_suggestion(id, li) {

    if(!window.confirm("Tem certeza que quer deletar?")) return;

    //https://quiz-on-stream.herokuapp.com/questions
    //http://localhost:3000/question/
    fetch(`https://quiz-on-stream.herokuapp.com/questions/subjects/suggestion/${id}`, {
        method: 'DELETE',
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function (response) {
        if(response.status == 200) {
            document.querySelector('ul').removeChild(li);
        }
    })
}

function see_report(suggestion) {
    localStorage.setItem('q_report', JSON.stringify(suggestion));
    window.open(`question-report.html`); 
}

function delete_report(id, li) {
    if(!window.confirm("Tem certeza que quer deletar?")) return;

    fetch(`https://quiz-on-stream.herokuapp.com/questions/reports/${id}`, {
        method: 'DELETE',
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function (response) {
        if(response.status == 200) {
            document.querySelector('ul').removeChild(li);
        }
    })
}

function edit_question(sug, li) {
    console.log(sug);

    // question description
    const description_label = document.createElement('LABEL');
    description_label.innerText = "Descrição";
    question_description_div = li.children[0];
    question_description_div.parentNode.insertBefore(description_label, question_description_div);
    question_description_div.setAttribute("contenteditable", "true");
    question_description_div.focus();
    setEndOfContenteditable(question_description_div);
    question_description_div.style.border = 'white 1px solid';
    question_description_div.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    
    // question options
    const option_a_label = document.createElement('LABEL');
    option_a_label.innerText = "Alternativa A";
    const option_b_label = document.createElement('LABEL');
    option_b_label.innerText = "Alternativa B";
    const option_c_label = document.createElement('LABEL');
    option_c_label.innerText = "Alternativa C";
    const option_d_label = document.createElement('LABEL');
    option_d_label.innerText = "Alternativa D";
    const option_a_txt = document.createElement('DIV');
    option_a_txt.innerText = sug.option_a;
    option_a_txt.setAttribute("contenteditable", "true");
    option_a_txt.style.border = 'white 1px solid';
    option_a_txt.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    const option_b_txt = document.createElement('DIV');
    option_b_txt.innerText = sug.option_b;
    option_b_txt.setAttribute("contenteditable", "true");
    option_b_txt.style.border = 'white 1px solid';
    option_b_txt.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    const option_c_txt = document.createElement('DIV');
    option_c_txt.innerText = sug.option_c;
    option_c_txt.setAttribute("contenteditable", "true");
    option_c_txt.style.border = 'white 1px solid';
    option_c_txt.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    const option_d_txt = document.createElement('DIV');
    option_d_txt.innerText = sug.option_d;
    option_d_txt.setAttribute("contenteditable", "true");
    option_d_txt.style.border = 'white 1px solid';
    option_d_txt.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    const option_a = document.createElement('DIV');
    const option_b = document.createElement('DIV');
    const option_c = document.createElement('DIV');
    const option_d = document.createElement('DIV');
    option_a.appendChild(option_a_label);
    option_a.appendChild(option_a_txt);
    option_b.appendChild(option_b_label);
    option_b.appendChild(option_b_txt);
    option_c.appendChild(option_c_label);
    option_c.appendChild(option_c_txt);
    option_d.appendChild(option_d_label);
    option_d.appendChild(option_d_txt);
    question_description_div.parentNode.insertBefore(option_a, question_description_div.nextSibling);
    option_a.parentNode.insertBefore(option_b, option_a.nextSibling);
    option_b.parentNode.insertBefore(option_c, option_b.nextSibling);
    option_c.parentNode.insertBefore(option_d, option_c.nextSibling);

    // Question Data
    const correct_option_label = document.createElement('LABEL');
    correct_option_label.innerText = "Alternativa Correta";
    const correct_option_txt = document.createElement('DIV');
    correct_option_txt.innerText = sug.correct_option;
    correct_option_txt.setAttribute("contenteditable", "true");
    correct_option_txt.style.border = 'white 1px solid';
    correct_option_txt.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    const correct_option = document.createElement('DIV');
    correct_option.appendChild(correct_option_label);
    correct_option.appendChild(correct_option_txt);

    const explanation_label = document.createElement('LABEL');
    explanation_label.innerText = "Justificativa";
    const explanation_txt = document.createElement('DIV');
    explanation_txt.innerText = get_question_exp(sug);
    explanation_txt.setAttribute("contenteditable", "true");
    explanation_txt.style.border = 'white 1px solid';
    explanation_txt.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    const explanation = document.createElement('DIV');
    explanation.appendChild(explanation_label);
    explanation_label.appendChild(explanation_txt);

    const difficulty_label = document.createElement('LABEL');
    difficulty_label.innerText = "Dificuldade";
    const difficulty_txt = document.createElement('DIV');
    difficulty_txt.innerText = sug.difficulty;
    difficulty_txt.setAttribute("contenteditable", "true");
    difficulty_txt.style.border = 'white 1px solid';
    difficulty_txt.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    const difficulty = document.createElement('DIV');
    difficulty.appendChild(difficulty_label);
    difficulty.appendChild(difficulty_txt); 

    const subject_label = document.createElement('LABEL');
    subject_label.innerText = "Assunto";
    const subject_txt = document.createElement('DIV');
    subject_txt.innerText = sug.subject;
    subject_txt.setAttribute("contenteditable", "true");
    subject_txt.style.border = 'white 1px solid';
    subject_txt.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    const subject = document.createElement('DIV');
    subject.appendChild(subject_label);
    subject.appendChild(subject_txt);

    const author_label = document.createElement('LABEL');
    author_label.innerText = "Quem enviou";
    const author_txt = document.createElement('DIV');
    author_txt.innerText = sug.author;
    author_txt.setAttribute("contenteditable", "true");
    author_txt.style.border = 'white 1px solid';
    author_txt.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    const author = document.createElement('DIV');
    author.appendChild(author_label);
    author.appendChild(author_txt);

    option_d.parentNode.insertBefore(correct_option, option_d.nextSibling);
    correct_option.parentNode.insertBefore(explanation, correct_option.nextSibling);
    explanation.parentNode.insertBefore(difficulty, explanation.nextSibling);
    difficulty.parentNode.insertBefore(subject, difficulty.nextSibling);
    subject.parentNode.insertBefore(author, subject.nextSibling);

    const add_btn = document.createElement('BUTTON');
    add_btn.innerText = "Adicionar";
    author.parentNode.insertBefore(add_btn, author.nextSibling);
    add_btn.onclick = function () {
        add_question(li, sug, explanation_txt.innerText);
    }

    // Mudando botão Ver
    const btn_ver = li.lastElementChild.previousElementSibling;
    btn_ver.innerText = "Ocultar";
    btn_ver.onclick = function () {
        li.removeChild(description_label);
        li.removeChild(option_a);
        li.removeChild(option_b);
        li.removeChild(option_c);
        li.removeChild(option_d);
        li.removeChild(correct_option);
        li.removeChild(difficulty);
        li.removeChild(subject);
        li.removeChild(author);
        
        question_description_div.style.border = "none";
        question_description_div.setAttribute("contenteditable", "false");
        question_description_div.style.backgroundColor = "rgba(0, 0, 0, 0)";

        btn_ver.innerText = "Ver";
        btn_ver.onclick = function () {
            edit_question(sug, li);
        }
    }
}

function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    { 
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}

function add_question(li, sug, exp = "") {
    fetch("https://quiz-on-stream.herokuapp.com/question", {
                
        // Adding method type
        method: "POST",
            
        // Adding body or contents to send
        body: JSON.stringify({
            description: sug.description,
            option_a: sug.option_a,
            option_b: sug.option_b,
            option_c: sug.option_c,
            option_d: sug.option_d,
            answer: sug.correct_option,
            difficulty: sug.difficulty,
            subject: sug.subject,
            author: sug.author
        }),
            
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(async function (response) {
        if(response.status == 200) {
            alert("Questão adicionada com sucesso!");
            if(exp.length < 1) return;
            const question_response = await response.json();
            add_question_explanation(exp, question_response['response']);
        }
        else
            alert("Erro ao adicionar. Status: " + response.status);
    })
    delete_suggestion(sug.id, li);
}

function get_question_exp(sug) {
    let explanation = "";
    exp_suggestions.forEach(exp_s => {
        if(exp_s.question_id == sug.id)
            explanation = exp_s.text;
    });
    return explanation;
}

function add_question_explanation(text, question_id) {
    fetch("https://quiz-on-stream.herokuapp.com/question/explanation", {
        method: "POST",
        body: JSON.stringify({
            text: text,
            question_id: question_id
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
}

function get_exp_id(question_id) {
    let exp_id = "";
    exp_suggestions.forEach(element => {
        if(element.question_id == question_id)
            exp_id = element.id;
    });
    return exp_id;
}

function delete_question(sug, li) {
    if(!window.confirm("Tem certeza que quer deletar?")) return;

    //https://quiz-on-stream.herokuapp.com/questions
    //http://localhost:3000/question/
    fetch(`https://quiz-on-stream.herokuapp.com/questions/suggestions/${sug.id}`, {
        method: 'DELETE',
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function (response) {
        if(response.status == 200) {
            document.querySelector('ul').removeChild(li);
        }
    })
}