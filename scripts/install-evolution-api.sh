#!/bin/bash
# =====================================================
# ZapFácil Pro - Instalação Evolution API em VM Oracle Cloud
# =====================================================
#
# COMO USAR:
#   1. Acesse sua VM via SSH (substitua IP e caminho da chave):
#      ssh -i ~/Downloads/sua-chave.key ubuntu@168.138.x.x
#
#   2. Baixe e rode este script:
#      wget -O install-evolution-api.sh https://raw.githubusercontent.com/tchellodigrace/painel-zapfacil/main/scripts/install-evolution-api.sh
#      chmod +x install-evolution-api.sh
#      sudo ./install-evolution-api.sh
#
#   3. Aguarde ~5 minutos (instala Docker, Evolution API, Nginx)
#
#   4. Ao final, o script mostra:
#      - URL pública da API (http://IP_DA_VM:8080)
#      - Como gerar a API key no painel /manager
#
#   5. Copie a URL + API key e cole no painel admin → aba ZapBot →
#      "Servidor Evolution API"
# =====================================================

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}  ZapFácil Pro - Instalação Evolution API${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Este script precisa ser rodado como root.${NC}"
   echo -e "Rode com: ${YELLOW}sudo ./install-evolution-api.sh${NC}"
   exit 1
fi

# Verificar Ubuntu
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    echo -e "${GREEN}OS detectado: $NAME $VERSION${NC}"
else
    echo -e "${RED}Não foi possível detectar o OS. Script feito para Ubuntu 22.04+${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}[1/6] Atualizando sistema...${NC}"
apt-get update -y
apt-get upgrade -y
apt-get install -y curl wget gnupg lsb-release ca-certificates software-properties-common ufw

echo ""
echo -e "${BLUE}[2/6] Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu
    echo -e "${GREEN}Docker instalado.${NC}"
else
    echo -e "${YELLOW}Docker já está instalado.${NC}"
fi

echo ""
echo -e "${BLUE}[3/6] Instalando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose ${COMPOSE_VERSION} instalado.${NC}"
else
    echo -e "${YELLOW}Docker Compose já está instalado.${NC}"
fi

echo ""
echo -e "${BLUE}[4/6] Abrindo firewall (iptables) da VM...${NC}"
# Oracle Cloud tem iptables bloqueando tudo por padrão
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
# Persistir regras
netfilter-persistent save 2>/dev/null || apt-get install -y iptables-persistent
netfilter-persistent save 2>/dev/null || true
echo -e "${GREEN}Portas 80, 443 e 8080 liberadas no iptables.${NC}"

echo ""
echo -e "${BLUE}[5/6] Criando arquivos da Evolution API...${NC}"
mkdir -p /opt/evolution-api
cd /opt/evolution-api

# Gerar API key aleatória (32 chars)
API_KEY=$(openssl rand -hex 16)
INSTANCE_NAME="zapfacil-prod"

# Criar docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://0.0.0.0:8080
      - CORS_ORIGIN=*
      - AUTHENTICATION_API_KEY=${API_KEY}
      - LANGUAGE=pt-BR
      - LOG_LEVEL=ERROR
      - DEL_INSTANCE=true
      - CONFIG_SESSION_PHONE_CLIENT=ZapFacil Pro
      - CONFIG_SESSION_PHONE_NAME=Chrome
    volumes:
      - evolution_data:/evolution-api/instances
    networks:
      - evolution_net

volumes:
  evolution_data:

networks:
  evolution_net:
    driver: bridge
EOF

echo -e "${GREEN}Arquivo docker-compose.yml criado.${NC}"

echo ""
echo -e "${BLUE}[6/6] Subindo Evolution API...${NC}"
docker-compose up -d
sleep 10

# Verificar se está rodando
if docker ps | grep -q evolution-api; then
    echo -e "${GREEN}Evolution API está rodando!${NC}"
else
    echo -e "${RED}Erro: Evolution API não subiu. Verifique logs:${NC}"
    docker-compose logs
    exit 1
fi

# Pegar IP público da VM
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s http://ifconfig.me || echo "SEU_IP_PUBLICO")

echo ""
echo -e "${BLUE}=====================================================${NC}"
echo -e "${GREEN}  ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""
echo -e "${YELLOW}📋 DADOS PARA COLOCAR NO PAINEL ADMIN:${NC}"
echo -e "   (Painel Admin → aba ZapBot → Servidor Evolution API)"
echo ""
echo -e "   ${GREEN}URL da API:${NC}        http://${PUBLIC_IP}:8080"
echo -e "   ${GREEN}Nome da Instância:${NC} ${INSTANCE_NAME}"
echo -e "   ${GREEN}API Key:${NC}           ${API_KEY}"
echo ""
echo -e "${YELLOW}🌐 Painel de Gestão:${NC}"
echo -e "   http://${PUBLIC_IP}:8080/manager"
echo -e "   (Abra no navegador para ver instâncias, QR code, etc.)"
echo ""
echo -e "${YELLOW}📝 PRÓXIMOS PASSOS:${NC}"
echo -e "   1. Copie os 3 dados acima (URL, Instância, API Key)"
echo -e "   2. Abra o painel admin: https://my-project-rho-sooty.vercel.app/admin"
echo -e "   3. Vá na aba 'ZapBot'"
echo -e "   4. Cole os dados em 'Servidor Evolution API'"
echo -e "   5. Clique em 'Salvar Configuração'"
echo -e "   6. Pronto! Agora pode ativar o ZapBot para cada cliente."
echo ""
echo -e "${YELLOW}🔒 SEGURANÇA (opcional mas recomendado):${NC}"
echo -e "   - Configure HTTPS com domínio próprio (Let's Encrypt)"
echo -e "   - Restrinja o IP do painel /manager no nginx"
echo -e "   - Faça backup regular de /opt/evolution-api/evolution_data"
echo ""
echo -e "${BLUE}=====================================================${NC}"

# Salvar dados em arquivo para consulta posterior
cat > /opt/evolution-api/CREDENCIAIS.txt << EOF
=====================================================
ZapFácil Pro - Evolution API Credenciais
=====================================================
Data instalação: $(date)

URL da API:        http://${PUBLIC_IP}:8080
Nome da Instância: ${INSTANCE_NAME}
API Key:           ${API_KEY}

Painel de Gestão:  http://${PUBLIC_IP}:8080/manager
=====================================================
EOF
chmod 600 /opt/evolution-api/CREDENCIAIS.txt

echo -e "${YELLOW}💾 Credenciais salvas em /opt/evolution-api/CREDENCIAIS.txt${NC}"
echo -e "${YELLOW}   (apenas root pode ler)${NC}"
