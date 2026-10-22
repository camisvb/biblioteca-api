import express from 'express';
import dotenv from 'dotenv';
import conectarBanco from './db.js';

// recuperar as variáveis do arquivo .env
dotenv.config();

// criar o servidor
const app = express();

// permitir json no corpo da requisição
app.use(express.json());

// definir a pasta de arquivos estáticos (frontend)
app.use(express.static('./public'));

// define a porta do servidor
const PORTA = process.env.PORTA;

// variável de conexao
const conexao = conectarBanco();

// página inicial no frontend
app.get("/", (req, res) => {
    res.sendFile("index.html", { root: "./public" });
});

// rota para listar todos os livros
app.get("/livros", async (req, res) => {
    const sql = "SELECT * FROM livro";
    const [resposta] = await conexao.query(sql);
    res.json(resposta);
});

// atualizar dados de um livro
app.put("/livros/:id", async (req, res) => {
    const id = req.params.id;
    const { titulo, descricao, autor } = req.body;
    
    // Adicionado o 'id' ao final do array para bater com o 'WHERE id = ?'
    const novoLivro = [
        titulo,
        descricao,
        autor,
        id
    ];
    
    const [resposta] = await conexao.query("UPDATE livro SET titulo=?, descricao=?, autor=? WHERE id = ?", novoLivro);
    
    if (resposta.affectedRows > 0) {
        res.json({ message: "Livro atualizado" });
    } else {
        res.status(400).json({ message: "Livro NÃO atualizado" });
    }
});

// cadastrar novo livro
app.post("/livros", async (req, res) => {
    const { titulo, descricao, autor } = req.body;
    const [resposta] = await conexao.query("INSERT INTO livro (titulo, descricao, autor) VALUES (?, ?, ?)", [titulo, descricao, autor]);
    res.status(201).json({
        id: resposta.insertId,
        message: "Livro cadastrado com sucesso"
    });
});

// Crases corrigidas aqui no console.log:
app.listen(PORTA, () => {
    console.log(`servidor Rodando em http://localhost:${PORTA}`);
});