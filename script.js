// Объявляем константы для элементов интерфейса
const form = document.querySelector('.todo-form');
const todoInput = document.querySelector('.todo-input');
const tasksList = document.querySelector('.tasks-list');
const overviewBox = document.querySelector('.overview-box');
const icons = {
    done: './icons/ni-check-hand.svg',
    revert: './icons/revert.svg',
    delete: './icons/delete.svg',
    edit: './icons/ni-pen-line.svg',
    save: './icons/ni-clipboard-check.svg'
};

// Меняем const на let, так как массив будет изменяться
let tasks = [];

// Регистрируем обработчики событий
form.addEventListener('submit', handleAddTaskSubmit);
// Объединяем обработчики в один, чтобы избежать конфликтов
tasksList.addEventListener('click', handleTaskAction);

// Универсальный обработчик для всех действий (удаление, выполнение, редактирование)
function handleTaskAction(event) {
    // Находим ближайшую кнопку с атрибутом data-action
    const actionBtn = event.target.closest('button[data-action]');
    if (!actionBtn) return; // Если клик не по кнопке, ничего не делаем

    const action = actionBtn.dataset.action;
    
    event.stopPropagation();

    // Выбираем действие в зависимости от значения атрибута data-action
    switch(action) {
        case 'delete':
            handleDeleteTask(actionBtn);
            break;
        case 'done':
        case 'revert':
            handleCompletedTask(actionBtn);
            break;
        case 'edit':
            startEditing(actionBtn);
            break;
        case 'save':
            finishEditing(actionBtn);
            break;
    }
}

// Основная функция добавления задачи
function handleAddTaskSubmit(event) {
    event.preventDefault();

    const taskText = todoInput.value.trim();
    if (!taskText) {
        alert('Please enter a task!');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        done: false,
    };

    tasks.push(newTask);
    
    // Генерируем HTML для новой задачи
    const cssClass = newTask.done 
        ? 'task-list__title task-list__title-done' 
        : 'task-list__title';
        
    const buttonCssClass = newTask.done 
        ? 'button-action button-action--completed' 
        : 'button-action';

    const taskHTML = `
        <li id="${newTask.id}" class="task-list__item card">
            <span class="${cssClass}">${newTask.text}</span>
            <div class="task-list__buttons">
                <button type="button" data-action="done" class="${buttonCssClass}">
                    <img src="${icons[newTask.done ? 'revert' : 'done']}" alt="Done">
                </button>
                <button type="button" data-action="delete" class="button-action">
                    <img src="${icons.delete}" alt="Delete">
                </button>
                <button type="button" data-action="edit" class="button-action">
                    <img src="${icons.edit}" alt="Edit">
                </button>
            </div>
        </li>`;

    tasksList.insertAdjacentHTML('beforeend', taskHTML);
    
    // Анимация добавления
    requestAnimationFrame(() => {
        const newTaskElement = tasksList.lastElementChild;
        newTaskElement.classList.add('show');
    });

    // Очищаем поле ввода
    todoInput.value = '';
    todoInput.focus();

    saveToLocalStorage();
    updateOverviewBox();
}

// Функция обновления блока состояния
function updateOverviewBox() {
    const isEmpty = tasks.length === 0;
    overviewBox.dataset.state = isEmpty ? 'empty' : 'filled';
    
    const img = overviewBox.querySelector('img');
    const title = overviewBox.querySelector('h3');
    
    if (isEmpty) {
        img.src = './images/oc-lighthouse.svg';
        title.innerHTML = 'Looks like you\'re all caught up! <br> Time to dream up something new.';
    } else {
        img.src = './images/oc-target.svg';
        title.textContent = 'Keep up the good work!';
    }
}

// Обработчик удаления задач
function handleDeleteTask(deleteButton) {
    // Находим родительский элемент li для удаления
    const parentNode = deleteButton.closest('li');
    const id = Number(parentNode.id);
    
    tasks = tasks.filter(task => task.id !== id); // Фильтруем массив задач
    parentNode.remove(); // Удаляем элемент из DOM
    
    saveToLocalStorage();
    updateOverviewBox();
}

