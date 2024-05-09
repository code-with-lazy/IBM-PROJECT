const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
// const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const ibmdb = require("ibm_db");

const assistant_id = "12aa8368-91f6-4acd-bc4e-f0f17be5a678";
let session_id;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const assistant = new AssistantV2({
    authenticator: new IamAuthenticator({ apikey: 'vmv2azJZ1x5CBZ93XH7T-fqweLpNKG0nK7ydYVq0QmWV' }),
    serviceUrl: 'https://api.au-syd.assistant.watson.cloud.ibm.com/instances/79c7d747-5fd8-4b29-acdc-3beebfd4f4c8',
    version: '2021-06-14'
});

// const languageTranslator = new LanguageTranslatorV3({
//     version: '2018-05-01',
//     authenticator: new IamAuthenticator({
//         apikey: 'nFf2jPgRLoaGEhCjmB-4wNf5UXJD_bMRH7IbNXWlTsea',
//     }),
//     serviceUrl: 'https://api.eu-gb.language-translator.watson.cloud.ibm.com/instances/85f8b5a2-fbf1-499c-b0c5-ec96b38d31de',
// });

assistant.createSession({
    assistantId: assistant_id
})
    .then(res => {
        console.log(JSON.stringify(res.result, null, 2));
        session_id = res.result.session_id; // Assign the session ID to the variable
    })
    .catch(err => {
        console.log(err);
    });


// Function to establish DB2 connection
function connectToDB2(callback) {
    ibmdb.open("DRIVER={DB2};HOSTNAME=3883e7e4-18f5-4afe-be8c-fa31c41761d2.bs2io90l08kqb1od8lcg.databases.appdomain.cloud;UID=vvy23821;PWD=kfqqyhgd75I3ZuZz;PORT=31498;DATABASE=bludb;PROTOCOL=TCPIP;SECURITY=SSL", callback);
}



// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html file when root URL is accessed
app.get('/', (req, res) => {
   // res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/message', async (req, res) => {

    let message = req.query.input

    try {

        // Call function to interact with IBM Watson Assistant
        console.log("Response from Server")
        const response = await sendToWatson(message);
        console.log("Response From Message Routing")
        console.log(response);
        // Return the response to the client
        res.json({ message: response });
    } catch (error) {
        console.error('Error interacting with IBM Watson Assistant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Route to add a new appointment
app.post('/appointment/add', (req, res) => {
    console.log('Add Apoointment Section')
    try {
        const { appointmentID, patientID, patientName, department, slotID, slotTime, date } = req.body;

        connectToDB2((err, conn) => {
            if (err) {
                console.error('Error connecting to DB2:', err);
                return res.status(500).json({ error: 'An error occurred while connecting to the database.' });
            }

            const query = `
        INSERT INTO Appointments (AppointmentId, PatientID, Patient_Name, Department, Slot_ID, Slot_Time, Date)
        VALUES (?,?,?,?,?,?,?);
      `;

            conn.query(query, [appointmentID, patientID, patientName, department, slotID, slotTime, date], (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'An error occurred while adding the appointment.' });
                }

                res.json({ message: 'Appointment added successfully.' });
                console.log("Appointment added successfully.")

                conn.close((err) => {
                    if (err) {
                        console.error('Error closing DB2 connection:', err);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error adding appointment:', error);
        res.status(500).json({ error: 'An error occurred while adding the appointment.' });
    }
});

// Route to add a new patient
app.post('/patient/add', (req, res) => {
    console.log('Add Patient Section')
    try {
        const { patient_id, patient_name, age_value, phone_number, city_name, department_name } = req.body;

        connectToDB2((err, conn) => {
            if (err) {
                console.error('Error connecting to DB2:', err);
                return res.status(500).json({ error: 'An error occurred while connecting to the database.' });
            }

            const query = `
        INSERT INTO Patients (PatientID, Patient_Name, Age, Phone_Number, City, Department)
        VALUES (?,?,?,?,?,?);
      `;

            conn.query(query, [patient_id, patient_name, age_value, phone_number, city_name, department_name], (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'An error occurred while adding the patient.' });
                }

                res.json({ message: 'Patient added successfully.' });
                console.log('Patient added successfully.')

                conn.close((err) => {
                    if (err) {
                        console.error('Error closing DB2 connection:', err);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ error: 'An error occurred while adding the patient.' });
    }
});

// Route to retrieve appointment details by ID
app.get('/appointment/getDetails/:id', (req, res) => {
    console.log('Appointment Details Section')
    try {
        const appointmentId = req.params.id;
        console.log(appointmentId)

        connectToDB2((err, conn) => {
            if (err) {
                console.error('Error connecting to DB2:', err);
                return res.status(500).json({ error: 'An error occurred while connecting to the database.' });
            }

            const query = `
    SELECT
        Appointments.AppointmentId,
        Appointments.PatientID,
        Patients.Patient_Name,
        Patients.Department,
        Appointments.Slot_ID,
        Appointments.Slot_Time,
        Appointments.Date
    FROM Appointments
    JOIN Patients ON Appointments.PatientID = Patients.PatientID
    WHERE Appointments.AppointmentId = ?;
`;

            console.log("checkpoint")
            conn.query(query, [appointmentId], (err, result) => {
                if (err) {
                    console.log("Checkpoint 2")
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'An error occurred while fetching appointment details.' });
                }

                if (result.length === 0) {
                    console.log("Checkpoint 3")
                    return res.status(404).json({ error: 'Appointment not found.' });
                }

                console.log(result)
                res.json(result); // Send the result array directly as the JSON response

                conn.close((err) => {
                    if (err) {
                        console.error('Error closing DB2 connection:', err);
                    }
                });
            });

        });
    } catch (error) {
        console.log("Checkpoint 4")
        console.error('Error fetching appointment details:', error);
        res.status(500).json({ error: 'An error occurred while fetching appointment details.' });
    }
});

// Route to delete an appointment by ID
app.delete('/appointment/delete', (req, res) => {
    console.log('Appointment Delete Section')
    try {
        // const appointmentId = req.params.id;.
        const { appointmentId } = req.query;

        console.log(appointmentId)

        connectToDB2((err, conn) => {
            if (err) {
                console.error('Error connecting to DB2:', err);
                return res.status(500).json({ error: 'An error occurred while connecting to the database.' });
            }

            const query = `
            DELETE FROM Patients
            WHERE PatientID IN (
            SELECT PatientID
            FROM Appointments
            WHERE AppointmentId = ?);

            DELETE FROM Appointments
            WHERE AppointmentId = ?;
        `;

            conn.query(query, [appointmentId, appointmentId], (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'An error occurred while deleting the appointment.' });
                }

                if (result.rowsAffected === 0) {
                    return res.status(404).json({ error: 'Appointment not found.' });
                }
                // console.log(result)
                console.log('Appointment deleted successfully.')
                res.json({ message: 'Appointment deleted successfully.' });


                conn.close((err) => {
                    if (err) {
                        console.error('Error closing DB2 connection:', err);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'An error occurred while deleting the appointment.' });
    }
});

// Route to retrieve available slots for a specific date
app.get('/appointment/slots', (req, res) => {
    try {
        const { date } = req.query;

        connectToDB2((err, conn) => {
            if (err) {
                console.error('Error connecting to DB2:', err);
                return res.status(500).json({ error: 'An error occurred while connecting to the database.' });
            }

            const query = `
            SELECT *
            FROM TimeSlot
            WHERE SlotId NOT IN (SELECT Slot_ID FROM Appointments WHERE Date = ?);
        `;

            conn.query(query, [date], (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'An error occurred while fetching available slots.' });
                }
                console.log(result)

                res.json(result);

                conn.close((err) => {
                    if (err) {
                        console.error('Error closing DB2 connection:', err);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'An error occurred while fetching available slots.' });
    }
});

// Route to reschedule an appointment
app.post('/appointment/reschedule', (req, res) => {
    try {
        const { appointmentId, newDate, newSlotId, newSlotTime } = req.body;
        // let appointmentId = req.body.appointmentId
        // let newDate = req.body.newDate
        // let newSlotId= req.body.newSlotId
        // let newSlotTime = req.body.newSlotTime





        connectToDB2((err, conn) => {
            if (err) {
                console.error('Error connecting to DB2:', err);
                return res.status(500).json({ error: 'An error occurred while connecting to the database.' });
            }

            const query = `
          UPDATE Appointments
          SET Date = ?, Slot_ID = ?, Slot_Time = ?
          WHERE AppointmentId = ?;
        `;

            conn.query(query, [newDate, newSlotId, newSlotTime, appointmentId], (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'An error occurred while rescheduling the appointment.' });
                }

                if (result.rowsAffected === 0) {
                    return res.status(404).json({ error: 'Appointment not found.' });
                }

                res.json({ message: 'Appointment rescheduled successfully.' });

                conn.close((err) => {
                    if (err) {
                        console.error('Error closing DB2 connection:', err);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        res.status(500).json({ error: 'An error occurred while rescheduling the appointment.' });
    }
});

app.get('/appointment/Details', (req, res) => {
    const appointmentId = req.query.AID;
    console.log(appointmentId)
    connectToDB2((err, conn) => {
        if (err) {
            console.error('Error connecting to DB2:', err);
            return res.status(500).json({ error: 'An error occurred while connecting to the database.' });
        }

        const query = 'SELECT * FROM Appointments WHERE APPOINTMENTID = ?';

        conn.query(query, [appointmentId], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'An error occurred while fetching appointment details.' });
            }
            if (result.length === 0) {
                return res.status(404).json({ error: 'Appointment not found.' });
            }
            const appointmentDetails = result[0];
            console.log(appointmentDetails);
            res.json(appointmentDetails);

            conn.close((err) => {
                if (err) {
                    console.error('Error closing DB2 connection:', err);
                }
            });
        });
    });

});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Access the server at http://localhost:${port}`);
});

//Function to Send to Watson
async function sendToWatson(userInput) {
    console.log(userInput)
    try {
        const response = await assistant.message({
            assistantId: assistant_id,
            sessionId: session_id,
            input: {
                'message_type': 'text',
                'text': userInput
            }
        });
        console.log("sendToWastson Method : ")
        console.log(response.result.output.generic[0].text);
        return response.result.output.generic[0].text;
    } catch (error) {
        console.error(error);
        return "An error occurred while processing your request2.";
    }
}

// function translateMessage(message) {
//     const translateParams = {
//         text: message,
//         modelId: 'en-hi', // Change this to the desired translation model ID
//     };

//     return languageTranslator.translate(translateParams)
//         .then(translationResult => {
//             const translation = translationResult.translations[0].translation;
//             return translation;
//         })
//         .catch(err => {
//             console.log('error:', err);
//             throw err; // Rethrow the error for handling by the caller
//         });
// }

