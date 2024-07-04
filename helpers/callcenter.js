const {  Buttons , List} = require('whatsapp-web.js')
const knex_pg = require('../db/postgres')
var moment = require('moment'); // require

////////////////////////////////
// para enviar recordatorio al cliente 
////////////////////////////////////////////////////////////////
const recordatorio = async(client, cita )=>{

    /////////////////////////////////////////////////
    //consultar a la base y extraer 
    console.log(cita)
    let datos = await consultarCitas(cita)
	let box = await consultarBox(cita.box)
    console.log(datos)
    let saludo = ( Number( moment().format('HH')) < 12 )?'Buenos dias':'Buenas tardes'
    let clearNumber = `595${cita.celular.slice(-9)}@c.us`
    console.log(clearNumber)
    let mensaje = `*CALL CENTER *\n\n${saludo}, Sr/Sra. *${cita.cliente}* \n✅Su cita se encuentra reservada\n🗓️ *Día:* ${cita.fecha}\n⏰ *Hora:* ${cita.hora}hs\n🏣 *Taller:* ${cita.taller}\n🚩 *Direccion:* ${cita.direccion}\n📍 *Ubicacion:* ${cita.ubicacion}\nLe esperamos en nuestros Locales❗️ ` //button body 

    /*let mensaje = new Buttons(
        `Buenas tardes Sr/Sra. ${cita.cliente}\n✅Su cita se encuentra reservada\n🗓️ Día: ${cita.fecha}\n⏰ Horario: ${cita.hora}hs\n📍 Taller: ${cita.ubicacion}\nLe esperamos ❗️ `, //button body 
                        [
                            {id: 'cancelAgenda', body:'❌ Cancelar!'},
                            {id: `okAgenda`, body:'✔️ Confirmar!'},
                        ],
                        ' 📆 AGENDA',
                        'Opciones: '
            );
            */
    client.sendMessage( clearNumber , mensaje ).then(async (msg )=>{
      //console.log(msg) para ver el mensaje que se envio.... al cliente 
      ////////////////////////////////////////////////////////////////////
      // actualizar la agenda que fue notificado el cliente por whatsapp!
      try {
        console.log('se envio correctamente al cliente el manesaje confirmacion !!')
        await knex_pg('fichas')
              .where('fecha', cita.fecha)
              .andWhere('hora', cita.hora)
              .andWhere('celular', cita.celular)
              .update({whatsapp: 'SI'})

      } catch (error) {
        console.log('hubo un error en la actualizacion de la agenda para la notifiacion ', error)
      }
    })
    .catch(err => console.log('hubo un error en el envio de datos al cliente ', err))
};

const confirmacion = async(client, cita )=>{

  /////////////////////////////////////////////////
  //consultar a la base y extraer 
  console.log(cita)
  let datos = await consultarCitas2(cita)
  console.log(datos)
  let saludo = ( Number( moment().format('HH')) < 12 )?'Buenos dias':'Buenas tardes'
  let clearNumber = `595${cita.celular.slice(-9)}@c.us`
  console.log(clearNumber)
  let mensaje = `*CALL CENTER *\n\n${saludo}, Sr/Sra. *${cita.cliente}* \n✅ Recordatorio de citas \n🗓️ *Día:* ${cita.fecha}\n⏰ *Hora:* ${cita.hora}hs\n🏣 *Taller:* ${cita.taller}\n🚩 *Direccion:* ${cita.direccion}\n📍 *Ubicacion:* ${cita.ubicacion}\n Favor confirme o cancele su cita con estas opciones:❗️ \n*1* Confirmar \n*2* Cancelar ` //button body 

  client.sendMessage( clearNumber , mensaje ).then(async (msg )=>{
    //console.log(msg) para ver el mensaje que se envio.... al cliente 
    ////////////////////////////////////////////////////////////////////
    // actualizar la agenda que fue notificado el cliente por whatsapp!
    try {
      console.log('se envio correctamente al cliente el manesaje confirmacion !!')
      // await knex_pg(process.env.TABLA_AGENDA)
      //       .where('fecha', cita.fecha)
      //       .andWhere('hora', cita.hora)
      //       .andWhere('celular', cita.celular)
      //       .update({whatsapp: 'SI'})

    } catch (error) {
      console.log('hubo un error en la actualizacion de la agenda para la notifiacion ', error)
    }
  })
  .catch(err => console.log('hubo un error en el envio de datos al cliente ', err))
};

////////////////////////////////
// para resonder al cliente segun las opciones
////////////////////////////////////////////////////////////////

const consultarCitas = async(cita) => {
  let list = []
  try {
    await knex_pg
    .select("*")
    .from("fichas")
    .where("fecha", cita.fecha)
    .andWhere("hora", cita.hora)
    .andWhere("celular", cita.celular)
    .andWhere("estado", '1')
    .then(rows => {
      list = rows 
    }); 

  } catch (error) {
    console.log('ocurrio un error en la consulta posgres ', error )
  }
  return list 

}

