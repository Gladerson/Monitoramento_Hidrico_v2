import requests
import time
import random

BASE_URL = 'http://127.0.0.1:8000/api/'
AGENT_EMAIL = 'ti.semarh@gmail.com'
AGENT_PASSWORD = 'T32322433@'
DEVICE_MAC_ADDRESS = '00:1B:44:11:3A:B7'

def get_auth_token():
    """Obtém um token de acesso para o agente (embora o novo endpoint não exija)."""
    try:
        response = requests.post(BASE_URL + 'token/', data={
            'email': AGENT_EMAIL,
            'password': AGENT_PASSWORD
        })
        response.raise_for_status()
        return response.json().get('access')
    except requests.exceptions.RequestException as e:
        print(f"Erro ao obter token: {e}")
        return None

def send_sensor_data():
    """Simula o envio de dados do sensor para a API."""
    headers = {} # Token não é mais necessário para este endpoint específico
    
    # Dados simulados
    vazao = round(random.uniform(50.0, 75.5), 2)
    volume_acumulado = round(random.uniform(1000.0, 5000.0), 2)
    
    # Endpoint para salvar uma nova leitura para um dispositivo específico
    url = f"{BASE_URL}dispositivos/{DEVICE_MAC_ADDRESS}/leitura/"
    
    payload = {
        'vazao': vazao,
        'volume_acumulado': volume_acumulado,
    }
    
    try:
        # Usamos POST para criar um novo registro de histórico
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        print(f"Leitura enviada com sucesso: {payload}")
    except requests.exceptions.RequestException as e:
        print(f"Erro ao enviar dados: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Detalhes do erro: {e.response.text}")


if __name__ == "__main__":
    print(f"Iniciando o agente_sensor para o dispositivo {DEVICE_MAC_ADDRESS}...")
    
    while True:
        send_sensor_data()
        # Envia dados a cada 10 segundos
        time.sleep(10)