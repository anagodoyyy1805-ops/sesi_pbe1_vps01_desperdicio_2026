const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const arquivoDados = path.join(__dirname, "dados.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

function lerDados() {
    try {
        const dados = fs.readFileSync(arquivoDados, "utf8");
        return JSON.parse(dados);
    } catch (erro) {
        return [];
    }
}

function salvarDados(dados) {
    fs.writeFileSync(
        arquivoDados,
        JSON.stringify(dados, null, 2),
        "utf8"
    );
}

app.get("/equipamentos", (req, res) => {
    const dados = lerDados();
    res.json(dados);
});

app.get("/equipamentos/:id", (req, res) => {
    const dados = lerDados();
    const id = Number(req.params.id);

    const equipamento = dados.find(item => item.id === id);

    if (!equipamento) {
        return res.status(404).json({
            mensagem: "Equipamento não encontrado."
        });
    }

    res.json(equipamento);
});

app.get("/buscar/equipamento/:nome", (req, res) => {
    const dados = lerDados();
    const nome = req.params.nome.toLowerCase();

    const resultados = dados.filter(item =>
        item.equipamento.toLowerCase().includes(nome)
    );

    res.json(resultados);
});

app.get("/buscar/local/:local", (req, res) => {
    const dados = lerDados();
    const local = req.params.local.toLowerCase();

    const resultados = dados.filter(item =>
        item.local.toLowerCase().includes(local)
    );

    res.json(resultados);
});

app.post("/equipamentos", (req, res) => {
    const dados = lerDados();

    const { local, equipamento, consumo_kwh, mes_referencia, status } = req.body;

    if (
        !local ||
        !equipamento ||
        consumo_kwh === undefined ||
        !mes_referencia ||
        !status
    ) {
        return res.status(400).json({
            mensagem: "Todos os campos são obrigatórios."
        });
    }
    const novoId = dados.length > 0
        ? Math.max(...dados.map(item => item.id)) + 1
        : 1;
    const novoEquipamento = {
        id: novoId,
        local,
        equipamento,
        consumo_kwh: Number(consumo_kwh),
        mes_referencia,
        status
    };

    dados.push(novoEquipamento);
    salvarDados(dados);
    res.status(201).json(novoEquipamento);
});

app.put("/equipamentos/:id", (req, res) => {
    const dados = lerDados();
    const id = Number(req.params.id);

    const indice = dados.findIndex(item => item.id === id);

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Equipamento não encontrado."
        });
    }

    const equipamentoAtualizado = {
        id,
        local: req.body.local ?? dados[indice].local,
        equipamento: req.body.equipamento ?? dados[indice].equipamento,
        consumo_kwh: req.body.consumo_kwh !== undefined
            ? Number(req.body.consumo_kwh)
            : dados[indice].consumo_kwh,
        mes_referencia: req.body.mes_referencia ?? dados[indice].mes_referencia,
        status: req.body.status ?? dados[indice].status
    };

    dados[indice] = equipamentoAtualizado;
    salvarDados(dados);

    res.json(equipamentoAtualizado);
});

app.delete("/equipamentos/:id", (req, res) => {
    const dados = lerDados();
    const id = Number(req.params.id);

    const indice = dados.findIndex(item => item.id === id);

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Equipamento não encontrado."
        });
    }

    const removido = dados.splice(indice, 1)[0];
    salvarDados(dados);
    res.json({
        mensagem: "Equipamento excluído com sucesso.",
        equipamento: removido
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});