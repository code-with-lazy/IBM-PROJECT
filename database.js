const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { IamAuthenticator } = require('ibm-watson/auth');
const ibmdb = require("ibm_db");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function connectToDB2(callback) {
    ibmdb.open("DRIVER={DB2};HOSTNAME=3883e7e4-18f5-4afe-be8c-fa31c41761d2.bs2io90l08kqb1od8lcg.databases.appdomain.cloud;UID=vvy23821;PWD=kfqqyhgd75I3ZuZz;PORT=31498;DATABASE=bludb;PROTOCOL=TCPIP;SECURITY=SSL", callback);
}

app.get('/appointment/allData', (req, res) => {
    try {
        connectToDB2((err, conn) => {
            if (err) {
                console.error('Error connecting to DB2:', err);
                return res.status(500).json({ error: 'An error occurred while connecting to the database.' });
            }

            const query = `
                SELECT * FROM APPOINTMENTS;
            `;

            conn.query(query, (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'An error occurred while fetching available slots.' });
                }

                // Convert the result to HTML table
                let htmlResult = '<table style="border-collapse: collapse; width: 100%;"><tr>';
                for (const column of Object.keys(result[0])) {
                    htmlResult += `<th style="border: 1px solid #ddd; padding: 8px;">${column}</th>`;
                }
                htmlResult += '</tr>';
                for (const row of result) {
                    htmlResult += '<tr>';
                    for (const value of Object.values(row)) {
                        htmlResult += `<td style="border: 1px solid #ddd; padding: 8px;">${value}</td>`;
                    }
                    htmlResult += '</tr>';
                }
                htmlResult += '</table>';

                // Sending HTML response
                res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Appointment Data</title>
                        <style>
                            table {
                                font-family: Arial, sans-serif;
                                border-collapse: collapse;
                                width: 100%;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                            }
                            th {
                                background-color: #f2f2f2;
                            }
                        </style>
                    </head>
                    <body>
                        <h2>Appointment Data</h2>
                        ${htmlResult}
                    </body>
                    </html>
                `);

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

app.get('/patients/allData', (req, res) => {
    try {
        connectToDB2((err, conn) => {
            if (err) {
                console.error('Error connecting to DB2:', err);
                return res.status(500).json({ error: 'An error occurred while connecting to the database.' });
            }

            const query = `
                SELECT * FROM PATIENTS;
            `;

            conn.query(query, (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).json({ error: 'An error occurred while fetching patient data.' });
                }

                // Convert the result to HTML table
                let htmlResult = '<table style="border-collapse: collapse; width: 100%;"><tr>';
                for (const column of Object.keys(result[0])) {
                    htmlResult += `<th style="border: 1px solid #ddd; padding: 8px;">${column}</th>`;
                }
                htmlResult += '</tr>';
                for (const row of result) {
                    htmlResult += '<tr>';
                    for (const value of Object.values(row)) {
                        htmlResult += `<td style="border: 1px solid #ddd; padding: 8px;">${value}</td>`;
                    }
                    htmlResult += '</tr>';
                }
                htmlResult += '</table>';

                // Sending HTML response
                res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Patient Data</title>
                        <style>
                            table {
                                font-family: Arial, sans-serif;
                                border-collapse: collapse;
                                width: 100%;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                            }
                            th {
                                background-color: #f2f2f2;
                            }
                        </style>
                    </head>
                    <body>
                        <h2>Patient Data</h2>
                        ${htmlResult}
                    </body>
                    </html>
                `);

                conn.close((err) => {
                    if (err) {
                        console.error('Error closing DB2 connection:', err);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error fetching patient data:', error);
        res.status(500).json({ error: 'An error occurred while fetching patient data.' });
    }
});


const port = process.env.PORT || 4500;
app.listen(port, () => {
    console.log(`Server is running on port ${port}\n`);
    console.log(`\nFor All Patient Details \nAccess the server at http://localhost:${port}/patients/allData\n`);
    console.log(`\nFor All Appointment Details \nAccess the server at http://localhost:${port}/appointment/allData`);

});
