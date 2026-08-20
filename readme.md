# Iniciar o projeto :

nest :npm run dev
next :npm run dev

# Verificar o .ENV (backend):

NEXT_PUBLIC_API_URL=

- //Para local, alterar o rootPath para "join(\_\_dirname, '..', '..', 'uploads')"

# Verificar o .ENV (frontend):

NEXT_PUBLIC_API_URL=

NEXT_PUBLIC_IMAGE_HOSTNAME=
NEXT_PUBLIC_IMAGE_PROTOCOL=
NEXT_PUBLIC_IMAGE_PORT=
NEXT_PUBLIC_IMAGE_PATHNAME=

# PROJETO PILOTO (1/6) :

[X] Adicionar, apagar e editar um buraco no mapa.
[ ] Tornar mais fácil dos motoqueiros adicionarem buracos no mapa.
[ ] Botão de filtrar buracos.
[ ] Botão de conclusão em massa dos buracos.
[ ] Botão de exclusão em massa dos buracos.
[ ] Otimizar a experiência de usuário.

# HOLEAPP 1.0 :

[ ] Adicionar níveis de usuário e habilitar permissões específicas para cada usuário.

# O que deve ser feito?

[ ] Depois de adicionar a feature de fixar o mapa no usuário, Criar isLoading para todos os botões que fazem ações diretamente ligadas ao banco como Apagar, editar, criar... Esse estado irá impedir que o usuário fique gerando erro sem necessidade.

# Comentários para a projeto descritivo final:

- Foram feitos alguns estudos de imagens e vemos que imagens comprimidas em 50 % da sua qualidade, não perderia tanto a qualidade quanto deixar ela em 100% da sua capacidade.

Agora, quero criar uma pagina de login que somente usuários autorizados podem criar e apagar. pontos.

A visualização da zona tem que ser um pouco transparente de forma que a bater o olho, a equipe, gerente e administrador possam ver a demarcação e para poder demarcar, será por meio de clicks que fazem retas, podendo criar uma area e essa area se liga entre pontos por retas.

Aproveitando, que agora os usuários possuem imagem, foto de perfil, quero que, o administrador consiga ver eles quando eles estiverem usando o aplicativo no mapa. Para não lagar muito o sistema, eles terão uma atualização a cada 1 minuto. e a imagem deles serão mostradas no mapa em um circulozinho no mapa grande, o administrador apenas, terá um botão de filtro que poderá ligar e desligar essa função para ver ou não ver onde o colaborador está. Adicione esse botão de filtro onde você achar que é mais inteligente no mapa grande. Se a pessoa fechar o aplicativo. A borda deixa de ficar verde para ficar vermelho na imagem do colaborador. O usuário que estiver olhando para isso não consegue ver a própria imagem. Se o colaborador estiver online, ele aparece com a borda em verde. E se depois de 5 minutos não receber nenhuma informação dele, passa para vermelho. e depois de 20 minutos. Ele some do mapa. Me ajude a planeja uma coisa dessa.
