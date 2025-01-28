
const addTextBtn = document.getElementById('add-text');
const addImageBtn = document.getElementById('add-image');
const saveBoardBtn = document.getElementById('save-board');
const clearBoardBtn = document.getElementById('clear-board');

const addTextBox = document.getElementById('text-popup');
const addImageBox = document.getElementById('image-popup');

const saveTextBtn = document.getElementById('save-text-btn');
const saveImageBtn = document.getElementById('save-image-btn');
const cancelBtns = document.querySelectorAll('.cancel-btn');

const board = document.getElementById('board');

let addedTextElements = 0;
let addedImageElements = 0;

const makeDraggable = (element) => {
    element.setAttribute('draggable', 'true');

    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', null); // Required for drag-and-drop
        e.target.classList.add('dragging');
    });

    element.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
    });
};

board.addEventListener('dragover', (e) => {
    e.preventDefault(); // Allow dropping
});

board.addEventListener('drop', (e) => {
    e.preventDefault();

    const draggingElement = document.querySelector('.dragging');
    if (draggingElement) {
        const boardRect = board.getBoundingClientRect();
        const offsetX = e.clientX - boardRect.left;
        const offsetY = e.clientY - boardRect.top;

        draggingElement.style.position = 'absolute';
        draggingElement.style.left = `${offsetX}px`;
        draggingElement.style.top = `${offsetY}px`;
    }
});

const openTextBox = () => {
    const textInput = document.getElementById('text-input'); // Target the input box
    textInput.value = '';
    console.log("Add Text button clicked!");
    addTextBox.classList.remove('hidden');
};

const openImageBox = () => {
    const imageUrl = document.getElementById('image-url');
    imageUrl.value = '';
    console.log("Add Image button clicked!");
    addImageBox.classList.remove('hidden');

};

const saveBoard = () => {
    console.log("Save Board button clicked!");
    const elements = board.children;
    const boardData = [];

    // Loop through each child and collect its data
    for (let element of elements) {
        const elementData = {
            tag: element.tagName, // e.g., "DIV", "IMG"
            content: element.innerText || null, // For text elements
            src: element.src || null, // For images
            draggable: element.draggable,
            styles: {
                top: element.style.top,
                left: element.style.left,
                width: element.style.width,
                height: element.style.height,
                color: element.style.color,
                backgroundColor: element.style.backgroundColor,
                position: element.style.position,
            },
        };
        boardData.push(elementData);
    }

    // Save the board data to localStorage
    localStorage.setItem('board', JSON.stringify(boardData));
    console.log("Board saved!");
};

const loadBoard = () => {
    const savedData = localStorage.getItem('board');

    if (!savedData) {
        console.log("No saved board data found.");
        return;
    }

    const boardData = JSON.parse(savedData);

    // Clear the board before loading
    board.innerHTML = '';

    // Recreate each element on the board
    for (let data of boardData) {
        const newElement = document.createElement(data.tag);

        // Restore content or image source
        if (data.tag === 'IMG') {
            newElement.src = data.src;
        } else {
            newElement.innerText = data.content;
        }

        // Restore styles
        Object.assign(newElement.style, data.styles);

        newElement.classList.add('board-element');
        if (data.tag === 'DIV') newElement.classList.add('board-text');
        if (data.tag === 'IMG') newElement.classList.add('board-image');

        // Reattach click listeners for editing and deleting
        addClickListeners(newElement);
        makeDraggable(newElement);

        // Append the element back to the board
        board.appendChild(newElement);
    }

    console.log("Board loaded!");
};

const clearBoard = () => {
    console.log("Clear Board button clicked!");
    while (board.firstChild) {
        board.removeChild(board.firstChild); // Remove the first child until no more remain
    }

};

const saveText = () => {
    console.log("Save Text button clicked!");
    const textInput = document.getElementById('text-input').value;
    const textDiv = document.createElement('div');
    textDiv.innerText = textInput;
    textDiv.classList.add('board-text'); 
    textDiv.id = `text-div-${addedTextElements}`;
    makeDraggable(textDiv);
    board.appendChild(textDiv);
    addClickListeners(textDiv)
    addedTextElements++
    hideElements();
};

