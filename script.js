document.body.classList.add('js');
document.getElementById('year').textContent = new Date().getFullYear();
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.section, .manifesto, .topic, .show').forEach((el) => observer.observe(el));

const journey = [
  {title:'O clique vira trabalho para o navegador',description:'O evento de entrada chega ao JavaScript. O navegador consulta a URL, verifica cache e inicia o pedido do documento e da logo.',wire:'click → fetch("https://netsecbr.com/logo-temp.jpg")',app:'URL + fetch',transport:'—',network:'—',link:'—'},
  {title:'DNS encontra o endereço',description:'Cache local, resolvedor e servidores autoritativos participam se o nome ainda não estiver resolvido. A resposta entrega um endereço IP para o destino.',wire:'consulta A/AAAA netsecbr.com → endereço IP',app:'DNS',transport:'UDP/TCP 53 ou DoH',network:'IP do resolvedor',link:'quadro local'},
  {title:'Socket e rota de saída',description:'O sistema escolhe IP de origem, interface e rota. Se o destino está fora da sub-rede, o próximo salto será o gateway padrão.',wire:'destino:443 → tabela de rotas → gateway',app:'HTTPS',transport:'porta efêmera → 443',network:'IP origem → destino',link:'próximo salto'},
  {title:'TCP abre a conexão',description:'No exemplo com HTTP/2 sobre TCP, SYN, SYN-ACK e ACK sincronizam números de sequência. Perda de segmento pode provocar retransmissão.',wire:'SYN → SYN-ACK → ACK',app:'—',transport:'TCP handshake',network:'IP',link:'Ethernet/Wi‑Fi'},
  {title:'TLS protege o conteúdo',description:'Cliente e servidor negociam parâmetros criptográficos, validam o certificado e estabelecem chaves. O conteúdo HTTP passa a viajar cifrado.',wire:'ClientHello → ServerHello → certificado → chaves',app:'TLS 1.3',transport:'TCP 443',network:'IP',link:'quadro local'},
  {title:'HTTP pede a imagem',description:'O navegador envia um GET para a logo. Cabeçalhos como Host e Accept ajudam o servidor a entender qual recurso entregar.',wire:'GET /logo-temp.jpg  Host: netsecbr.com',app:'HTTP GET',transport:'fluxo TCP',network:'datagramas IP',link:'quadros'},
  {title:'A pilha encapsula os bytes',description:'HTTP é cifrado por TLS; TCP adiciona portas e sequência; IP acrescenta origem, destino e TTL; Ethernet coloca MACs e verificação de quadro.',wire:'Ethernet [ IP [ TCP [ TLS [ HTTP ] ] ] ]',app:'HTTP + TLS',transport:'TCP / sequência',network:'IP / TTL',link:'MAC / FCS'},
  {title:'ARP, rádio e switch: o primeiro salto',description:'Na LAN IPv4, ARP descobre o MAC do gateway se preciso; em IPv6, Neighbor Discovery faz papel semelhante. O switch encaminha pela tabela MAC.',wire:'ARP who-has gateway? → quadro ao MAC do gateway',app:'dados cifrados',transport:'TCP',network:'IP',link:'ARP / VLAN / MAC'},
  {title:'Gateway, firewall e NAT',description:'O gateway reduz TTL e escolhe a próxima rota. Um firewall pode inspecionar a sessão; NAT pode trocar o IP e a porta de origem, registrando o mapeamento de retorno.',wire:'rota + política + NAT → novo próximo salto',app:'HTTPS cifrado',transport:'porta / estado',network:'rota / NAT',link:'novo quadro'},
  {title:'A internet encaminha por saltos',description:'Cada roteador lê o IP de destino e consulta sua tabela. O quadro de enlace muda a cada enlace; o IP de destino permanece, salvo tradução ou túnel.',wire:'TTL 64 → 63 → 62 ... | L2 refeito por salto',app:'TLS cifrado',transport:'TCP',network:'IP / BGP',link:'enlace por salto'},
  {title:'O servidor produz a resposta',description:'A pilha do servidor remove cabeçalhos, TLS decifra o pedido e a aplicação encontra o arquivo. HTTP responde com status, tipo e bytes da imagem.',wire:'HTTP/2 200 · Content-Type: image/jpeg · bytes',app:'HTTP 200 + TLS',transport:'TCP / ACK',network:'IP de retorno',link:'novo quadro'},
  {title:'A volta termina na tela',description:'O retorno pode seguir outra rota. NAT desfaz o mapeamento, TCP ordena os segmentos, TLS decifra os dados e o navegador renderiza a logo.',wire:'quadros → IP → TCP → TLS → imagem exibida',app:'renderização',transport:'TCP reordena',network:'rota de volta',link:'último salto'}
];
const labSvg = document.querySelector('.lab-map svg');
const labToggle = document.getElementById('lab-toggle');
const labState = document.getElementById('lab-state');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentStep = 0;
let playing = !reducedMotion;
let elapsed = 0;
let lastFrame = 0;
const duration = 36000;
function renderJourney(index) {
  currentStep = index;
  const step = journey[index];
  document.getElementById('journey-count').textContent = `EVENTO ${String(index + 1).padStart(2,'0')} / 12`;
  document.getElementById('journey-title').textContent = step.title;
  document.getElementById('journey-description').textContent = step.description;
  document.getElementById('journey-wire').textContent = step.wire;
  for (const [key,id] of [['app','lab-app'],['transport','lab-transport'],['network','lab-network'],['link','lab-link']]) document.getElementById(id).textContent = step[key];
  document.getElementById('lab-result').classList.toggle('is-visible', index === 11);
}
function setPlaying(value) {
  playing = value;
  labToggle.textContent = value ? 'Pausar Ⅱ' : 'Continuar ▶';
  labToggle.setAttribute('aria-label', value ? 'Pausar animação' : 'Continuar animação');
  labState.textContent = value ? '● EM EXECUÇÃO' : 'Ⅱ PAUSADO';
  if (value) labSvg.unpauseAnimations(); else labSvg.pauseAnimations();
  lastFrame = 0;
}
function frame(time) {
  if (playing) {
    if (lastFrame) elapsed = (elapsed + Math.min(time - lastFrame, 100)) % duration;
    lastFrame = time;
    const index = Math.min(11, Math.floor(elapsed / 3000));
    if (index !== currentStep) renderJourney(index);
    document.getElementById('lab-progress').style.width = `${elapsed / duration * 100}%`;
  }
  requestAnimationFrame(frame);
}
labToggle.addEventListener('click', () => setPlaying(!playing));
document.getElementById('lab-restart').addEventListener('click', () => { elapsed = 0; labSvg.setCurrentTime(0); renderJourney(0); setPlaying(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) setPlaying(false); });
renderJourney(0);
if (reducedMotion) setPlaying(false);
requestAnimationFrame(frame);

