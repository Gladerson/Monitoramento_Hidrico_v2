# api/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
import random

# Modelo de Usuário customizado
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        OPERATOR = "OPERATOR", "Operator"
        USER = "USER", "User"

    cpf = models.CharField(max_length=11, unique=True, primary_key=True)
    data_nascimento = models.DateField(null=True, blank=True)
    telefone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.USER)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'cpf']

def generate_random_id():
    return str(random.randint(100000, 999999))

# Modelo de Endereço 
class Address(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='address', null=True)
    id = models.CharField(max_length=6, primary_key=True, default=generate_random_id, editable=False)
    proprietario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_addresses')
    rua = models.CharField(max_length=255)
    numero = models.CharField(max_length=20)
    bairro = models.CharField(max_length=100)
    municipio = models.CharField(max_length=100)
    estado = models.CharField(max_length=2)

    def __str__(self):
        return f"{self.rua}, {self.numero} - {self.municipio}"

# Modelo de Recursos Hídricos 
class RecursoHidrico(models.Model):
    # 1. Classe para as escolhas do novo campo 'tipo'
    class TipoRecurso(models.TextChoices):
        RESERVATORIO = "RESERVATORIO", "Reservatório"
        POCO = "POCO", "Poço"
        DESSALINIZADOR = "DESSALINIZADOR", "Dessalinizador"
        REDE_DISTRIBUICAO = "REDE_DISTRIBUICAO", "Rede de distribuição"

    id = models.CharField(max_length=6, primary_key=True, default=generate_random_id, editable=False)
    nome = models.CharField(max_length=100)
    endereco = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='recursos_hidricos')
    # 2. Adicionar o novo campo 'tipo'
    tipo = models.CharField(
        max_length=50, 
        choices=TipoRecurso.choices, 
        default=TipoRecurso.RESERVATORIO
    )
    
    def __str__(self):
        return self.nome

# Modelo de Dispositivos 
class DispositivoCadastrado(models.Model):
    mac_address = models.CharField(max_length=17, primary_key=True)
    tipo = models.CharField(max_length=50)
    nome_dispositivo = models.CharField(max_length=100)
    status = models.BooleanField(default=False)
    ultima_atualizacao = models.DateTimeField(auto_now=True)
    metrica_01 = models.FloatField(default=0.0)
    metrica_02 = models.FloatField(default=0.0)
    local = models.ForeignKey(RecursoHidrico, on_delete=models.SET_NULL, null=True, blank=True, related_name='dispositivos')

    def __str__(self):
        return f"{self.nome_dispositivo} ({self.mac_address})"

# NOVO MODELO: Histórico de Leituras do Dispositivo
class HistoricoDispositivo(models.Model):
    dispositivo = models.ForeignKey(DispositivoCadastrado, on_delete=models.CASCADE, related_name='historico')
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    vazao = models.FloatField()
    volume_acumulado = models.FloatField()

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Leitura de {self.dispositivo.mac_address} em {self.timestamp}"