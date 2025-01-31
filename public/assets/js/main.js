

// editor end 

//edit and save js start 

$(window).on("load", function () {

    $('.save-button').on('click', save_onclick);
    $('.cancel-button').on('click', cancel_onclick);
    $('.edit-button').on('click', edit_onclick);

    $('.save-button, .cancel-button').hide();
});

function edit_onclick() {
    setFormMode($(this).closest("form"), 'edit');
}

function cancel_onclick() {
    setFormMode($(this).closest("form"), 'view');
}

function save_onclick() {
    setFormMode($(this).closest("form"), 'view');
}


function setFormMode($form, mode) {
    switch (mode) {
        case 'view':
            $form.find('.save-button, .cancel-button').hide();
            $form.find('.edit-button').show();
            $form.find("input, select").prop("disabled", true);
            break;
        case 'edit':
            $form.find('.save-button, .cancel-button').show();
            $form.find('.edit-button').hide();
            $form.find("input, select").prop("disabled", false);
            break;
    }
}

//Edit and save js ends 




// model preview js start here by Jainul
const previewModalPreview = document.getElementById('previewModalPreview');
const previewOpenModalBtn = document.getElementById('previewOpenModalBtn');
const previewCloseModalBtn = document.getElementById('previewCloseModalBtn');

function openPreviewModal() {
    previewModalPreview.style.display = 'flex';
}

function closePreviewModal() {
    previewModalPreview.style.display = 'none';
}

previewOpenModalBtn.addEventListener('click', openPreviewModal);
previewCloseModalBtn.addEventListener('click', closePreviewModal);

previewModalPreview.addEventListener('click', (e) => {
    if (e.target === previewModalPreview) {
        closePreviewModal();
    }
});

// callback popup js start here by Jainul
const callbackschModalSch = document.getElementById('callbackschModalSch');
const callbackschCloseModalBtn = document.getElementById('callbackschCloseModalBtn');

function openCallbackschModal() {
    callbackschModalSch.style.display = 'flex';
}

function closeCallbackschModal() {
    callbackschModalSch.style.display = 'none';
}

callbackschCloseModalBtn.addEventListener('click', closeCallbackschModal);

callbackschModalSch.addEventListener('click', (e) => {
    if (e.target === callbackschModalSch) {
        closeCallbackschModal();
    }
});

const callbackdModalD = document.getElementById('callbackdModalD');
const callbackdCloseModalBtn = document.getElementById('callbackdCloseModalBtn');

function openCallbackdModal() {
    callbackdModalD.style.display = 'flex';
}

function closeCallbackdModal() {
    callbackdModalD.style.display = 'none';
}

callbackdCloseModalBtn.addEventListener('click', closeCallbackdModal);

callbackdModalD.addEventListener('click', (e) => {
    if (e.target === callbackdModalD) {
        closeCallbackdModal();
    }
});

const callbackhModalH = document.getElementById('callbackhModalH');
const callbackhCloseModalBtn = document.getElementById('callbackhCloseModalBtn');

function openCallbackhModal() {
    callbackhModalH.style.display = 'flex';
}

function closeCallbackhModal() {
    callbackhModalH.style.display = 'none';
}

callbackhCloseModalBtn.addEventListener('click', closeCallbackhModal);

callbackhModalH.addEventListener('click', (e) => {
    if (e.target === callbackhModalH) {
        closeCallbackhModal();
    }
});

const callbacksModalS = document.getElementById('callbacksModalS');
const callbacksCloseModalBtn = document.getElementById('callbacksCloseModalBtn');

function openCallbacksModal() {
    callbacksModalS.style.display = 'flex';
}

function closeCallbacksModal() {
    callbacksModalS.style.display = 'none';
}

callbacksCloseModalBtn.addEventListener('click', closeCallbacksModal);

callbacksModalS.addEventListener('click', (e) => {
    if (e.target === callbacksModalS) {
        closeCallbacksModal();
    }
});



