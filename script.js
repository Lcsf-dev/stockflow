// Navegação entre as páginas

function destacarPaginaAtual() {
    const caminhoPagina = window.location.pathname;
    const ultimaBarra = caminhoPagina.lastIndexOf("/");
    let paginaAtual = caminhoPagina.substring(ultimaBarra + 1);

    if (paginaAtual === "") {
        paginaAtual = "index.html";
    }

    const linksMenu = document.querySelectorAll("#menu-principal .nav-link");

    for (let indice = 0; indice < linksMenu.length; indice++) {
        const linkMenu = linksMenu[indice];

        if (linkMenu.getAttribute("href") === paginaAtual) {
            linkMenu.classList.add("active");
            linkMenu.setAttribute("aria-current", "page");
        } else {
            linkMenu.classList.remove("active");
            linkMenu.removeAttribute("aria-current");
        }
    }

    console.log("Página carregada no StockFlow:", paginaAtual);
}

// Dados e armazenamento local

const chaveArmazenamento = "stockflow.dados";
const categorias = {
    "materia-prima": "Matéria-prima",
    "componentes": "Componentes",
    "embalagens": "Embalagens",
    "consumo": "Materiais de consumo"
};
const unidades = { "un": "un", "kg": "kg", "m": "m", "l": "L" };
let dados = null;
let versaoLida = null;
let armazenamentoDisponivel = false;
let materialEmEdicao = null;

function localizarMaterial(identificador, materiais) {
    for (let indice = 0; indice < materiais.length; indice++) {
        if (materiais[indice].id === identificador) {
            return materiais[indice];
        }
    }

    return null;
}

function possuiMovimentacoes(identificador, movimentacoes) {
    for (let indice = 0; indice < movimentacoes.length; indice++) {
        if (movimentacoes[indice].materialId === identificador) {
            return true;
        }
    }

    return false;
}

function calcularSaldo(identificador, movimentacoes) {
    let saldoMil = 0;

    for (let indice = 0; indice < movimentacoes.length; indice++) {
        const movimentacao = movimentacoes[indice];

        if (movimentacao.materialId === identificador) {
            if (movimentacao.tipo === "entrada") {
                saldoMil += movimentacao.quantidadeMil;
            } else {
                saldoMil -= movimentacao.quantidadeMil;
            }
        }
    }

    return saldoMil;
}

// Valida o arquivo inteiro antes de utilizar ou substituir os dados existentes.
function validarDados(conteudo) {
    if (!conteudo || conteudo.versao !== 1 ||
        !Array.isArray(conteudo.materiais) || !Array.isArray(conteudo.movimentacoes)) {
        throw new Error("Formato de armazenamento não reconhecido.");
    }

    const identificadores = [];
    const codigos = [];

    for (let indice = 0; indice < conteudo.materiais.length; indice++) {
        const material = conteudo.materiais[indice];

        if (!material || !Number.isSafeInteger(material.id) || material.id <= 0 ||
            identificadores.includes(material.id) ||
            typeof material.codigo !== "string" || material.codigo.trim() === "" ||
            material.codigo.length > 40 ||
            typeof material.nome !== "string" || material.nome.trim() === "" ||
            material.nome.length > 120 ||
            !Object.hasOwn(categorias, material.categoria) ||
            !Object.hasOwn(unidades, material.unidade) ||
            !Number.isSafeInteger(material.estoqueMinimoMil) || material.estoqueMinimoMil < 0) {
            throw new Error("Cadastro armazenado inválido.");
        }

        const codigoNormalizado = material.codigo.trim().toLocaleUpperCase("pt-BR");

        if (codigos.includes(codigoNormalizado) ||
            (material.unidade === "un" && material.estoqueMinimoMil % 1000 !== 0)) {
            throw new Error("Código duplicado ou estoque mínimo inválido.");
        }

        identificadores.push(material.id);
        codigos.push(codigoNormalizado);
    }

    const identificadoresMovimentacoes = [];
    const movimentacoesValidadas = [];

    for (let indice = 0; indice < conteudo.movimentacoes.length; indice++) {
        const movimentacao = conteudo.movimentacoes[indice];

        if (!movimentacao || !Number.isSafeInteger(movimentacao.id) || movimentacao.id <= 0 ||
            identificadoresMovimentacoes.includes(movimentacao.id) ||
            !Number.isSafeInteger(movimentacao.materialId) ||
            (movimentacao.tipo !== "entrada" && movimentacao.tipo !== "saida") ||
            !Number.isSafeInteger(movimentacao.quantidadeMil) || movimentacao.quantidadeMil <= 0 ||
            typeof movimentacao.observacao !== "string" || movimentacao.observacao.length > 500 ||
            typeof movimentacao.data !== "string" || Number.isNaN(Date.parse(movimentacao.data))) {
            throw new Error("Movimentação armazenada inválida.");
        }

        const material = localizarMaterial(movimentacao.materialId, conteudo.materiais);

        if (!material || movimentacao.unidade !== material.unidade ||
            (material.unidade === "un" && movimentacao.quantidadeMil % 1000 !== 0)) {
            throw new Error("Material ou unidade da movimentação inválidos.");
        }

        movimentacoesValidadas.push(movimentacao);
        const saldoMil = calcularSaldo(material.id, movimentacoesValidadas);

        if (!Number.isSafeInteger(saldoMil) || saldoMil < 0) {
            throw new Error("O histórico contém um saldo inválido.");
        }

        identificadoresMovimentacoes.push(movimentacao.id);
    }
}

