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
  { title: 'Um clique inicia a jornada', description: 'Você clica para abrir a página. O navegador transforma essa intenção em uma requisição para buscar os dados e a imagem.', meta: 'APLICAÇÃO · NAVEGADOR', status: 'Aguardando requisição' },
  { title: 'Qual é o endereço do servidor?', description: 'O navegador consulta o cache e, se necessário, o DNS para descobrir o endereço IP associado a netsecbr.com.', meta: 'DNS · RESOLUÇÃO DE NOMES', status: 'Resolvendo netsecbr.com' },
  { title: 'A conexão é preparada', description: 'Para HTTPS sobre TCP, o cliente estabelece a conexão e negocia TLS. O navegador prepara uma requisição HTTP protegida.', meta: 'TCP · TLS · HTTP', status: 'Estabelecendo conexão segura' },
  { title: 'Dados viram segmentos e pacotes', description: 'A pilha de rede adiciona portas TCP, endereços IP e, na interface de saída, um quadro de enlace. Cada camada dá contexto ao mesmo fluxo.', meta: 'ENCAPSULAMENTO · PORTAS · IP', status: 'Encapsulando dados' },
  { title: 'O primeiro salto é local', description: 'O dispositivo encontra o MAC do próximo salto via ARP quando necessário. O switch encaminha o quadro pela rede local.', meta: 'ARP · ETHERNET · SWITCHING', status: 'Cruzando a rede local' },
  { title: 'O gateway escolhe o caminho', description: 'O roteador encaminha o pacote conforme sua tabela. Políticas, NAT e inspeção de firewall podem atuar no percurso.', meta: 'ROUTING · FIREWALL · NAT', status: 'Passando pelo gateway' },
  { title: 'O pacote atravessa a internet', description: 'Roteadores intermediários encaminham o pacote por saltos sucessivos até a rede que anuncia o destino. O caminho de volta pode ser diferente.', meta: 'IP · ROTEAMENTO ENTRE REDES', status: 'Em trânsito pela internet' },
  { title: 'O servidor responde', description: 'O servidor recebe a requisição, processa o pedido e devolve uma resposta HTTP com os dados e a imagem solicitada.', meta: 'SERVIDOR · HTTP 200', status: 'Resposta saindo do servidor' },
  { title: 'A resposta aparece na tela', description: 'Os pacotes de retorno chegam, TCP reorganiza os dados, TLS os decifra e o navegador renderiza a logo. Uma falha em qualquer trecho muda o resultado.', meta: 'RETORNO · DECAPSULAMENTO · RENDERIZAÇÃO', status: 'Resposta recebida' }
];
const stepButtons = [...document.querySelectorAll('.journey-step')];
let currentStep = 0;
function showJourneyStep(index) {
  currentStep = Math.max(0, Math.min(journey.length - 1, index));
  const step = journey[currentStep];
  document.getElementById('journey-count').textContent = `ETAPA ${String(currentStep + 1).padStart(2, '0')} / 09`;
  document.getElementById('journey-title').textContent = step.title;
  document.getElementById('journey-description').textContent = step.description;
  document.getElementById('journey-meta').textContent = step.meta;
  document.getElementById('browser-status').textContent = step.status;
  document.getElementById('journey-progress').style.width = `${(currentStep / (journey.length - 1)) * 100}%`;
  document.querySelector('.journey-visual').classList.toggle('is-complete', currentStep === journey.length - 1);
  document.getElementById('journey-prev').disabled = currentStep === 0;
  document.getElementById('journey-next').disabled = currentStep === journey.length - 1;
  stepButtons.forEach((button, i) => { button.classList.toggle('is-active', i === currentStep); button.setAttribute('aria-pressed', String(i === currentStep)); });
  stepButtons[currentStep].scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
stepButtons.forEach(button => button.addEventListener('click', () => showJourneyStep(Number(button.dataset.step))));
document.getElementById('journey-prev').addEventListener('click', () => showJourneyStep(currentStep - 1));
document.getElementById('journey-next').addEventListener('click', () => showJourneyStep(currentStep + 1));

const layers = {
  7: { title: 'Aplicação', description: 'Onde a aplicação usa serviços de rede para trocar informações.', examples: 'HTTP, DNS', tcpip: 'Aplicação', journey: 'O navegador solicita a página e a logo.' },
  6: { title: 'Apresentação', description: 'Representação dos dados: formatos, codificação e proteção antes de exibi-los.', examples: 'TLS, UTF-8, JPEG', tcpip: 'Aplicação', journey: 'TLS protege o fluxo e o navegador interpreta a imagem.' },
  5: { title: 'Sessão', description: 'Organiza o diálogo entre aplicações. No uso real, suas funções costumam aparecer em protocolos de aplicação.', examples: 'Sessões de aplicação', tcpip: 'Aplicação', journey: 'O navegador mantém o contexto da troca.' },
  4: { title: 'Transporte', description: 'Identifica processos com portas e trata entrega, ordem e confiabilidade quando o protocolo oferece isso.', examples: 'TCP, UDP, portas', tcpip: 'Transporte', journey: 'TCP estabelece a conexão e reorganiza os dados na volta.' },
  3: { title: 'Rede', description: 'Endereça dispositivos entre redes e permite que roteadores escolham o próximo salto.', examples: 'IPv4, IPv6, ICMP', tcpip: 'Internet', journey: 'O pacote IP atravessa gateways até o destino.' },
  2: { title: 'Enlace', description: 'Entrega quadros no enlace local e usa endereços físicos no salto atual.', examples: 'Ethernet, VLAN, MAC', tcpip: 'Acesso à rede', journey: 'O switch encaminha o quadro para o próximo salto.' },
  1: { title: 'Física', description: 'Transporta bits como sinais pelo meio de transmissão.', examples: 'Fibra, cobre, rádio', tcpip: 'Acesso à rede', journey: 'Os bits percorrem cabos e enlaces sem fio.' }
};
const layerButtons = [...document.querySelectorAll('.layer-button')];
function showLayer(number) {
  const layer = layers[number];
  document.getElementById('layer-number').textContent = `/ ${String(number).padStart(2, '0')}`;
  document.getElementById('layer-title').textContent = layer.title;
  document.getElementById('layer-description').textContent = layer.description;
  document.getElementById('layer-examples').textContent = layer.examples;
  document.getElementById('layer-tcpip').textContent = layer.tcpip;
  document.getElementById('layer-journey').textContent = layer.journey;
  layerButtons.forEach(button => { const active = Number(button.dataset.layer) === number; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  document.querySelectorAll('[data-tcpip]').forEach(item => item.classList.toggle('is-active', item.dataset.tcpip === layer.tcpip));
}
layerButtons.forEach(button => button.addEventListener('click', () => showLayer(Number(button.dataset.layer))));
showLayer(7);
