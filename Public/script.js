//------------------------------------------ Code Starts Here -------------------------------------------

// ---- Global Variable ----------------

let patientDetails = {};
let appointmentDetails = {};
let selectedDate;
let aID;
let slots;

// let flag = 'English'
//------------------------------------------------- Main Functions Section Starts --------------------------------------------------------------------------------

function generateId(n) {
    let idName;
    if (n === 1) {
        idName = "PID";
    } else if (n === 2) {
        idName = "AID";
    }

    const timestamp = new Date().getTime();
    const last4Digits = timestamp % 1000;
    const random = Math.floor(Math.random() * 100);;
    const uniqueNumber = String(last4Digits) + String(random);
    let idValue = idName + uniqueNumber;

    return idValue;
}

function resetGlobalVariables() {
    // Resetting global variables
    patientDetails = {};
    appointmentDetails = {};
    selectedDate = null;
    aID = null;
    slots = null;
}



function sendMessageToServer(message) {
    return fetch(`/message?input=${encodeURIComponent(message)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            console.log("Response from Watson in Script File");
            return data.message; // Return the message here
        })
        .catch(error => {
            console.error('Error sending message to server:', error);
            return 'An error occurred while processing your message.';
        });
}

async function sendMessage() {
    var userInput = document.getElementById("user-input").value;
    if (userInput.trim() === "") {
        return; // Do not send empty message
    }
    // if (userInput == "Hindi" || userInput == "HINDI" || userInput == "hindi") {
    //     flag = "Hindi"
    // }


    displayMessage("user", userInput);
    document.getElementById("user-input").value = ""; // Clear input
    var chatContainer = document.getElementById("chat-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
    try {
        let botResponse = await sendMessageToServer(userInput);

        if (botResponse.trim() === "Kindly Provide Your Details") {
            displayMessage("bot", botResponse);
            renderInitialForm()
        } else if (botResponse.trim() === "Kindly Provide Your Appointment ID to Reschedule") {
            displayMessage("bot", botResponse)
            resheduleAppointment()
        } else if (botResponse.trim() == "Kindly Provide Your Appointment ID to Cancel") {
            displayMessage("bot", botResponse)
            cancelappointment()
        } else {
            displayMessage("bot", botResponse);
        }
    } catch (error) {
        console.error('Error while processing bot response:', error);
        displayMessage('bot', 'An error occurred while processing bot response.');
    }

    if (userInput == "EXIT" || userInput == "Exit" || userInput == "exit") {
        exitFunction()
    }
}

function displayMessage(sender, message) {
    var chatContainer = document.getElementById("chat-container");
    var messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");

    if (sender === "user") {
        messageElement.classList.add("user-message");
    } else {
        messageElement.classList.add("bot-message");
    }
    messageElement.innerText = message;
    chatContainer.appendChild(messageElement);

}



function displayWelcomeMessage() {
    var welcomeMessage = "Welcome to our chatbot! How can I assist you today? ";
    var option1 = "I Can, \n Book Appointment \n Reschedule Appointment \n Cancel appointment \n Contact Customer Support"
    var option2 = "To Exit Type : Exit"
    displayMessage("bot", welcomeMessage);
    displayMessage("bot", option1);
    displayMessage("bot", option2)
}



window.onload = () => displayWelcomeMessage();

//-------------------------------------------- Main Function Section Ends ------------------------------------------------------------




//-------------------------------------------- Book appointment Sections Starts ----------------------------------------------


function renderInitialForm() {
    const container = document.querySelector(".chat-container");
    const formContainer = document.createElement("div");
    formContainer.classList.add("chat-message", "bot-message", "form-container");
    formContainer.innerHTML = `
    <form id="initial-form">
    <label for="name">Name:</label><br>
    <input class="formClass1" type="text" id="name" name="name" required><br>
    <label for="age">Age:</label><br>
    <input class="formClass1" type="number" id="age" name="age" required><br>
    <label for="phonenumber">Phone Number:</label><br>
    <input class="formClass1" type="tel" id="phonenumber" name="phonenumber" pattern="[0-9]{10}" maxlength="10" required><br>
    <label for="city">City:</label><br>
    <input class="formClass1" type="text" id="city" name="city" required><br><br>
    <label for="department">Department:</label><br>
    <select class="formClass" id="department" name="department" required>
        <option value="" disabled selected>Select Department</option>
        <option value="Orthopedics">Orthopedics (Ortho)</option>
        <option value="Cardiology">Cardiology (Cardio)</option>
        <option value="Gastroenterology">Gastroenterology (GI)</option>
        <option value="General Medicine">General Medicine / General Practitioner (General Physician)</option>
        <option value="Pediatrics">Pediatrics</option>
    </select><br><br>
    <button id="formButton" type="button" onclick="submitInitialForm()">Submit</button>
    </form>
    `;
    container.appendChild(formContainer);
    // Function to handle Enter key press on input fields
    document.getElementById("initial-form").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default Enter key behavior (form submission)
            submitInitialForm(); // Call the function to handle form submission
        }
    });

}

function submitInitialForm() {
    const name = document.getElementById('name').value.toUpperCase();
    const age = document.getElementById('age').value.toUpperCase();
    const phoneNumber = document.getElementById('phonenumber').value.toUpperCase();
    const city = document.getElementById('city').value.toUpperCase();
    const department = document.getElementById('department').value.toUpperCase();

    const patientID = generateId(1);
    // const patientID = "PID02"

    patientDetails = {
        patient_id: patientID,
        patient_name: name,
        age_value: age,
        phone_number: phoneNumber,
        city_name: city,
        department_name: department
    };
    console.log(patientDetails)
    renderDateSelectorForm();
}

function renderDateSelectorForm() {
    displayMessage("bot", "Kindly Select A Date");
    const container = document.querySelector(".chat-container");
    const formContainer = document.createElement("div");
    formContainer.classList.add("chat-message", "bot-message", "form-container");
    formContainer.innerHTML = `
        <form id="date-selector-form">
            <label for="date">Select Date:</label><br>
            <input class="formClass1" type="date" id="date" name="date" required><br><br>
            <button id="formButton" type="button" onclick="submitDateSelectorForm()">Submit</button>
        </form>
    `;
    container.appendChild(formContainer);
    document.getElementById("date").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default Enter key behavior (form submission)
            submitDateSelectorForm(); // Call the function to handle form submission
        }
    });
}

function submitDateSelectorForm() {
    selectedDate = document.getElementById('date').value;

    // patientDetails.date = selectedDate;

    fetch(`/appointment/slots?date=${selectedDate}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch available slots');
            }
            return response.json();
        })
        .then(data => {
            slots = data;
            renderAvailableSlots();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function renderAvailableSlots() {
    displayMessage("bot", "Select A Slot (Ex : S01).");
    const container = document.querySelector(".chat-container");
    const formContainer = document.createElement("div");
    formContainer.classList.add("chat-message", "bot-message", "form-container");

    let slotsHTML = `<h2>Available Slots:</h2><ul>`;
    slots.forEach(slot => {
        slotsHTML += `<li>${slot.SLOTID} - ${slot.SLOTTIME}</li>`;
    });
    slotsHTML += `</ul>`;

    formContainer.innerHTML = `
        ${slotsHTML}
        <div class="confirm-booking-container">
            <label for="slotID">Enter Slot ID:</label><br>
            <input class="formClass1" type="text" id="slotID" name="slotID" required><br><br>
            <button id="formButton" type="button" onclick="submitSlotName()">Submit</button>
        </div>
    `;
    container.appendChild(formContainer);
    // Function to handle Enter key press on input field
    document.getElementById("slotID").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default Enter key behavior (form submission)
            submitSlotName(); // Call the function to handle form submission
        }
    });

}

