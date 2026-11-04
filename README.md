# StockFlow

**Sua indústria em movimento, seu estoque sob controle.**

**Acesse o sistema:** [stockflowbr.netlify.app](https://stockflowbr.netlify.app).

## 📦 O que é o StockFlow

O StockFlow é um sistema de controle de estoque industrial para pequenas
indústrias. Permite organizar materiais, registrar entradas e saídas,
consultar saldos e identificar necessidades de reposição.

O sistema começa com listas vazias. Os materiais e as quantidades são
informados manualmente pelos usuários nos formulários.

## 🎯 Objetivo

Facilitar o acompanhamento de matérias-primas, componentes, embalagens
e materiais de consumo, mantendo o cadastro e o histórico de movimentações
no navegador utilizado.

## 🛠️ Tecnologias

- HTML5: estrutura semântica das páginas e formulários.
- CSS3: identidade visual e adaptação para telas pequenas.
- JavaScript puro: validações, cálculos e atualização da interface.
- Bootstrap 5.3.8: grid, navegação responsiva e carrossel.
- localStorage com JSON: persistência dos cadastros e movimentações.

O Bootstrap é carregado por CDN e depende de conexão com a internet.
O projeto não utiliza npm, ferramentas de build, backend ou banco de dados.

O Bootstrap é distribuído sob a [licença MIT](https://github.com/twbs/bootstrap/blob/v5.3.8/LICENSE).

## 📄 Páginas e funcionalidades

| Página | Funcionalidades |
| --- | --- |
| `index.html` | Total de materiais, contagem de estoque baixo e esgotados, lista de reposição. |
| `materials.html` | Cadastro, pesquisa por código ou nome, edição, saldos e situação dos materiais. |
| `movements.html` | Entradas, saídas, consulta do saldo e histórico com data, hora e observação. |
| `about.html` | Apresentação, benefícios, exemplos e carrossel de três recursos. |

Regras principais:

- Todo material começa com saldo zero.
- O saldo muda somente por entradas e saídas.
- Códigos são normalizados para maiúsculas e não podem ser duplicados.
- A edição preserva o identificador e as movimentações.
- A unidade fica bloqueada após a primeira movimentação.
- Saídas superiores ao saldo são bloqueadas.
- Unidades inteiras não aceitam frações.
- Quilogramas, metros e litros aceitam até três casas decimais.
- Entradas e saídas inválidas não alteram o histórico.
- Os indicadores contam materiais; não somam quantidades de unidades diferentes.

A situação segue esta ordem:

1. Saldo zero: **Esgotado**.
2. Saldo positivo menor ou igual ao mínimo: **Estoque baixo**.
3. Saldo acima do mínimo: **Disponível**.

## 📁 Organização dos arquivos

```text
StockFlow/
├── index.html
├── materials.html
├── movements.html
├── about.html
├── style.css
├── script.js
├── README.md
└── images/
    ├── logo-stockflow.png
    └── symbol-stockflow.png
```

A pasta técnica `.git` mantém o histórico de versionamento.

## ▶️ Como executar com Live Server

1. Abra a pasta do projeto no Visual Studio Code.
2. Instale a extensão Live Server, caso ainda não esteja instalada.
3. Clique com o botão direito em `index.html`.
4. Selecione **Open with Live Server**.
5. Mantenha a internet disponível para carregar o Bootstrap.

Não é necessário compilar ou instalar dependências do projeto.

Os arquivos também podem ser hospedados como um site estático no Netlify.
Nesse caso, não há comando de build: o diretório publicado é a raiz
que contém `index.html`.

A versão publicada utiliza envio direto dos arquivos estáticos.
Enviar commits ao GitHub não atualiza automaticamente a hospedagem;
alterações no sistema precisam de uma nova publicação no Netlify.

## 🧭 Como usar o sistema

1. Abra **Materiais** e informe código, nome, categoria, unidade e estoque mínimo.
2. Clique em **Cadastrar material**. O material será criado com saldo zero.
3. Use a pesquisa para localizar um código ou nome.
4. Clique em **Editar** para atualizar os dados cadastrais.
5. Abra **Movimentações** e selecione o material.
6. Escolha entrada ou saída e informe uma quantidade maior que zero.
7. Acrescente uma observação, se necessário, e registre a movimentação.
8. Consulte o histórico e retorne à **Visão geral** para acompanhar a reposição.

As categorias são matéria-prima, componentes, embalagens e materiais de consumo.
As unidades disponíveis são unidade (un), quilograma (kg), metro (m) e litro (L).

Use vírgula ou ponto como separador decimal, sem separador de milhar.
Por exemplo, `1,250` representa um inteiro e duzentos e cinquenta milésimos.
Para mil unidades, informe `1000`.

A data e a hora são geradas automaticamente e apresentadas no horário
local do navegador. Os registros mais recentes aparecem primeiro.

O carrossel da página Sobre avança pelos botões **Anterior** e **Próximo**,
sem reprodução automática.

## 💾 Armazenamento e limitações

Os dados são armazenados como JSON na chave `stockflow.dados` do localStorage.
Um único registro reúne materiais, movimentações e a versão do formato.

Os registros ficam no navegador e perfil utilizados, sem sincronização
entre computadores ou navegadores. Não há envio dos dados de estoque
para um servidor.

O armazenamento está associado à origem do endereço: protocolo, domínio
e porta. Os dados do Live Server não aparecem automaticamente no domínio
publicado no Netlify. Alterar a porta local também pode acessar outro
armazenamento.

Limpar os dados do site, usar navegação privada ou trocar de perfil pode
tornar os registros indisponíveis. O armazenamento local não substitui
uma cópia de segurança.

Se a leitura falhar ou os dados estiverem inválidos, o sistema informa
o problema e bloqueia gravações, preservando o conteúdo existente.
Se o salvamento falhar, não é anunciado sucesso, e os campos preenchidos
permanecem disponíveis para uma nova tentativa.

Quando uma mudança em outra aba é detectada, é necessário recarregar
a página antes de continuar. Evite registrar operações simultâneas
em várias abas: o armazenamento local não oferece transações entre abas.

Os cálculos usam números inteiros em milésimos. Valores que ultrapassam
o limite inteiro seguro do JavaScript são rejeitados.

## 🧩 Como o código está organizado

O `style.css` centraliza as cores no `:root`. O azul-marinho estrutura
a navegação e os títulos; o verde escuro destaca as ações; laranja
e vermelho identificam situações de atenção e erro junto aos textos.

O `script.js` é compartilhado entre as páginas e organizado em seções:

- **Navegação:** `destacarPaginaAtual` identifica o link atual.
- **Armazenamento:** `carregarDados`, `validarDados` e `salvarDados`
  verificam e persistem os registros.
- **Quantidades:** `converterParaMilesimos` valida a entrada;
  `formatarQuantidade` apresenta o resultado.
- **Materiais:** `prepararMaterial`, `cadastrarMaterial`,
  `iniciarEdicaoMaterial` e `renderizarMateriais` organizam o cadastro.
- **Movimentações:** `prepararMovimentacao`, `registrarMovimentacao`
  e `renderizarMovimentacoes` controlam o histórico.
- **Indicadores:** `resumirEstoque` e `renderizarVisaoGeral`
  identificam os materiais que precisam de reposição.

O saldo é calculado a partir do histórico. Assim, não existe um campo
de saldo que possa divergir das entradas e saídas.

As funções são declaradas com `function`. As condições `if` e `else`
validam entradas e classificam o estoque. Os laços `for` percorrem os
materiais e as movimentações.

O `console.log` da navegação informa qual página foi carregada.
O localStorage usa `getItem` e `setItem`, junto de `JSON.parse`
e `JSON.stringify`.

Os eventos são associados com `addEventListener`. Antes de atualizar
uma área ou associar eventos, o script verifica os elementos da página.
Os textos digitados são exibidos com `textContent`, sem interpretar HTML.

## 🧪 Verificações manuais

Utilize um cadastro destinado à conferência quando quiser executar
este roteiro. Nenhum dado de teste é carregado automaticamente.

- Abrir as quatro páginas e conferir o destaque do menu atual.
- Tentar cadastrar campos vazios ou preenchidos apenas com espaços.
- Tentar repetir um código alterando maiúsculas e minúsculas.
- Tentar informar estoque mínimo negativo ou não numérico.
- Cadastrar um material e conferir o saldo inicial zero.
- Pesquisar por código e por nome.
- Editar um material e confirmar a preservação de seu histórico.
- Registrar uma entrada e uma saída válidas.
- Tentar sair com quantidade superior ao saldo.
- Tentar registrar zero, valor negativo, texto ou mais de três casas decimais.
- Tentar registrar uma fração para um material em unidades.
- Em um material fracionável, registrar entradas de `0,1` e `0,2`
  e conferir o saldo de `0,3`.
- Após movimentar um material, conferir o bloqueio da unidade na edição.
- Verificar as situações esgotado, estoque baixo e disponível.
- Recarregar e navegar entre as páginas para conferir a persistência.
- Testar o menu, os formulários e a rolagem das tabelas em tela pequena.
- Navegar com Tab e conferir foco visível e o atalho para o conteúdo.
- Avançar e voltar pelos três slides da página Sobre.
- Alterar dados em outra aba e conferir o aviso para recarregar.

Verificações executadas durante o desenvolvimento:

- Sintaxe do JavaScript.
- Regras de cadastro, duplicidade, edição e quantidades.
- Entradas, saídas, precisão decimal, saldo insuficiente e limites numéricos.
- Leitura, persistência, conteúdo inválido e falha de salvamento em memória.
- Integração dos formulários, pesquisa, tabelas, mensagens e indicadores
  com os arquivos HTML em um DOM simulado.
- Inicialização e atualização do indicador do carrossel em ambiente simulado.
- Links locais, identificadores, rótulos e referências de acessibilidade.
- Respostas HTTPS das quatro páginas, CSS, JavaScript e imagens no Netlify.

A conferência visual em navegador real, a navegação por teclado
e o comportamento das animações do Bootstrap ainda precisam
ser verificados manualmente.

## 🌿 Colaboração com Git e branches

Repositório: [Lcsf-dev/stockflow](https://github.com/Lcsf-dev/stockflow).

- **Commit:** registra uma mudança no histórico local.
- **Push:** envia commits para o repositório remoto.
- **Pull:** recebe e integra alterações do repositório remoto.
- **Branch:** mantém uma linha separada de desenvolvimento.
- **Pull request:** apresenta alterações para revisão antes da integração.

A `main` reúne as versões revisadas. A implementação inicial está
na branch `feature/initial-structure`.

Fluxo da equipe:

1. Confira se não há alterações locais pendentes.
2. Atualize a `main`.
3. Crie uma branch específica.
4. Desenvolva uma tarefa coerente.
5. Verifique o comportamento e revise o diff.
6. Adicione somente os arquivos ou trechos da tarefa.
7. Faça um commit com uma mensagem precisa.
8. Envie a branch.
9. Abra um pull request e aguarde a revisão.

Exemplo de início de tarefa:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/materials
```

Depois de preparar e verificar os arquivos de uma mudança:

```bash
git diff --cached
git commit -m "feat: aprimora a consulta de materiais"
git push -u origin feature/materials
```

O nome da branch e a mensagem devem corresponder à tarefa real.
Não utilize commits vazios, force push ou compactação automática
do histórico. O merge na `main` depende de revisão.

## 🚀 Possibilidades de evolução

- Refinar a apresentação dos formulários e tabelas com base no uso.
- Ampliar as verificações de acessibilidade e compatibilidade.
- Avaliar novas necessidades de controle de estoque antes de ampliar o escopo.
