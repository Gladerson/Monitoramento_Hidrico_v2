# api/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Address, RecursoHidrico, DispositivoCadastrado, HistoricoDispositivo

User = get_user_model()

try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'cpf', 'role', 'is_staff')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Dados Adicionais', {'fields': ('role', 'cpf', 'data_nascimento', 'telefone')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'cpf')}),
    )

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'rua', 'municipio', 'estado', 'proprietario')
    search_fields = ('user__username', 'municipio', 'rua', 'proprietario__username')

@admin.register(RecursoHidrico)
class RecursoHidricoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'endereco')
    search_fields = ('nome',)

@admin.register(DispositivoCadastrado)
class DispositivoCadastradoAdmin(admin.ModelAdmin):
    list_display = ('nome_dispositivo', 'mac_address', 'tipo', 'local', 'status', 'ultima_atualizacao')
    search_fields = ('nome_dispositivo', 'mac_address')

@admin.register(HistoricoDispositivo)
class HistoricoDispositivoAdmin(admin.ModelAdmin):
    list_display = ('dispositivo', 'timestamp', 'vazao', 'volume_acumulado')
    search_fields = ('dispositivo__mac_address',)
    list_filter = ('timestamp',)