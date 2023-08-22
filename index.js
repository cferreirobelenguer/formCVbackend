const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const Schema = mongoose.Schema;
const multer = require('multer');
const DataModel = require ('../backend/model/datauser');
const app = express();
const nodemailer = require('nodemailer');
require('dotenv').config();
const config = require('../backend/config');


app.use(bodyParser.json());


//bbdd mongoDB
mongoose.connect('mongodb://localhost:27017/user', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=> {
    console.log('Conexión bbdd correcta');
});

app.use((req, res, next) => {
    //Configuramos el control de acceso para que cualquier cliente pueda hacer peticiones ajax
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    //permitimos métodos http 
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('pdf'), async (req, res) => {
    try {
        const { name, tel, email } = req.body;
        const pdf = req.file.buffer;

      // Guarda los datos en la base de datos
        const newData = new DataModel({ name, tel, email, pdf });
        await newData.save();
        const now = new Date();
        const transporter = nodemailer.createTransport(config.email);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.USER_EMAIL,
            subject: `CURRICULUM A FECHA ${now}`,
            html: `
                    <h1>CANDIDATO</h1>
                    <table>
                        <tr>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                        </tr>
                        <tr>
                            <td>
                                ${name}
                            </td>
                            <td>
                                ${tel}
                            </td>
                            <td>
                                ${email}
                            </td>
                        </tr>
                    </table>`,
            attachments: [{ filename: 'curriculum.pdf', content: pdf }]
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                res.status(500).send('Error al enviar el correo');
            } else {
                console.log('Correo enviado:', info.response);
                }
            });
        
    } catch (error) {
        console.error('Error al guardar los datos:', error);
        res.status(500).json({ error: 'Error al guardar los datos' });
    }
    });


app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