const layers = {
  7:{title:'Aplicação',description:'Protocolos pelos quais programas solicitam e entregam serviços de rede.',examples:'HTTP, DNS, SMTP',real:'Ao abrir netsecbr.com, o navegador faz GET da página e consulta DNS para localizar o host.',tcpip:'Aplicação',journey:'O GET pede /logo-temp.jpg.'},
  6:{title:'Apresentação',description:'Representação, codificação e proteção dos dados. No TCP/IP, essas tarefas ficam na aplicação.',examples:'TLS, UTF-8, JPEG',real:'TLS cifra o pedido; o navegador interpreta os bytes JPEG da logo recebida.',tcpip:'Aplicação',journey:'TLS cifra; JPEG é decodificado na volta.'},
  5:{title:'Sessão',description:'Organização do diálogo e do contexto entre aplicações; na internet moderna, várias funções ficam no protocolo de aplicação.',examples:'Sessão HTTP, cookies',real:'Um cookie pode preservar o login entre solicitações HTTP; ele não é uma sessão TCP.',tcpip:'Aplicação',journey:'O navegador mantém contexto entre pedidos.'},
  4:{title:'Transporte',description:'Comunicação entre processos por portas, com confiabilidade e ordem quando o protocolo oferece esses recursos.',examples:'TCP, UDP, QUIC',real:'TCP usa SYN/SYN-ACK/ACK e reordena os segmentos; QUIC usa UDP e implementa confiabilidade acima dele.',tcpip:'Transporte',journey:'TCP 443 entrega os bytes em ordem.'},
  3:{title:'Rede',description:'Endereçamento e encaminhamento entre redes distintas.',examples:'IPv4, IPv6, ICMP',real:'O gateway consulta sua rota padrão para enviar o pacote IP à internet; traceroute revela saltos.',tcpip:'Internet',journey:'Roteadores examinam o IP de destino.'},
  2:{title:'Enlace',description:'Entrega local de quadros e identificação do próximo salto no enlace atual.',examples:'Ethernet, Wi‑Fi, VLAN',real:'ARP descobre o MAC do gateway em IPv4; o switch encaminha o quadro pela porta aprendida.',tcpip:'Acesso à rede',journey:'O quadro muda a cada salto.'},
  1:{title:'Física',description:'Sinais que carregam bits pelo meio físico ou pelo ar.',examples:'Fibra, cobre, rádio',real:'Pulsos ópticos atravessam fibra; ondas de rádio levam quadros Wi‑Fi ao ponto de acesso.',tcpip:'Acesso à rede',journey:'Bits saem da placa pela mídia disponível.'}
};
const layerButtons = [...document.querySelectorAll('.layer-button')];
function showLayer(number) {
  const layer = layers[number];
  for (const [key,id] of [['title','layer-title'],['description','layer-description'],['examples','layer-examples'],['real','layer-real'],['tcpip','layer-tcpip'],['journey','layer-journey']]) document.getElementById(id).textContent = layer[key];
  document.getElementById('layer-number').textContent = `/ ${String(number).padStart(2,'0')}`;
  layerButtons.forEach(button => { const active = Number(button.dataset.layer) === number; button.classList.toggle('is-active',active); button.setAttribute('aria-pressed',String(active)); });
  document.querySelectorAll('[data-tcpip]').forEach(item => item.classList.toggle('is-active',item.dataset.tcpip === layer.tcpip));
}
layerButtons.forEach(button => button.addEventListener('click', () => showLayer(Number(button.dataset.layer))));
showLayer(7);
