import OpenAI from "openai";
import readline from 'readline';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(express.json());


const client = new OpenAI({
    'apiKey': process.env.OPENAI_API_KEY
});

app.post('/processar', async (req, res) => {
    const caminho = path.join(__dirname, 'src', 'uploads', path.basename(req.body.imagem));
    const base64 = fs.readFileSync(caminho, { encoding: 'base64' });


    if (!base64 || base64.length < 50) {
      console.error("Imagem vazia ou inválida.");
      return res.status(400).json({ erro: "Imagem não pode ser processada" });
    }
    
  
    try {
      const resposta = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: `Esta imagem contém uma nota fiscal. Extraia e liste apenas os produtos comprados, com quantidade e valor, no seguinte formato:

                                      [nome do produto] | [quantidade e unidade] | [valor em R$]
                                      
                                      Exemplo:
                                      Arroz 1kg | 2 UN | R$ 9,80
                                      Feijão Preto | 1 UN | R$ 8,50
                                      Pão de Queijo | 0.3750 KG | R$ 20,50
                                      
                                      ⚠️ Não inclua valores totais, tributos, nem repita a palavra "produto", "quantidade" ou "valor". Apenas a lista dos itens conforme o modelo acima.`
                                      },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`
                }
              }
            ]
          }
        ]
      });
  
      const texto = resposta.choices[0].message.content;
      res.json({ resposta: texto });
    } catch (e) {
      console.error(e);
      res.status(500).json({ erro: 'Erro ao processar imagem' });
    }
});
  
app.listen(5000, () => console.log('Servidor de processamento rodando na porta 5000'));


// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   });

// rl.question('Digite sua pergunta: ', async (pergunta) => {
//     try {
//         const response = await client.chat.completions.create({
//         model: "gpt-4o",
//         messages: [
//             { role: "user", content: pergunta }
//         ]
//         });

//         console.log('\nResposta da IA:', response.choices[0].message.content);
//     } catch (err) {
//         console.error('Erro ao chamar a API:', err.message);
//     } finally {
//         rl.close();
//     }
// });