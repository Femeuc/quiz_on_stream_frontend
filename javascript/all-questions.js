load_all_questions();

async function load_all_questions() {
    const response = await get_all_questions();
    const ul = document.querySelector('#questions-list');

    for(let i = 0; i < response.length; i ++) {
        const li = document.createElement('LI');
        const div = document.createElement('DIV');
        const button_edit = document.createElement('BUTTON');
        const button_delete = document.createElement('BUTTON');

        button_edit.className = "question-buttons";
        button_edit.id = "edit-button";
        button_edit.onclick = function() { 
            localStorage.setItem('update_question', JSON.stringify(response[i]));
            window.open(`update-question.html`); 
        };
        button_delete.onclick = function() { 
            delete_question(response[i].id, li);
        };

        button_delete.className = "question-buttons";
        button_delete.id = "delete-button";

        div.innerText = response[i].description.replace(/(\r\n|\n|\r)/gm, "");
        button_edit.innerText = "Editar";
        button_delete.innerText = "Deletar";

        li.appendChild(div);
        li.appendChild(button_edit);
        li.appendChild(button_delete);

        ul.appendChild(li);
    }

}

async function get_all_questions() {
    //https://quiz-on-stream.herokuapp.com/questions
    //http://localhost:3000/questions
    let api_url = "https://quiz-on-stream.herokuapp.com/questions";

    const response = await fetch(api_url);
    
    // Storing data in form of JSON
    const data = await response.json();
    console.log(data);
    return data.response;
}

function delete_question(question_id, question_li) {
    if(!window.confirm("Tem certeza que quer deletar essa questão?")) return;
    //https://quiz-on-stream.herokuapp.com/questions
    //http://localhost:3000/question/
    fetch('https://quiz-on-stream.herokuapp.com/question/' + question_id, {
        method: 'DELETE',
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function (response) {
        if(response.status == 200) {
            document.querySelector('#questions-list').removeChild(question_li);
        }
    })
}