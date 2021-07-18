const channel = localStorage['username'];
const latest_messages_ul = document.querySelector('#latest-messages');

document.querySelector('#chat-owner').innerText = "Chat de " + channel +":";

const client = new tmi.Client({
	channels: [ channel ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
	//console.log(`${tags['display-name']}: ${message}`);

    const li = document.createElement("LI");
    li.innerHTML = `<span style="font-weight: bold; color: yellow;"'>${tags['display-name']}</span>: ${message}`;
    latest_messages_ul.appendChild(li);

    if(latest_messages_ul.childElementCount > 7) {
        latest_messages_ul.removeChild(latest_messages_ul.childNodes[0]);
    };

    const chat_messages_div = document.querySelector('#chat-messages-div');
    chat_messages_div.scrollTop = chat_messages_div.scrollHeight;
});

function handleCheckboxChange() {
    let general_subjects = document.querySelector('#general-matters');
    if (document.querySelector('#general-matters-checkbox').checked) {
        general_subjects.style.display = "grid";
    } else {
        general_subjects.style.display = "none";
    }

    let specific_subjects = document.querySelector('#specific-matters');
    if (document.querySelector('#specific-matters-checkbox').checked) {
        specific_subjects.style.display = "grid";
    } else {
        specific_subjects.style.display = "none";
    }

    let how_much_time = document.querySelector('#how-much-time');
    if (document.querySelector('#predefined').checked) {
        how_much_time.style.display = "inline";
    } else {
        how_much_time.style.display = "none";
    }

}


const api_url = `http://localhost:3000/questions/subjects/channel?name=${channel}`;
get_question_subjects(api_url);
async function get_question_subjects(api_url) {
    // Storing response
    const response = await fetch(api_url);
    
    // Storing data in form of JSON
    const data = await response.json();
    console.log(data.response);

    let general_subjects = [];
    let channel_subjects = [];

    for(let i = 0; i < data.response.length; i++) {
        if(data.response[i].is_general_subject)
            general_subjects.push(data.response[i]);
        else
            channel_subjects.push(data.response[i]);
    }

    add_general_subjects(general_subjects);
    add_channel_subjects(channel_subjects);
}

function add_general_subjects(data) {
    const general_matters_input_div = document.querySelector('#general-matters-input-div')
    for (let i = 0; i < data.length; i++) {
        const filter_input_block = document.createElement("DIV");
        const general_matters_input = document.createElement("INPUT");
        const general_matters_label = document.createElement("LABEL");

        filter_input_block.className = "filter-input-block";
        general_matters_input.className = "filter-input";
        general_matters_input.type = "checkbox";
        general_matters_input.id = `${data[i].subject_simplified}`;
        general_matters_label.setAttribute("for", general_matters_input.id);
        general_matters_label.innerText = general_matters_input.id;
        general_matters_label.style = "margin-left: 5px";

        filter_input_block.appendChild(general_matters_input);
        filter_input_block.appendChild(general_matters_label);
        general_matters_input_div.appendChild(filter_input_block);
    }
}

function add_channel_subjects(data) {
    const channel_matters_input_div = document.querySelector('#channel-matters-input-div')
    for (let i = 0; i < data.length; i++) {
        const filter_input_block = document.createElement("DIV");
        const channel_matters_input = document.createElement("INPUT");
        const channel_matters_label = document.createElement("LABEL");

        filter_input_block.className = "filter-input-block";
        channel_matters_input.className = "filter-input";
        channel_matters_input.type = "checkbox";
        channel_matters_input.id = `${data[i].subject_simplified}`;
        channel_matters_label.setAttribute("for", channel_matters_input.id);
        channel_matters_label.innerText = channel_matters_input.id;
        channel_matters_label.style = "margin-left: 5px";

        filter_input_block.appendChild(channel_matters_input);
        filter_input_block.appendChild(channel_matters_label);
        channel_matters_input_div.appendChild(filter_input_block);
    }
}


const start_button = document.querySelector('#start-button');
start_button.onclick = async function() {
    const all_filters = document.querySelectorAll('.filter-input');
    const filters_inputs = [];
    for (let i = 0; i < all_filters.length; i++) {
        if(all_filters[i].checked) {
            filters_inputs.push(all_filters[i].id);
        }
    }
    console.log(filters_inputs.toString());

    const subjects = [];
    const difficulties = [];
    let time;

    for (let i = 0; i < filters_inputs.length; i++) {

        switch (filters_inputs[i]) {
            case 'easy':
            case 'normal':
            case 'hard':
                difficulties.push(filters_inputs[i]);
                break;
            
            case 'dinamic':
            case 'predefined':
                time = filters_inputs[i];
                break;
            
            default:
                subjects.push(filters_inputs[i]);
        }
    }

    if(subjects.length < 1 || difficulties.length < 1) {
        alert("Você precisa marcar pelo menos um dos filtro de abrangência e um de dificuldade. ");
        return;
    }

    const response = await get_all_questions_ids(subjects, difficulties);

    if(response.length < 1) {
        alert("Nenhuma pergunta cadastrada com esses filtros.");
        return;
    }

    localStorage.setItem("questions_ids", JSON.stringify(response));
    localStorage.setItem('time', time);
    localStorage.setItem('seconds', time == 'dinamic' ? 0 : document.querySelector('#quantity').value);

    window.open('questions.html', '_self');
};


async function get_all_questions_ids(subjects, difficulties) {
    let api_url = "http://localhost:3000/questions/filters?";

    for(let i = 0; i < difficulties.length; i++) {
        api_url += "difficulty=" + difficulties[i] + "&";
    }
    for(let i = 0; i < subjects.length; i++) {
        api_url += "subject=" + subjects[i] + "&";
    }

    const response = await fetch(api_url);
    
    // Storing data in form of JSON
    const data = await response.json();

    return data.response;
}