# api/serializers.py

from rest_framework import serializers
from .models import User, Address, RecursoHidrico, DispositivoCadastrado, HistoricoDispositivo
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'rua', 'numero', 'bairro', 'municipio', 'estado', 'proprietario']

class UserSerializer(serializers.ModelSerializer):
    address = AddressSerializer(read_only=True)
    cpf_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['cpf_display', 'username', 'email', 'data_nascimento', 'telefone', 'role', 'address']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def get_cpf_display(self, obj):
        request = self.context.get('request', None)
        if not request or not hasattr(request, 'user'):
             return None

        user = request.user
        if user.is_authenticated:
            if user.role == 'OPERATOR' and user != obj:
                return f"{obj.cpf[:4]}*******"
            return obj.cpf
        
        return None

class UserOperatorViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'data_nascimento', 'telefone', 'role']


class RecursoHidricoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecursoHidrico
        fields = '__all__'

class DispositivoCadastradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DispositivoCadastrado
        fields = '__all__'

# NOVO SERIALIZER
class HistoricoDispositivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricoDispositivo
        fields = ['vazao', 'volume_acumulado'] # Apenas os campos que o agente envia

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token