function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem-sistema");

    if (mensagem) {
        mensagem.textContent = texto;
        mensagem.className = "mensagem mb-4 mensagem-" + tipo;
        mensagem.hidden = false;
    }
}

function bloquearFormularios() {
    armazenamentoDisponivel = false;
    const campos = document.querySelectorAll("form fieldset");

    for (let indice = 0; indice < campos.length; indice++) {
        campos[indice].disabled = true;
    }
}

function carregarDados() {
    try {
        versaoLida = localStorage.getItem(chaveArmazenamento);

        if (versaoLida === null) {
            dados = { versao: 1, materiais: [], movimentacoes: [] };
        } else {
            const conteudo = JSON.parse(versaoLida);
            validarDados(conteudo);
            dados = conteudo;
        }

        armazenamentoDisponivel = true;
    } catch (erro) {
        dados = null;
        bloquearFormularios();
        mostrarMensagem("Não foi possível ler os dados deste navegador. Os registros existentes não foram apagados. Verifique o armazenamento e recarregue a página.", "erro");
        console.error("Falha ao ler o armazenamento:", erro.name);
    }
}

// Salva cadastros e histórico juntos. A memória só muda depois do salvamento.
function salvarDados(novosDados) {
    if (!armazenamentoDisponivel) {
        mostrarMensagem("O armazenamento está indisponível. Recarregue a página antes de tentar novamente.", "erro");
        return false;
    }

    try {
        const versaoAtual = localStorage.getItem(chaveArmazenamento);

        if (versaoAtual !== versaoLida) {
            bloquearFormularios();
            mostrarMensagem("Os dados foram alterados em outra aba. Recarregue esta página para continuar sem sobrescrever os registros.", "erro");
            return false;
        }

        validarDados(novosDados);
        const conteudo = JSON.stringify(novosDados);
        localStorage.setItem(chaveArmazenamento, conteudo);
        dados = novosDados;
        versaoLida = conteudo;
        return true;
    } catch (erro) {
        mostrarMensagem("Não foi possível salvar. Nenhuma alteração foi confirmada. Verifique o espaço e a permissão de armazenamento do navegador e tente novamente.", "erro");
        console.error("Falha ao salvar o armazenamento:", erro.name);
        return false;
    }
}

