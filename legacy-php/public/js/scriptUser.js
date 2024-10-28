const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


const eachDay = document.querySelectorAll(".day");
var nextButton = document.querySelector(".next__btn");
var prevButton = document.querySelector(".prev__btn");


const currentDate = new Date();
var dayOfMonth = currentDate.getDate();
var dayOfWeek = currentDate.getDay();
var month = currentDate.getMonth();

function updateDates(){

    eachDay.forEach(function(aDay, i){ //goes through each day of the week
        var dayInput = dayOfMonth - dayOfWeek + i; 
        var monthInput = month;            
        console.log(monthInput);

        if(dayInput < 1 && month != 0){ //checks if sunday is before 1st day of month and current month is not January
            dayInput = daysInMonth[month - 1] + dayInput;
            monthInput = month - 1;
        }else if(dayInput < 1){ //checks if sunday is before 1st day of month
            dayInput = daysInMonth[11] + dayOfMonth - dayOfWeek;
            monthInput = 11;
            console.log(daysInMonth[11]);
            console.log(dayOfMonth);
            console.log(dayOfWeek);
            console.log(" jan");
        }else if(dayInput > daysInMonth[month] && month != 11){ //if date is greater then the number of days in that month and not december
            dayInput = dayInput - daysInMonth[month];
            monthInput = month + 1;
        }else if(dayInput > daysInMonth[month]){ //if date is greater then the number of days in that month and not december
            dayInput = dayInput - daysInMonth[0];
            monthInput = 0;
        }

        //make sure that todays date is the active date
        const today = new Date(); 
        if (today.getDate() === dayInput && today.getMonth() === monthInput) { 
            aDay.classList.add("active"); 
        }
        
        aDay.textContent = daysOfWeek[i] + " " + months[monthInput] + " " + dayInput;

    });

}

updateDates();

nextButton.addEventListener("click", function(){
    dayOfMonth += 7;
    if(dayOfMonth > daysInMonth[month] && month != 11){
        dayOfMonth = dayOfMonth - daysInMonth[month];
        month += 1;
    }else if(dayOfMonth > daysInMonth[month]){
        dayOfMonth = dayOfMonth - daysInMonth[month];
        month = 0;
    }
    //updateDates();
    updateArrowClasses();
});

prevButton.addEventListener("click", function(){
    dayOfMonth -= 7;
    if(dayOfMonth < 1 && month != 0){
        dayOfMonth = daysInMonth[month - 1] + dayOfMonth;
        month -= 1;
    }else if(dayOfMonth < 1){
        dayOfMonth = daysInMonth[month - 1] + dayOfMonth;
        month = 11;
    }
    //updateDates();
    updateArrowClasses();
});

//reloads classes so that that week has active classes
function updateArrowClasses() {
    updateDates();
    loadClasses();
}


/*add class*/

const classFormBtn = document.querySelector(".add__class__btn");
const addClassForm = document.querySelector(".add__class");

const backdrop = document.querySelector(".backdrop");
const whiteBackdrop = document.querySelector(".class__backdrop");

const toggleAddClassForm = () => {
    addClassForm.classList.toggle("active");
    backdrop.classList.toggle("active");
    classFormBtn.classList.toggle("active");
    whiteBackdrop.classList.toggle("active");
};

//classFormBtn.addEventListener("click", toggleAddClassForm);  Not not work in User Mode


/*Create New Class*/

const addClassBtn = document.querySelector(".add__btn");
const classesContainer = document.querySelector(".classes__container");
const classInput = document.getElementById("class__input");
const categorySelect = document.getElementById("category__select");
const timeInput = document.getElementById("time__input");
const locationSelect = document.getElementById("location__select");
const spotsInput = document.getElementById("spots__input");


function updateActiveState() {
    eachDay.forEach(day => {
        day.addEventListener("click", () => {
            eachDay.forEach(day => day.classList.remove("active"));
            day.classList.add("active");
            displayClasses(day.textContent);
            loadClasses();
        });
    });
}

function displayClasses(day) {
    const allClasses = document.querySelectorAll(".class");
    allClasses.forEach(cls => {
        if (cls.dataset.day === day) {
            cls.style.display = "flex";
        } else {
            cls.style.display = "none";
        }
    });
}

