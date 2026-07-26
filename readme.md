# 👕 MyCloset

MyCloset é uma aplicação web desenvolvida para facilitar o gerenciamento de um guarda-roupa digital. O usuário pode visualizar roupas, pesquisar peças, favoritar itens e organizar seu catálogo de forma prática e intuitiva.

O projeto foi desenvolvido utilizando HTML, CSS, JavaScript puro e Firebase.

---

## ✨ Funcionalidades

- 🔐 Login com autenticação Firebase
- 👤 Controle de usuários
- 🏠 Página inicial com catálogo de roupas
- 🔎 Pesquisa de roupas
- ❤️ Sistema de favoritos
- 🆕 Identificação automática de peças recém-adicionadas
- 📱 Interface responsiva
- 📦 Progressive Web App (PWA)
- 👑 Painel administrativo para usuários administradores

---

## 📄 Páginas

### Login (`index.html`)
- Autenticação por e-mail e senha.
- Redirecionamento automático caso o usuário já esteja logado.

### Home (`home.html`)
- Exibição das roupas.
- Pesquisa de produtos.
- Categorias.
- Destaque para peças novas.
- Navegação principal.

### Catálogo (`catalogo.html`)
- Visualização completa das roupas cadastradas.

### Designs (`designs.html`)
- Área destinada aos looks e combinações.

### Favoritos (`liked.html`)
- Exibe apenas as roupas marcadas como favoritas.

### Administração (`admin.html`)
Disponível apenas para usuários com permissão de administrador.

---

## 🛠 Tecnologias

- HTML5
- CSS3
- JavaScript (ES6 Modules)
- Firebase Authentication
- Cloud Firestore
- Progressive Web App (PWA)

---

## 📂 Estrutura do Projeto

```
MyCloset/
│
├── css/
│   └── styles.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── firebase.js
│   ├── functions.js
│   ├── home.js
│   ├── search.js
│   └── sw.js
│
├── icons/
│
├── index.html
├── home.html
├── catalogo.html
├── designs.html
├── liked.html
├── admin.html
│
├── manifest.json
└── README.md
```

---

## 🔥 Firebase

O projeto utiliza o Firebase para:

- Autenticação de usuários
- Armazenamento das informações dos usuários
- Controle de permissões (Administrador e Usuário)

---

## 👤 Controle de Permissões

Existem dois tipos de usuários:

### Usuário
- Acessa o catálogo.
- Pesquisa roupas.
- Favorita peças.

### Administrador
Além das funções do usuário, possui acesso ao painel administrativo.

---

## 📱 Progressive Web App

O projeto pode ser instalado como aplicativo em dispositivos compatíveis.

Recursos disponíveis:

- Manifest
- Ícones personalizados
- Service Worker
- Funcionamento como aplicativo

---

## 🚀 Como executar

1. Clone o repositório

```bash
git clone https://github.com/ArthurBarcelos1/MyCloset.git
```

2. Abra a pasta do projeto.

3. Configure seu projeto no Firebase.

4. Insira suas credenciais no arquivo:

```
js/firebase.js
```

5. Execute utilizando um servidor local, como:

- Live Server (VS Code)
- XAMPP
- Apache
- Firebase Hosting

---

## 📌 Melhorias futuras

- Cadastro de roupas pelo administrador
- Upload de imagens
- Filtros avançados
- Organização por categorias
- Compartilhamento de looks
- Histórico de favoritos
- Melhor suporte offline

---

## 📸 Interface

A interface foi desenvolvida com foco em simplicidade, responsividade e facilidade de navegação, oferecendo uma experiência semelhante à de aplicativos móveis.

---

## Funcionalidade

O site ainda está em fase de desenvolvimento e várias funcionalidades ainda não funcionam.

---

## 📄 Licença

Este projeto foi desenvolvido para fins de estudo e aprendizado.