// Quantidades são inteiros em milésimos, evitando erros como 0,1 + 0,2.
function converterParaMilesimos(valor, unidade, permitirZero) {
    const texto = valor.trim();

    if (!Object.hasOwn(unidades, unidade)) {
        throw new Error("Selecione uma unidade de medida válida.");
    }

    if (unidade === "un" && !/^\d+$/.test(texto)) {
        throw new Error("Materiais em unidades aceitam somente números inteiros.");
    }

    if (!/^\d+([.,]\d{1,3})?$/.test(texto)) {
        throw new Error("Informe um número sem separador de milhar e com até três casas decimais.");
    }

    const partes = texto.replace(",", ".").split(".");
    let parteDecimal = "";

    if (partes.length === 2) {
        parteDecimal = partes[1];
    }

    const quantidadeMil = Number(partes[0] + parteDecimal.padEnd(3, "0"));

    if (!Number.isSafeInteger(quantidadeMil)) {
        throw new Error("A quantidade excede o limite numérico permitido.");
    }

    if (quantidadeMil === 0 && !permitirZero) {
        throw new Error("A quantidade deve ser maior que zero.");
    }

    return quantidadeMil;
}

function quantidadeParaCampo(quantidadeMil) {
    const parteInteira = Math.floor(quantidadeMil / 1000);
    const resto = quantidadeMil % 1000;

    if (resto === 0) {
        return String(parteInteira);
    }

    const parteDecimal = String(resto).padStart(3, "0").replace(/0+$/, "");
    return String(parteInteira) + "," + parteDecimal;
}

function formatarQuantidade(quantidadeMil) {
    const partes = quantidadeParaCampo(quantidadeMil).split(",");
    let texto = Number(partes[0]).toLocaleString("pt-BR");

    if (partes.length === 2) {
        texto += "," + partes[1];
    }

    return texto;
}

function obterSituacao(saldoMil, estoqueMinimoMil) {
    if (saldoMil === 0) {
        return { texto: "Esgotado", classe: "situacao-esgotado" };
    } else if (saldoMil <= estoqueMinimoMil) {
        return { texto: "Estoque baixo", classe: "situacao-baixo" };
    } else {
        return { texto: "Disponível", classe: "situacao-disponivel" };
    }
}

function gerarIdentificador(registros) {
    let maiorIdentificador = 0;

    for (let indice = 0; indice < registros.length; indice++) {
        if (registros[indice].id > maiorIdentificador) {
            maiorIdentificador = registros[indice].id;
        }
    }

    if (!Number.isSafeInteger(maiorIdentificador + 1)) {
        throw new Error("Não foi possível gerar um novo identificador.");
    }

    return maiorIdentificador + 1;
}

// Elementos e mensagens dos formulários

function criarCelula(linha, texto, classe) {
    const celula = document.createElement("td");
    celula.textContent = texto;

    if (classe) {
        celula.className = classe;
    }

    linha.appendChild(celula);
    return celula;
}

function criarSituacao(linha, saldoMil, estoqueMinimoMil) {
    const situacao = obterSituacao(saldoMil, estoqueMinimoMil);
    const celula = criarCelula(linha, "");
    const etiqueta = document.createElement("span");
    etiqueta.className = "situacao " + situacao.classe;
    etiqueta.textContent = situacao.texto;
    celula.appendChild(etiqueta);
}

function limparErroFormulario(formulario, identificadorMensagem) {
    const mensagem = document.getElementById(identificadorMensagem);
    mensagem.hidden = true;
    mensagem.textContent = "";
    const camposInvalidos = formulario.querySelectorAll("[aria-invalid]");

    for (let indice = 0; indice < camposInvalidos.length; indice++) {
        camposInvalidos[indice].removeAttribute("aria-invalid");
        camposInvalidos[indice].removeAttribute("aria-errormessage");
    }
}

function informarErroFormulario(identificadorMensagem, texto, campo) {
    const mensagem = document.getElementById(identificadorMensagem);
    mensagem.textContent = texto;
    mensagem.hidden = false;

    if (campo) {
        campo.setAttribute("aria-invalid", "true");
        campo.setAttribute("aria-errormessage", identificadorMensagem);
        campo.focus();
    }
}

// Cadastro, pesquisa e edição de materiais

function prepararMaterial(codigo, nome, categoria, unidade, minimo, identificador) {
    const codigoNormalizado = codigo.trim().toLocaleUpperCase("pt-BR");
    const nomeNormalizado = nome.trim();

    if (codigoNormalizado === "" || codigoNormalizado.length > 40) {
        throw new Error("Informe o código do material, com até 40 caracteres.");
    }

    if (nomeNormalizado === "" || nomeNormalizado.length > 120) {
        throw new Error("Informe o nome do material, com até 120 caracteres.");
    }

    if (!Object.hasOwn(categorias, categoria)) {
        throw new Error("Selecione uma categoria válida.");
    }

    if (!Object.hasOwn(unidades, unidade)) {
        throw new Error("Selecione uma unidade de medida válida.");
    }

    for (let indice = 0; indice < dados.materiais.length; indice++) {
        const material = dados.materiais[indice];

        if (material.id !== identificador &&
            material.codigo.trim().toLocaleUpperCase("pt-BR") === codigoNormalizado) {
            throw new Error("Já existe um material com esse código.");
        }
    }

    const materialAnterior = localizarMaterial(identificador, dados.materiais);

    if (materialAnterior && materialAnterior.unidade !== unidade &&
        possuiMovimentacoes(identificador, dados.movimentacoes)) {
        throw new Error("A unidade não pode mudar porque este material já possui movimentações.");
    }

    let identificadorMaterial = identificador;

    if (identificadorMaterial === null) {
        identificadorMaterial = gerarIdentificador(dados.materiais);
    }

    return {
        id: identificadorMaterial,
        codigo: codigoNormalizado,
        nome: nomeNormalizado,
        categoria: categoria,
        unidade: unidade,
        estoqueMinimoMil: converterParaMilesimos(minimo, unidade, true)
    };
}

function limparFormularioMaterial() {
    const formulario = document.getElementById("formulario-material");

    if (!formulario) {
        return;
    }

    formulario.reset();
    materialEmEdicao = null;
    document.getElementById("unidade-material").disabled = false;
    document.getElementById("titulo-cadastro").textContent = "Cadastrar material";
    document.getElementById("salvar-material").textContent = "Cadastrar material";
    document.getElementById("cancelar-edicao").hidden = true;
    limparErroFormulario(formulario, "erro-material");
}

function iniciarEdicaoMaterial(identificador) {
    if (!dados || !armazenamentoDisponivel) {
        return;
    }

    const material = localizarMaterial(identificador, dados.materiais);

    if (!material) {
        return;
    }

    limparFormularioMaterial();
    materialEmEdicao = identificador;
    document.getElementById("codigo-material").value = material.codigo;
    document.getElementById("nome-material").value = material.nome;
    document.getElementById("categoria-material").value = material.categoria;
    document.getElementById("unidade-material").value = material.unidade;
    document.getElementById("unidade-material").disabled = possuiMovimentacoes(identificador, dados.movimentacoes);
    document.getElementById("minimo-material").value = quantidadeParaCampo(material.estoqueMinimoMil);
    document.getElementById("titulo-cadastro").textContent = "Editar material";
    document.getElementById("salvar-material").textContent = "Salvar alterações";
    document.getElementById("cancelar-edicao").hidden = false;
    document.getElementById("codigo-material").focus();
}

function cadastrarMaterial(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    limparErroFormulario(formulario, "erro-material");

    if (!dados || !armazenamentoDisponivel) {
        mostrarMensagem("Recarregue a página para verificar o armazenamento antes de salvar.", "erro");
        return;
    }

    const campos = formulario.querySelectorAll("input, select");

    for (let indice = 0; indice < campos.length; indice++) {
        if (campos[indice].value.trim() === "") {
            informarErroFormulario("erro-material", "Preencha todos os campos obrigatórios.", campos[indice]);
            return;
        }
    }

    let material;

    try {
        material = prepararMaterial(
            document.getElementById("codigo-material").value,
            document.getElementById("nome-material").value,
            document.getElementById("categoria-material").value,
            document.getElementById("unidade-material").value,
            document.getElementById("minimo-material").value,
            materialEmEdicao
        );
    } catch (erro) {
        informarErroFormulario("erro-material", erro.message);
        return;
    }

    const novosMateriais = dados.materiais.slice();
    let textoSucesso = "Material cadastrado. Saldo inicial: zero.";

    if (materialEmEdicao === null) {
        novosMateriais.push(material);
    } else {
        for (let indice = 0; indice < novosMateriais.length; indice++) {
            if (novosMateriais[indice].id === materialEmEdicao) {
                novosMateriais[indice] = material;
            }
        }

        textoSucesso = "Dados do material atualizados. O histórico foi preservado.";
    }

    const novosDados = { versao: 1, materiais: novosMateriais, movimentacoes: dados.movimentacoes };

    if (salvarDados(novosDados)) {
        limparFormularioMaterial();
        renderizarMateriais();
        mostrarMensagem(textoSucesso, "sucesso");
    }
}

function renderizarMateriais() {
    const lista = document.getElementById("lista-materiais");

    if (!lista) {
        return;
    }

    lista.replaceChildren();
    const vazio = document.getElementById("vazio-materiais");
    const tabela = document.getElementById("tabela-materiais");
    const resumo = document.getElementById("resumo-materiais");

    if (!dados) {
        tabela.hidden = true;
        vazio.hidden = false;
        vazio.textContent = "Não foi possível consultar os materiais. Verifique a mensagem acima.";
        resumo.textContent = "Consulta indisponível.";
        return;
    }

    const pesquisa = document.getElementById("pesquisa-material").value.trim().toLocaleLowerCase("pt-BR");
    let quantidadeEncontrada = 0;

    for (let indice = 0; indice < dados.materiais.length; indice++) {
        const material = dados.materiais[indice];

        if (!material.nome.toLocaleLowerCase("pt-BR").includes(pesquisa) &&
            !material.codigo.toLocaleLowerCase("pt-BR").includes(pesquisa)) {
            continue;
        }

        const linha = document.createElement("tr");
        const saldoMil = calcularSaldo(material.id, dados.movimentacoes);
        criarCelula(linha, material.codigo);
        criarCelula(linha, material.nome);
        criarCelula(linha, categorias[material.categoria]);
        criarCelula(linha, unidades[material.unidade]);
        criarCelula(linha, formatarQuantidade(material.estoqueMinimoMil), "text-end");
        criarCelula(linha, formatarQuantidade(saldoMil), "text-end");
        criarSituacao(linha, saldoMil, material.estoqueMinimoMil);
        const celulaAcao = criarCelula(linha, "");
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "btn btn-outline-primary btn-sm";
        botao.textContent = "Editar";
        botao.setAttribute("aria-label", "Editar material " + material.codigo);
        botao.disabled = !armazenamentoDisponivel;
        botao.addEventListener("click", function () {
            iniciarEdicaoMaterial(material.id);
        });
        celulaAcao.appendChild(botao);
        lista.appendChild(linha);
        quantidadeEncontrada++;
    }

    resumo.textContent = quantidadeEncontrada + " de " + dados.materiais.length + " material(is).";
    tabela.hidden = quantidadeEncontrada === 0;
    vazio.hidden = quantidadeEncontrada !== 0;

    if (dados.materiais.length === 0) {
        vazio.textContent = "Nenhum material cadastrado. Utilize o formulário para começar.";
    } else {
        vazio.textContent = "Nenhum material encontrado para esta pesquisa.";
    }
}

// Inicialização compartilhada: cada página utiliza somente os elementos existentes.

destacarPaginaAtual();
carregarDados();

const formularioMaterial = document.getElementById("formulario-material");

if (formularioMaterial) {
    formularioMaterial.addEventListener("submit", cadastrarMaterial);
    document.getElementById("cancelar-edicao").addEventListener("click", limparFormularioMaterial);
    document.getElementById("pesquisa-material").addEventListener("input", renderizarMateriais);
    renderizarMateriais();
}

window.addEventListener("storage", function (evento) {
    if (evento.key === chaveArmazenamento || evento.key === null) {
        bloquearFormularios();
        mostrarMensagem("O armazenamento foi alterado em outra aba. Recarregue esta página antes de continuar.", "erro");
    }
});