// End callback popup js here by Jainul
// model review js start here by Jainul
const reviewModalReview = document.getElementById('reviewModalReview');
const reviewOpenModalBtn = document.getElementById('reviewOpenModalBtn');
const reviewCloseModalBtn = document.getElementById('reviewCloseModalBtn');


/* udit start for log */
const logCloseModalBtn = document.getElementById('logCloseModalBtn');



function closelogModal() {
    logModallog.style.display = 'none';
}
logCloseModalBtn.addEventListener('click', closelogModal);

logModallog.addEventListener('click', (e) => {
    if (e.target === logModallog) {
        closelogModal();
    }
});
/* udit end for log */



var customModalOverlay = document.getElementById('customModalOverlay');
var customOpenModalBtn = document.getElementById('customOpenModalBtn');
var customCloseModalBtn = document.getElementById('customCloseModalBtn');

function openCustomModal() {
    customModalOverlay.style.display = 'flex';
}

function closeCustomModal() {
    customModalOverlay.style.display = 'none';
}

customOpenModalBtn.addEventListener('click', openCustomModal);
customCloseModalBtn.addEventListener('click', closeCustomModal);

customModalOverlay.addEventListener('click', (e) => {
    if (e.target === customModalOverlay) {
        closeCustomModal();
    }
});


var customModalOverlaysms = document.getElementById('customModalOverlaysms');
var customOpenModalBtnsms = document.getElementById('customOpenModalBtnsms');
var customCloseModalBtnsms = document.getElementById('customCloseModalBtnsms');

function openCustomModalsms() {
    customModalOverlaysms.style.display = 'flex';
}

function closeCustomModalsms() {
    customModalOverlaysms.style.display = 'none';
}

customOpenModalBtnsms.addEventListener('click', openCustomModalsms);
customCloseModalBtnsms.addEventListener('click', closeCustomModalsms);

customModalOverlaysms.addEventListener('click', (e) => {
    if (e.target === customModalOverlaysms) {
        closeCustomModalsms();
    }
});

// model js ends here



// Alerts start 

function showAlert(type, message, duration = 5000) {
    var alertContainer = document.getElementById('alertContainer');
    var alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;

    var iconClass = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type];

    alertElement.innerHTML = `
                <div class="alert-content">
                    <i class="alert-icon ${iconClass}"></i>
                    <div class="alert-message">${message}</div>
                    <button class="alert-close" onclick="closeAlert(this.closest('.alert'))">&times;</button>
                </div>
            `;
    alertContainer.appendChild(alertElement);

    // Trigger reflow to enable transition
    alertElement.offsetHeight;

    // Show the alert
    setTimeout(() => alertElement.classList.add('show'), 10);

    // Automatically remove the alert after the specified duration
    setTimeout(() => closeAlert(alertElement), duration);
}

function closeAlert(alertElement) {
    alertElement.classList.remove('show');
    setTimeout(() => alertElement.remove(), 300);
}

// Alerts end





//Script model js start

var modalscript = document.getElementById('agent_myModal');
var openBtn = document.getElementById('openModalBtn');
var closeBtn = document.getElementById('closeBtn');
var minimizeBtn = document.getElementById('minimizeBtn');
var maximizeBtn = document.getElementById('maximizeBtn');
var modalContent = document.querySelector('.modalscript-content');

openBtn.onclick = () => {
    modalscript.classList.remove('hidden');
    modalscript.classList.add('fade-in');
    open_script_show();
    setTimeout(() => modalscript.classList.remove('fade-in'), 300);
}

closeBtn.onclick = () => {
    modalscript.style.opacity = '0';
    setTimeout(() => {
        modalscript.classList.add('hidden');
        modalscript.style.opacity = '1';
        modalscript.classList.remove('minimized', 'maximized');
    }, 300);
}

minimizeBtn.onclick = () => {
    modalscript.classList.add('minimized');
    modalscript.classList.remove('maximized');
    updateMaximizeIcon();
}

