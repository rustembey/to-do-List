let x = console.log;

const form = document.querySelector('.todo-form');
const todoInput = document.querySelector('.todo-input');
const tasksList = document.querySelector('.tasks-list');
const overviewBox = document.querySelector('.overview-box');
const buttonDone = document.querySelector('.done')

const tasks = [];

//добавление задачи : слушатель событии addEventListener
//функция handleAddTaskSubmit добавлен в слушатель событий
form.addEventListener('submit', handleAddTaskSubmit);

// удаление задачи: слушатель событии addEventListener
//функция handelDeleteTask добавлен в слушатель событий
tasksList.addEventListener('click', handelDeleteTask)

// завершение задачи: слушатель событии addEventListener
//функция handleCompletedTask добавлен в слушатель событий
tasksList.addEventListener('click', handleCompletedTask)

// Функции 
//функция handleAddTaskSubmit: отправка формы для добавления задачи
function handleAddTaskSubmit(event) {
    event.preventDefault();

    const taskText = todoInput.value; //достаю текст из инпута, константа создана выше

    //формирую задачу в виде обьекта
    const newTask = {
        id: Date.now(),
        text: taskText,
        done: false,
    };
    //добавляю задачу в обьект tasks
    tasks.push(newTask);
    //формирую css Class
    const cssClass = newTask.done ? 'task-list__title task-list__title-done' : 'task-list__title';
    const buttonCssClass = newTask.done ? 'button-action button-action--completed' : 'button-action';


    //делаю разметку html li Title динамичный из перемнной taskText то есть название задачи. (Создать списом можно и с creanElement)
    const creatTaskList =
        `<li id="${newTask.id}" class="task-list__item card">
                    <span class="${cssClass}">${newTask.text}</span>
                    <div class="task-list__buttons">
                        <button type="button" data-action="done" data-action="completed" class="${buttonCssClass}">
                            <img src="./icons/ni-check-hand.svg" alt="Done" width="18" height="18">
                        </button>
                        <button type="button" data-action="delete" class="button-action">
                            <img src="./icons/delete.svg" alt="Delete" width="18" height="18">
                        </button>
                    </div>
                </li>` ;

    //добавляю задачу на страницу (разметка выше) в тэг ul с помощью insertAdjacentHTML
    tasksList.insertAdjacentHTML('beforeend', creatTaskList) // beforeend перед концом можно вставлять и перед начлом
    /// очищаю инпут и фокус 
    todoInput.value = '';
    todoInput.focus();
    /// очищаю инпут и фокус вызываю функцию updateOverviewBox которая идет ниже в коде. так как функция создана через declaration можно вызывать заранее
    updateOverviewBox();
};
/// функция updateOverviewBox : обновление OverviewBox в зависмости от state, title и картина разные при state "empty" или "filled". 
// в данном случае мы сделали с dataset добавив "data-state" в html но можно и с добавлением классов с помощью ClassList 
function updateOverviewBox() {
    if (tasksList.children.length === 0) {
        overviewBox.dataset.state = 'empty';
        overviewBox.querySelector('img').src = './images/oc-lighthouse.svg';
        overviewBox.querySelector('h3').innerHTML = 'Looks like you\'re all caught up! <br> Time to dream up something new.';
    } else {
        overviewBox.dataset.state = 'filled';
        overviewBox.querySelector('img').src = './images/oc-target.svg';
        overviewBox.querySelector('h3').textContent = 'Keep up the good work!';
    }
}
//функция handelDeleteTask: поиск черех data в html кнопка имеет data-action= "done" или "delete"
function handelDeleteTask(event) {
    if (event.target.dataset.action !== 'delete') return
    const parentNode = event.target.closest('li');

    //определяю id задачи
    const id = Number(parentNode.id);
    // индекс задачи в массиве
    const index = tasks.findIndex(function (task) {
            return task.id === id;
    })

    tasks.splice(index, 1)



    parentNode.remove();

    updateOverviewBox();
};

//функция handleCompletedTask: 
function handleCompletedTask(event) {
    if (event.target.dataset.action !== 'done') return
    const parentNode = event.target.closest('li');
    const taskTitle = parentNode.querySelector('.task-list__title');
    const buttonDone = event.target;
    taskTitle.classList.toggle('task-list__title-done')
    buttonDone.classList.toggle('button-action--completed');
    if (buttonDone.classList.contains('button-action--completed')) {
        buttonDone.querySelector('img').src = './icons/revert.svg';
    } else {
        buttonDone.querySelector('img').src = './icons/ni-check-hand.svg'; // Возвращаем исходную иконку
    }
    updateOverviewBox();
};

function saveHTMLToLS() {
    localStorage.setItem('tasksHTML', tasksList.innerHTML);
}




