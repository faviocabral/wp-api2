const fs = require('fs')
const express = require('express')
const app = express()
const port = 5010
const qrcode = require('qrcode-terminal');
const { Client,LocalAuth , Buttons , List} = require('whatsapp-web.js');
const {moment } = require('moment');
var cors = require('cors')
var bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//helpers 
const agenda = require('./helpers/callcenter')
 const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "bot-server",
  }),
  puppeteer: {
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-web-sexurity', '--disable-setuid-sandbox'],
    headless: true,
  },
  webVersion: "2.2409.2",
  webVersionCache: {
    type: "remote",
    remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
});

 
client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
	qrcode.generate(qr, {small: true});	
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
 
	console.log(msg)
  //test respuesto... 

  //ejemplo de agenda... 
  if (msg.body.toLowerCase() == 'agenda') {
    agenda.recordatorio(client, {fecha:'13/03/2023', hora:'09:30', ubicacion: '', cliente: msg._data.notifyName || '' , telefono: msg.from })
  }

  agenda.respuestas(client, msg )
});

client.initialize();

app.get('/', (req, res) => {   
  res.send('whatsapp api')
})

app.get('/agenda', (req, res)=>{
  var datos = req.query // datos que vienen 
  let cita = {
              fecha:'13/03/2023', 
              hora:'09:30', 
              ubicacion: '' , 
              telefono: `595${datos.telefono}@c.us` || '595981000000@c.us' , 
              cliente: datos.nombre || 'Juan Perez'
            }
  agenda.recordatorio(client, cita )
})

app.post('/agenda', (req, res)=>{
  var datos = req.body // datos que vienen 
  Promise.all([agenda.recordatorio(client, datos ) ])
  .then((e)=>{
    console.log("mensaje enviado")
    res.status(200).send('mensaje enviado')
  })
  .catch((e)=>{
    res.status(400).send('hubo un error al enviar los datos whatstapp bot ')
    console.log('hubo un error al enviar los datos whatstapp bot ',e)
  })

})

app.get('/confirmacion/:ficha', (req, res)=>{
  var datos = req.body // datos que vienen 
  var ficha = req.params.ficha
  agenda.confirmacion(client, ficha )
})


app.get('/enviar/:nro/:msg', (req, res)=>{
  const {nro , msg} = req.params

   client.sendMessage( `595${nro}@c.us`, msg ).then(x=>{
    res.send('ok')
  })
})

app.get('/verificar' , async (req, res)=>{
  var numero = req.query.numero
  console.log('nro para verificar ', numero)
  try {
    console.log('entro para verificar el nro...')
    const ischeck = await client.isRegisteredUser(`595${numero.slice(-9)}@c.us`)
    res.status(200).json({message: (ischeck )? 'si': 'no'})
  } catch (error) {
    console.log('hubo un error en la verificacion de nro' , error)
    res.status(400).json({message:'error' , error: error}) 
  }
})

app.get('/verificar-group' , async (req, res)=>{
  try {
    console.log('entro para verificar contactId...')
    const list = await client.getCommonGroups('595982268726@c.us')
    console.log(list)
    res.status(200).json(list)
  } catch (error) {
    console.log('hubo un error en la verificacion de nro' , error)
    res.status(400).json({message:'error' , error: error}) 
  }
})

app.get('/chat', async (req, res)=>{
  var {telefono , limit } = req.query

  client.getChatById(`595${telefono}@c.us`).then((chat)=>{
    console.log(chat) 
    chat.fetchMessages({limit: limit}).then((msg)=>{
      console.log(msg) 
      res.status(200).json(msg)
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})