maximizeBtn.onclick = () => {
    if (modalscript.classList.contains('minimized')) {
        modalscript.classList.remove('minimized');
    } else {
        modalscript.classList.toggle('maximized');
    }
    updateMaximizeIcon();
}

function updateMaximizeIcon() {
    var isMaximized = modalscript.classList.contains('maximized');
    var maximizeIcon = maximizeBtn.querySelector('svg');
    if (isMaximized) {
        maximizeIcon.innerHTML = '<path d="M4 8h8V4H4v4zm2-4h4v2H6V4zm10 0v4h8V4h-8zm2 4h-4V6h4v2zM4 20h8v-4H4v4zm2-4h4v2H6v-2zm10 0v4h8v-4h-8zm2 4h-4v-2h4v2z"/>';
        maximizeBtn.title = "Restore";
    } else {
        maximizeIcon.innerHTML = '<path d="M4 4H20V20H4V4Z" />';
        maximizeBtn.title = "Maximize";
    }
}

/*window.onclick = (event) => {
    if (event.target === modal) {
        closeBtn.onclick();
    }
}*/

// Script model js ends 

// Calendar js start 

var calendarView = document.getElementById('calendarView');
var currentDateElement = document.getElementById('currentDate');
var prevBtn = document.getElementById('prevBtn');
var nextBtn = document.getElementById('nextBtn');
var monthViewBtn = document.getElementById('monthViewBtn');
var yearViewBtn = document.getElementById('yearViewBtn');
var selectedDateElement = document.getElementById('selectedDate');
var eventTitleInput = document.getElementById('eventTitle');
var eventTimeInput = document.getElementById('eventTime');
var addEventButton = document.getElementById('addEvent');
var eventsContainer = document.getElementById('eventsContainer');

var currentDate = new Date();
var selectedDate = new Date();
var currentView = 'month';
var events = {};

function renderCalendar() {
    if (currentView === 'month') {
        renderMonthView();
    } else {
        renderYearView();
    }
    updateHeader();
    renderEvents();
}

function renderMonthView() {
    calendarView.innerHTML = '';
    var firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    var lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    var daysContainer = document.createElement('div');
    daysContainer.classList.add('days');

    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(name => {
        var dayNameElement = document.createElement('div');
        dayNameElement.textContent = name;
        dayNameElement.style.fontWeight = 'bold';
        daysContainer.appendChild(dayNameElement);
    });

    for (var i = 0; i < firstDay.getDay(); i++) {
        daysContainer.appendChild(document.createElement('div'));
    }

    for (var i = 1; i <= lastDay.getDate(); i++) {
        var dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.textContent = i;
        var dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toDateString();
        if (events[dateString] && events[dateString].length > 0) {
            dayElement.classList.add('has-events');
        }
        dayElement.addEventListener('click', () => selectDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i)));
        daysContainer.appendChild(dayElement);
    }

    calendarView.appendChild(daysContainer);
    updateSelectedDate();
}

function renderYearView() {
    calendarView.innerHTML = '';
    var monthsContainer = document.createElement('div');
    monthsContainer.classList.add('months');

    for (var i = 0; i < 12; i++) {
        var monthElement = document.createElement('div');
        monthElement.classList.add('month');
        monthElement.textContent = new Date(currentDate.getFullYear(), i, 1).toLocaleString('default', { month: 'short' });
        monthElement.addEventListener('click', () => {
            currentDate = new Date(currentDate.getFullYear(), i, 1);
            currentView = 'month';
            renderCalendar();
        });
        monthsContainer.appendChild(monthElement);
    }

    calendarView.appendChild(monthsContainer);
}

function updateHeader() {
    if (currentView === 'month') {
        currentDateElement.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
    } else {
        currentDateElement.textContent = currentDate.getFullYear();
    }
}

function selectDate(date) {
    selectedDate = date;
    updateSelectedDate();
    renderEvents();
}

