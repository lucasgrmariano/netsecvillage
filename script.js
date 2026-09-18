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
  {title:'O clique começa em casa',description:'Um clique no computador aciona o navegador. Ele verifica cache e prepara a busca da logo em netsecbr.com.',wire:'click → GET /logo-temp.jpg',app:'navegador / HTTP',transport:'—',network:'—',link:'—'},
  {title:'DNS resolve o nome',description:'O sistema consulta o cache e, se necessário, um resolvedor DNS. A resposta fornece um endereço IP do destino, que pode ser de uma CDN próxima.',wire:'A/AAAA netsecbr.com → IP do destino',app:'DNS',transport:'UDP/TCP ou DoH',network:'IP do resolvedor',link:'rede local'},
  {title:'O PC escolhe a saída',description:'A tabela de rotas indica a interface local e o gateway padrão. O sistema reserva uma porta de origem para conversar com a porta 443 do servidor.',wire:'IP local:porta efêmera → IP remoto:443',app:'HTTPS',transport:'porta de origem',network:'rota padrão',link:'próximo salto'},
  {title:'TCP e TLS preparam o canal',description:'Neste exemplo com HTTP/2, TCP faz SYN, SYN-ACK e ACK. Depois, TLS valida o certificado e negocia chaves para cifrar os dados.',wire:'SYN → SYN-ACK → ACK → TLS handshake',app:'TLS 1.3',transport:'TCP 443',network:'IP',link:'Wi-Fi / Ethernet'},
  {title:'O pedido é encapsulado',description:'O GET é protegido por TLS. TCP acrescenta portas e sequência; IP acrescenta endereços e TTL; o enlace acrescenta MACs e verificação de quadro.',wire:'L2 [ IP [ TCP [ TLS [ HTTP GET ] ] ] ]',app:'HTTP + TLS',transport:'TCP / sequência',network:'IP / TTL',link:'MAC / FCS'},
  {title:'Wi-Fi ou switch encaminha o quadro',description:'O PC envia bits pelo rádio ou cabo. O ponto de acesso e o switch entregam o quadro na rede da casa, usando a VLAN e o MAC de destino locais.',wire:'PC → AP / switch → porta do firewall',app:'dados cifrados',transport:'TCP',network:'IP',link:'Wi-Fi / Ethernet'},
  {title:'O firewall da casa inspeciona',description:'Se houver firewall no caminho, ele verifica política e estado da conexão. ARP em IPv4, ou Neighbor Discovery em IPv6, pode localizar o MAC do próximo salto.',wire:'allow? sessão criada → MAC do gateway',app:'HTTPS cifrado',transport:'estado TCP',network:'IP destino',link:'ARP / ND'},
  {title:'Roteador doméstico faz NAT',description:'O CPE ou firewall escolhe a rota de saída. Em IPv4, NAT pode trocar endereço e porta privados pelos públicos, guardando a tradução para a volta.',wire:'192.168.x.x:porta → IP público:porta',app:'TLS cifrado',transport:'porta traduzida',network:'NAT / rota',link:'novo quadro'},
  {title:'ONT ou modem entrega à operadora',description:'Na fibra, a ONT transforma sinais elétricos e ópticos; em outras tecnologias, o modem faz a adaptação do meio. O tráfego entra na rede de acesso.',wire:'CPE → ONT / modem → rede de acesso',app:'TLS cifrado',transport:'TCP',network:'IP',link:'fibra / cabo / rádio'},
  {title:'A rede de acesso agrega clientes',description:'Equipamentos da operadora agregam várias assinaturas e encaminham o fluxo ao roteador de borda. A autenticação e o transporte dependem da arquitetura do provedor.',wire:'acesso → agregação → borda ISP',app:'TLS cifrado',transport:'TCP',network:'IP / MPLS ou túnel',link:'enlace ISP'},
  {title:'CGNAT pode traduzir de novo',description:'Se a operadora usa CGNAT em IPv4, outra tradução compartilha um IP público entre clientes. Em IPv6, esse passo normalmente não é necessário.',wire:'IP compartilhado:porta → internet',app:'TLS cifrado',transport:'porta mapeada',network:'CGNAT opcional',link:'novo enlace'},
  {title:'Core e backbone carregam o fluxo',description:'Roteadores centrais transportam o pacote pela infraestrutura de alta capacidade. O TTL cai a cada salto IP; o quadro de enlace é refeito em cada trecho.',wire:'core ISP → backbone | TTL n → n−1',app:'TLS cifrado',transport:'TCP',network:'IP / TTL',link:'fibra de longa distância'},
  {title:'Peering conecta redes diferentes',description:'A operadora entrega o fluxo a outra rede por trânsito IP ou peering, às vezes em um ponto de troca de tráfego. BGP anuncia quais destinos cada rede alcança.',wire:'ASN da operadora → trânsito / PTT → ASN destino',app:'TLS cifrado',transport:'TCP',network:'BGP / próximo AS',link:'interconexão'},
  {title:'O servidor responde',description:'O servidor ou nó CDN recebe o GET, remove encapsulamentos, processa o pedido e devolve os bytes JPEG com status HTTP 200.',wire:'HTTP 200 · Content-Type: image/jpeg',app:'HTTP 200',transport:'TCP / ACK',network:'IP de retorno',link:'rede do destino'},
  {title:'O retorno cruza as redes',description:'Os segmentos voltam por redes intermediárias; a rota pode ser diferente da ida. Firewall e NAT reconhecem a sessão e desfazem os mapeamentos.',wire:'servidor → backbone → ISP → firewall → casa',app:'TLS cifrado',transport:'TCP / ACK',network:'rota de volta',link:'novo quadro por salto'},
  {title:'A logo aparece na tela',description:'O PC recebe os segmentos, TCP os ordena, TLS decifra os bytes e o navegador decodifica a imagem. A logo da NetSec Village finalmente aparece.',wire:'quadros → IP → TCP → TLS → JPEG → tela',app:'renderização',transport:'TCP reordena',network:'IP local',link:'último salto'}
];
const labSvg = document.querySelector('.lab-map svg');
const labToggle = document.getElementById('lab-toggle');
const labState = document.getElementById('lab-state');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentStep = 0;
let playing = !reducedMotion;
let elapsed = 0;
let lastFrame = 0;
const duration = journey.length * 3000;
const route = document.getElementById('lab-route');
const packet = document.getElementById('lab-packet');
const positions = [0,.005,.015,.025,.035,.07,.13,.18,.23,.29,.34,.39,.45,.50,.70,.98];
function positionPacket(progress) {
  const phase = Math.min(journey.length - 1, Math.floor(progress * journey.length));
  const fraction = progress * journey.length - phase;
  const from = positions[phase];
  const to = positions[Math.min(phase + 1, positions.length - 1)];
  const point = route.getPointAtLength((from + (to - from) * fraction) * route.getTotalLength());
  packet.setAttribute('cx', point.x); packet.setAttribute('cy', point.y);
}
function renderJourney(index) {
  currentStep = index;
  const step = journey[index];
  document.getElementById('journey-count').textContent = `EVENTO ${String(index + 1).padStart(2,'0')} / ${journey.length}`;
  document.getElementById('journey-title').textContent = step.title;
  document.getElementById('journey-description').textContent = step.description;
  document.getElementById('journey-wire').textContent = step.wire;
  for (const [key,id] of [['app','lab-app'],['transport','lab-transport'],['network','lab-network'],['link','lab-link']]) document.getElementById(id).textContent = step[key];
  document.getElementById('lab-result').classList.toggle('is-visible', index === journey.length - 1);
}
function setPlaying(value) {
  playing = value;
  labToggle.textContent = value ? 'Pausar Ⅱ' : 'Continuar ▶';
  labToggle.setAttribute('aria-label', value ? 'Pausar animação' : 'Continuar animação');
  labState.textContent = value ? '● EM EXECUÇÃO' : 'Ⅱ PAUSADO';
  lastFrame = 0;
}
function frame(time) {
  if (playing) {
    if (lastFrame) elapsed = (elapsed + Math.min(time - lastFrame, 100)) % duration;
    lastFrame = time;
    const index = Math.min(journey.length - 1, Math.floor(elapsed / 3000));
    if (index !== currentStep) renderJourney(index);
    document.getElementById('lab-progress').style.width = `${elapsed / duration * 100}%`;
    positionPacket(elapsed / duration);
  }
  requestAnimationFrame(frame);
}
labToggle.addEventListener('click', () => setPlaying(!playing));
document.getElementById('lab-restart').addEventListener('click', () => { elapsed = 0; positionPacket(0); renderJourney(0); setPlaying(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) setPlaying(false); });
renderJourney(0);
positionPacket(0);
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
