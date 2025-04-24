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
app.use(express.urlencoded({ extended: true }));


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
              { type: 'text', text: `Esta imagem contém uma nota fiscal.

Extraia e liste apenas os produtos comprados, com as seguintes informações:
- Nome do produto
- Quantidade com unidade (ex: 1 UN, 0.3750 KG)
- Valor em reais (formato: R$ X,XX)

Liste no formato abaixo (uma linha por produto):

[nome do produto] | [quantidade e unidade] | [valor em R$]

Exemplo:
Arroz 1kg | 2 UN | R$ 9,80  
Feijão Preto | 1 UN | R$ 8,50  
Pão de Queijo | 0.3750 KG | R$ 20,50  

⚠️ Atenção:
- Não inclua cabeçalhos, totais, tributos, códigos ou descrições longas
- Ignore colunas que não sejam nome, quantidade e valor
- Extraia a Quantidade apenas de colunas com nome: Quantidade, Quan ou QTD
- Se houver cabeçalho na imagem, use-o para se guiar, mas **não o inclua no resultado**
- Evite duplicar informações ou repetir palavras como "produto", "quantidade" ou "valor"`
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

// app.post('/webhook', async (req, res) => {
//   const { message, type, from, mediaUrl } = req.body;

//   // Se for imagem
//   if (type === 'image' && mediaUrl) {
//     const imageBuffer = await fetch(mediaUrl).then(r => r.arrayBuffer());

//     // Envie para a OpenAI como base64
//     const base64 = Buffer.from(imageBuffer).toString('base64');

//     const openaiResponse = await client.chat.completions.create({
//       model: 'gpt-4o',
//       messages: [
//         {
//           role: 'user',
//           content: [
//             {
//               type: 'text',
//               text: `Esta imagem contém uma nota fiscal. Extraia os dados no formato: produto | quantidade | valor.`
//             },
//             {
//               type: 'image_url',
//               image_url: {
//                 url: `data:image/jpeg;base64,${base64}`
//               }
//             }
//           ]
//         }
//       ]
//     });

//     const resposta = openaiResponse.choices[0].message.content;

//     // Responder via WhatsApp usando Evolution API
//     await fetch('https://api.evolution-api.com/message/send-text', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: 'Bearer SEU_TOKEN_DA_INSTANCIA'
//       },
//       body: JSON.stringify({
//         number: from,
//         text: resposta
//       })
//     });
//   }

//   res.sendStatus(200);
// });



app.post('/webhook', async (req, res) => {
  try {
    console.log('BODY:', req.body);

    const textoRecebido = req.body?.data?.message?.conversation;
    const numero = req.body?.data?.key?.remoteJid?.replace('@s.whatsapp.net', '');

    if (!textoRecebido || !numero) {
      console.warn('⚠️ Mensagem ou número não encontrados no body.');
      return res.sendStatus(400);
    }

    console.log('📩 Mensagem recebida:', textoRecebido);
    console.log('📞 Número:', numero);

    // Responder via Evolution API
    const resposta = await fetch('http://localhost:8080/message/sendText/Botestoque', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer 75B60D8DA4FA-4CAB-AC4D-5283EDD72616',
        'apikey': '75B60D8DA4FA-4CAB-AC4D-5283EDD72616'
      },
      body: JSON.stringify({
        number: numero,
        text: `✅ Recebi: "${textoRecebido}"`
      })
    });

    if (!resposta.ok) {
      console.error('❌ Erro ao enviar resposta:', await resposta.text());
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.sendStatus(500);
  }
});



  
app.listen(5000, () => console.log('Servidor de processamento rodando na porta 5000'));