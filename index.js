const express = require("express");
require("dotenv").config(); 
const OpenAI = require("openai");

const app = express();
app.use(express.json()); 

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY_ASISTANCE, 
});

const VALID_TOKEN = process.env.OPEN_AI_KEY_ASISTANCE

const verifyHeaders = (req, res, next) => {
    const authHeader = req.headers['authorization']; 

  
    if (!authHeader) {
        return res.status(400).json({ error: "Falta el encabezado Authorization" });
    }

    
    const token = authHeader.split(" ")[1]; 

  
    if (token !== VALID_TOKEN) {
        return res.status(403).json({ error: "Acceso prohibido: token no válido" });
    }

    next(); 
};

async function addMessage(threadID, message){
    const messageResponse = await openai.beta.threads.messages.create(threadID,{
        role: "user",
        content: message
    })
    return messageResponse
}

async function getMessages(asistente, thread) {
    console.log("Pensando...")
    const run = await openai.beta.threads.runs.create(thread,{
        assistant_id: asistente
    })

    while(true){
        const runInfo = await openai.beta.threads.runs.retrieve(thread, run.id)

        if(runInfo.status === "completed"){
            break
        }
        console.log("Pensando 1 segundo...")
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const messages = await openai.beta.threads.messages.list(thread)
    const messagesContent = messages.data[0].content[0].text.value
    return messagesContent
}



async function obtenerAsistente() {

    const asistente = "asst_NHIZLs3EqpCWWIszdNFGHhIB"
    const thread = "thread_qivVC58W5OtE6omPtbz1Qj23"
    
 
    try {

        const message = await addMessage(thread, mensaje)
        console.log("Mensaje:",message)
        const ultimoMensaje = await getMessages(asistente, thread)
        console.log("Ultimo mensaje", ultimoMensaje)
   

       
    } catch (error) {
        console.error('Error al obtener el asistente:', error);
    }
}




app.post("/start", verifyHeaders, async (req, res) => {
    const asistente = "asst_NHIZLs3EqpCWWIszdNFGHhIB";
    const thread = "thread_qivVC58W5OtE6omPtbz1Qj23";

    try {
        
        const userMessage = req.body.message || "Hola";

        
        await addMessage(thread, userMessage);

        
        const assistantResponse = await getMessages(asistente, thread);

        return res.status(200).json({ message: assistantResponse });
    } catch (error) {
        console.error('Error en /start:', error.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));