function submitSlotName() {

    const slotID = document.getElementById("slotID").value.toUpperCase();
    console.log(slotID)
    const selectedSlot = slots.find(slot => slot.SLOTID === slotID);
    console.log(selectedSlot)

    if (!selectedSlot) {
        displayMessage("bot", "Invalid slot ID. Please select a valid slot.");
        return;
    }

    // patientDetails.slotID = selectedSlot.slotID;
    // patientDetails.slotTime = selectedSlot.slotTime;

    const appointmentID = generateId(2);

    appointmentDetails = {
        appointmentID,
        patientID: patientDetails.patient_id,
        patientName: patientDetails.patient_name,
        department: patientDetails.department_name,
        slotID: selectedSlot.SLOTID,
        slotTime: selectedSlot.SLOTTIME,
        date: selectedDate
    };

    console.log(appointmentDetails)
    fetch('/patient/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientDetails)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add patient details');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    // let appointmentbookingDetails
    fetch('/appointment/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentDetails)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add appointment details');
            }
            return response.json();
        })
        .then(data => {
            const confirmationMessage = `Appointment booked successfully.`;
            displayMessage("bot", confirmationMessage);


            fetch(`/appointment/Details?AID=${appointmentID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch appointment details');
                    }
                    return response.json();
                })
                .then(data => {
                    const appointmentbookingDetails = data;
                    console.log(appointmentbookingDetails)
                    const adetails = appointmentbookingDetails
                    // console.log(adetails.APPOINTMENTID);
                    // console.log(adetails['APPOINTMENTID']);
                    console.log(adetails);
                    const bookingDetails = `
                    Appointment ID: ${adetails['APPOINTMENTID']}\n
                    Patient ID: ${adetails.PATIENTID}\n
                    Patient Name: ${adetails.PATIENT_NAME}\n
                    Department: ${adetails.DEPARTMENT}\n
                    Slot: ${adetails.SLOT_ID}\n
                    Slot Time: ${adetails.SLOT_TIME}\n
                    Date : ${adetails.DATE}
                    `;
                    displayMessage("bot", `Appointment details:\n` + bookingDetails);

                })
                .catch(error => {
                    console.error('Error:', error);
                });


            resetGlobalVariables()
            console.log(patientDetails)
            console.log(appointmentDetails)
            console.log(selectedDate)
            console.log(aID)
            console.log(slots)

            displayMessage("bot", `Page will Reload in 5 Sec`);


            // setTimeout(function () {
            //     window.location.reload();
            // }, 7000);
        })
        .catch(error => {
            console.error('Error:', error);
        });

}


// ------------------------------- Book Appointment Section Ends ------------------------------------------------------------------




// ------------------------------- Reschedule Appointment Section Starts  -----------------------------------------------------------


function resheduleAppointment() {
    const container = document.querySelector(".chat-container");
    const formContainer = document.createElement("div");
    formContainer.classList.add("chat-message", "bot-message", "form-container");
    formContainer.innerHTML = `
    <form id="initial-form">
        <div class="confirm-booking-container">
            <label for="slotName">Appointment ID : :</label><br>
            <input class="formClass1" type="text" id="aID" name="aID" required><br><br>
            <button id="formButton" type="button" onclick="reschedule()">Submit</button>
        </div>
    </form>
    `;
    container.appendChild(formContainer);
    document.getElementById("aID").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default Enter key behavior (form submission)
            reschedule(); // Call the function to handle form submission
        }
    });
}

async function reschedule() {
    aID = document.getElementById("aID").value.toUpperCase();

    const requestURL = `/appointment/getDetails/${aID}`;

    try {
        const res = await fetch(requestURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let botResponse; // Declare botResponse in a scope accessible to both blocks

        appointmentDetails = await res.json();

        if (appointmentDetails.length === 0) {
            console.log("No appointment details found.");
        } else {
            const appointment = appointmentDetails[0]; // Access the first object in the array

            botResponse = `
                Appointment ID: ${appointment.APPOINTMENTID}\n
                Patient ID: ${appointment.PATIENTID}\n
                Patient Name: ${appointment.PATIENT_NAME}\n
                Department: ${appointment.DEPARTMENT}\n
                Slot: ${appointment.SLOT_ID}\n
                Slot Time: ${appointment.SLOT_TIME}\n
                Date : ${appointment.DATE}
            `;

            // console.log(botResponse);
        }

        console.log(botResponse); // Now botResponse is accessible here
        displayMessage("bot", botResponse);


        renderNewDate();

    } catch (error) {
        console.error('Error:', error);
        // Handle error (e.g., display error message to the user)
    }
}

function renderNewDate() {
    displayMessage("bot", "Kindly Select A Date");

    // Create form container
    const container = document.querySelector(".chat-container");
    const formContainer = document.createElement("div");
    formContainer.classList.add("chat-message", "bot-message", "form-container");
    formContainer.innerHTML = `
    <form id="date-selector-form">
        <label for="date">Select Date:</label><br>
        <input class="formClass1" type="date" id="date" name="date" required><br><br>
        <button id="formButton" type="button" onclick="submitNewDateForm()">Submit</button>
    </form>
`;

    // Append form container to the chat container
    container.appendChild(formContainer);

    // Add event listener after the form is added to the DOM
    const dateInput = document.getElementById("date");
    if (dateInput) {
        dateInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent the default Enter key behavior (form submission)
                submitNewDateForm(); // Call the function to submit the form
            }
        });
    }

}

function submitNewDateForm() {
    selectedDate = document.getElementById('date').value;
    console.log(selectedDate)
    fetch(`/appointment/slots?date=${selectedDate}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch available slots');
            }
            return response.json();
        })
        .then(data => {
            slots = data;
            console.log(slots)
            renderNewSlots();
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle error (e.g., display error message to the user)
        });

}

