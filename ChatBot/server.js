import OpenAI from "openai";
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();


const client = new OpenAI({
    'apiKey': process.env.OPENAI_API_KEY
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

rl.question('Digite sua pergunta: ', async (pergunta) => {
    try {
        const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "user", content: pergunta }
        ]
        });

        console.log('\nResposta da IA:', response.choices[0].message.content);
    } catch (err) {
        console.error('Erro ao chamar a API:', err.message);
    } finally {
        rl.close();
    }
});