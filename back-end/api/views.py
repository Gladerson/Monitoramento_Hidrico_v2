# api/views.py
from django.utils import timezone
from django.db.models import Sum, Max
from django.db.models.functions import TruncMonth, TruncDay
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, Address, RecursoHidrico, DispositivoCadastrado, HistoricoDispositivo
from .serializers import (
    UserSerializer, UserOperatorViewSerializer, AddressSerializer, 
    RecursoHidricoSerializer, DispositivoCadastradoSerializer,
    HistoricoDispositivoSerializer, MyTokenObtainPairSerializer
)
from .permissions import IsAdminUser, IsAdminOrOperator, IsOwnerOrAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list' and self.request.user.role == 'OPERATOR':
            return UserOperatorViewSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            self.permission_classes = [IsAdminUser]
        elif self.action in ['retrieve', 'update', 'partial_update']:
             self.permission_classes = [IsOwnerOrAdmin]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()
        if user.role in ['ADMIN', 'OPERATOR']:
            return User.objects.all()
        return User.objects.filter(cpf=user.cpf)

class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Adicionado filterset_fields para permitir a filtragem via URL
    # A sintaxe 'recursos_hidricos__tipo' permite filtrar o Endereço
    # pelo 'tipo' de seus Recursos Hídricos relacionados.
    filterset_fields = ['recursos_hidricos__tipo']

    # ======================================================================
    # MÉTODO get_queryset CORRIGIDO E OTIMIZADO PARA FILTRAGEM
    # ======================================================================
    def get_queryset(self):
        user = self.request.user
        base_queryset = Address.objects.distinct() # Usar distinct para evitar duplicatas

        if not user.is_authenticated:
            return base_queryset.none()

        if user.role in ['ADMIN', 'OPERATOR']:
            # Admins e Operadores podem ver todos, mas ainda podem filtrar
            return base_queryset
        
        # Usuários comuns só podem ver seus próprios endereços
        return base_queryset.filter(proprietario=user)


class RecursoHidricoViewSet(viewsets.ModelViewSet):
    queryset = RecursoHidrico.objects.all()
    serializer_class = RecursoHidricoSerializer
    filterset_fields = ['endereco', 'tipo'] # Adicionado 'tipo' à filtragem
    
    def get_permissions(self):
        if self.action == 'destroy':
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAdminOrOperator]
        return super().get_permissions()

class DispositivoCadastradoViewSet(viewsets.ModelViewSet):
    queryset = DispositivoCadastrado.objects.all()
    serializer_class = DispositivoCadastradoSerializer
    lookup_field = 'mac_address'
    filterset_fields = ['local']

    @action(detail=True, methods=['post'], url_path='leitura')
    def salvar_leitura(self, request, mac_address=None):
        dispositivo = self.get_object()
        serializer = HistoricoDispositivoSerializer(data=request.data)
        if serializer.is_valid():
            vazao = serializer.validated_data['vazao']
            volume_acumulado = serializer.validated_data['volume_acumulado']
            
            HistoricoDispositivo.objects.create(
                dispositivo=dispositivo,
                vazao=vazao,
                volume_acumulado=volume_acumulado
            )
            
            dispositivo.metrica_01 = vazao
            dispositivo.metrica_02 = volume_acumulado
            dispositivo.status = True
            dispositivo.ultima_atualizacao = timezone.now()
            dispositivo.save()
            
            return Response({'status': 'leitura salva'}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='stats')
    def stats(self, request, mac_address=None):
        dispositivo = self.get_object()
        year = request.query_params.get('year', timezone.now().year)
        
        monthly_consumption = HistoricoDispositivo.objects.filter(
            dispositivo=dispositivo,
            timestamp__year=year
        ).annotate(
            month=TruncMonth('timestamp')
        ).values('month').annotate(
            total_vazao=Sum('vazao')
        ).values('month', 'total_vazao').order_by('month')

        month = request.query_params.get('month', timezone.now().month)
        daily_max_flow = HistoricoDispositivo.objects.filter(
            dispositivo=dispositivo,
            timestamp__year=year,
            timestamp__month=month
        ).annotate(
            day=TruncDay('timestamp')
        ).values('day').annotate(
            max_vazao=Max('vazao')
        ).values('day', 'max_vazao').order_by('day')

        return Response({
            'monthly_consumption': monthly_consumption,
            'daily_max_flow': daily_max_flow
        })

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'stats']:
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'destroy':
            self.permission_classes = [IsAdminUser]
        elif self.action == 'salvar_leitura':
            self.permission_classes = [permissions.AllowAny]
        else:
            self.permission_classes = [IsAdminOrOperator]
        return super().get_permissions()

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer