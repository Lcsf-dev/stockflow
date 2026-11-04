// Dados e armazenamento local

const chaveArmazenamento = "stockflow.dados";
const categorias = {
    "materia-prima": "Matérias-primas",
    "componentes": "Peças e componentes",
    "ferramentas": "Ferramentas e acessórios",
    "seguranca": "EPI e segurança",
    "eletricos": "Materiais elétricos",
    "hidraulicos": "Materiais hidráulicos e pneumáticos",
    "limpeza": "Limpeza e higiene",
    "manutencao": "Lubrificantes e produtos de manutenção",
    "embalagens": "Embalagens",
    "escritorio": "Materiais de escritório",
    "consumo": "Materiais de consumo",
    "outros": "Outros"
};
// As chaves são mantidas iguais às do armazenamento anterior.
const unidades = { "un": "un", "kg": "kg", "m": "m", "l": "L" };
// dados reúne materiais e movimentações; só é atualizado após salvar com sucesso.
let dados = null;
let armazenamentoDisponivel = false;
let materialEmEdicao = null;

// O mesmo script atende duas páginas. Um formulário ausente terá valor null.
const formularioMaterial = document.getElementById("formulario-material");
const formularioMovimentacao = document.getElementById("formulario-movimentacao");
const campoPesquisa = document.getElementById("pesquisa-material");

// Procura um material pelo identificador; retorna null quando ele não existe.
function localizarMaterial(identificador, materiais) {
    for (let indice = 0; indice < materiais.length; indice++) {
        if (materiais[indice].id === identificador) {
            return materiais[indice];
        }
    }

    return null;
}

// Verifica se o histórico impede a troca da unidade do material.
function possuiMovimentacoes(identificador, movimentacoes) {
    for (let indice = 0; indice < movimentacoes.length; indice++) {
        if (movimentacoes[indice].materialId === identificador) {
            return true;
        }
    }

    return false;
}

// Recebe o ID e o histórico; soma entradas e desconta saídas, devolvendo milésimos.
function calcularSaldo(identificador, movimentacoes) {
    let saldoEmMilesimos = 0;

    for (let indice = 0; indice < movimentacoes.length; indice++) {
        const movimentacao = movimentacoes[indice];

        if (movimentacao.materialId === identificador) {
            if (movimentacao.tipo === "entrada") {
                saldoEmMilesimos += movimentacao.quantidadeMil;
            } else {
                saldoEmMilesimos -= movimentacao.quantidadeMil;
            }
        }
    }

    return saldoEmMilesimos;
}

// Recebe o JSON lido e verifica o formato básico, sem recalcular todo o histórico.
function validarDados(conteudo) {
    if (!conteudo || conteudo.versao !== 1 ||
        !Array.isArray(conteudo.materiais) || !Array.isArray(conteudo.movimentacoes)) {
        throw new Error("Formato de armazenamento não reconhecido.");
    }

    for (let indice = 0; indice < conteudo.materiais.length; indice++) {
        const material = conteudo.materiais[indice];

        if (!material || !Number.isSafeInteger(material.id) || material.id <= 0 ||
            typeof material.codigo !== "string" || typeof material.nome !== "string" ||
            !Object.hasOwn(categorias, material.categoria) || !Object.hasOwn(unidades, material.unidade) ||
            !Number.isSafeInteger(material.estoqueMinimoMil) || material.estoqueMinimoMil < 0) {
            throw new Error("Formato de material não reconhecido.");
        }
    }

    for (let indice = 0; indice < conteudo.movimentacoes.length; indice++) {
        const movimentacao = conteudo.movimentacoes[indice];

        if (!movimentacao || !Number.isSafeInteger(movimentacao.id) || movimentacao.id <= 0 ||
            !localizarMaterial(movimentacao.materialId, conteudo.materiais) ||
            (movimentacao.tipo !== "entrada" && movimentacao.tipo !== "saida") ||
            !Number.isSafeInteger(movimentacao.quantidadeMil) || movimentacao.quantidadeMil <= 0 ||
            !Object.hasOwn(unidades, movimentacao.unidade) ||
            typeof movimentacao.observacao !== "string" || typeof movimentacao.data !== "string" ||
            Number.isNaN(Date.parse(movimentacao.data))) {
            throw new Error("Formato de movimentação não reconhecido.");
        }
    }
}

// Mostra um aviso geral. O tipo escolhe a cor de sucesso ou de erro.
function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem-sistema");

    if (mensagem) {
        mensagem.textContent = texto;
        mensagem.className = "mensagem mb-4 mensagem-" + tipo;
        mensagem.hidden = false;
    }
}

// Esconde o aviso da operação anterior ao iniciar uma nova tentativa.
function ocultarMensagem() {
    const mensagem = document.getElementById("mensagem-sistema");

    if (mensagem) {
        mensagem.hidden = true;
    }
}

// Lê o armazenamento; se houver falha, preserva os registros e bloqueia gravações.
function carregarDados() {
    try {
        const conteudoSalvo = localStorage.getItem(chaveArmazenamento);

        if (conteudoSalvo === null) {
            dados = { versao: 1, materiais: [], movimentacoes: [] };
        } else {
            const conteudo = JSON.parse(conteudoSalvo);
            validarDados(conteudo);
            dados = conteudo;
        }

        armazenamentoDisponivel = true;
    } catch (erro) {
        dados = null;
        armazenamentoDisponivel = false;
        const gruposDeCampos = document.querySelectorAll("form fieldset");
        for (let indice = 0; indice < gruposDeCampos.length; indice++) {
            gruposDeCampos[indice].disabled = true;
        }
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
        const conteudo = JSON.stringify(novosDados);
        localStorage.setItem(chaveArmazenamento, conteudo);
        dados = novosDados;
        return true;
    } catch (erro) {
        mostrarMensagem("Não foi possível salvar. Nenhuma alteração foi confirmada. Verifique o espaço e a permissão de armazenamento do navegador e tente novamente.", "erro");
        console.error("Falha ao salvar o armazenamento:", erro.name);
        return false;
    }
}

// Armazenamos quantidades em milésimos: 1,5 kg vira 1500. Na exibição, convertemos de volta.
// Recebe o texto e a unidade, valida as casas decimais e devolve um inteiro seguro.
function converterParaMilesimos(valor, unidade, permitirZero) {
    const texto = valor.trim();

    if (!Object.hasOwn(unidades, unidade)) {
        throw new Error("Selecione uma unidade de medida válida.");
    }

    // Esta expressão aceita apenas algarismos: unidades não podem ter frações.
    if (unidade === "un" && !/^\d+$/.test(texto)) {
        throw new Error("Materiais em unidades aceitam somente números inteiros.");
    }

    // Aceita vírgula ou ponto e até três casas; rejeita negativos e separadores de milhar.
    if (!/^\d+([.,]\d{1,3})?$/.test(texto)) {
        throw new Error("Informe um número sem separador de milhar e com até três casas decimais.");
    }

    const partes = texto.replace(",", ".").split(".");
    let parteDecimal = "";

    if (partes.length === 2) {
        parteDecimal = partes[1];
    }

    // Completa a fração: "1,5" vira "1" + "500", sem somar números decimais.
    const quantidadeEmMilesimos = Number(partes[0] + parteDecimal.padEnd(3, "0"));

    if (!Number.isSafeInteger(quantidadeEmMilesimos)) {
        throw new Error("A quantidade excede o limite numérico permitido.");
    }

    if (quantidadeEmMilesimos === 0 && !permitirZero) {
        throw new Error("A quantidade deve ser maior que zero.");
    }

    return quantidadeEmMilesimos;
}

// Recebe milésimos e devolve um texto decimal sem separador de milhar para edição.
function quantidadeParaCampo(quantidadeEmMilesimos) {
    // Em 1500, o resto 500 é a fração. Retiramos o resto antes de dividir.
    const resto = quantidadeEmMilesimos % 1000;
    const parteInteira = (quantidadeEmMilesimos - resto) / 1000;
    if (resto === 0) {
        return String(parteInteira);
    }
    const parteDecimal = String(resto).padStart(3, "0").replace(/0+$/, "");
    return parteInteira + "," + parteDecimal;
}

// Acrescenta os separadores brasileiros somente para mostrar a quantidade na tela.
function formatarQuantidade(quantidadeEmMilesimos) {
    const partes = quantidadeParaCampo(quantidadeEmMilesimos).split(",");
    let texto = Number(partes[0]).toLocaleString("pt-BR");

    if (partes.length === 2) {
        texto += "," + partes[1];
    }

    return texto;
}

// Verifica primeiro o saldo zero para não confundir esgotado com estoque baixo.
function obterSituacao(saldoEmMilesimos, estoqueMinimoEmMilesimos) {
    if (saldoEmMilesimos === 0) {
        return { texto: "Esgotado", classe: "situacao-esgotado" };
    } else if (saldoEmMilesimos <= estoqueMinimoEmMilesimos) {
        return { texto: "Estoque baixo", classe: "situacao-baixo" };
    } else {
        return { texto: "Disponível", classe: "situacao-disponivel" };
    }
}

// Usa o maior identificador existente mais um, preservando os registros antigos.
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

// Cria uma célula de tabela. textContent mostra o texto sem executar HTML digitado.
function criarCelula(linha, texto, classe) {
    const celula = document.createElement("td");
    celula.textContent = texto;

    if (classe) {
        celula.className = classe;
    }

    linha.appendChild(celula);
    return celula;
}

// Mostra a situação com palavras e cor, facilitando a identificação do estoque.
function criarSituacao(linha, saldoEmMilesimos, estoqueMinimoEmMilesimos) {
    const situacao = obterSituacao(saldoEmMilesimos, estoqueMinimoEmMilesimos);
    const celula = criarCelula(linha, "");
    const etiqueta = document.createElement("span");
    etiqueta.className = "situacao " + situacao.classe;
    etiqueta.textContent = situacao.texto;
    celula.appendChild(etiqueta);
}

// Remove o aviso anterior e a marcação de campos inválidos.
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

// Mostra o motivo do erro e, quando informado, leva o foco ao campo.
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

// Limpa avisos anteriores e verifica os campos obrigatórios dos dois formulários.
function validarFormulario(formulario, identificadorMensagem) {
    limparErroFormulario(formulario, identificadorMensagem);
    ocultarMensagem();
    if (!dados || !armazenamentoDisponivel) {
        mostrarMensagem("Recarregue a página para verificar o armazenamento antes de salvar.", "erro");
        return false;
    }
    const campos = formulario.querySelectorAll("[required]");
    for (let indice = 0; indice < campos.length; indice++) {
        const campo = campos[indice];
        // Campos bloqueados na edição não precisam ser preenchidos novamente.
        if (!campo.disabled && campo.value.trim() === "") {
            informarErroFormulario(identificadorMensagem, "Preencha todos os campos obrigatórios.", campo);
            return false;
        }
    }
    return true;
}

// Materiais: cadastro, pesquisa e edição

// Recebe os campos do cadastro e o ID em edição; devolve o material validado.
function prepararMaterial(cadastro, identificador) {
    const codigo = cadastro.codigo.trim().toLocaleUpperCase("pt-BR");
    const nome = cadastro.nome.trim();
    if (codigo === "" || codigo.length > 40) {
        throw new Error("Informe o código do material, com até 40 caracteres.");
    }
    if (nome === "" || nome.length > 120) {
        throw new Error("Informe o nome do material, com até 120 caracteres.");
    }
    if (!Object.hasOwn(categorias, cadastro.categoria) || !Object.hasOwn(unidades, cadastro.unidade)) {
        throw new Error("Selecione uma categoria e uma unidade válidas.");
    }
    // Na edição, o próprio material pode continuar usando seu código.
    for (let indice = 0; indice < dados.materiais.length; indice++) {
        const material = dados.materiais[indice];
        if (material.id !== identificador && material.codigo.trim().toLocaleUpperCase("pt-BR") === codigo) {
            throw new Error("Já existe um material com esse código.");
        }
    }
    const materialAnterior = localizarMaterial(identificador, dados.materiais);
    if (materialAnterior && materialAnterior.unidade !== cadastro.unidade &&
        possuiMovimentacoes(identificador, dados.movimentacoes)) {
        throw new Error("A unidade não pode mudar porque este material já possui movimentações.");
    }
    if (identificador === null) {
        identificador = gerarIdentificador(dados.materiais);
    }
    return {
        id: identificador,
        codigo: codigo,
        nome: nome,
        categoria: cadastro.categoria,
        unidade: cadastro.unidade,
        estoqueMinimoMil: converterParaMilesimos(cadastro.minimo, cadastro.unidade, true)
    };
}

// Volta ao modo de cadastro e libera os campos bloqueados durante a edição.
function limparFormularioMaterial() {
    formularioMaterial.reset();
    materialEmEdicao = null;
    // elements acessa os campos pelo atributo name definido no HTML.
    const campos = formularioMaterial.elements;
    campos.unidade.disabled = false;
    campos.quantidadeInicial.disabled = false;
    document.getElementById("titulo-cadastro").textContent = "Cadastrar material";
    document.getElementById("salvar-material").textContent = "Cadastrar material";
    document.getElementById("cancelar-edicao").hidden = true;
    limparErroFormulario(formularioMaterial, "erro-material");
}

// Preenche o formulário com o material escolhido, preservando seu histórico.
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
    const campos = formularioMaterial.elements;
    campos.codigo.value = material.codigo;
    campos.nome.value = material.nome;
    campos.categoria.value = material.categoria;
    campos.unidade.value = material.unidade;
    campos.unidade.disabled = possuiMovimentacoes(identificador, dados.movimentacoes);
    campos.estoqueMinimo.value = quantidadeParaCampo(material.estoqueMinimoMil);
    // O saldo não é editado aqui: somente entradas e saídas o alteram.
    campos.quantidadeInicial.disabled = true;
    document.getElementById("titulo-cadastro").textContent = "Editar material";
    document.getElementById("salvar-material").textContent = "Salvar alterações";
    document.getElementById("cancelar-edicao").hidden = false;
    campos.codigo.focus();
}

// Recebe o envio do formulário, valida os campos e confirma somente após salvar.
function cadastrarMaterial(evento) {
    evento.preventDefault(); // Evita que o navegador recarregue a página ao enviar.
    if (!validarFormulario(formularioMaterial, "erro-material")) {
        return;
    }
    const campos = formularioMaterial.elements;
    try {
        const cadastro = {
            codigo: campos.codigo.value,
            nome: campos.nome.value,
            categoria: campos.categoria.value,
            unidade: campos.unidade.value,
            minimo: campos.estoqueMinimo.value
        };
        const material = prepararMaterial(cadastro, materialEmEdicao);
        let quantidadeInicialEmMilesimos = 0;
        if (materialEmEdicao === null) {
            quantidadeInicialEmMilesimos = converterParaMilesimos(campos.quantidadeInicial.value, material.unidade, true);
        }
        if (salvarMaterial(material, quantidadeInicialEmMilesimos)) {
            limparFormularioMaterial();
            exibirMateriais();
            atualizarIndicadores();
            mostrarMensagem("Material salvo. O saldo e o histórico estão atualizados.", "sucesso");
        }
    } catch (erro) {
        informarErroFormulario("erro-material", erro.message);
    }
}

