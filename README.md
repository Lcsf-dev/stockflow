# 📦 StockFlow

O **StockFlow** é um sistema de controle de estoque industrial que ajuda a organizar materiais e acompanhar suas quantidades.

Seu objetivo é facilitar a rotina do almoxarifado, reunindo cadastros, entradas, saídas e informações sobre materiais que precisam de reposição.

**Sua indústria em movimento, seu estoque sob controle.**

## 🌐 Acesse o projeto

Acesse a aplicação publicada na Vercel: **[stockflowbr.vercel.app](https://stockflowbr.vercel.app/)**.

## ⚙️ Funcionalidades

- **Cadastro de materiais:** organize código, nome, categoria, unidade, quantidade inicial e estoque mínimo.
- **Pesquisa e edição:** encontre materiais pelo nome ou código e atualize seus cadastros.
- **Entradas e saídas:** registre as movimentações e acompanhe a atualização do saldo.
- **Histórico:** consulte os registros com data, hora e observações.
- **Indicadores de estoque:** identifique os materiais disponíveis, com estoque baixo ou esgotados.
- **Validação dos formulários:** evita códigos repetidos, quantidades inválidas e saídas acima do saldo disponível.
- **Layout adaptável:** utilize as páginas em computadores, tablets e celulares, com menu e carrossel de imagens.

## 🛠️ Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| HTML | Organiza o conteúdo das páginas. |
| CSS | Define cores, tamanhos e aparência. |
| JavaScript | Faz os formulários, a pesquisa e o controle de estoque funcionarem. |
| Bootstrap | Ajuda na adaptação das telas, no menu e no carrossel. |
| localStorage | Salva os dados no navegador. |
| Vercel | Mantém o site disponível na internet. |

## 📁 Arquivos principais

```text
stockflow/
├── images/          # Imagens e logotipos
├── index.html       # Página inicial e apresentação do sistema
├── index.js         # Contador do carrossel da página inicial
├── stock.html       # Cadastro, pesquisa e consulta do estoque
├── movements.html   # Registro e histórico das movimentações
├── script.js        # Funcionamento do estoque e das movimentações
├── style.css        # Aparência das páginas
└── README.md        # Apresentação e orientações do projeto
```

## ▶️ Como executar

1. Baixe ou clone o [repositório do StockFlow](https://github.com/Lcsf-dev/stockflow).
2. Abra a pasta no **Visual Studio Code** e instale a extensão **Live Server**.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.
4. Navegue pelo menu entre **Início**, **Estoque** e **Movimentações**.

O projeto não exige instalação de outras dependências. Mantenha a internet conectada para carregar o Bootstrap e o JavaScript habilitado no navegador.

## 🧭 Como utilizar

1. Em **Estoque**, cadastre um material com sua quantidade inicial e o estoque mínimo desejado.
2. Consulte os materiais na tabela e utilize a pesquisa para encontrar um cadastro.
3. Em **Movimentações**, selecione o material, escolha entrada ou saída e informe a quantidade.
4. Após registrar, acompanhe o histórico e consulte o saldo atualizado na página **Estoque**.

## 💾 Sobre os dados salvos

- Os registros ficam salvos no navegador utilizado e permanecem após recarregar a página.
- Os dados não são compartilhados entre computadores, navegadores ou entre a versão local e o site publicado.
- Limpar os dados do site apaga os registros. Na navegação privativa, eles podem ser perdidos ao fechar a sessão.
- Não há backup automático. Para evitar conflitos nos registros, utilize uma aba por vez ao cadastrar materiais ou registrar movimentações.

## 📚 Créditos

O StockFlow utiliza o **Bootstrap 5.3.8**, disponibilizado sob a [licença MIT](https://github.com/twbs/bootstrap/blob/v5.3.8/LICENSE).