function renderNewSlots() {
    displayMessage("bot", "Select A Slot (Ex : S01).");
    console.log(slots)
    console.log(selectedDate)
    const container = document.querySelector(".chat-container");
    const formContainer = document.createElement("div");
    formContainer.classList.add("chat-message", "bot-message", "form-container");

    let slotsHTML = `<h2>Available Slots:</h2><ul>`;
    slots.forEach(slot => {
        slotsHTML += `<li>${slot.SLOTID} - ${slot.SLOTTIME}</li>`;
    });
    slotsHTML += `</ul>`;

    formContainer.innerHTML = `
        ${slotsHTML}
        <div class="confirm-booking-container">
            <label for="slotID">Enter Slot ID:</label><br>
            <input class="formClass1" type="text" id="slotID" name="slotID" required><br><br>
            <button id="formButton" type="button" onclick="submitNewSlots()">Submit</button>
        </div>
    `;
    container.appendChild(formContainer);
    document.getElementById("slotID").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default Enter key behavior (form submission)
            document.getElementById("formButton").click(); // Simulate a click on the submit button
        }
    });

}

function submitNewSlots() {
    const slotID = document.getElementById("slotID").value.toUpperCase();
    console.log(slotID)
    const selectedSlot = slots.find(slot => slot.SLOTID === slotID); // Fixed typo here
    console.log(selectedSlot)
    if (!selectedSlot) {
        displayMessage("bot", "Invalid slot ID. Please select a valid slot.");
        return;
    }



    const newDetails = {
        appointmentId: aID, // Assuming `aID` is defined somewhere in your code
        newDate: selectedDate,
        newSlotId: selectedSlot.SLOTID,
        newSlotTime: selectedSlot.SLOTTIME // Fixed typo here
    };
    console.log(newDetails)



    fetch('/appointment/reschedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDetails)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to reschedule appointment');
            }
            return response.json();
        })
        .then(data => {
            const confirmationMessage = `Appointment rescheduled successfully.`;
            displayMessage("bot", confirmationMessage);

            fetch(`/appointment/Details?AID=${aID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch appointment details');
                    }
                    return response.json();
                })
                .then(data => {
                    const appointmentbookingDetails = data;
                    console.log(appointmentbookingDetails)
                    const adetails = appointmentbookingDetails[0]
                    const bookingDetails = `
                    Appointment ID: ${adetails.APPOINTMENTID}\n
                    Patient ID: ${adetails.PATIENTID}\n
                    Patient Name: ${adetails.PATIENT_NAME}\n
                    Department: ${adetails.DEPARTMENT}\n
                    Slot: ${adetails.SLOT_ID}\n
                    Slot Time: ${adetails.SLOT_TIME}\n
                    Date : ${adetails.DATE}
                    `;
                    console.log(bookingDetails)

                    displayMessage("bot", `Appointment details:\n` + bookingDetails);
                    resetGlobalVariables()
                    console.log(patientDetails)
                    console.log(appointmentDetails)
                    console.log(selectedDate)
                    console.log(aID)
                    console.log(slots)
                    displayWelcomeMessage()

                })
                .catch(error => {
                    console.error('Error:', error);
                });


            // displayMessage("bot", `Page will Reload in 5 Sec`);
            // setTimeout(function () {
            //     window.location.reload();
            // }, 5000);

            // Display updated appointment details or perform other actions as needed
        })
        .catch(error => {
            console.error('Error:', error);
        });

}



//--------------------------------------- Reschedule Appointment Section Ends ------------------------------------




//--------------------------------------- Cancel Appointment Section Starts --------------------------------------


function cancelappointment() {
    const container = document.querySelector(".chat-container");
    const formContainer = document.createElement("div");
    formContainer.classList.add("chat-message", "bot-message", "form-container");
    formContainer.innerHTML = `
    <form id="initial-form">
        <div class="confirm-booking-container">
            <label for="slotName">Appointment ID : :</label><br>
            <input class="formClass1" type="text" id="aID" name="aID" required><br><br>
            <button id="formButton" type="button" onclick="cancel()">Submit</button>
        </div>
    </form>
    `;
    container.appendChild(formContainer);
    // Function to handle Enter key press on input field
    document.getElementById("aID").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default Enter key behavior (form submission)
            cancel(); // Call the function to handle form submission
        }
    });

}

async function cancel() {
    aID = document.getElementById("aID").value.toUpperCase();

    // Construct the request URL with the appointment ID parameter
    const requestURL = `/appointment/getDetails/${aID}`;

    try {
        // Send the request to the endpoint using a GET request
        const res = await fetch(requestURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Parse the response JSON

        let botResponse; // Declare botResponse in a scope accessible to both blocks
        let appointment
        appointmentDetails = await res.json();

        if (appointmentDetails.length === 0) {
            console.log("No appointment details found.");
        } else {
            appointment = appointmentDetails[0]; // Access the first object in the array

            botResponse = `
                Appointment ID: ${appointment.APPOINTMENTID}\n
                Patient ID: ${appointment.PATIENTID}\n
                Patient Name: ${appointment.PATIENT_NAME}\n
                Department: ${appointment.DEPARTMENT}\n
                Slot: ${appointment.SLOT_ID}\n
                Slot Time: ${appointment.SLOT_TIME}\n
                Date : ${appointment.DATE}
            `;

            // console.log(botResponse);
        }

        console.log(botResponse); // Now botResponse is accessible here
        displayMessage("bot", botResponse);


        // Append form for cancellation confirmation
        const container = document.querySelector(".chat-container");
        const formContainer = document.createElement("div");
        formContainer.classList.add("chat-message", "bot-message", "form-container");
        formContainer.innerHTML = `
        <form id="initial-form">
            <div class="confirm-booking-container">
                <label for="slotName">Appointment ID: ${appointment.APPOINTMENTID}</label><br><br>
                <h3>Click Confirm To Delete Appointment</h3>
                <button id="formButton" type="button" onclick="confirmCancel()">Confirm</button>
                <button id="formButton" type="button" onclick="displayWelcomeMessage()">Cancel</button>
            </div>
        </form>`;
        container.appendChild(formContainer);
        // Function to handle Enter key press on the form
        document.getElementById("initial-form").addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent the default Enter key behavior (form submission)
                confirmCancel(); // Call the function to confirm cancellation
            }
        });

    } catch (error) {
        console.error('Error while rescheduling appointment:', error);
        displayMessage('bot', 'An error occurred while cancelling appointment.');
    }
}

async function confirmCancel() {
    try {
        // Send a DELETE request to cancel the appointment
        const res = await fetch(`/appointment/delete?appointmentId=${aID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the request was successful
        if (res.ok) {
            // Display a success message
            displayMessage('bot', 'Appointment Cancelled');
            resetGlobalVariables()
            console.log(patientDetails)
            console.log(appointmentDetails)
            console.log(selectedDate)
            console.log(aID)
            console.log(slots)
            displayWelcomeMessage()
            // displayMessage("bot", `Page will Reload in 5 Sec`);
            // setTimeout(function () {
            //     window.location.reload();
            // }, 5000);
        } else {
            // Display an error message if the request fails
            displayMessage('bot', 'Failed to cancel appointment. Please try again.');
        }
    } catch (error) {
        // Display an error message if there is an exception
        console.error('Error while cancelling appointment:', error);
        displayMessage('bot', 'An error occurred while cancelling appointment.');
    }

    // Display the welcome message after cancelling the appointment

}


//----------------------------------- Cancel appointment Section Ends -----------------------------



//-------------------------------- Code Ends Here -------------------------------------------------