// Recebe o material validado e a quantidade inicial; salva cadastro e entrada juntos.
function salvarMaterial(material, quantidadeInicialEmMilesimos) {
    // slice cria cópias: uma falha ao salvar não deve mudar os dados em memória.
    const novosMateriais = dados.materiais.slice();
    const novasMovimentacoes = dados.movimentacoes.slice();

    if (materialEmEdicao === null) {
        novosMateriais.push(material);

        // A entrada inicial é criada somente no cadastro, nunca durante a edição.
        if (quantidadeInicialEmMilesimos > 0) {
            novasMovimentacoes.push({
                id: gerarIdentificador(novasMovimentacoes),
                materialId: material.id,
                tipo: "entrada",
                quantidadeMil: quantidadeInicialEmMilesimos,
                unidade: material.unidade,
                data: new Date().toISOString(),
                observacao: "Estoque inicial"
            });
        }
    } else {
        for (let indice = 0; indice < novosMateriais.length; indice++) {
            if (novosMateriais[indice].id === material.id) {
                novosMateriais[indice] = material;
            }
        }
    }

    return salvarDados({ versao: 1, materiais: novosMateriais, movimentacoes: novasMovimentacoes });
}

// Lê a pesquisa e os dados e monta a tabela usando textos seguros.
function exibirMateriais() {
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

    const pesquisa = campoPesquisa.value.trim().toLocaleLowerCase("pt-BR");
    let quantidadeEncontrada = 0;

    for (let indice = 0; indice < dados.materiais.length; indice++) {
        const material = dados.materiais[indice];

        if (!material.nome.toLocaleLowerCase("pt-BR").includes(pesquisa) &&
            !material.codigo.toLocaleLowerCase("pt-BR").includes(pesquisa)) {
            continue;
        }

        const linha = document.createElement("tr");
        const saldoEmMilesimos = calcularSaldo(material.id, dados.movimentacoes);
        criarCelula(linha, material.codigo);
        criarCelula(linha, material.nome);
        criarCelula(linha, categorias[material.categoria]);
        criarCelula(linha, unidades[material.unidade]);
        criarCelula(linha, formatarQuantidade(material.estoqueMinimoMil), "text-end");
        criarCelula(linha, formatarQuantidade(saldoEmMilesimos), "text-end");
        criarSituacao(linha, saldoEmMilesimos, material.estoqueMinimoMil);
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

// Movimentações: entradas, saídas e histórico

// Recebe os dados da operação; valida quantidade e saldo e devolve a movimentação.
function prepararMovimentacao(identificador, tipo, quantidade, observacao) {
    const material = localizarMaterial(identificador, dados.materiais);

    if (!material) {
        throw new Error("Selecione um material cadastrado.");
    }

    if (tipo !== "entrada" && tipo !== "saida") {
        throw new Error("Selecione o tipo: entrada ou saída.");
    }

    if (observacao.trim().length > 500) {
        throw new Error("A observação deve ter até 500 caracteres.");
    }

    const quantidadeEmMilesimos = converterParaMilesimos(quantidade, material.unidade, false);
    const saldoEmMilesimos = calcularSaldo(material.id, dados.movimentacoes);

    if (tipo === "saida" && quantidadeEmMilesimos > saldoEmMilesimos) {
        throw new Error("Saída bloqueada. Saldo disponível: " + formatarQuantidade(saldoEmMilesimos) + " " + unidades[material.unidade] + ".");
    }

    if (tipo === "entrada" && quantidadeEmMilesimos > Number.MAX_SAFE_INTEGER - saldoEmMilesimos) {
        throw new Error("A entrada ultrapassa o limite numérico do saldo.");
    }

    return {
        id: gerarIdentificador(dados.movimentacoes),
        materialId: material.id,
        tipo: tipo,
        quantidadeMil: quantidadeEmMilesimos,
        unidade: material.unidade,
        data: new Date().toISOString(),
        observacao: observacao.trim()
    };
}

// Atualiza o saldo e a orientação de quantidade quando o usuário escolhe um material.
function atualizarSaldoSelecionado() {
    const campos = formularioMovimentacao.elements;
    const material = localizarMaterial(Number(campos.material.value), dados.materiais);
    const saldo = document.getElementById("saldo-selecionado");
    const ajuda = document.getElementById("ajuda-quantidade");
    campos.quantidade.inputMode = "decimal";
    if (!material) {
        saldo.textContent = "Selecione um material para consultar o saldo.";
        ajuda.textContent = "Informe uma quantidade maior que zero.";
        return;
    }
    const saldoEmMilesimos = calcularSaldo(material.id, dados.movimentacoes);
    saldo.textContent = "Saldo disponível: " + formatarQuantidade(saldoEmMilesimos) + " " + unidades[material.unidade] + ".";
    if (material.unidade === "un") {
        ajuda.textContent = "Informe uma quantidade inteira de unidades, maior que zero.";
        campos.quantidade.inputMode = "numeric";
    } else {
        ajuda.textContent = "Quantidade em " + unidades[material.unidade] + ", com até três casas decimais. Use vírgula ou ponto, sem separador de milhar.";
    }
}

// Preenche as opções do formulário; sem materiais, bloqueia novas operações.
function preencherMateriaisMovimentacao() {
    const seletor = formularioMovimentacao.elements.material;
    const aviso = document.getElementById("aviso-sem-materiais");
    const campos = document.getElementById("campos-movimentacao");
    if (!dados) {
        campos.disabled = true;
        aviso.textContent = "Não foi possível consultar os materiais. Verifique a mensagem acima.";
        aviso.hidden = false;
        return;
    }
    campos.disabled = !armazenamentoDisponivel || dados.materiais.length === 0;
    aviso.hidden = dados.materiais.length !== 0;
    for (let indice = 0; indice < dados.materiais.length; indice++) {
        const material = dados.materiais[indice];
        const opcao = document.createElement("option");
        opcao.value = String(material.id);
        opcao.textContent = material.codigo + " — " + material.nome + " (" + unidades[material.unidade] + ")";
        seletor.appendChild(opcao);
    }
}

// Recebe o envio do formulário e grava uma operação válida antes de atualizar a tela.
function registrarMovimentacao(evento) {
    evento.preventDefault();
    if (!validarFormulario(formularioMovimentacao, "erro-movimentacao")) {
        return;
    }
    const campos = formularioMovimentacao.elements;
    try {
        const movimentacao = prepararMovimentacao(
            Number(campos.material.value), campos.tipo.value,
            campos.quantidade.value, campos.observacao.value
        );
        // A cópia preserva os dados atuais caso o salvamento falhe.
        const novasMovimentacoes = dados.movimentacoes.slice();
        novasMovimentacoes.push(movimentacao);
        if (salvarDados({ versao: 1, materiais: dados.materiais, movimentacoes: novasMovimentacoes })) {
            campos.quantidade.value = "";
            campos.observacao.value = "";
            atualizarSaldoSelecionado();
            exibirMovimentacoes();
            mostrarMensagem("Movimentação registrada e saldo atualizado.", "sucesso");
        }
    } catch (erro) {
        informarErroFormulario("erro-movimentacao", erro.message);
    }
}

// Mostra o histórico salvo do registro mais recente ao mais antigo.
function exibirMovimentacoes() {
    const lista = document.getElementById("lista-movimentacoes");

    if (!lista) {
        return;
    }

    lista.replaceChildren();
    const vazio = document.getElementById("vazio-movimentacoes");
    const tabela = document.getElementById("tabela-movimentacoes");
    const resumo = document.getElementById("resumo-movimentacoes");

    if (!dados) {
        tabela.hidden = true;
        vazio.hidden = false;
        vazio.textContent = "Não foi possível consultar o histórico. Verifique a mensagem acima.";
        resumo.textContent = "Consulta indisponível.";
        return;
    }

    resumo.textContent = dados.movimentacoes.length + " movimentação(ões).";
    tabela.hidden = dados.movimentacoes.length === 0;
    vazio.hidden = dados.movimentacoes.length !== 0;

    // Percorre de trás para frente para mostrar primeiro os registros mais recentes.
    for (let indice = dados.movimentacoes.length - 1; indice >= 0; indice--) {
        const movimentacao = dados.movimentacoes[indice];
        const material = localizarMaterial(movimentacao.materialId, dados.materiais);
        const linha = document.createElement("tr");
        criarCelula(linha, material.codigo + " — " + material.nome);
        let textoTipo = "Entrada";

        if (movimentacao.tipo === "saida") {
            textoTipo = "Saída";
        }

        criarCelula(linha, textoTipo);
        criarCelula(linha, formatarQuantidade(movimentacao.quantidadeMil), "text-end");
        criarCelula(linha, unidades[movimentacao.unidade]);
        const celulaData = criarCelula(linha, "");
        const data = document.createElement("time");
        data.dateTime = movimentacao.data;
        data.textContent = new Date(movimentacao.data).toLocaleString("pt-BR");
        celulaData.appendChild(data);
        let observacao = "Sem observação";

        if (movimentacao.observacao !== "") {
            observacao = movimentacao.observacao;
        }

        criarCelula(linha, observacao);
        lista.appendChild(linha);
    }
}

// Indicadores e alertas de reposição

// Conta materiais por situação, sem somar quantidades de unidades diferentes.

function atualizarIndicadores() {
    const total = document.getElementById("total-materiais");
    if (!total) {
        return; // A página de movimentações não possui indicadores.
    }
    const baixos = document.getElementById("total-baixos");
    const esgotados = document.getElementById("total-esgotados");
    if (!dados) {
        total.textContent = "—";
        baixos.textContent = "—";
        esgotados.textContent = "—";
        return;
    }
    let quantidadeBaixos = 0;
    let quantidadeEsgotados = 0;
    for (let indice = 0; indice < dados.materiais.length; indice++) {
        const material = dados.materiais[indice];
        const saldoEmMilesimos = calcularSaldo(material.id, dados.movimentacoes);
        if (saldoEmMilesimos === 0) {
            quantidadeEsgotados++;
        } else if (saldoEmMilesimos <= material.estoqueMinimoMil) {
            quantidadeBaixos++;
        }
    }
    total.textContent = String(dados.materiais.length);
    baixos.textContent = String(quantidadeBaixos);
    esgotados.textContent = String(quantidadeEsgotados);
}

// Inicialização: o defer do HTML faz este trecho rodar após a criação da página.
console.log("StockFlow carregado:", document.title);
carregarDados();

if (formularioMaterial) {
    formularioMaterial.addEventListener("submit", cadastrarMaterial);
    document.getElementById("cancelar-edicao").addEventListener("click", limparFormularioMaterial);
    campoPesquisa.addEventListener("input", exibirMateriais);
    exibirMateriais();
    atualizarIndicadores();
}

if (formularioMovimentacao) {
    formularioMovimentacao.addEventListener("submit", registrarMovimentacao);
    formularioMovimentacao.elements.material.addEventListener("change", atualizarSaldoSelecionado);
    preencherMateriaisMovimentacao();
    exibirMovimentacoes();
}

// O Bootstrap controla os slides; este evento atualiza somente o texto da posição.
const carrossel = document.getElementById("carrossel-recursos");
if (carrossel && typeof bootstrap !== "undefined") {
    new bootstrap.Carousel(carrossel, { interval: false, ride: false });
    carrossel.addEventListener("slid.bs.carousel", function (evento) {
        document.getElementById("status-carrossel").textContent = (evento.to + 1) + " de 3";
    });
}