function updateSelectedDate() {
    selectedDateElement.textContent = selectedDate.toDateString();
    document.querySelectorAll('.day, .month').forEach(element => {
        element.classList.remove('active');
        if (currentView === 'month' && parseInt(element.textContent) === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()) {
            element.classList.add('active');
        } else if (currentView === 'year' && element.textContent === selectedDate.toLocaleString('default', { month: 'short' })) {
            element.classList.add('active');
        }
    });
}

function addEvent() {
    if (!eventTitleInput.value || !eventTimeInput.value) return;

    var eventKey = selectedDate.toDateString();
    if (!events[eventKey]) {
        events[eventKey] = [];
    }

    events[eventKey].push({
        title: eventTitleInput.value,
        time: eventTimeInput.value
    });

    eventTitleInput.value = '';
    eventTimeInput.value = '';
    renderEvents();
    renderCalendar(); // Re-render to update event indicators
}

function renderEvents() {
    eventsContainer.innerHTML = '';
    var eventKey = selectedDate.toDateString();
    var dayEvents = events[eventKey] || [];

    dayEvents.forEach((event, index) => {
        var eventElement = document.createElement('div');
        eventElement.classList.add('event');
        eventElement.innerHTML = `
                    <span>${event.time} - ${event.title}</span>
                    <button onclick="removeEvent('${eventKey}', ${index})">&#10006;</button>
                `;
        eventsContainer.appendChild(eventElement);
    });
}

function removeEvent(eventKey, index) {
    events[eventKey].splice(index, 1);
    renderEvents();
    renderCalendar(); // Re-render to update event indicators
}

prevBtn.addEventListener('click', () => {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
        currentDate.setFullYear(currentDate.getFullYear() - 1);
    }
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
    renderCalendar();
});

monthViewBtn.addEventListener('click', () => {
    currentView = 'month';
    monthViewBtn.classList.add('active');
    yearViewBtn.classList.remove('active');
    renderCalendar();
});

yearViewBtn.addEventListener('click', () => {
    currentView = 'year';
    yearViewBtn.classList.add('active');
    monthViewBtn.classList.remove('active');
    renderCalendar();
});

addEventButton.addEventListener('click', addEvent);

renderCalendar();

//Calendar js ends here 

// Search js start

var categorySelect = document.getElementById('category-select');
var searchInput = document.getElementById('search-input');
var clearIcon = document.querySelector('.clear-icon');
var searchIcon = document.querySelector('.search-icon');

/*searchInput.addEventListener('input', function () {
    clearIcon.style.display = this.value ? 'block' : 'none';
});

clearIcon.addEventListener('click', function () {
    searchInput.value = '';
    this.style.display = 'none';
    searchInput.focus();
});

searchIcon.addEventListener('click', function () {
    performSearch();
});

searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});*/

function performSearch() {
    var searchTerm = searchInput.value;
    var category = categorySelect.value;
    console.log(`Searching for "${searchTerm}" in category: ${category}`);
    // Here you would typically send this data to your backend or perform the search
    alert(`Search performed: "${searchTerm}" in category: ${category}`);
}

// Search js end 


//Floating dialer button js start

// Make the button draggable
var button = document.querySelector('.draggable-button');

var isDragging = false;
var offsetX, offsetY;

button.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - button.getBoundingClientRect().left;
    offsetY = e.clientY - button.getBoundingClientRect().top;
    button.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        button.style.left = `${e.clientX - offsetX}px`;
        button.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    button.style.cursor = 'grab';
});

// Ensure the button stays within the viewport
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        var x = e.clientX - offsetX;
        var y = e.clientY - offsetY;

        // Ensure the button stays within the viewport
        var minX = 0;
        var minY = 0;
        var maxX = window.innerWidth - button.offsetWidth;
        var maxY = window.innerHeight - button.offsetHeight;

        if (x < minX) x = minX;
        if (y < minY) y = minY;
        if (x > maxX) x = maxX;
        if (y > maxY) y = maxY;

        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
    }
});

// Floating dialer button js end 