# 📦 StockFlow

Aplicação front-end de controle de estoque industrial, desenvolvida com HTML, CSS e JavaScript. Permite organizar materiais, registrar entradas e saídas e identificar necessidades de reposição em uma interface responsiva.

**Sua indústria em movimento, seu estoque sob controle.**

## 🌐 Acesso

Acesse a aplicação publicada na Vercel: **[stockflowbr.vercel.app](https://stockflowbr.vercel.app/)**.

O sistema funciona no navegador, sem servidor de aplicação ou banco de dados remoto. Os registros são armazenados localmente com `localStorage`.

## ⚙️ Funcionalidades

- **Cadastro de materiais:** código, nome, categoria, unidade de medida, quantidade inicial e estoque mínimo.
- **Organização em 12 categorias:** incluindo matérias-primas, peças e componentes, ferramentas e EPI.
- **Pesquisa e edição:** busca por nome ou código e atualização dos dados cadastrais sem apagar o histórico.
- **Movimentações:** registro de entradas e saídas com data e hora automáticas e observação opcional.
- **Histórico:** consulta das movimentações, com os registros mais recentes primeiro.
- **Indicadores:** quantidade de materiais cadastrados, com estoque baixo e esgotados.
- **Página inicial:** apresentação do sistema, seus objetivos e recursos, com atalhos para Estoque e Movimentações.
- **Interface responsiva:** navegação entre Início, Estoque e Movimentações, tabelas com rolagem horizontal em telas pequenas e carrossel de apresentação.

## 📋 Regras de estoque

- Cada material deve ter um código único, sem diferenciar letras maiúsculas e minúsculas.
- Uma quantidade inicial maior que zero gera automaticamente uma entrada no histórico, identificada como **Estoque inicial**.
- Após o cadastro, o saldo é alterado somente por entradas e saídas. A edição do material não permite alterar a quantidade inicial.
- As movimentações exigem quantidades maiores que zero, e saídas superiores ao saldo disponível são bloqueadas.
- Materiais em **unidades (un)** aceitam apenas quantidades inteiras. **Quilogramas (kg), metros (m) e litros (L)** aceitam até três casas decimais.
- Os campos de quantidade aceitam vírgula ou ponto como separador decimal, sem separador de milhar.
- A unidade de medida não pode ser alterada depois que o material possui movimentações.

As situações exibidas na tabela seguem estes critérios:

| Situação | Critério |
| --- | --- |
| Disponível | Saldo acima do estoque mínimo. |
| Estoque baixo | Saldo maior que zero e menor ou igual ao estoque mínimo. |
| Esgotado | Saldo igual a zero. |

As quantidades são armazenadas internamente como inteiros em milésimos. Por exemplo, `1,5 kg` corresponde a `1500`, evitando cálculos diretos com frações decimais no saldo.

## 🛠️ Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| HTML5 | Estrutura das páginas, formulários e tabelas. |
| CSS3 | Identidade visual e ajustes de layout e responsividade. |
| JavaScript | Validações, cálculo de saldos, pesquisa e atualização da interface. |
| Bootstrap 5.3.8 | Grade responsiva, componentes de interface, menu e carrossel. |
| localStorage | Persistência dos materiais e das movimentações no navegador. |
| Vercel | Hospedagem da aplicação. |

## 📁 Estrutura do projeto

```text
stockflow/
├── images/          # Logotipos e imagens da aplicação
├── index.html       # Apresentação do sistema e acesso às páginas
├── home.js          # Navegação manual do carrossel da página inicial
├── stock.html     # Cadastro, pesquisa, edição e indicadores de estoque
├── movements.html   # Registro e histórico de movimentações
├── script.js        # Regras de estoque, interface e armazenamento local
├── style.css        # Estilos personalizados
└── README.md        # Documentação do projeto
```

## ▶️ Como executar

Não é necessário instalar dependências com npm nem executar uma etapa de compilação.

1. Clone o repositório:

   ```bash
   git clone https://github.com/Lcsf-dev/stockflow.git
   cd stockflow
   ```

2. Abra a pasta do projeto no Visual Studio Code.
3. Instale a extensão **Live Server**, caso ainda não esteja instalada.
4. Clique com o botão direito em `index.html` e selecione **Open with Live Server**.
5. Utilize o menu para navegar entre Início, Estoque e Movimentações.

O endereço principal abre a página inicial (`index.html`). A página de estoque fica em `stock.html`.

O JavaScript deve estar habilitado. O Bootstrap é carregado por CDN e depende de conexão com a internet.

## 🧭 Como utilizar

1. Na página **Estoque**, cadastre um material e informe sua quantidade inicial e estoque mínimo.
2. Consulte o saldo e a situação na tabela. Utilize a pesquisa para encontrar um material pelo nome ou código.
3. Na página **Movimentações**, selecione o material, escolha entrada ou saída e informe a quantidade.
4. Acrescente uma observação, se necessário, e registre a movimentação.
5. Consulte o histórico e retorne à página **Estoque** para acompanhar os indicadores e as necessidades de reposição.

## 💾 Armazenamento e limitações

- Os dados ficam no `localStorage` do navegador e permanecem disponíveis após recarregar a página, desde que o armazenamento seja preservado.
- Não há sincronização entre computadores, dispositivos, navegadores ou perfis de navegador.
- Cada endereço possui seu próprio armazenamento. Os registros do antigo endereço na Netlify não são transferidos automaticamente para a Vercel; a execução local também utiliza um armazenamento separado.
- Limpar os dados do site remove os registros salvos. Na navegação privativa, eles podem ser descartados ao encerrar a sessão.
- Esta versão não possui autenticação, controle de permissões, exportação, importação ou backup integrado.
- Utilize uma aba por vez para registrar alterações, pois não há controle de gravações simultâneas entre abas.

## 📚 Créditos

O projeto utiliza **Bootstrap 5.3.8**, distribuído sob a [licença MIT](https://github.com/twbs/bootstrap/blob/v5.3.8/LICENSE). Essa referência corresponde à licença do Bootstrap.
