/* Get data from LocalStorage */
const USER_STORAGE_KEY = 'TODO__APP';
const userSettings = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || {};
const dataTodos = userSettings.todos || []

// Get elements
const body = document.querySelector('body')
const themeBtn = document.querySelector('.theme')
const todoListElm = document.querySelector('.todo-list')
const deleteButton = document.querySelector('.delete-btn')
const quantityUncompletedElement = document.querySelector('.quantity-items-number')
const filterItemsEle = document.querySelectorAll('.todo-filter-item')

// Variables
let quantityUncompletedItems = 0;
let isDarkTheme = userSettings.isDarkTheme || false;


/* DOMContentLoaded */
window.addEventListener('load', start)

function start() {
    loadConfig()
    renderList(dataTodos)
    changeNumberOfUncomletedItems();
}

// Load user config 
function loadConfig() {
    themeBtn.classList.toggle('dark-active', isDarkTheme)
    body.classList.toggle('dark-theme', isDarkTheme)
}
// Set user config
function setSettings(key, value) {
    userSettings[key] = value
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userSettings))
}

// Show todo list
function renderList(data) {
    if (data) {
        const todoItems = data.map((item, index) => {
            return `<li
            class="todo-item${item.completed ? ' completed' : ''}"
            data-index=${index}
            ondrag= "startDrag(event)"
            ondragend = "dragEnd(event)"
            draggable="true"
            >
                <div class="check-btn" onclick="checkTodo(event,${index})">
                    <span class="check-icon"><i class="fa-solid fa-check"></i></span>
                </div>
            <span class="todo-name"
            ondblclick="editTodo(event)"
            contentEditable=false
            spellcheck= false
            onkeydown="enterToEndEdit(event)">${item.text}
            </span> 
            <span class="delete-btn" onclick="deleteTodo(${index},event)">
                <i class="uil uil-times"></i>
            </span>
          </li>`
        })
        todoListElm.innerHTML = todoItems.join('')
    }
}
// Toggle Dark / Light Theme
function changeTheme() {
    isDarkTheme = !isDarkTheme
    setSettings('isDarkTheme', isDarkTheme)
    loadConfig();
}

// Add New Todo
function addTodo() {
    const todoInput = document.querySelector('.add-input')
    const newTodo = {
        text: todoInput.value,
        completed: false
    }
    dataTodos.push(newTodo)
    setSettings('todos', dataTodos)
    renderList(dataTodos)
    todoInput.value = ''
    changeNumberOfUncomletedItems();
}
// Add when press 'Enter' button
function addFromKey(e) {
    if (e.keyCode === 13) {
        addTodo()
    }
}

// Drag and drop to reorder list 
// Blur item was drag
function startDrag(e) {
    e.target.classList.add('draging')
}
// Handle reorder event, when user drag element to new position
todoListElm.addEventListener('dragover', dragOver)
function dragOver(e) {
    const items = document.querySelectorAll('.todo-item')
    if (!e.target.classList.contains('draging') && e.target.classList.contains('todo-item')) {
        const dragingCard = document.querySelector('.draging')
        const cards = [...items]
        const currPos = cards.indexOf(dragingCard)
        const newPos = cards.indexOf(e.target)
        if (currPos > newPos) {
            this.insertBefore(dragingCard, e.target)
        } else {
            this.insertBefore(dragingCard, e.target.nextSibling)
        }
        const dragItem = dataTodos.splice(currPos, 1)
        dataTodos.splice(newPos, 0, ...dragItem)
        setSettings('todos', dataTodos)
    }
}
function dragEnd(e) {
    e.target.classList.remove('draging')
    renderList(dataTodos)
}

// Check Todo When Completed
function checkTodo(e, id) {
    const parentE = e.target.closest('.todo-item')
    dataTodos[id].completed = !dataTodos[id].completed
    parentE.classList.toggle('completed', dataTodos[id].completed)
    setSettings('todos', dataTodos)
    changeNumberOfUncomletedItems();
}

// Show quantity of uncompleted items
function changeNumberOfUncomletedItems() {
    quantityUncompletedItems = 0;
    for (let item of dataTodos) {
        if (!item.completed) {
            ++quantityUncompletedItems;
        }
    }
    const string = quantityUncompletedItems < 2 ? `${quantityUncompletedItems} item left` : `${quantityUncompletedItems} items left`
    const quantityTextEle = document.querySelector('.quantity-items-text')
    quantityTextEle.innerText = string
}

// Edit item when dblclick
function editTodo(e) {
    e.target.contentEditable = true
    e.target.focus()
    e.target.addEventListener('click', (e) => {
        e.stopPropagation()
    })
    window.addEventListener('click', function clickOutside() {
        endEdit()
        window.removeEventListener('click', clickOutside)
    })
}
// 
function endEdit() {
    const ele = document.querySelector('.todo-name[contentEditable = true]')
    if (ele) {
        dataTodos[ele.closest('.todo-item').getAttribute("data-index")].text = ele.innerText
        setSettings(dataTodos)
        ele.contentEditable = false
    }
}
function enterToEndEdit(e) {
    if (e.keyCode === 13) {
        endEdit()
    }
}

// Filter Items
function filterItems(e, filter) {
    document.querySelector('.todo-filter-item.active').classList.remove('active')
    e.target.classList.add('active')
    switch (filter) {
        case 'all':
            renderList(dataTodos)
            break;
        case false:
        case true:
            const filteredItems = dataTodos.filter(item => {
                return item.completed == filter
            })
            renderList(filteredItems)
            break;
        default:
            renderList(dataTodos)
            break;
    }
}

// Delete a todo item
function deleteTodo(index, e) {
    const parentEle = e.target.closest('.todo-item')
    dataTodos.splice(index, 1)
    setSettings('todos', dataTodos)
    changeNumberOfUncomletedItems();
    parentEle.style.transform = 'translateX(60px)'
    parentEle.style.opacity = '0'
    parentEle.style.borderBottomColor = 'none'
    setTimeout(() => {
        parentEle.remove()
        renderList(dataTodos)
    }, 300)
}

// Clear Completed Items
function clearList() {
    const uncompletedItems = dataTodos.reduce((result, item) => {
        if (!item.completed)
            result.push(item)
        return result
    }, [])
    dataTodos.length = 0;
    dataTodos.push(...uncompletedItems)
    setSettings('todos', dataTodos);
    renderList(dataTodos)
    changeNumberOfUncomletedItems()
}