// Обработчик выполнения задач
function handleCompletedTask(actionButton) {
    const parentNode = actionButton.closest('li');
    const id = Number(parentNode.id);
    const task = tasks.find(task => task.id === id);
    
    if (!task) return;
    
    task.done = !task.done; // Инвертируем состояние
    
    // Обновляем элементы DOM
    const title = parentNode.querySelector('.task-list__title');
    
    title.classList.toggle('task-list__title-done');
    actionButton.classList.toggle('button-action--completed');
    
    // Обновляем кнопку в зависимости от состояния задачи
    actionButton.dataset.action = task.done ? 'revert' : 'done';
    actionButton.querySelector('img').src = task.done 
        ? icons.revert 
        : icons.done;

    saveToLocalStorage();
    updateOverviewBox();
}

// Функция начала редактирования
function startEditing(editButton) {
    const parentLi = editButton.closest('li');
    const titleElement = parentLi.querySelector('.task-list__title');
    const taskId = Number(parentLi.id);
    const task = tasks.find(t => t.id === taskId);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.className = 'edit-input';
    
    // Заменяем заголовок на поле ввода
    titleElement.replaceWith(input);
    input.focus();

    // Меняем иконку и действие кнопки на "сохранить"
    editButton.dataset.action = 'save';
    editButton.querySelector('img').src = icons.save;

    // Обработчик для завершения редактирования при потере фокуса
    input.addEventListener('blur', () => {
        // Проверяем, всё ещё ли input присутствует в DOM
        // Необходимо, чтобы избежать двойного вызова при нажатии на кнопку "сохранить"
        if (document.body.contains(input)) {
            saveTaskText(task, input, titleElement, editButton);
        }
    });

    // Обработчик для завершения редактирования при нажатии Enter
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Предотвращаем отправку формы
            input.blur(); // Снимаем фокус, что вызовет событие blur и сохранение
        }
    });
}

// Функция завершения редактирования при нажатии на кнопку сохранения
function finishEditing(saveButton) {
    const parentLi = saveButton.closest('li');
    const input = parentLi.querySelector('.edit-input');
    const taskId = Number(parentLi.id);
    const task = tasks.find(t => t.id === taskId);
    
    // Создаем новый элемент для текста задачи
    const titleElement = document.createElement('span');
    const cssClass = task.done ? 'task-list__title task-list__title-done' : 'task-list__title';
    titleElement.className = cssClass;
    
    // Сохраняем новый текст
    const newText = input.value.trim();
    if (newText) {
        task.text = newText;
        titleElement.textContent = newText;
        saveToLocalStorage();
    } else {
        // Если текст пустой, возвращаем старый
        titleElement.textContent = task.text;
    }
    
    // Заменяем поле ввода на текст
    input.replaceWith(titleElement);
    
    // Меняем кнопку обратно на "редактировать"
    saveButton.dataset.action = 'edit';
    saveButton.querySelector('img').src = icons.edit;
}

// Работа с Local Storage
function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLS() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (savedTasks) {
            tasks = savedTasks;
            renderTasks();
        }
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
    }
    updateOverviewBox();
}

// Рендер задач при загрузке
function renderTasks() {
    tasksList.innerHTML = tasks.map(task => {
        const cssClass = task.done 
            ? 'task-list__title task-list__title-done' 
            : 'task-list__title';
            
        const buttonAction = task.done ? 'revert' : 'done';
        const buttonIcon = task.done ? icons.revert : icons.done;
        const buttonClass = task.done ? 'button-action button-action--completed' : 'button-action';
        
        return `
            <li id="${task.id}" class="task-list__item card show">
                <span class="${cssClass}">${task.text}</span>
                <div class="task-list__buttons">
                    <button type="button" data-action="${buttonAction}" class="${buttonClass}">
                        <img src="${buttonIcon}" alt="${buttonAction}">
                    </button>
                    <button type="button" data-action="delete" class="button-action">
                        <img src="${icons.delete}" alt="Delete">
                    </button>
                    <button type="button" data-action="edit" class="button-action">
                        <img src="${icons.edit}" alt="Edit">
                    </button>
                </div>
            </li>`;
    }).join('');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLS();
});