function createClassElement(className, category, time, location, spots, day) {
    const newClass = document.createElement("div");
    newClass.classList.add("class");
    newClass.dataset.day = day;

    newClass.innerHTML = `
        <div class="class__time">${time}</div>
        <div class="class__details">
            <div class="class__name">${className}</div>
            <div class="class__category">${category}</div>
        </div>
        <div class="class__location">${location}</div>
        <div class="class__details">
            <button class="book__btn">Book</button>
            <div class="class__spots">${spots} spots left</div>
        </div>
    `;

    // Attach event listener to the "Book" button for booking and expense logging
    const bookBtn = newClass.querySelector('.book__btn');
    const spotsDisplay = newClass.querySelector('.class__spots');

    bookBtn.addEventListener('click', function() {
        // Decrease spots
        let currentSpots = parseInt(spotsDisplay.textContent.match(/\d+/)[0]);
        if (currentSpots > 0) {
            currentSpots -= 1; // Decrement the spots
            spotsDisplay.textContent = `${currentSpots} spots left`;
    
            // Send AJAX request to update the spots in classes.csv
            fetch('update_class_spots.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    className: className,
                    day: day,
                    newSpots: currentSpots
                })
            })
            .then(response => response.text())
            .then(data => {
                console.log('Class spots updated:', data);
            })
            .catch(error => console.error('Error updating class spots:', error));
    
            // Send AJAX request to log the booking fee as an expense
            fetch('add_expense.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Grace',
                    type: 'Fee',
                    confirmation: 'N',
                    amount: '-20'
                })
            })
            .then(response => response.text())
            .then(data => {
                console.log('Expense added:', data);
            })
            .catch(error => console.error('Error adding expense:', error));
        } else {
            // Optionally handle the case when no spots are left
            console.log('No spots left');
        }
    });
    

    return newClass;
}



function handleAddButtonClick(event) {
    event.preventDefault();

    const className = classInput.value;
    const category = categorySelect.value;
    const time = timeInput.value;
    const location = locationSelect.value;
    const spots = spotsInput.value;
    const day = document.querySelector(".day.active").textContent; 

    fetch("saveClasses.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            className: className,
            category: category,
            time: time,
            location: location,
            spots: spots,
            day: day 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to add class.");
        }
        return response.text();
    })
    .then(data => {
        console.log(data); 
        classInput.value = "";
        timeInput.value = "";
        spotsInput.value = "";
        loadClasses(); 
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function displayClasses(day) {
    const allClasses = document.querySelectorAll(".class");
    allClasses.forEach(cls => {
        if (cls.dataset.day === day) { 
            cls.style.display = "flex";
        } else {
            cls.style.display = "none";
        }
    });
}

addClassBtn.addEventListener("click", handleAddButtonClick);



function loadClasses() {
    const activeDay = document.querySelector(".day.active").textContent;

    fetch("loadClasses.php?date=" + encodeURIComponent(activeDay))
    .then(response => response.json())
    .then(classes => {
        // Clear existing classes
        classesContainer.innerHTML = "";
        
        if (classes.length === 0) {//if no classes
            const message = document.createElement("div");
            message.classList.add("no__classes__message");
            message.textContent = "No Classes Yet";
            classesContainer.appendChild(message);
        } else { //load classes
            classes.forEach(cls => {
                const [day, time, className, category, location, spots] = cls;
                const newClassElement = createClassElement(className, category, time, location, spots, activeDay);
                classesContainer.appendChild(newClassElement);
            });
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}


window.addEventListener("DOMContentLoaded", () => {
    loadClasses();
});


addClassBtn.addEventListener("click", handleAddButtonClick);
addClassBtn.addEventListener("click", toggleAddClassForm);

updateActiveState();

/*select time*/


// // Function to populate time select options in 15-minute intervals
// function populateTimeSelect(selectElement) {
//     for (let hours = 0; hours < 24; hours++) {
//         for (let minutes = 0; minutes < 60; minutes += 15) {
//             const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//             const option = document.createElement('option');
//             option.value = time;
//             option.textContent = time;
//             selectElement.appendChild(option);
//         }
//     }
// }

// // Populate start time and end time select options
// const startTimeSelect = document.getElementById('start-time');
// const endTimeSelect = document.getElementById('end-time');
// populateTimeSelect(startTimeSelect);
// populateTimeSelect(endTimeSelect);

// // Event listener for calculating duration
// endTimeSelect.addEventListener('change', () => {
//     const startTime = startTimeSelect.value.split(':').map(Number);
//     const endTime = endTimeSelect.value.split(':').map(Number);
//     const startMinutes = startTime[0] * 60 + startTime[1];
//     const endMinutes = endTime[0] * 60 + endTime[1];
//     const durationMinutes = endMinutes - startMinutes;
//     const hours = Math.floor(durationMinutes / 60);
//     const minutes = durationMinutes % 60;
//     document.getElementById('duration').textContent = `${hours} hours ${minutes} minutes`;
// });

// // Function to handle adding class form submission
// function handleAddClassFormSubmission(event) {
//     event.preventDefault();

//     const formData = new FormData(event.target);
//     const startTime = formData.get('start-time');
//     const endTime = formData.get('end-time');
//     const className = formData.get('className');
//     const category = formData.get('category');
//     const location = formData.get('location');
//     const spots = formData.get('spots');
//     const day = document.querySelector('.day.active').textContent;

//     const classData = {
//         className,
//         category,
//         startTime,
//         endTime,
//         location,
//         spots,
//         day
//     };

//     fetch('saveClasses.php', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(classData)
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log(data); 
//         classInput.value = '';
//         loadClasses(); 
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
// }

// // Add event listener to handle form submission
// const addClassForm2 = document.querySelector('form');
// addClassForm2.addEventListener('submit', handleAddClassFormSubmission);