const consultarCitas2 = async(cita) => {
  let list = []
  try {
    await knex_pg
    .select("*")
    .from("fichas")
    .where("id_ficha", cita)
    .then(rows => {
      //console.log(rows)
      list = rows 
    }); 

  } catch (error) {
    console.log('ocurrio un error en la consulta posgres ', error )
  }
  return list 

}

const consultarBox = async(box) => {
  let list = []
  try {
    await knex_pg
    .select("*")
    .from("boxes")
    .where("orden", box)
    .then(rows => {
      //console.log(rows)
      list = rows 
    }); 

  } catch (error) {
    console.log('ocurrio un error en la consulta posgres ', error )
  }
  return list 
}

const respuestas = (client , msg  )=>{
    //si responde con un botton 
    if(msg.type === 'buttons_response'){

        switch (msg.selectedButtonId) {
    
            //respueta cuando confirma agenda el cliente la cita 
            case 'okAgenda':

              /*
                CONSULTAR A LA BASE DE CALLCENTER .... 
              */
                //consultarCitas()
                let res =  
                `Buenas tardes Sr/Sra. ${msg._data.notifyName || 'Juan Perez'}
                ✅Su cita se encuentra CONFIRMADA!! 
                🗓️ Día: ${ '20/03/2023'} 
                ⏰ Horario: ${ '09:30'}hs
                📍 Taller: ${ ''}
                Le esperamos❗️`
                console.log(msg.from )
                console.log(res )
                client.sendMessage(msg.from, res)
                break;
    
            //respuesta cuando cancela el cliente la cita 
            case 'cancelAgenda':
                let button = new Buttons(
                    `Lamentamos que su cita de servicio haya sido *cancelado* Sr/Sra. ${msg._data.notifyName}, si desea *RE-AGENDAR* indique en el boton mas abajo❗️ `, //button body 
                    [
                      {id: 'noReagendar', body:'❌ No!'},
                      {id: 'siReagendar', body:'✔️ Si!'},
                    ],
                    '📆 AGENDA CANCELADA !!',
                    'Opciones: '
                  ); 
                client.sendMessage(msg.from , button )
                break;
    
            //respuesta 
            case 'siReagendar':
    
                //consultar fechas disponibles para la agenda
                // api 
                ////////////////////////////////
                let diasDisponibles = new List(
                    " 👉🏻 Una vez que re-agende quedara automaticamente agendado❗️❗️", //cuerpo del mensaje 
                    "Ver Fechas", // texto del boton de la lista
                    [
                      {
                        title: "Fechas Disponibles", //titulo de la lista
                        rows: [ //opciones 
                          { id: "fecha1", title: "20/03/2023" },
                          { id: "fecha2", title: "21/03/2023" },
                          { id: "fecha3", title: "22/03/2023" },
                        ],
                      },
                    ],
                    "🗓️ Seleccione una fecha Disponible❗️❗️"
                  ); 
                  client.sendMessage(msg.from, diasDisponibles)
                break;
                
            //respuesta cuando cancela el cliente la cita 
            case 'noReagendar':
                res =  
                ` Sr/Sra. ${msg._data.notifyName}
                😔 Su cita se encuentra *CANCELADA*❗️❗️ 
                🗓️ Lamentamos que no haya podido re-agendar su cita 
                👨🏻‍💼 Un agente se pondra en contacto con usted para una mejor atencion gracias.
                Le esperamos❗️`
                client.sendMessage(msg.from, res)
                break;
    
            default:
                break;
        }
    }

    //cuando responde con el listado 
    if(msg.type === 'list_response'){

        ////////////////////////////////
        // aqui debemos recuperar hora disponibles 
        ////////////////////////////////

        if( 'fecha1 fecha2 fecha3'.includes(msg.selectedRowId)){
            fecha = msg.body
            let horasDisponibles = new List(
              " 👉🏻 Una vez que re-agende quedara automaticamente agendado❗️❗️ ", //cuerpo del mensaje 
              "Ver Horas", // texto del boton de la lista
              [
                {
                  title: "Horas Disponibles", //titulo de la lista
                  rows: [ //opciones 
                    { id: "hora1", title: "08:00" },
                    { id: "hora2", title: "09:30" },
                    { id: "hora3", title: "10:00" },
                  ],
                },
              ],
              `🗓️ Seleccione una hora Disponible de la fecha *${fecha}* ❗️❗️ `
            ); 
            client.sendMessage(msg.from, horasDisponibles)
        }
        if( 'hora1 hora2 hora3'.includes(msg.selectedRowId)){
            hora = msg.body
            res =  
                `Sr/Sra. ${msg._data.notifyName}
                ✅Su cita se encuentra *RE-AGENDADA*❗️❗️ 
                🗓️ Día: *${fecha}* 
                ⏰ Horario: *${hora}hs*
                📍 Taller: ${cita.ubicacion}
                Le esperamos❗️`
            client.sendMessage(msg.from, res)
          }                
    }

}

module.exports = {recordatorio , respuestas, consultarCitas, consultarCitas2, confirmacion }