const saveImage = () => {
    console.log("Save Image button clicked!");
    const imageUrl = document.getElementById('image-url').value;
    const imageInput = document.getElementById('image-upload');
    const imageDiv = document.createElement('div');
    const newImage = document.createElement('img');
    if (imageUrl.trim() === '') {
        console.log("No URL entered");

        if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0]; // Get the uploaded file
        const reader = new FileReader();

        // Once the file is read, set the src of a new image element
        reader.onload = (event) => {
            newImage.src = event.target.result; // Data URL
            newImage.alt = 'Uploaded image'; // Add alt text

        };

        // Read the file as a Data URL
        reader.readAsDataURL(file);
        } else {
            console.log("No file selected.");
        }
    } else {
    newImage.src= imageUrl;
    
    }
    newImage.classList.add('board-image');
    newImage.id = `img-${addedImageElements}`
    imageDiv.setAttribute('draggable', 'true');
    imageDiv.appendChild(newImage);
    makeDraggable(imageDiv);
    addClickListeners(imageDiv)
    board.appendChild(imageDiv);
    addedImageElements++;
    hideElements();
};

const hideElements = () => {
    console.log("Cancel button clicked!");
    const popups = [addTextBox, addImageBox]; // Add all popups here
    popups.forEach(popup => {
        if (!popup.classList.contains('hidden')) {
            popup.classList.add('hidden');
        }
    });

};

const showEditMenu = (element) => {
    // Remove any existing menu
    const existingMenu = document.querySelector('.edit-menu');
    if (existingMenu) existingMenu.remove();

    // Create a popup menu dynamically
    const menu = document.createElement('div');
    menu.classList.add('edit-menu');
    menu.innerHTML = `
        <button id="edit-element">Edit</button>
        <button id="delete-element">Delete</button>
    `;

    // Append the menu near the selected element
    document.body.appendChild(menu);
    menu.style.position = 'absolute';
    menu.style.top = `${element.offsetTop + element.offsetHeight}px`;
    menu.style.left = `${element.offsetLeft}px`;

    // Add event listeners for the buttons
    document.getElementById('edit-element').addEventListener('click', () => editElement(element));
    document.getElementById('delete-element').addEventListener('click', () => deleteElement(element));

    // Close the menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== element) {
            menu.remove();
            element.classList.remove('selected'); // Remove highlight
        }
    }, { once: true });
};

const editElement = (element) => {
    if (element.tagName === 'DIV') { // For text elements
        const newText = prompt('Edit text:', element.innerText);
        if (newText !== null) {
            element.innerText = newText;
        }
    } else if (element.tagName === 'IMG') { // For image elements
        const newSrc = prompt('Edit image URL:', element.src);
        if (newSrc !== null) {
            element.src = newSrc;
        }
    }

    const menu = document.querySelector('.edit-menu');
    if (menu) menu.remove();

    // Remove the selected class
    element.classList.remove('selected');
};

const deleteElement = (element) => {
    if (confirm('Are you sure you want to delete this element?')) {
        element.remove();

        // Remove the menu after deleting
        const menu = document.querySelector('.edit-menu');
        if (menu) menu.remove();

        console.log('Element deleted!');
    }  
};

window.addEventListener('load', loadBoard);

addTextBtn.addEventListener('click', openTextBox);
addImageBtn.addEventListener('click', openImageBox);
saveBoardBtn.addEventListener('click', saveBoard);
clearBoardBtn.addEventListener('click', clearBoard);

saveTextBtn.addEventListener('click', saveText);
saveImageBtn.addEventListener('click', saveImage);

cancelBtns.forEach(btn => {
    btn.addEventListener('click', hideElements);
});

const addClickListeners = (element) => {
    element.addEventListener('click', () => {
        // Highlight the selected element
        element.classList.add('selected');

        // Open a popup or menu for edit/delete options
        showEditMenu(element);
    });
};


