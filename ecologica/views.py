# coding=utf-8
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.forms import AuthenticationForm,PasswordChangeForm
from django.shortcuts import render_to_response
from django.template import RequestContext, loader
from django.contrib.auth import login, authenticate, logout
from django.http import HttpResponse,Http404,HttpResponseRedirect
from django.contrib.auth.models import User
from ecologica.models import RepositorioImagenes,Provincia,Municipio,FormaJuridica,ContactoOperador,Expediente,InterlocutoresVisita,Cliente,ProductoAgricola,ProductoGanaderia,ProductoIndustria,Variedades,Parcela,VisitaParcela,HistoricoCultivos,Inspector,RecolectorParcelas,riesgo,RecolectorErrores,Ganado,Facturacion,NuevosExpedientes
from ecologica.models import Auditoria,Incumplimiento,AccionesCorrectivas,Evaluacion,Perfil,Industria,usuarioInspector,Historico_Certificados,parcelas_visita,ganado_visita,industria_visita,InformeVisita
from ecologica.serializers import UsuariosSerializer,MunicipioSerializer,ProvinciaSerializer,InterlocutoresSerializer,ExpedienteSerializer,FormaJuridicaSerializer,ContactoSerializer,ClienteSerializer,ProductoAgricolaSerializer,ProductoGanaderiaSerializer,ProductoIndustriaSerializer,VariedadesSerializer,ParcelaSerializer,VisitaParcelaSerializer,HistoricoCultivosSerializer,InspectorSerializer,ImagenesSerializer,RecolectorParcelasSerializer,RiesgoSerializer,RecolectorErroresSerializer
from ecologica.serializers import GanadoSerializer,FacturacionSerializer,NuevosExpedientesSerializer,AuditoriaSerializer,IncumplimientoSerializer,AccionesCorrectivasSerializer,EvaluacionSerializer,PerfilSerializer,IndustriaSerializer,UsuarioInspectorSerializer,HistoricoCertificadosSerializer,parcelas_visitaSerializer,ganado_visitaSerializer,industria_visitaSerializer,InformeVisitaSerializer
import datetime
from django.contrib.auth import (REDIRECT_FIELD_NAME, login as auth_login,
    logout as auth_logout, get_user_model, update_session_auth_hash)
from django.template.response import TemplateResponse
from datetime import timedelta
from django.views.generic import View
from rest_framework import generics, permissions
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from io import BytesIO
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle,getSampleStyleSheet
from reportlab.lib.colors import (
    black,
    purple,
    white,
    yellow
)
from datetime import date
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from reportlab.lib.pagesizes import A4
import xlsxwriter
import csv
try:  
    import cStringIO as StringIO
except ImportError:  
    import StringIO

pdfmetrics.registerFont(TTFont('Arial Narrow', 'Vera.ttf'))
pdfmetrics.registerFont(TTFont('Arial Narrow Bold', 'VeraBd.ttf'))
pdfmetrics.registerFont(TTFont('Arial Narrow Cursiva', 'VeraIt.ttf'))


'''from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)'''


###Vista Principal###
@login_required()
def main(request):
	template = loader.get_template('ecologica/Dashboard.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	tipoUs = ""
	expedientesAsignados = []
	if user.is_staff:
		
		cliente = arrayIni
		expediente = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		tipoUs = "Admin"
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		tipoUs = perfil.TipoUsuario
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expediente = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				expedientesAsignados = VisitaParcela.objects.filter(inspector = inspect)
			else:
				expediente = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			cliente = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
		
	idExp = []
	expedientesA = []
		
	if len(expedientesAsignados) > 0:
		for visita in expedientesAsignados:
			if not visita.expediente.id in idExp:
				idExp.append(visita.expediente.id)
				expedientesA.append(visita)
		
	numparcelas = len(Parcela.objects.filter(ag_eco='SI'))
	numganaderas = len(Ganado.objects.filter(ag_eco="SI"))	
	numindustrias = len(Industria.objects.filter(ag_eco="SI"))
	nRecolector1 = len(RecolectorParcelas.objects.filter(tipoParcela='AE'))
	nRecolector2 = len(RecolectorParcelas.objects.filter(tipoParcela='GA'))
	nRecolector3 = len(RecolectorParcelas.objects.filter(tipoParcela='IN'))
	fechahoy = datetime.date.today()
	d = timedelta(weeks=13,hours=24)
	fechaCaduca = fechahoy+d
	fechaCaducaYa= fechahoy+timedelta(days=15)
	
	CaducaExpedientesYa = Expediente.objects.filter(vigente='SI',F_finalvigencia__lte=fechaCaducaYa)
	ids = [g.id for g in CaducaExpedientesYa]
	CaducaExpedientes = Expediente.objects.filter(vigente='SI',F_finalvigencia__lte=fechaCaduca).exclude(id__in = ids)
	acciones = AccionesCorrectivas.objects.all()
	ids_acciones = [g.auditoria.id for g in acciones]
	solicitaPAC = Auditoria.objects.filter(solicita_PAC = 'SI').exclude(id__in = ids_acciones)
	numPAC = len(solicitaPAC)
	user = User.objects.get(id=request.user.id)

	numCaducas = len(CaducaExpedientes)
	numCaducasYa = len(CaducaExpedientesYa)
	context = RequestContext(request, {
		'numparcelas':numparcelas,
		'nrecolector':nRecolector1,
		'numganaderas':numganaderas,
		'numindustrias':numindustrias,
		'nrecolector2':nRecolector2,
		'nrecolector3':nRecolector3,
		'caducaExpedientes': CaducaExpedientes,
		'caducaExpedientesYa': CaducaExpedientesYa,
		'numCaducas':numCaducas,
		'numCaducasYa':numCaducasYa,
		'solicitaPAC':solicitaPAC,
		'numPAC':numPAC,
		'consultaCliente':cliente[0],
		'creaCliente':cliente[2],
		'consultaExpediente':expediente[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'generaSipea':archivos[0],
		'tipoUs':tipoUs,
		'lista_visitasA':expedientesA
    })
	return HttpResponse(template.render(context))

	
@login_required()
def logout_view(request):
	logout(request)
	return HttpResponseRedirect('/')
	
@sensitive_post_parameters()
@csrf_protect
@login_required
def password_change(request,
					template_name='password_change.html',
					password_change_form=PasswordChangeForm,
					current_app=None, extra_context=None):
					
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	tipoUs = ""
	expedientesAsignados = []
	if user.is_staff:
		
		cliente = arrayIni
		expediente = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		tipoUs = "Admin"
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		tipoUs = perfil.TipoUsuario
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expediente = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				expedientesAsignados = VisitaParcela.objects.filter(inspector = inspect)
			else:
				expediente = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			cliente = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
    
	if request.method == "POST":
		form = password_change_form(user=request.user, data=request.POST)
		if form.is_valid():
			form.save()
			update_session_auth_hash(request, form.user)
			return HttpResponseRedirect('/')
	else:
		form = password_change_form(user=request.user)
	context = {
		'form': form,
		'consultaCliente':cliente[0],
		'creaCliente':cliente[2],
		'consultaExpediente':expediente[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'tipoUs':tipoUs,
	}
	if extra_context is not None:
		context.update(extra_context)
	return TemplateResponse(request, template_name, context,
							current_app=current_app)
	
def ingresar (request):

	if request.user.is_authenticated(): 
		return HttpResponseRedirect('/Dashboard/')
	else:
		if request.method == 'POST':
			formulario = AuthenticationForm(request.POST)
			if formulario.is_valid:
				usuario = request.POST['username']
				clave = request.POST['password']
				acceso = authenticate(username = usuario,password = clave)
				if acceso is not None:
					if acceso.is_active:
						login(request,acceso)
						if acceso.is_staff:
							return HttpResponseRedirect('/Dashboard/')
						else:
                        
							return HttpResponseRedirect('/Dashboard/')
					
					else:
						return render_to_response('ecologica/home.html', {'user': request.user}, context_instance=RequestContext(request))
               
				else:
					return render_to_response('ecologica/login.html',{'form':formulario},context_instance = RequestContext(request))
		else:
			formulario = AuthenticationForm()
		return render_to_response('ecologica/login.html',{'form':formulario},context_instance = RequestContext(request))

@login_required()
def expedientes(request):
    
	expedientesAE = Expediente.objects.filter(tipoAgricultura = 'AE').order_by('-anyo','-CodOperador')	
	expedientesGA = Expediente.objects.filter(tipoAgricultura = 'GA').order_by('-anyo','-CodOperador')	
	expedientesND= Expediente.objects.filter(tipoAgricultura = 'IN').order_by('-anyo','-CodOperador')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
	
	template = loader.get_template('ecologica/Expedientes.html')

	
	context = RequestContext(request, {
		'lista_expedientesAE':  expedientesAE,
		'lista_expedientesGA':  expedientesGA,
		'lista_expedientesND': expedientesND,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'generaSipea':archivos[0]
	})
	return HttpResponse(template.render(context))	
	
@login_required()
def expedientesVigor(request):
    
	expedientesAE = Expediente.objects.filter(tipoAgricultura = 'AE',Estado='ALTA').order_by('-anyo','-CodOperador')	
	expedientesGA = Expediente.objects.filter(tipoAgricultura = 'GA',Estado='ALTA').order_by('-anyo','-CodOperador')
	expedientesND = Expediente.objects.filter(tipoAgricultura = 'IN',Estado='ALTA').order_by('-anyo','-CodOperador')	
	
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
	
	template = loader.get_template('ecologica/ExpedientesVigor.html')
	numAE = len(expedientesAE)
	numGA = len(expedientesGA)
	numND = len(expedientesND)
	context = RequestContext(request, {
		'lista_expedientesAE':  expedientesAE,
		'lista_expedientesGA':  expedientesGA,
		'lista_expedientesND':  expedientesND,
		'numAE': numAE,
		'numGA': numGA,
		'numND': numND,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'generaSipea':archivos[0]
		
	})
	return HttpResponse(template.render(context))	
	
	
@login_required()
def riesgos(request):
    
	expedientes = riesgo.objects.all()
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectors = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectors = str(usInspector[0].inspectores).split()
			

	n_expedientes = 0;
	
	for expediente in expedientes:
		if expediente.idExpediente.Estado == 'ALTA':
			n_expedientes = n_expedientes + 1
	
	template = loader.get_template('ecologica/Riesgos.html')
	context = RequestContext(request, {
		'n_expedientes':  n_expedientes,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectors[0],
		'creaInspector':inspectors[2],
		'generaSipea':archivos[0]
		
	})
	return HttpResponse(template.render(context))	
	

@login_required()	
def ExpedienteView(request,id_Expediente):
		
	template = loader.get_template('ecologica/Expediente.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	tipoUs = ""
	auditor = ""
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		contactos = arrayIni
		interloc = arrayIni
		parcela = arrayIni
		riesgos = arrayIni
		v_realizadas = arrayIni
		certificado = arrayIni
		tipoUs = "Admin"
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		auditor = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = auditor)
		tipoUs = perfil.TipoUsuario
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				auditorias = arrayIni3
			else:
				expedient = str(usInspector[0].expedientes).split()
				
				auditorias = str(usInspector[0].auditorias).split()
				
			planificadas = str(usInspector[0].p_visitas).split()
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
			contactos = str(usInspector[0].contactos).split()
			interloc = str(usInspector[0].interlocutores).split()
			parcela = str(usInspector[0].parcelas).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			v_realizadas = str(usInspector[0].v_realizadas).split()
			certificado = str(usInspector[0].certifica).split()
    
	expediente = Expediente.objects.get(id=id_Expediente)
	auditores = Inspector.objects.all().order_by('Nombre',"Apellido1","Apellido2")
	formaJ = FormaJuridica.objects.all()
	user = User.objects.get(id=request.user.id)

	fechahoy = datetime.date.today()
	
	if expediente.vigente == 'SI' and expediente.F_finalvigencia < fechahoy:
		expediente.vigente = 'NO'
		expediente.haestadovigente = 'SI'
		expediente.save()
	
	documento = expediente.idDocumento;
	
	if len(documento) < 2:
		documento = "0"+documento;
		
	visitas = VisitaParcela.objects.filter(completada = 'SI',expediente = id_Expediente).order_by('-f_visita')
		
	codigo = expediente.CodOperador[0:6]+"/"+expediente.CodOperador[7:9]+"/"+expediente.CodOperador[10:12]+"/CC"+documento
	
	idCliente = expediente.id_cliente_id
	
	cliente = Cliente.objects.get(id=idCliente)
	
	nif = str(cliente.nifcif)
	if nif[0].isdigit():
		tipoID = 'NIF'
	else:
		tipoID = 'CIF'
	
	
	gen = cliente.Genero
	if gen == 'H':
		genero = 'Hombre'
	elif gen == 'M':
		genero = 'Mujer'
	else:
		genero = 'No procede'
	
	
	
	estado = expediente.Estado
	actividad = expediente.con_actividad
	
	provincias = Provincia.objects.all();
	municipios = Municipio.objects.all();
	
	responsable = expediente.responsable
	responsAudit = Inspector.objects.filter(categoria='RA').exclude(id = responsable.id)
	respons = Inspector.objects.filter(categoria='R').exclude(id = responsable.id)
	listaudit = auditores | responsAudit
	listarespons = respons | responsAudit
	
	products = ProductoAgricola.objects.all()
	ganado = ProductoGanaderia.objects.all().order_by("Actividad")
	industria = ProductoIndustria.objects.all().order_by("Producto")
	actGen = []
	for act in products:
		if not act.Actividad in actGen:
			actGen.append(act.Actividad)
	actGen2 = []
	for act in ganado:
		if not act.Actividad in actGen2:
			actGen2.append(act.Actividad)
	actGen3 = []
	for act in industria:
		if not act.Producto in actGen3:
			actGen3.append(act.Producto)

	est = False
	if estado == "ALTA":
		est = True
	elif estado == "BAJA":
		est = False
		
	activ = False
	if actividad == "SI":
		activ = True
	elif actividad == "NO":
		activ = False
		
	context = RequestContext(request, {
		'cliente':cliente,
		'expediente':expediente,
		'estado':est,
		'actividad':activ,
		'actgen':actGen,
		'actgen2':actGen2,
		'actgenIn':actGen3,
		'provincias':provincias,
		'municipios':municipios,
		'auditores':listaudit,
		'codigo':codigo,
		'visitas':visitas,
		'tipoID':tipoID,
		'genero':genero,
		'user':user,
		'responsableExp':responsable,
		'responsables':listarespons,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'modificaExpediente':expedient[1],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaContactos':contactos[0],
		'modificaContactos':contactos[1],
		'creaContactos':contactos[2],
		'consultaInterlocutores':interloc[0],
		'modificaInterlocutores':interloc[1],
		'consultaParcelas':parcela[0],
		'creaParcelas':parcela[2],
		'creaInterlocutores':interloc[2],
		'consultaPlanificadas':planificadas[0],
		'modificaPlanificadas':planificadas[1],
		'creaPlanificadas':planificadas[2],
		'consultaAuditorias':auditorias[0],
		'modificaAuditorias':auditorias[1],
		'creaAuditorias':auditorias[2],
		'consultaFacturacion':facturacion[0],
		'creaFactura':facturacion[2],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'generaSipea':archivos[0],
		'generaCertificado':archivos[4],
		'consultaparcela':parcela[0],
		'creaparcela':parcela[2],
		'consultaRiesgos':riesgos[0],
		'creaRiesgos':riesgos[1],
		'modificaRiesgos':riesgos[2],
		'consultasRealizadas':v_realizadas[0],
		'modificaRealizadas':v_realizadas[1],
		'certifica':certificado[2],
		'tipoUs':tipoUs,
		'auditor':auditor,
		'formaJ': formaJ,
    })
	
	return HttpResponse(template.render(context))	
	
@login_required()	
def creaCliente(request):
	template = loader.get_template('ecologica/FormularioCliente.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	provincias = Provincia.objects.all();
	municipios = Municipio.objects.all();
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectors = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectors = str(usInspector[0].inspectores).split()
	context = RequestContext(request, {
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectors[0],
		'creaInspector':inspectors[2],
		'generaSipea':archivos[0],
		'provincias': provincias,
		'municipios':municipios
	})
	return HttpResponse(template.render(context))
	
@login_required()	
def creaInspector(request):

	template = loader.get_template('ecologica/FormularioInspector.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectors = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectors = str(usInspector[0].inspectores).split()
	context = RequestContext(request, {
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectors[0],
		'creaInspector':inspectors[2],
		'generaSipea':archivos[0]
	})
	
	if request.method == 'POST':
	
		nomb = request.POST['nombre']
		Ap1 = request.POST['apellido1']
		Ap2 = request.POST['apellido2']
		dni = request.POST['nif']
		Telf1 = request.POST['telefono1']
		Telf2 = request.POST['telefono2']
		tipoUs = request.POST['tipoAg']
		
		us = request.POST['usuario']
		if tipoUs != 'A':
			expedientes = request.POST['consexpedientes']+" "+request.POST['modexpedientes']+" "+request.POST['creaexpedientes']
			clientes = request.POST['consclient']+" "+request.POST['modclient']+" "+request.POST['creaclient']
			facturacion = request.POST['consfact']+" "+request.POST['modfact']+" "+request.POST['creafact']
			planificadas = request.POST['consvisplan']+" "+request.POST['modvisplan']+" "+request.POST['creavisplan']
			auditorias = request.POST['consaudi']+" "+request.POST['modaudi']+" "+request.POST['creaaudi']
			archivos = request.POST['gensip']+" "+request.POST['gencli']+" "+request.POST['genfac']+" "+request.POST['genclient']+" "+request.POST['gencer']
			if tipoUs != 'R':
				certifica = request.POST['conscer']+" "+request.POST['modcer']+" "+request.POST['creacer']
				inspectores = request.POST['consins']+" "+request.POST['modins']+" "+request.POST['creains']
			else:
				certifica = 'NO NO NO'
				inspectores = 'NO NO NO'
		else:
			expedientes = request.POST['consexp']+" "+request.POST['consexp']
			clientes = 'NO NO NO'
			facturacion = 'NO NO NO'
			planificadas = request.POST['consplan']+" "+request.POST['modplan']+" "+request.POST['creaplan']
			auditorias = 'SI SI SI'
			certifica = 'NO NO NO'
			inspectores = 'NO NO NO'
			archivos = 'NO NO NO NO NO'
		contactos = request.POST['conscont']+" "+request.POST['modcont']+" "+request.POST['creacont']
		interlocutores = request.POST['consinter']+" "+request.POST['modinter']+" "+request.POST['creainter']
		parcelas = request.POST['consparc']+" "+request.POST['modparc']+" "+request.POST['creaparc']
		visitas = request.POST['consvis']+" "+request.POST['modvis']
		riesgos = request.POST['consriesgo']+" "+request.POST['modriesgo']+" "+request.POST['creariesgo']
		
		if us == 'SI':
		
			Usuario = request.POST['cuenta']
			Password = request.POST['password']
			mail = request.POST['email']
			
			user = User.objects.create_user(Usuario,mail,Password)
			user.first_name = nomb
			user.last_name = Ap1
			user.is_active = True
			
			perfil = Perfil(id=user.id,user=user, TipoUsuario=tipoUs)
			inspector = Inspector(id = user.id,Nombre = nomb,Apellido1 = Ap1,Apellido2 = Ap2,nif = dni,Telefono1 = Telf1,Telefono2 = Telf2,categoria = tipoUs)
			usInspector = usuarioInspector(inspector = inspector, expedientes = expedientes,clientes = clientes,contactos = contactos,interlocutores = interlocutores,parcelas = parcelas,v_realizadas = visitas,p_visitas = planificadas,ev_riesgos = riesgos,facturacion = facturacion,auditorias = auditorias,certifica = certifica,inspectores = inspectores,archivos = archivos)
			
			
			user.save()
			perfil.save()
			inspector.save()
			usInspector.save()
		else:
			inspector = Inspector(Nombre = nomb,Apellido1 = Ap1,Apellido2 = Ap2,nif = dni,Telefono1 = Telf1,Telefono2 = Telf2,categoria = tipoUs)
			inspector.save()
			
		return HttpResponseRedirect('/inspectores/')
		
	return HttpResponse(template.render(context))

	
@login_required()	
def creaExpediente(request,id_Cliente):
	template = loader.get_template('ecologica/FormularioExpediente.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectors = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectors = str(usInspector[0].inspectores).split()
	cliente = Cliente.objects.get(id=id_Cliente)
	products = ProductoAgricola.objects.all().order_by("Actividad")
	ganado = ProductoGanaderia.objects.all().order_by("Actividad")
	industria = ProductoIndustria.objects.all().order_by("Producto")
	actGen = []
	for act in products:
		if not act.Actividad in actGen:
			actGen.append(act.Actividad)
	actGen2 = []
	for act2 in ganado:
		if not act2.Actividad in actGen2:
			actGen2.append(act2.Actividad)
	actGenIn = []
	for actIn in industria:
		if not actIn.Producto in actGenIn:
			actGenIn.append(actIn.Producto)
			
	expedientes = Expediente.objects.all().order_by('-anyo','-CodOperador')

	if len(expedientes) > 0:
		ultimo = str(expedientes[0].CodOperador)[2:6]
	else:
		ultimo = '0'
	
	respons = Inspector.objects.filter(categoria='R')
	formaJ = FormaJuridica.objects.all()
	
	context = RequestContext(request, {
		"cliente":cliente,
		"actgen":actGen,
		"actgen2":actGen2,
		"actgenIn":actGenIn,
		'responsables':respons,
		'ultimo':ultimo,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectors[0],
		'creaInspector':inspectors[2],
		'formaJ': formaJ,
	})
	
	return HttpResponse(template.render(context))
	
@login_required()	
def creaFactura(request,id_Cliente):
	
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectors = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectors = str(usInspector[0].inspectores).split()

	template = loader.get_template('ecologica/FormularioFacturacion.html')
	cliente = Cliente.objects.get(id=id_Cliente)
	facturas = Facturacion.objects.filter(cliente = id_Cliente).order_by("f_fact")
	context = RequestContext(request, {
		"cliente":cliente,
		"facturas":facturas,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectors[0],
		'creaInspector':inspectors[2],
	})
	return HttpResponse(template.render(context))
	
@login_required()
def clientes(request):
	user = User.objects.get(id=request.user.id)
	
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		cliente = arrayIni
		expediente = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expediente = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expediente = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			cliente = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
	
	lista_clientes = Cliente.objects.all().order_by("Nombre")
	template = loader.get_template('ecologica/Clientes.html')
	context = RequestContext(request, {
		'lista_clientes': lista_clientes,
		'consultaCliente':cliente[0],
		'creaCliente':cliente[2],
		'consultaExpediente':expediente[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'generaSipea':archivos[0]
	})
	
	return HttpResponse(template.render(context))
	
@login_required()
def inspectores(request):
    
	template = loader.get_template('ecologica/Inspectores.html')
	if request.method == 'POST':
		
		idUs = request.POST['ID']
		tipoUs = request.POST['tipoAg']
		
		us = request.POST['usuario']
		if tipoUs != 'A':
			expedientes = request.POST['consexpedientes']+" "+request.POST['modexpedientes']+" "+request.POST['creaexpedientes']
			clientes = request.POST['consclient']+" "+request.POST['modclient']+" "+request.POST['creaclient']
			facturacion = request.POST['consfact']+" "+request.POST['modfact']+" "+request.POST['creafact']
			planificadas = request.POST['consvisplan']+" "+request.POST['modvisplan']+" "+request.POST['creavisplan']
			auditorias = request.POST['consaudi']+" "+request.POST['modaudi']+" "+request.POST['creaaudi']
			archivos = request.POST['gensip']+" "+request.POST['gencli']+" "+request.POST['genfac']+" "+request.POST['genclient']+" "+request.POST['gencer']
			if tipoUs != 'R':
				certifica = request.POST['conscer']+" "+request.POST['modcer']+" "+request.POST['creacer']
				inspectores = request.POST['consins']+" "+request.POST['modins']+" "+request.POST['creains']
			else:
				certifica = 'NO NO NO'
				inspectores = 'NO NO NO'
		else:
			expedientes = request.POST['consexp']+" "+request.POST['consexp']
			clientes = 'NO NO NO'
			facturacion = 'NO NO NO'
			planificadas = request.POST['consplan']+" "+request.POST['modplan']+" "+request.POST['creaplan']
			auditorias = 'SI SI SI'
			certifica = 'NO NO NO'
			inspectores = 'NO NO NO'
			archivos = 'NO NO NO NO NO'
		contactos = request.POST['conscont']+" "+request.POST['modcont']+" "+request.POST['creacont']
		interlocutores = request.POST['consinter']+" "+request.POST['modinter']+" "+request.POST['creainter']
		parcelas = request.POST['consparc']+" "+request.POST['modparc']+" "+request.POST['creaparc']
		visitas = request.POST['consvis']+" "+request.POST['modvis']
		riesgos = request.POST['consriesgo']+" "+request.POST['modriesgo']+" "+request.POST['creariesgo']
		
		if us == 'SI':
		
			Usuario = request.POST['cuenta']
			Password = request.POST['password']
			mail = request.POST['email']
			
			user = User.objects.create_user(Usuario,mail,Password)
			user.is_active = True
			
			perfil = Perfil(id=idUs,user=user, TipoUsuario=tipoUs)
			inspector = Inspector.objects.get(id = idUs)
			inspector.categoria = tipoUs
			usInspector = usuarioInspector(inspector = inspector, expedientes = expedientes,clientes = clientes,contactos = contactos,interlocutores = interlocutores,parcelas = parcelas,v_realizadas = visitas,p_visitas = planificadas,ev_riesgos = riesgos,facturacion = facturacion,auditorias = auditorias,certifica = certifica,inspectores = inspectores,archivos = archivos)
			
			
			user.save()
			perfil.save()
			inspector.save()
			usInspector.save()
			
		return HttpResponseRedirect('/inspectores/')
		
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectors = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectors = str(usInspector[0].inspectores).split()
			
	inspectores = Inspector.objects.all()	
	
	context = RequestContext(request, {
		'inspectores': inspectores,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectors[0],
		'creaInspector':inspectors[2],
		'generaSipea':archivos[0]
	})
	
	return HttpResponse(template.render(context))

@login_required()
def clienteView(request,id_Cliente):
    
	template = loader.get_template('ecologica/Cliente.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expediente = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expediente = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expediente = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
	cliente = Cliente.objects.get(id=id_Cliente)
	expedientesAE = Expediente.objects.filter(tipoAgricultura="AE",id_cliente = cliente.id)
	expedientesGA = Expediente.objects.filter(tipoAgricultura="GA",id_cliente = cliente.id)
	expedientesND = Expediente.objects.filter(tipoAgricultura="IN",id_cliente = cliente.id)
	expedientes = Expediente.objects.filter(id_cliente = cliente.id)
	if len(expedientes) == 0:
		facturas = []
	else:
		facturas = Facturacion.objects.filter(expediente__in = expedientes).order_by("f_fact")
	
	
	ibn = cliente.iban
	iban = ibn[0:4]+"-"+ibn[4:8]+"-"+ibn[8:10]+"-"+ibn[10:]
	
	nif = str(cliente.nifcif)
	if nif[0].isdigit():
		tipoID = 'NIF'
	else:
		tipoID = 'CIF'
	
	
	gen = cliente.Genero
	if gen == 'H':
		genero = 'Hombre'
	elif gen == 'M':
		genero = 'Mujer'
	else:
		genero = 'No procede'
	
	context = RequestContext(request, {
		'cliente': cliente,
		'expedientesAE':expedientesAE,
		'expedientesGA':expedientesGA,
		'expedientesND':expedientesND,
		'iban':iban,
		'facturas':facturas,
		'tipoID':tipoID,
		'genero':genero,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expediente[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'generaSipea':archivos[0]
	})
	
	return HttpResponse(template.render(context))	

@login_required()
def parcelaView(request,id_Parcela):
    
	template = loader.get_template('ecologica/Parcela.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	parcela = Parcela.objects.get(id=id_Parcela)
	tipoUs = ""	
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectors = arrayIni
		tipoUs = "Admin"
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			tipoUs = perfil.TipoUsuario
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				expParcela = parcela.expediente
				expedientesAsignados = VisitaParcela.objects.filter(inspector = inspect)			
				idExp = []
				if len(expedientesAsignados) > 0:
					for visita in expedientesAsignados:
						if not visita.expediente.id in idExp:
							idExp.append(visita.expediente.id)
					if not expParcela.id in idExp:
						return HttpResponseRedirect('/Dashboard/')	
				else:
					return HttpResponseRedirect('/Dashboard/')	
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectors = str(usInspector[0].inspectores).split()
	
	
	sr = parcela.sr
	secreg = ""
	estado = parcela.Estado
	products = ProductoAgricola.objects.all()
	provincias = Provincia.objects.all()
	tipo = "AE"
	actGen = []
	for act in products:
		if not act.Actividad in actGen:
			actGen.append(act.Actividad)

	if sr == "R":
		secreg = u'REGADÍO'
	elif sr == "S":
		secreg = "SECANO"
		
	est = False
	if estado == "ALTA":
		est = True
	elif estado == "BAJA":
		est = False
		
	context = RequestContext(request, {
		'parcela':parcela,
		'secreg': secreg,
		'estado':est,
		'actgen':actGen,
		'provincias':provincias,
		'tipo':tipo,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectors[0],
		'creaInspector':inspectors[2],
		'tipoUs':tipoUs,
		
    })
	
	return HttpResponse(template.render(context))	

@login_required()
def parcelaGanadoView(request,id_Parcela):
	user = User.objects.get(id=request.user.id)
	template = loader.get_template('ecologica/Parcela.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	parcela = Ganado.objects.get(id=id_Parcela)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectors = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				expParcela = parcela.expedienteGanado
				expedientesAsignados = VisitaParcela.objects.filter(inspector = inspect)			
				idExp = []
				if len(expedientesAsignados) > 0:
					for visita in expedientesAsignados:
						if not visita.expediente.id in idExp:
							idExp.append(visita.expediente.id)
					if not expParcela.id in idExp:
						return HttpResponseRedirect('/Dashboard/')	
				else:
					return HttpResponseRedirect('/Dashboard/')	
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectors = str(usInspector[0].inspectores).split()
	
	auditores = Inspector.objects.all()
	auditor = ""
	if not user.is_staff:
		perfil = Perfil.objects.get(user=request.user.id)
		if perfil.TipoUsuario == 'A':
			auditor = auditores.get(id=user.id)
	sr = parcela.sr
	secreg = ""
	estado = parcela.Estado
	products = ProductoGanaderia.objects.all()
	grCult = parcela.grupoCultivo
	tipo = "GA"
	if grCult == '1':
		grupoCultivo = "Dehesa"
	elif grCult == '2':
		grupoCultivo = "Pradera"
	elif grCult == '3':
		grupoCultivo = "Pasto"
	else: 
		grupoCultivo = "Pastizal"
	tipAc = parcela.tipoAcuicola

	if tipAc == '1':
		tipoAcuicola = "Estanque"
	elif tipAc == '2':
		tipoAcuicola = "Estero"
	elif tipAc == '3':
		tipoAcuicola = "Jaula"
	elif tipAc == '4':
		tipoAcuicola = "Otra estructura fija"
	elif tipAc == '5':
		tipoAcuicola = "Otra estructura móvil"
	else:
		tipoAcuicola = ""
		
	provincias = Provincia.objects.all()
	actGen2 = []
	for act in products:
		if not act.Actividad in actGen2:
			actGen2.append(act.Actividad)

	if sr == "R":
		secreg = u'REGADÍO'
	elif sr == "S":
		secreg = "SECANO"
		
	est = False
	if estado == "ALTA":
		est = True
	elif estado == "BAJA":
		est = False
		
	context = RequestContext(request, {
		'parcela':parcela,
		'secreg': secreg,
		'estado':est,
		'actgen2':actGen2,
		'provincias':provincias,
		'grupoCultivo':grupoCultivo,
		'tipoAcuicola':tipoAcuicola,
		'tipo':tipo,
		'auditor':auditor,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectors[0],
		'creaInspector':inspectors[2],
    })
	
	return HttpResponse(template.render(context))		
	
@login_required()
def productoIndustrialView(request,id_Parcela):
	parcela = Industria.objects.get(id=id_Parcela)
	template = loader.get_template('ecologica/Parcela.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	producto = Industria.objects.get(id=id_Parcela)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectors = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				expParcela = producto.expediente
				expedientesAsignados = VisitaParcela.objects.filter(inspector = inspect)			
				idExp = []
				if len(expedientesAsignados) > 0:
					for visita in expedientesAsignados:
						if not visita.expediente.id in idExp:
							idExp.append(visita.expediente.id)
					if not expParcela.id in idExp:
						return HttpResponseRedirect('/Dashboard/')	
				else:
					return HttpResponseRedirect('/Dashboard/')	
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectors = str(usInspector[0].inspectores).split()

	auditores = Inspector.objects.all()
	auditor = ""
	if not user.is_staff:
		perfil = Perfil.objects.get(user=request.user.id)
		if perfil.TipoUsuario == 'A':
			auditor = auditores.get(id=user.id)
	
	estado = producto.Estado
	products = ProductoIndustria.objects.all().order_by('Producto')
	tipo = 'IN'
			
	tipC = producto.tipoCom
	comercializacion = ''
	if tipC == '1':
		comercializacion = 'Mayorista'
	elif tipC == '2':
		comercializacion = 'Minorista'
		
	fpres = producto.form_pres
	presentacion = ''
	if fpres == '1':
		presentacion = 'A granel'
	elif fpres == '2':
		presentacion = 'Envasado cerrado'
	elif fpres == '3':
		presentacion = 'Otros'
	
	
	provincias = Provincia.objects.all()
	actGen = []
	for act in products:
		if not act.Producto in actGen:
			actGen.append(act.Producto)	
	est = False
	if estado == "ALTA":
		est = True
	elif estado == "BAJA":
		est = False
		
	context = RequestContext(request, {
		'parcela':parcela,
		'producto':producto,
		'estado':est,
		'actgenIn':actGen,
		'provincias':provincias,
		'auditor':auditor,
		'comercializacion':comercializacion,
		'presentacion':presentacion,
		'tipo':tipo,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectors[0],
		'creaInspector':inspectors[2],
    })
	
	return HttpResponse(template.render(context))	

class ExcelExport1(View):
	filename = 'nuevos_Clientes.xlsx'
	
	def get(self,request,*args,**kwargs):
	
		user = User.objects.get(id=request.user.id)
		if not user.is_staff:
			perfil = Perfil.objects.get(user=request.user)
			inspect = Inspector.objects.get(id=perfil.id)
			usInspector = usuarioInspector.objects.filter(inspector = inspect)
			
			if len(usInspector) > 0:
				if perfil.TipoUsuario == 'A':
					return HttpResponseRedirect('/Dashboard/')
		nuevos_Expedientes = NuevosExpedientes.objects.all()
		idClientes = list()
		data = list()
		cont = 1
		for expediente in nuevos_Expedientes:
			if not expediente.idExp.id_cliente in idClientes:
				list_exp = list()
				list_exp.append(cont)
				operador = (expediente.idExp.id_cliente.Nombre+" "+expediente.idExp.id_cliente.Apellido1+" "+expediente.idExp.id_cliente.Apellido2).upper()
				list_exp.append(operador)
				list_exp.append(expediente.idExp.id_cliente.nifcif)
				contacto = ContactoOperador.objects.filter(id_operador = expediente.idExp)
				contact = ''
				if len(contacto) > 0:
					contact = contacto[0].Nombre+" "+contacto[0].Apellido1+" "+contacto[0].Apellido2
				list_exp.append(contact)
				direccion = expediente.idExp.id_cliente.Domicilio+". "+expediente.idExp.id_cliente.CP+" "+expediente.idExp.id_cliente.Municipio.Municipio+" ("+expediente.idExp.id_cliente.Provincia.Provincia+")"
				list_exp.append(direccion)
				list_exp.append(int(expediente.idExp.id_cliente.Telefono1))
				list_exp.append(expediente.idExp.id_cliente.Email)
				ibn = expediente.idExp.id_cliente.iban
				isbn = expediente.idExp.id_cliente.esiban
				codigo = ''
				if isbn:
					codigo = isbn
					iban = ibn[0:4]+"-"+ibn[4:8]+"-"+ibn[8:10]+"-"+ibn[10:]
					codigo = isbn+"-"+iban
				else:
					if ibn:
						codigo = ibn[0:4]+"-"+ibn[4:8]+"-"+ibn[8:10]+"-"+ibn[10:]
				
				list_exp.append(codigo)
				formPago = expediente.idExp.id_cliente.p_recur
				if formPago == 'R':
					pago = 'Pago Recurrente'
				elif formPago == 'U':
					pago = 'Pago Único'
				else :
					pago = ''
				list_exp.append(pago.decode('utf-8'))
				list_exp.append(expediente.idExp.id_cliente.F_sepa)
				cont += 1
				data.append(list_exp)
				idClientes.append(expediente.idExp.id_cliente)
		
		output = StringIO.StringIO()
		wb = xlsxwriter.Workbook(output)
		sheet = wb.add_worksheet('NUEVOS CLIENTES')
		
		format1 = wb.add_format({
			'bold':True,
			'align':'center',
			'font_size':12,
			'font_name': 'Georgia',
		})
		
		format2 = wb.add_format({
			'bold':True,
			'align':'center',
			'font_size':10,
			'font_name': 'Georgia',
		})
		
		format3 = wb.add_format({
			'align':'center',
			'font_size':10,
			'font_name': 'Georgia',
		})
		
		formatRed = wb.add_format({
			'font_color': 'red',
			'align':'center',
			'font_size':10,
			'font_name': 'Georgia',
		})
		
		url_format = wb.add_format({
			'font_color': 'blue',
			'underline':  1,
			'align':'center',
			'font_size':10,
			'font_name': 'Georgia',
		})
		
		date_format = wb.add_format({'num_format': 'dd/mm/yyyy',
                                'align':'center',
								'font_size':10,
								'font_name': 'Georgia'})

		
		sheet.set_column(0,0,10,format1)
		sheet.set_column(1,1,46)
		sheet.set_column(2,2,9)
		sheet.set_column(3,3,25)
		sheet.set_column(4,4,55)
		sheet.set_column(5,5,14)
		sheet.set_column(6,6,34)
		sheet.set_column(7,7,26)
		sheet.set_column(8,8,26)
		sheet.set_column(9,9,26)
		
		sheet.write('B2','OPERADOR',format2)
		sheet.write('C2','CIF',format2)
		sheet.write('D2','PERSONA CONTACTO',format2)
		direc = "DIRECCIÓN"
		sheet.write('E2',direc.decode('utf-8'),format2)
		tel = 'TELÉFONO'
		sheet.write('F2',tel.decode('utf-8'),format2)
		correo = 'CORREO ELECTRÓNICO'
		sheet.write('G2',correo.decode('utf-8'),format2)
		sheet.write('H2','CUENTA BANCARIA',format2)
		sheet.write('I2','FORMA DE PAGO',format2)
		sheet.write('J2','FECHA ORDEN SEPA',format2)
		
		sheet.autofilter('B2:J2')

		row = 2
		for row_data in (data):
			sheet.write_row(row, 0, row_data,format3)
			sheet.write_url(row, 6,'mailto:'+row_data[6]+'', url_format, row_data[6])
			if row_data[9]:
				sheet.write_datetime(row,9,row_data[9], date_format)
			

			row += 1
		

		wb.close()
		output.seek(0)
		
		response = HttpResponse(output.read(), content_type="application/ms-excel")  
		response['Content-Disposition'] = 'attachment; filename=%s' % self.filename
		
		return response
		
def ExpedientesVigorArchivo(request, tipo = None):
	filename = 'ExpedientesEnVigor.xlsx'
	
	user = User.objects.get(id=request.user.id)
	if not user.is_staff:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
			
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				return HttpResponseRedirect('/Dashboard/')
	
	if tipo == '1':
		tipoAg = 'AE'
	elif tipo == '2':
		tipoAg = 'GA'
	elif tipo == '3':
		tipoAg = 'IN'
	expedientesVigor = Expediente.objects.filter(Estado='ALTA',tipoAgricultura = tipoAg).order_by('-anyo','-CodOperador')
	data = list()
	cont = 1
	for expediente in expedientesVigor:
		list_exp = list()
		list_exp.append(cont)
		operador = (expediente.id_cliente.Nombre+" "+expediente.id_cliente.Apellido1+" "+expediente.id_cliente.Apellido2).upper()
		list_exp.append(operador)
		list_exp.append(expediente.CodOperador)
		list_exp.append(expediente.CodSipea)
		list_exp.append(expediente.id_cliente.nifcif)
		list_exp.append(int(expediente.id_cliente.Telefono1))
		if expediente.id_cliente.Telefono2:
			list_exp.append(int(expediente.id_cliente.Telefono2))
		else: 
			list_exp.append('')
		direccion = expediente.id_cliente.Domicilio+". "+expediente.id_cliente.CP+" "+expediente.id_cliente.Municipio.Municipio+" ("+expediente.id_cliente.Provincia.Provincia+")"
		list_exp.append(direccion)
		list_exp.append(expediente.id_cliente.Email)
		codVigencia = ''
		f_ini = ''
		f_fin = ''
		if expediente.vigente == 'SI':
			documento = expediente.idDocumento;
			if len(documento) < 2:
				documento = "0"+documento;	
			codVigencia = expediente.CodOperador[0:6]+"/"+expediente.CodOperador[7:9]+"/"+expediente.CodOperador[10:12]+"/CC"+documento
			f_ini = expediente.F_iniciovigencia
			f_fin = expediente.F_finalvigencia
		
		list_exp.append(codVigencia)
		list_exp.append(f_ini)
		list_exp.append(f_fin)
		
		contacto = ContactoOperador.objects.filter(id_operador = expediente)
		contact = ''
		telfCont = ''
		dirContact = ''
		if len(contacto) > 0:
			contact = contacto[0].Nombre+" "+contacto[0].Apellido1+" "+contacto[0].Apellido2
			telfCont = int(contacto[0].Telefono1)
			dirContact =  contacto[0].Domicilio+". "+contacto[0].CP+" "+contacto[0].Municipio.Municipio+" ("+contacto[0].Provincia.Provincia+")"
			
		list_exp.append(contact)
		list_exp.append(telfCont)
		list_exp.append(dirContact)	
		
		f_solicitud = expediente.Fecha_recepcion
		list_exp.append(f_solicitud)
		f_ae = expediente.Fecha_aecologica
		list_exp.append(f_ae)
		tec_resp = expediente.responsable
		list_exp.append(tec_resp.Nombre+" "+tec_resp.Apellido1+" "+tec_resp.Apellido2)
		visitas = VisitaParcela.objects.filter(expediente = expediente).order_by('-f_visita')
		if len(visitas) > 0:
			ultimaVisita = visitas[0]
			list_exp.append(ultimaVisita.f_visita)
		else:
			list_exp.append('')
		eval = riesgo.objects.filter(idExpediente = expediente).order_by('-f_eval')
		if len(eval) > 0:
			ultimaEval = eval[0]
			list_exp.append(ultimaEval.f_eval)
			list_exp.append(ultimaEval.puntuacion)
		else:
			list_exp.append('')
			list_exp.append('')
		
		facturas = Facturacion.objects.filter(expediente = expediente).order_by('-f_fact')
		if len(facturas) > 0:
			ultimaFactura = facturas[0]
			list_exp.append(ultimaFactura.f_fact)
		else:
			list_exp.append('')
		
		cont += 1
		data.append(list_exp)
	
	output = StringIO.StringIO()
	wb = xlsxwriter.Workbook(output)
	sheet = wb.add_worksheet('EXPEDIENTES EN VIGOR')
	
	format1 = wb.add_format({
		'bold':True,
		'align':'center',
		'font_size':12,
		'font_name': 'Georgia',
	})
	
	format2 = wb.add_format({
		'bold':True,
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	format3 = wb.add_format({
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	formatRed = wb.add_format({
		'font_color': 'red',
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	url_format = wb.add_format({
		'font_color': 'blue',
		'underline':  1,
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	date_format = wb.add_format({'num_format': 'dd/mm/yyyy',
							'align':'center',
							'font_size':10,
							'font_name': 'Georgia'})

	
	sheet.set_column(0,0,10,format1)
	sheet.set_column(1,1,46)
	sheet.set_column(2,2,20)
	sheet.set_column(3,3,15)
	sheet.set_column(4,4,9)
	sheet.set_column(5,5,14)
	sheet.set_column(6,6,14)
	sheet.set_column(7,7,55)
	sheet.set_column(8,8,55)
	sheet.set_column(9,9,20)
	sheet.set_column(10,10,15)
	sheet.set_column(11,11,15)
	sheet.set_column(12,12,46)
	sheet.set_column(13,13,20)
	sheet.set_column(14,14,55)
	sheet.set_column(15,15,20)
	sheet.set_column(16,16,20)
	sheet.set_column(17,17,34)
	sheet.set_column(18,18,26)
	sheet.set_column(19,19,26)
	sheet.set_column(20,20,26)
	sheet.set_column(21,21,26)
	
	
	sheet.write('B2','OPERADOR',format2)
	sheet.write('C2','COD. EXPEDIENTE',format2)
	sheet.write('D2','COD. SIPEA',format2)
	sheet.write('E2','NIF',format2)
	tel = 'TELÉFONO'
	sheet.write('F2',tel.decode('utf-8')+'1',format2)
	sheet.write('G2',tel.decode('utf-8')+'2',format2)
	direc = "DIRECCIÓN"
	sheet.write('H2',direc.decode('utf-8'),format2)
	sheet.write('I2','EMAIL',format2)
	sheet.write('J2','COD. CERTIFICADO',format2)
	sheet.write('K2','F. INI VIGENCIA',format2)
	sheet.write('L2','F. FIN VIGENCIA',format2)
	sheet.write('M2','CONTACTO',format2)
	sheet.write('N2','TEL. CONTACTO',format2)
	sheet.write('O2',direc.decode('utf-8')+' CONTACTO',format2)
	direc2 = "F. RECEP. SOLICITUD"
	sheet.write('P2',direc2.decode('utf-8'),format2)
	direc3 = "F. INSCRIPCIÓN AE"
	sheet.write('Q2',direc3.decode('utf-8'),format2)
	tecnico = "TÉCNICO RESPONSABLE"
	sheet.write('R2',tecnico.decode('utf-8'),format2)
	ul_vis = "F. ÚLTIMA VISITA"
	sheet.write('S2',ul_vis.decode('utf-8'),format2)
	ul_ev = "F. ÚLTIMA EVALUACIÓN"
	sheet.write('T2',ul_ev.decode('utf-8'),format2)
	puntos = "PUNTUACIÓN"
	sheet.write('U2',puntos.decode('utf-8'),format2)
	ul_fact = "F. ÚLTIMA FACTURA"
	sheet.write('V2',ul_fact.decode('utf-8'),format2)
	sheet.autofilter('B2:V2')

	row = 2
	for row_data in (data):
		sheet.write_row(row, 0, row_data,format3)
		if row_data[8]:
			sheet.write_url(row, 8,'mailto:'+row_data[8]+'', url_format, row_data[8])
		if row_data[10]:
			sheet.write_datetime(row,10,row_data[10], date_format)
			sheet.write_datetime(row,11,row_data[11], date_format)
		sheet.write_datetime(row,15,row_data[15], date_format)
		sheet.write_datetime(row,16,row_data[16], date_format)
		if row_data[18]:
			sheet.write_datetime(row,18,row_data[18], date_format)
		if row_data[19]:
			sheet.write_datetime(row,19,row_data[19], date_format)
		if row_data[21]:
			sheet.write_datetime(row,21,row_data[21], date_format)
		
		row += 1
	

	wb.close()
	output.seek(0)
	
	response = HttpResponse(output.read(), content_type="application/ms-excel")  
	response['Content-Disposition'] = 'attachment; filename=%s' % filename
	
	return response
		
		
@login_required()
def Factura(request):		
	template = loader.get_template('ecologica/Facturacion.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni	
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
	facturas = Facturacion.objects.all().order_by("-f_fact")
	
	context = RequestContext(request, {
		"facturas":facturas,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'generaSipea':archivos[0]
		
	})
	return HttpResponse(template.render(context))
	
@login_required()
def VisitaPlanificada(request):		
	template = loader.get_template('ecologica/VisitasPlanificadas.html')
	visitas = VisitaParcela.objects.filter(completada = 'NO').order_by("f_visita")
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
	auditores = Inspector.objects.all()

	context = RequestContext(request, {
		"visitas":visitas,
		"auditores":auditores,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'generaSipea':archivos[0]
	})
	return HttpResponse(template.render(context))
	
@login_required()
def AuditoriasRealizadas(request):		
	template = loader.get_template('ecologica/AuditoriasRealizadas.html')
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditoris = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditoris = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditoris = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
	auditorias = Auditoria.objects.filter(visita__completada = 'NO').order_by("f_Auditoria")
	auditores = Inspector.objects.all()
	
	
	context = RequestContext(request, {
		"auditorias":auditorias,
		"auditores":auditores,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditoris[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
	})
	return HttpResponse(template.render(context))
	
@login_required()	
def ExcelExport2 (request, year1 = None, month1 = None, day1 = None,year2 = None, month2 = None, day2 = None,factu = None):
		
	user = User.objects.get(id=request.user.id)
	if not user.is_staff:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
			
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				return HttpResponseRedirect('/Dashboard/')	
	
	fechahoy = datetime.date.today()
	fecha = str(fechahoy.day)+"_"+str(fechahoy.month)+" "+str(fechahoy.year)
	if factu == '1':
		filename = 'Factura_datos_ecológicos_'+fecha+'.xlsx'
	else:
		filename = 'Expedientes_Ecológicos_NoFacturados_'+fecha+'.xlsx'
	fechaIni = datetime.date(int(year1), int(month1), int(day1))  
	fechaFin = datetime.date(int(year2), int(month2), int(day2))    	
	facturas = Facturacion.objects.filter(f_fact__gte=fechaIni,f_fact__lte=fechaFin).order_by('f_fact','expediente__CodOperador')
	expNoFact = []
	if factu == '2':
		listExp = []
		for factura in facturas:
			listExp.append(factura.expediente)
		expNoFact = VisitaParcela.objects.filter(f_visita__gte=fechaIni,f_visita__lte=fechaFin).exclude(expediente__in = listExp).order_by('f_visita','expediente__CodOperador')
	
	data = list()
	cont = 1
	if factu == '1':
		for factura in facturas:
			list_exp = list()
			list_exp.append(cont)
			list_exp.append(factura.f_fact)
			list_exp.append(factura.expediente.CodOperador)
			operador = (factura.expediente.id_cliente.Nombre+" "+factura.expediente.id_cliente.Apellido1+" "+factura.expediente.id_cliente.Apellido2).upper()
			list_exp.append(operador)
			list_exp.append(factura.expediente.id_cliente.nifcif)
			contacto = ContactoOperador.objects.filter(id_operador = factura.expediente)
			contact = ''
			if len(contacto) > 0:
				contact = contacto[0].Nombre+" "+contacto[0].Apellido1+" "+contacto[0].Apellido2
			list_exp.append(contact)
			direccion = factura.expediente.id_cliente.Domicilio+". "+factura.expediente.id_cliente.CP+" "+factura.expediente.id_cliente.Municipio.Municipio+" ("+factura.expediente.id_cliente.Provincia.Provincia+")"
			list_exp.append(direccion)
			list_exp.append(int(factura.expediente.id_cliente.Telefono1))
			list_exp.append(factura.expediente.id_cliente.Email)
			list_exp.append(factura.concepto.upper())
			euro = "€"
			list_exp.append(factura.importe)
			
			
			ibn = factura.expediente.id_cliente.iban
			isbn = factura.expediente.id_cliente.esiban
			codigo = ''
			if isbn:
				codigo = isbn
				iban = ibn[0:4]+"-"+ibn[4:8]+"-"+ibn[8:10]+"-"+ibn[10:]
				codigo = isbn+"-"+iban
			else:
				if ibn:
					codigo = ibn[0:4]+"-"+ibn[4:8]+"-"+ibn[8:10]+"-"+ibn[10:]
			
			list_exp.append(codigo)
			cont += 1
			data.append(list_exp)
	else:
		for expediente in expNoFact:
			list_exp = list()
			list_exp.append(cont)
			list_exp.append(expediente.f_visita)
			list_exp.append(expediente.expediente.CodOperador)
			operador = (expediente.expediente.id_cliente.Nombre+" "+expediente.expediente.id_cliente.Apellido1+" "+expediente.expediente.id_cliente.Apellido2).upper()
			list_exp.append(operador)
			list_exp.append(expediente.expediente.id_cliente.nifcif)
			contacto = ContactoOperador.objects.filter(id_operador = expediente.expediente)
			contact = ''
			if len(contacto) > 0:
				contact = contacto[0].Nombre+" "+contacto[0].Apellido1+" "+contacto[0].Apellido2
			list_exp.append(contact)
			direccion = expediente.expediente.id_cliente.Domicilio+". "+expediente.expediente.id_cliente.CP+" "+expediente.expediente.id_cliente.Municipio.Municipio+" ("+expediente.expediente.id_cliente.Provincia.Provincia+")"
			list_exp.append(direccion)
			list_exp.append(int(expediente.expediente.id_cliente.Telefono1))
			list_exp.append(expediente.expediente.id_cliente.Email)
			
			ibn = expediente.expediente.id_cliente.iban
			isbn = expediente.expediente.id_cliente.esiban
			codigo = ''
			if isbn:
				codigo = isbn
				iban = ibn[0:4]+"-"+ibn[4:8]+"-"+ibn[8:10]+"-"+ibn[10:]
				codigo = isbn+"-"+iban
			else:
				if ibn:
					codigo = ibn[0:4]+"-"+ibn[4:8]+"-"+ibn[8:10]+"-"+ibn[10:]
			
			list_exp.append(codigo)
			cont += 1
			data.append(list_exp)

	output = StringIO.StringIO()
	wb = xlsxwriter.Workbook(output)
	sheet = wb.add_worksheet('DATOS EXPEDIENTES')
	
	format1 = wb.add_format({
		'bold':True,
		'align':'center',
		'font_size':12,
		'font_name': 'Georgia',
	})
	
	format2 = wb.add_format({
		'bold':True,
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	format3 = wb.add_format({
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	formatRed = wb.add_format({
		'font_color': 'red',
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	url_format = wb.add_format({
		'font_color': 'blue',
		'underline':  1,
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	strng = '0.00€'
	money_format = wb.add_format({
		'num_format': strng.decode('utf-8'),
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia'
	})
	
	date_format = wb.add_format({'num_format': 'dd/mm/yyyy',
                                'align':'center',
								'font_size':10,
								'font_name': 'Georgia'})

	
	sheet.set_column(0,0,10,format1)
	sheet.set_column(1,1,20)
	sheet.set_column(2,2,14)
	sheet.set_column(3,3,46)
	sheet.set_column(4,4,9)
	sheet.set_column(5,5,25)
	sheet.set_column(6,6,55)
	sheet.set_column(7,7,14)
	sheet.set_column(8,8,34)
	if factu == '1':
		sheet.set_column(9,9,59)
		sheet.set_column(10,10,13)
		sheet.set_column(11,11,26)
	else:
		sheet.set_column(9,9,26)
	
	if factu == '1':
		fact = 'FECHA FACTURACIÓN'
	else:
		fact = 'FECHA VISITA'
	sheet.write('B2',fact.decode('utf-8'),format2)
	exp = 'NºEXPEDIENTE'
	sheet.write('C2',exp.decode('utf-8'),format2)
	sheet.write('D2','OPERADOR',format2)
	sheet.write('E2','CIF',format2)
	sheet.write('F2','PERSONA CONTACTO',format2)
	direc = "DIRECCIÓN"
	sheet.write('G2',direc.decode('utf-8'),format2)
	tel = 'TELÉFONO'
	sheet.write('H2',tel.decode('utf-8'),format2)
	correo = 'CORREO ELECTRÓNICO'
	sheet.write('I2',correo.decode('utf-8'),format2)
	if factu == '1':
		sheet.write('J2','CONCEPTO',format2)
		sheet.write('K2','IMPORTE',format2)
		sheet.write('L2','CUENTA BANCARIA',format2)
		sheet.autofilter('B2:L2')
	else:
		sheet.write('J2','CUENTA BANCARIA',format2)
		sheet.autofilter('B2:J2')
	
	
	
	
	row = 2
	for row_data in (data):
		sheet.write_row(row, 0, row_data,format3)
		sheet.write_datetime(row,1,row_data[1], date_format)
		sheet.write_url(row, 8,'mailto:'+row_data[8]+'', url_format, row_data[8])
		if factu == '1':
			sheet.write(row, 10, row_data[10], money_format)	
		row += 1
		
	wb.close()
	output.seek(0)
	
	response = HttpResponse(output.read(), content_type="application/ms-excel")  
	response['Content-Disposition'] = 'attachment; filename=%s' % filename
	
	return response

@login_required()	
def datosPagos (request):
		
	user = User.objects.get(id=request.user.id)
	if not user.is_staff:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
			
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				return HttpResponseRedirect('/Dashboard/')	
	
	fechahoy = datetime.date.today()
	fecha = str(fechahoy.day)+"_"+str(fechahoy.month)+" "+str(fechahoy.year)

	filename = 'Datos_Pagos_'+fecha+'.xlsx'
	expedientes = Expediente.objects.all().order_by('id_cliente')

	data = list()
	cont = 1
	for expediente in expedientes:
		list_exp = list()
		list_exp.append(cont);
		cliente = (expediente.id_cliente.Nombre+" "+expediente.id_cliente.Apellido1+" "+expediente.id_cliente.Apellido2).upper()
		list_exp.append(cliente)
		list_exp.append(expediente.CodOperador)
		list_exp.append(expediente.id_cliente.nifcif)
		direccion = expediente.id_cliente.Domicilio+". "+expediente.id_cliente.CP+" "+expediente.id_cliente.Municipio.Municipio+" ("+expediente.id_cliente.Provincia.Provincia+")"
		list_exp.append(direccion)
		contacto = ContactoOperador.objects.filter(id_operador = expediente)
		contact = ''
		if len(contacto) > 0:
			contact = contacto[0].Nombre+" "+contacto[0].Apellido1+" "+contacto[0].Apellido2
		list_exp.append(contact)
		list_exp.append(int(expediente.id_cliente.Telefono1))
		list_exp.append(expediente.id_cliente.Email)
		
		formaPago = expediente.id_cliente.f_pago
		f_pago = ""
		if formaPago == "D":
			f_pago = "Domiciliado"
		elif formaPago == "T":
			f_pago = "Transferencia"
		
		list_exp.append(f_pago)
		
		tipoPago = expediente.id_cliente.p_recur
		t_pago = ""
		if tipoPago == "R":
			t_pago = "Pago recurrente"
		elif tipoPago == "U":
			t_pago = "Pago único"

		list_exp.append(t_pago.decode('utf-8'))
		list_exp.append(expediente.id_cliente.F_sepa)
			
		ibn = expediente.id_cliente.iban
		isbn = expediente.id_cliente.esiban
		codigo = ''
		if isbn:
			codigo = isbn
			iban = ibn[0:4]+"-"+ibn[4:8]+"-"+ibn[8:10]+"-"+ibn[10:]
			codigo = isbn+"-"+iban
		else:
			if ibn:
				codigo = ibn[0:4]+"-"+ibn[4:8]+"-"+ibn[8:10]+"-"+ibn[10:]
		
		list_exp.append(codigo)
		list_exp.append(expediente.id_cliente.observaciones)
		cont += 1
		data.append(list_exp)
	

	output = StringIO.StringIO()
	wb = xlsxwriter.Workbook(output)
	sheet = wb.add_worksheet('DATOS PAGOS')
	
	format1 = wb.add_format({
		'bold':True,
		'align':'center',
		'font_size':12,
		'font_name': 'Georgia',
	})
	
	format2 = wb.add_format({
		'bold':True,
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	format3 = wb.add_format({
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	
	
	url_format = wb.add_format({
		'font_color': 'blue',
		'underline':  1,
		'align':'center',
		'font_size':10,
		'font_name': 'Georgia',
	})
	

	
	date_format = wb.add_format({'num_format': 'dd/mm/yyyy',
                                'align':'center',
								'font_size':10,
								'font_name': 'Georgia'})

	
	sheet.set_column(0,0,10,format1)
	sheet.set_column(1,1,40)
	sheet.set_column(2,2,16)
	sheet.set_column(3,3,9)
	sheet.set_column(4,4,55)
	sheet.set_column(5,5,40)
	sheet.set_column(6,6,12)
	sheet.set_column(7,7,30)
	sheet.set_column(8,8,20)
	sheet.set_column(9,9,20)
	sheet.set_column(10,10,20)
	sheet.set_column(11,11,30)
	sheet.set_column(12,12,100)
	
	
	sheet.write('B2','CLIENTE',format2)
	exp = 'Nº EXPEDIENTE'
	sheet.write('C2',exp.decode('utf-8'),format2)
	sheet.write('D2','CIF',format2)
	direc = "DIRECCIÓN"
	sheet.write('E2',direc.decode('utf-8'),format2)
	sheet.write('F2','PERSONA CONTACTO',format2)
	tel = 'TELÉFONO'
	sheet.write('G2',tel.decode('utf-8'),format2)
	correo = 'EMAIL'
	sheet.write('H2',correo.decode('utf-8'),format2)
	sheet.write('I2','FORMA DE PAGO',format2)
	sheet.write('J2','TIPO DE PAGO',format2)
	sheet.write('K2','FECHA ORDEN SEPA',format2)
	cuenta = 'Nº CUENTA'
	sheet.write('L2',cuenta.decode('utf-8'),format2)
	sheet.write('M2','OBSERVACIONES',format2)
	sheet.autofilter('B2:L2')
	
	row = 2
	for row_data in (data):
		sheet.write_row(row, 0, row_data,format3)
		if row_data[10]:
			sheet.write_datetime(row,10,row_data[10], date_format)
		sheet.write_url(row, 7,'mailto:'+row_data[7]+'', url_format, row_data[7])	
		row += 1
		
	wb.close()
	output.seek(0)
	
	response = HttpResponse(output.read(), content_type="application/ms-excel")  
	response['Content-Disposition'] = 'attachment; filename=%s' % filename
	
	return response
	
@login_required()
def expedientesCertificados(request):
    
	expedientesAE = Expediente.objects.filter(tipoAgricultura = 'AE',vigente='SI').order_by('F_finalvigencia')	
	expedientesGA = Expediente.objects.filter(tipoAgricultura = 'GA',vigente='SI').order_by('F_finalvigencia')	
	arrayIni = ['SI','SI','SI']
	arrayIni2 = ['SI','SI','SI','SI','SI']
	arrayIni3 = ['NO','NO','NO']
	user = User.objects.get(id=request.user.id)
	if user.is_staff:
		
		client = arrayIni
		expedient = arrayIni
		riesgos = arrayIni
		archivos = arrayIni2
		certifica = arrayIni
		planificadas = arrayIni
		auditorias = arrayIni
		facturacion = arrayIni
		inspectores = arrayIni
		
	else:
		perfil = Perfil.objects.get(user=request.user)
		inspect = Inspector.objects.get(id=perfil.id)
		usInspector = usuarioInspector.objects.filter(inspector = inspect)
		
		if len(usInspector) > 0:
			if perfil.TipoUsuario == 'A':
				expedient = arrayIni3
				planificadas = arrayIni3
				auditorias = arrayIni3
				return HttpResponseRedirect('/Dashboard/')
			else:
				expedient = str(usInspector[0].expedientes).split()
				planificadas = str(usInspector[0].p_visitas).split()
				auditorias = str(usInspector[0].auditorias).split()
			
			client = str(usInspector[0].clientes).split()
			riesgos = str(usInspector[0].ev_riesgos).split()
			archivos = str(usInspector[0].archivos).split()
			certifica = str(usInspector[0].certifica).split()
			facturacion = str(usInspector[0].facturacion).split()
			inspectores = str(usInspector[0].inspectores).split()
	template = loader.get_template('ecologica/Certificados.html')
	
	numAE = len(expedientesAE)
	numGA = len(expedientesGA)
	context = RequestContext(request, {
		'lista_expedientesAE':  expedientesAE,
		'lista_expedientesGA':  expedientesGA,
		'numAE': numAE,
		'numGA': numGA,
		'consultaCliente':client[0],
		'creaCliente':client[2],
		'consultaExpediente':expedient[0],
		'consultaRiesgos':riesgos[0],
		'generaNuevosClientes':archivos[1],
		'consultaCertificados':certifica[0],
		'consultaPlanificadas':planificadas[0],
		'consultaAuditorias':auditorias[0],
		'consultaFacturacion':facturacion[0],
		'consultaInspectores':inspectores[0],
		'creaInspector':inspectores[2],
		'generaSipea':archivos[0]
		
	})
	return HttpResponse(template.render(context))	

		
class UsuariosList(generics.ListCreateAPIView):
	queryset = User.objects.all()
	serializer_class = UsuariosSerializer
	
class UsuariosDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = User.objects.all()
	serializer_class = UsuariosSerializer

class ProvinciaList(generics.ListCreateAPIView):
	queryset = Provincia.objects.all()
	serializer_class = ProvinciaSerializer
	
class ProvinciaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Provincia.objects.all()
	serializer_class = ProvinciaSerializer
	
class MunicipioList(generics.ListCreateAPIView):
	queryset = Municipio.objects.all()
	serializer_class = MunicipioSerializer
	
class MunicipioDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Municipio.objects.all()
	serializer_class = MunicipioSerializer
	
class ContactoList(generics.ListCreateAPIView):
	queryset = ContactoOperador.objects.all()
	serializer_class = ContactoSerializer
	
class ContactoDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = ContactoOperador.objects.all()
	serializer_class = ContactoSerializer
	
class ExpedienteList(generics.ListCreateAPIView):
	queryset = Expediente.objects.all()
	serializer_class = ExpedienteSerializer

	
class ExpedienteDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Expediente.objects.all()
	serializer_class = ExpedienteSerializer

	
class InterlocutoresList(generics.ListCreateAPIView):
	queryset = InterlocutoresVisita.objects.all()
	serializer_class = InterlocutoresSerializer
	
class InterlocutoresDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = InterlocutoresVisita.objects.all()
	serializer_class = InterlocutoresSerializer
	
class FormaJuridicaList(generics.ListCreateAPIView):
	queryset = FormaJuridica.objects.all()
	serializer_class = FormaJuridicaSerializer
	
class FormaJuridicaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = FormaJuridica.objects.all()
	serializer_class = FormaJuridicaSerializer
	
class ClienteList(generics.ListCreateAPIView):
	queryset = Cliente.objects.all()
	serializer_class = ClienteSerializer
	
class ClienteDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Cliente.objects.all()
	serializer_class = ClienteSerializer
	
class ProductoAgricolaList(generics.ListCreateAPIView):
	queryset = ProductoAgricola.objects.all()
	serializer_class = ProductoAgricolaSerializer
	
class ProductoAgricolaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = ProductoAgricola.objects.all()
	serializer_class = ProductoAgricolaSerializer
	
class ProductoGanaderiaList(generics.ListCreateAPIView):
	queryset = ProductoGanaderia.objects.all()
	serializer_class = ProductoGanaderiaSerializer
	
class ProductoGanaderiaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = ProductoGanaderia.objects.all()
	serializer_class = ProductoGanaderiaSerializer
	
class ProductoIndustriaList(generics.ListCreateAPIView):
	queryset = ProductoIndustria.objects.all()
	serializer_class = ProductoIndustriaSerializer
	
class ProductoIndustriaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = ProductoIndustria.objects.all()
	serializer_class = ProductoIndustriaSerializer
	
class VariedadesList(generics.ListCreateAPIView):
	queryset = Variedades.objects.all()
	serializer_class = VariedadesSerializer
	
class VariedadesDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Variedades.objects.all()
	serializer_class = VariedadesSerializer
	
class VisitaParcelaList(generics.ListCreateAPIView):
	queryset = VisitaParcela.objects.all()
	serializer_class = VisitaParcelaSerializer
	
class VisitaParcelaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = VisitaParcela.objects.all()
	serializer_class = VisitaParcelaSerializer
	
class AuditoriaList(generics.ListCreateAPIView):
	queryset = Auditoria.objects.all()
	serializer_class = AuditoriaSerializer
	
class AuditoriaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Auditoria.objects.all()
	serializer_class = AuditoriaSerializer
	
class IncumplimientoList(generics.ListCreateAPIView):
	queryset = Incumplimiento.objects.all()
	serializer_class = IncumplimientoSerializer
	
class IncumplimientoDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Incumplimiento.objects.all()
	serializer_class = IncumplimientoSerializer
	
class ParcelaList(generics.ListCreateAPIView):
	queryset = Parcela.objects.all()
	serializer_class = ParcelaSerializer
	
class ParcelaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Parcela.objects.all()
	serializer_class = ParcelaSerializer
	
class HistoricoCultivosList(generics.ListCreateAPIView):
	queryset = HistoricoCultivos.objects.all()
	serializer_class = HistoricoCultivosSerializer
	
class HistoricoCultivosDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = HistoricoCultivos.objects.all()
	serializer_class = HistoricoCultivosSerializer
	
class InspectorList(generics.ListCreateAPIView):
	queryset = Inspector.objects.all()
	serializer_class = InspectorSerializer
	
class InspectorDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Inspector.objects.all()
	serializer_class = InspectorSerializer
	
class ImagenesList(generics.ListCreateAPIView):
	queryset = RepositorioImagenes.objects.all()
	serializer_class = ImagenesSerializer
	
class ImagenesDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = RepositorioImagenes.objects.all()
	serializer_class = ImagenesSerializer
	
class RecolectorParcelasList(generics.ListCreateAPIView):
	queryset = RecolectorParcelas.objects.all()
	serializer_class = RecolectorParcelasSerializer
	
class RecolectorParcelasDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = RecolectorParcelas.objects.all()
	serializer_class = RecolectorParcelasSerializer
	
class RiesgoList(generics.ListCreateAPIView):
	queryset = riesgo.objects.all()
	serializer_class = RiesgoSerializer
	
class RiesgoDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = riesgo.objects.all()
	serializer_class = RiesgoSerializer
	
class RecolectorErroresList(generics.ListCreateAPIView):
	queryset = RecolectorErrores.objects.all()
	serializer_class = RecolectorErroresSerializer
	
class RecolectorErroresDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = RecolectorErrores.objects.all()
	serializer_class = RecolectorErroresSerializer
	
class GanadoList(generics.ListCreateAPIView):
	queryset = Ganado.objects.all()
	serializer_class = GanadoSerializer
	
class GanadoDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Ganado.objects.all()	
	serializer_class = GanadoSerializer
	
class FacturacionList(generics.ListCreateAPIView):
	queryset = Facturacion.objects.all()
	serializer_class = FacturacionSerializer
	
class FacturacionDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Facturacion.objects.all()	
	serializer_class = FacturacionSerializer
	
class NuevosExpedientesList(generics.ListCreateAPIView):
	queryset = NuevosExpedientes.objects.all()
	serializer_class = NuevosExpedientesSerializer
	
class NuevosExpedientesDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = NuevosExpedientes.objects.all()	
	serializer_class = NuevosExpedientesSerializer
	
class AccionesCorrectivasList(generics.ListCreateAPIView):
	queryset = AccionesCorrectivas.objects.all()
	serializer_class = AccionesCorrectivasSerializer
	
class AccionesCorrectivasDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = AccionesCorrectivas.objects.all()	
	serializer_class = AccionesCorrectivasSerializer
	
class EvaluacionList(generics.ListCreateAPIView):
	queryset = Evaluacion.objects.all()
	serializer_class = EvaluacionSerializer
	
class EvaluacionDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Evaluacion.objects.all()	
	serializer_class = EvaluacionSerializer
	
class PerfilList(generics.ListCreateAPIView):
	queryset = Perfil.objects.all()
	serializer_class = PerfilSerializer
	
class PerfilDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Perfil.objects.all()
	serializer_class = PerfilSerializer
	
class IndustriaList(generics.ListCreateAPIView):
	queryset = Industria.objects.all()
	serializer_class = IndustriaSerializer
	
class IndustriaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Industria.objects.all()
	serializer_class = IndustriaSerializer	
	
class UsuarioInspectorList(generics.ListCreateAPIView):
	queryset = usuarioInspector.objects.all()
	serializer_class = UsuarioInspectorSerializer
	
class UsuarioInspectorDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = usuarioInspector.objects.all()
	serializer_class = UsuarioInspectorSerializer	
	
class Historico_CertificadosList(generics.ListCreateAPIView):
	queryset = Historico_Certificados.objects.all()
	serializer_class = HistoricoCertificadosSerializer
	
class Historico_CertificadosDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = Historico_Certificados.objects.all()
	serializer_class = HistoricoCertificadosSerializer
	
class parcelas_visitaList(generics.ListCreateAPIView):
	queryset = parcelas_visita.objects.all()
	serializer_class = parcelas_visitaSerializer
	
class parcelas_visitaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = parcelas_visita.objects.all()
	serializer_class = parcelas_visitaSerializer
	
class ganado_visitaList(generics.ListCreateAPIView):
	queryset = ganado_visita.objects.all()
	serializer_class = ganado_visitaSerializer
	
class ganado_visitaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = ganado_visita.objects.all()
	serializer_class = ganado_visitaSerializer
	
class industria_visitaList(generics.ListCreateAPIView):
	queryset = industria_visita.objects.all()
	serializer_class = industria_visitaSerializer
	
class industria_visitaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = industria_visita.objects.all()
	serializer_class = industria_visitaSerializer
	
class InformeVisitaList(generics.ListCreateAPIView):
	queryset = InformeVisita.objects.all()
	serializer_class = InformeVisitaSerializer
	
class InformeVisitaDetail(generics.RetrieveUpdateDestroyAPIView):
	queryset = InformeVisita.objects.all()
	serializer_class = InformeVisitaSerializer
	
def generaPlanificaciones(request, year1 = None, month1 = None, day1 = None,year2 = None, month2 = None, day2 = None):

	response = HttpResponse(content_type='text/plain')
	filename = "Planificacion_"+day1+"_"+month1+"_"+year1+".txt"
	response['Content-Disposition'] = 'attachment; filename=%s' % filename

	writer = csv.writer(response)
	fechaIni = datetime.date(int(year1), int(month1), int(day1)) 
	fechaFin = datetime.date(int(year2), int(month2), int(day2)) 
	visitas = VisitaParcela.objects.filter(f_visita__gte = fechaIni,f_visita__lte = fechaFin).order_by('expediente__id_cliente','expediente')
	for visita in visitas:
		if visita.expediente.tipoAgricultura == 'AE':
			parcelas = parcelas_visita.objects.filter(visita = visita, pla_completa='N')
		elif visita.expediente.tipoAgricultura == 'GA':
			parcelas = ganado_visita.objects.filter(visita = visita, pla_completa='N')
		elif visita.expediente.tipoAgricultura == 'IN':
			parcelas = industria_visita.objects.filter(visita = visita, pla_completa='N')
		for par in parcelas:
		
			fila = 'PLA  03009'
			if visita.actuacion == 'Auditoria Inicial Anunciada':
				fila = fila+'AUDIN'
			elif visita.actuacion == 'Auditoria Anual Anunciada':
				fila = fila+'AUDSE'
			elif visita.actuacion == 'Auditoria Adicional Anunciada':
				fila = fila+'AUDEX'
			elif visita.actuacion == 'Auditoria Inicial No Anunciada':
				fila = fila+'AINNA'
			elif visita.actuacion == 'Auditoria Anual No Anunciada':
				fila = fila+'ASENA'
			elif visita.actuacion == 'Auditoria Adicional No Anunciada':
				fila = fila+'AEXNA'
			fila = fila+'01A92166784  '
			nifAuditor = visita.inspector.nif
			fila = fila+nifAuditor+" "
			dia = str(visita.f_visita.day)
			while len(dia)<2:
				dia = '0'+dia
			fila = fila+dia
			mes = str(visita.f_visita.month)
			while len(mes)<2:
				mes = '0'+mes
			fila = fila+mes
			anyo = str(visita.f_visita.year)
			fila = fila+anyo
			clienteNif = visita.expediente.id_cliente.nifcif
			fila = fila+clienteNif+" "
			codSipea = visita.expediente.CodSipea
			while len(codSipea)<15:
				codSipea = codSipea+" "
			fila = fila + codSipea
			tipoInstala = visita.expediente.tipoAgricultura
			if tipoInstala == 'AE':
				fila = fila+'1'
				fila = fila + ' '
				fila = fila + par.parcela.provincia.CodProvincia[1:]
				fila = fila + par.parcela.municipio.CodCatastral
				codExp = par.parcela.provincia.CodProvincia[1:]+par.parcela.municipio.CodCatastral+par.parcela.poligono+par.parcela.parcela+par.parcela.recinto
				fila = fila + codExp
				fila = fila + "               "
				
			elif tipoInstala == 'GA':
				fila = fila+'2'
				fila = fila + par.esAcuicola
				fila = fila + par.ganado.provincia.CodProvincia[1:]
				fila = fila + par.ganado.municipio.CodCatastral
				if par.esAcuicola == 'S':
					fila = fila + "                  "
					regAc = par.ganado.regAcuicola
					while len(regAc)<15:
						regAc = regAc+" "
					fila = fila + regAc
				else:
					fila = fila + "ES"+par.ganado.codExplotREGA[2:]+"    "
					fila = fila + "               "
				
			elif tipoInstala == 'IN':
				fila = fila+'3'
				fila = fila + ' '
				fila = fila + par.industria.provincia.CodProvincia[1:]
				fila = fila + par.industria.municipio.CodCatastral
				comprueba = par.industria.matriculaRIA
				if comprueba == 'NO PROCEDE':
					fila = fila + '                  '
				else:
					fila = fila + par.industria.matriculaRIA[0:1]+par.industria.matriculaRIA[3:]+"            "
				fila = fila + "               "
			if par.incidencia == 'BAJA':
				fila = fila + 'B'
			else:
				fila = fila + 'A'
			
			motivo = eliminaTildes(par.motivoBaja).replace(',','.')
			observaciones = eliminaTildes(visita.descripcion).replace(',','.')
			
			while len(motivo)<1000:
				motivo = motivo+" "
			fila = fila + motivo
						
			while len(observaciones)<1000:
				observaciones = observaciones+" "
			fila = fila + observaciones
			
			writer.writerow([fila])

	return response
	
import unicodedata

def eliminaTildes(cadEntrada):
	cadena_sin_tildes = ''.join((c for c in unicodedata.normalize('NFD', unicode(cadEntrada)) if unicodedata.category(c) != 'Mn')) 
	return cadena_sin_tildes

def generaActuaciones(request, year1 = None, month1 = None, day1 = None, year2 = None, month2 = None, day2 = None):

	response = HttpResponse(content_type='text/plain')
	filename = "Actuaciones_"+day1+"_"+month1+"_"+year1+".txt"
	response['Content-Disposition'] = 'attachment; filename=%s' % filename

	writer = csv.writer(response)
	fechaIni = datetime.date(int(year1), int(month1), int(day1)) 
	fechaFin = datetime.date(int(year2), int(month2), int(day2)) 
	auditorias = Auditoria.objects.filter(f_Auditoria__gte = fechaIni,f_Auditoria__lte = fechaFin).order_by('visita__expediente__id_cliente','visita__expediente')

	for auditoria in auditorias:
		if auditoria.visita.expediente.tipoAgricultura == 'AE':
			parcelas = parcelas_visita.objects.filter(visita = auditoria.visita, act_completa='N')
		elif auditoria.visita.expediente.tipoAgricultura == 'GA':
			parcelas = ganado_visita.objects.filter(visita = auditoria.visita, act_completa='N')
		elif auditoria.visita.expediente.tipoAgricultura == 'IN':
			parcelas = industria_visita.objects.filter(visita = auditoria.visita, act_completa='N')
		for par in parcelas:
		
			fila = 'ACTUA'
			if auditoria.visita.actuacion == 'Auditoria Inicial Anunciada':
				fila = fila+'AUDIN'
			elif auditoria.visita.actuacion == 'Auditoria Anual Anunciada':
				fila = fila+'AUDSE'
			elif auditoria.visita.actuacion == 'Auditoria Adicional Anunciada':
				fila = fila+'AUDEX'
			elif auditoria.visita.actuacion == 'Auditoria Inicial No Anunciada':
				fila = fila+'AINNA'
			elif auditoria.visita.actuacion == 'Auditoria Anual No Anunciada':
				fila = fila+'ASENA'
			elif auditoria.visita.actuacion == 'Auditoria Adicional No Anunciada':
				fila = fila+'AEXNA'
			fila = fila +'03'
			fila = fila +'009'
			fila = fila +'01'
			fila = fila +'A92166784  '
			dia = str(auditoria.f_Auditoria.day)
			while len(dia)<2:
				dia = '0'+dia
			fila = fila+dia
			mes = str(auditoria.f_Auditoria.month)
			while len(mes)<2:
				mes = '0'+mes
			fila = fila+mes
			anyo = str(auditoria.f_Auditoria.year)
			fila = fila+anyo
			clienteNif = auditoria.visita.expediente.id_cliente.nifcif
			fila = fila+clienteNif+" "
			codSipea = auditoria.visita.expediente.CodSipea
			while len(codSipea)<15:
				codSipea = codSipea+" "
			fila = fila + codSipea
			nifAuditor = auditoria.visita.inspector.nif
			fila = fila+nifAuditor+" "
			incump = str(auditoria.n_incumplimientos)
			while len(incump)<4:
				incump = '0'+incump
			fila = fila + incump
			tipoInstala = auditoria.visita.expediente.tipoAgricultura
			if tipoInstala == 'AE':
				fila = fila+'1'
				fila = fila + ' '
				codExp = par.parcela.provincia.CodProvincia[1:]+par.parcela.municipio.CodCatastral+par.parcela.poligono+par.parcela.parcela+par.parcela.recinto
				fila = fila + codExp
				fila = fila + "               "
				fila = fila + par.parcela.provincia.CodProvincia[1:]
				fila = fila + par.parcela.municipio.CodCatastral
				
			elif tipoInstala == 'GA':
				fila = fila+'2'
				fila = fila + par.esAcuicola
				if par.esAcuicola == 'S':
					fila = fila + "                  "
					regAc = par.ganado.regAcuicola
					while len(regAc)<15:
						regAc = regAc+" "
					fila = fila + regAc
				else:
					fila = fila + "ES"+par.ganado.codExplotREGA[2:]+"    "
					fila = fila + "               "
				fila = fila + par.ganado.provincia.CodProvincia[1:]
				fila = fila + par.ganado.municipio.CodCatastral
				
				
			elif tipoInstala == 'IN':
				fila = fila+'3'
				fila = fila + ' '
				comprueba = par.industria.matriculaRIA
				if comprueba != 'NO PROCEDE':
					fila = fila + par.industria.matriculaRIA[0:1]+par.industria.matriculaRIA[3:]+"            "
				else:
					fila = fila + '                  '
				fila = fila + "               "
				fila = fila + par.industria.provincia.CodProvincia[1:]
				fila = fila + par.industria.municipio.CodCatastral
				
			muestras = str(auditoria.n_muestras)
			while len(muestras)<2:
				muestras = '0'+muestras
			fila = fila + muestras
			desc_muestras = eliminaTildes(auditoria.des_muestras).replace(',','.')
			
			while len(desc_muestras)<150:
				desc_muestras = desc_muestras+" "
			fila = fila + desc_muestras
			acta = auditoria.acta
			while len(acta)<40:
				acta = acta+" "
			fila = fila+acta
			
			observaciones = eliminaTildes(auditoria.observaciones).replace(',','.')
			while len(observaciones)<1000:
				observaciones = observaciones+" "
			fila = fila+observaciones
				
			writer.writerow([fila])

	return response
	
def generaIncumplimientos(request, year1 = None, month1 = None, day1 = None,year2 = None, month2 = None, day2 = None):

	response = HttpResponse(content_type='text/plain')
	filename = "Incumplimientos_"+day1+"_"+month1+"_"+year1+".txt"
	response['Content-Disposition'] = 'attachment; filename=%s' % filename

	writer = csv.writer(response)
	fechaIni = datetime.date(int(year1), int(month1), int(day1)) 
	fechaFin = datetime.date(int(year2), int(month2), int(day2)) 
	incumplimientos = Incumplimiento.objects.filter(auditoria__f_Auditoria__gte = fechaIni,auditoria__f_Auditoria__lte = fechaFin,inc_completo = 'N')
	

	for incumplimiento in incumplimientos:
		fila_valida = True
		fila = 'NOC  '
		fila = fila +'03'
		fila = fila +'009'
		if incumplimiento.auditoria.visita.actuacion == 'Auditoria Inicial Anunciada':
			fila = fila+'AUDIN'
		elif incumplimiento.auditoria.visita.actuacion == 'Auditoria Anual Anunciada':
			fila = fila+'AUDSE'
		elif incumplimiento.auditoria.visita.actuacion == 'Auditoria Adicional Anunciada':
			fila = fila+'AUDEX'
		elif incumplimiento.auditoria.visita.actuacion == 'Auditoria Inicial No Anunciada':
			fila = fila+'AINNA'
		elif incumplimiento.auditoria.visita.actuacion == 'Auditoria Anual No Anunciada':
			fila = fila+'ASENA'
		elif incumplimiento.auditoria.visita.actuacion == 'Auditoria Adicional No Anunciada':
			fila = fila+'AEXNA'
		fila = fila +'A92166784  '
		nifAuditor = incumplimiento.auditoria.visita.inspector.nif
		fila = fila+nifAuditor+" "
		clienteNif = incumplimiento.auditoria.visita.expediente.id_cliente.nifcif
		fila = fila+clienteNif+" "
		codSipea = incumplimiento.auditoria.visita.expediente.CodSipea
		while len(codSipea)<15:
			codSipea = codSipea+" "
		fila = fila + codSipea
		tipoInstala = incumplimiento.auditoria.visita.expediente.tipoAgricultura
		
			
		incump = incumplimiento.tipoIncumplimiento
		incumpli = ''
		if incump == 'D':
			incumpli = incumpli + 'A'
			incumpli = incumpli +' '
		elif incump == 'NC':
			incumpli = incumpli +'B'
			nocf = incumplimiento.tipoNoConf
			if nocf == 'IR':
				incumpli = incumpli + 'A'
			elif nocf == 'IN':
				incumpli = incumpli + 'B'
				
		fechaAuditoria = ''	
		dia = str(incumplimiento.auditoria.f_Auditoria.day)
		while len(dia)<2:
			dia = '0'+dia
		fechaAuditoria = fechaAuditoria+dia
		mes = str(incumplimiento.auditoria.f_Auditoria.month)
		while len(mes)<2:
			mes = '0'+mes
		fechaAuditoria = fechaAuditoria+mes
		anyo = str(incumplimiento.auditoria.f_Auditoria.year)
		fechaAuditoria = fechaAuditoria+anyo
		
		referencia = incumplimiento.incumpRef
		fase = incumplimiento.fase_proc
		while len(fase)<10:
			fase = fase + ' '
			
		referencia = referencia + fase
		producto = incumplimiento.producto
		
		if tipoInstala == 'AE':
			fila = fila+'1'
			fila = fila + ' '
			fila = fila + incumpli
			ageco = parcelas_visita.objects.filter(visita = incumplimiento.auditoria.visita)
			if len(ageco)>0:
				parcela = ageco[0].parcela
				fila = fila + parcela.provincia.CodProvincia[1:]
				fila = fila + parcela.municipio.CodCatastral
			else:
				fila_valida = False
			fila = fila +fechaAuditoria
			fila = fila +"                  "
			fila = fila + "               "
			fila = fila + referencia
			if len(producto)>0:
				activ = ProductoAgricola.objects.get(id=int(producto))
				codActi = activ.CodActividad
				while len(codActi)<2:
					codActi = "0"+ codActi
				fila = fila + codActi
				codCult = activ.CodCultivo
				while len(codCult) < 10:
					codCult = "0" + codCult
				fila = fila + codCult
			else:
				fila = fila + "000000000000"
			
		elif tipoInstala == 'GA':
			fila = fila+'2'
			ganado = ganado_visita.objects.filter(visita = incumplimiento.auditoria.visita)
			if len(ganado)>0:
				parcela = ganado[0].ganado
				fila = fila + ganado[0].esAcuicola
				fila = fila + incumpli
				
				fila = fila + parcela.provincia.CodProvincia[1:]
				fila = fila + parcela.municipio.CodCatastral
				fila = fila +fechaAuditoria
				if ganado[0].esAcuicola == 'S':
					fila = fila + "                  "
					regAc = ganado[0].ganado.regAcuicola
					while len(regAc)<15:
						regAc = regAc+" "
					fila = fila + regAc
				else:
					fila = fila + "ES"+ganado[0].ganado.codExplotREGA[2:]+"    "
					fila = fila + "               "
				fila = fila + referencia
				if len(producto)>0:
					activ = ProductoGanaderia.objects.get(id=int(producto))
					codActi = activ.CodActividad
					while len(codActi)<2:
						codActi = "0"+ codActi
					fila = fila + codActi
					codCult = activ.CodProducto
					while len(codCult) < 10:
						codCult = "0" + codCult
					fila = fila + codCult
				else:
					fila = fila + "000000000000"
			else:
				fila_valida = False
			
			
		elif tipoInstala == 'IN':
			fila = fila+'3'
			fila = fila + ' '
			fila = fila + incumpli
			industria = industria_visita.objects.filter(visita = incumplimiento.auditoria.visita)
			if len(industria) > 0:
				parcela = industria[0].industria
				fila = fila + parcela.provincia.CodProvincia[1:]
				fila = fila + parcela.municipio.CodCatastral
			else:
				fila_valida = False
			fila = fila +fechaAuditoria
			if parcela.matriculaRIA == 'NO PROCEDE':
				fila = fila + "                  "
			else:
				fila = fila + parcela.matriculaRIA[0:1]+parcela.matriculaRIA[3:]+"            "
			fila = fila + "               "
			fila = fila + referencia
			if len(producto)>0:
				activ = ProductoIndustria.objects.get(id=int(producto))
				codActi = activ.CodProducto
				while len(codActi)<2:
					codActi = "0"+ codActi
				fila = fila + codActi
				codCult = activ.CodActividad
				while len(codCult) < 10:
					codCult = "0" + codCult
				fila = fila + codCult
			else:
				fila = fila + "000000000000"
		
		n_incump = str(incumplimiento.ref)
		while len(n_incump) < 10:
			n_incump = n_incump + " "
		fila = fila + n_incump
		descripcion = eliminaTildes(incumplimiento.incumplimiento).replace(',','.')
		while len(descripcion)<500:
			descripcion = descripcion + " "
		fila = fila + descripcion
		forma = eliminaTildes(incumplimiento.f_detect).replace(',','.')
		while len(forma)<100:
			forma = forma + ' '
		fila = fila + forma
		fila = fila + incumplimiento.condicion
		observaciones = eliminaTildes(incumplimiento.observaciones).replace(',','.')
		while len(observaciones)<1000:
			observaciones = observaciones + " "
		fila = fila + observaciones
		
		if fila_valida == True:
			writer.writerow([fila])
		else:
			fila = ""

	return response
	
def tansformaFecha(date):
	dia = str(date.day)
	if len(dia) < 2:
		dia= "0"+dia
	
	mes = str(date.month)
	if len(mes) < 2:
		mes= "0"+mes
		
	anyo = str(date.year)
	return dia+"/"+mes+"/"+anyo
	
def getMes(mes):

	if mes == 1:
		return "Enero"
	elif mes == 2:
		return "Febrero"
	elif mes == 3:
		return "Marzo"
	elif mes == 4:
		return "Abril"
	elif mes == 5:
		return "Mayo"
	elif mes == 6:
		return "Junio"
	elif mes == 7:
		return "Julio"
	elif mes == 8:
		return "Agosto"
	elif mes == 9:
		return "Septiembre"
	elif mes == 10:
		return "Octubre"
	elif mes == 11:
		return "Noviembre"
	elif mes == 12:
		return "Diciembre"
	return ""
	
@login_required()
def certificado(request,id_Expediente):
			
	response = HttpResponse(content_type='application/pdf')
	response['Content-Disposition'] = 'attachment; filename="CertificadoCitagro.pdf"'
	buffer = BytesIO()

	p = canvas.Canvas(response)
	
	imagenLogo = RepositorioImagenes.objects.get(id=1)
	filename = imagenLogo.imagen.path
	p.drawImage(filename,-225, 394) 
	
	imagenPie = RepositorioImagenes.objects.get(id=2)
	filename2 = imagenPie.imagen.path
	p.drawImage(filename2,220, 70,width=115,height=40)
	
	imagenPie2 = RepositorioImagenes.objects.get(id=4)
	filename3 = imagenPie2.imagen.path
	p.drawImage(filename3,430, 70,width=72,height=56)
    
	
	p.setLineWidth(.3)
	p.setFont('Arial Narrow', 24)
 
	p.drawString(140,770,'Certificado de Conformidad')
	p.drawString(152,740,'AGRICULTURA ECOLÓGICA')
	

	expediente = Expediente.objects.get(id=id_Expediente)
	documento = expediente.idDocumento;
	
	if len(documento) < 2:
		documento = "0"+documento;
		
	p.setFont('Arial Narrow Bold', 11)
	codigo = expediente.CodOperador[0:6]+"/"+expediente.CodOperador[7:9]+"/"+expediente.CodOperador[10:12]+"/CC"+documento
	p.drawString(248,710,codigo)
	
	p.setFont('Arial Narrow', 10)
	
	p.drawString(85,500,"El Centro de Innovación y Tecnología Agroalimentaria, S.A. (CITAGRO), como organismo de control y certificación")
	p.drawString(155,485,"autorizado (código ES-ECO-030-AN), concede el certificado de conformidad a:")
	
	p.setFont('Arial Narrow', 20)
	cliente = Cliente.objects.get(id = expediente.id_cliente.id)
	nombreCliente = cliente.Nombre+" "+cliente.Apellido1+" "+cliente.Apellido2
	
	p.drawCentredString(4*inch, 6.2*inch, nombreCliente)

	
	p.setFont('Arial Narrow Bold', 10)
	codigo2 = expediente.CodOperador[0:6]+"/"+expediente.CodOperador[7:9]+"/"+expediente.CodOperador[10:12]
	p.drawCentredString(4*inch, 5.8*inch,"Operador: "+codigo2)
	
	p.setFont('Arial Narrow Bold', 12)
	p.drawCentredString(4*inch, 5.4*inch,cliente.Domicilio+",")
	p.drawCentredString(4*inch, 5.2*inch,"CP "+cliente.CP+", "+cliente.Municipio.Municipio+" ("+cliente.Provincia.Provincia+")")
	p.drawCentredString(4*inch, 5*inch,"ESPAÑA")
	
	p.setFont('Arial Narrow', 10)
	p.drawCentredString(4*inch, 4.6*inch,"Se expide el presente documento sobre la base del artículo 29, apartado 1, del Reglamento (CE) 834/2007 y del")
	p.drawCentredString(4*inch, 4.4*inch,"Reglamento (CE) 889/2008. El operador declarado ha sometido sus actividades a control y cumple los requisitos")
	p.drawString(1.15*inch, 4.2*inch,"establecidos en los citados Reglamentos, para los siguientes productos/alcance:")
	
	p.setFont('Arial Narrow Bold', 10)
	producto = ""
	if expediente.tipoAgricultura == "AE":
		producto = "VEGETALES Y PRODUCTOS VEGETALES"
    
	p.drawCentredString(4*inch, 3.8*inch,producto)
	p.setFont('Arial Narrow', 10)
	Visita = VisitaParcela.objects.filter(expediente = id_Expediente).order_by('-f_visita')
	ultimaVisita = Visita[0]
		
	fechaVisita = tansformaFecha(ultimaVisita.f_visita)
	p.drawString(1.15*inch, 3.4*inch,"Fecha del")
	p.setFont('Arial Narrow Bold', 10)
	p.drawString(1.69*inch, 3.4*inch,"último control")
	
	p.setFont('Arial Narrow', 10)
	p.drawString(2.48*inch, 3.4*inch,"realizado:")
	
	p.setFont('Arial Narrow Bold', 10)
	p.drawString(3*inch, 3.4*inch,fechaVisita)
	
	p.setFont('Arial Narrow', 10)
	p.drawString(1.15*inch, 3.2*inch,"El Sistema de Certificación de CITAGRO se basa en procesos de inspección y ensayos analíticos sobre muestras")
	p.drawString(1.15*inch, 3*inch,"representativas de la producción certificada.")
	
	p.drawString(1.15*inch, 2.6*inch,"Este certificado será")
	
	p.setFont('Arial Narrow Bold', 10)
	fechaIniVigencia = tansformaFecha(expediente.F_iniciovigencia)
	fechaFinVigencia = tansformaFecha(expediente.F_finalvigencia)
	p.drawString(2.22*inch, 2.6*inch,"válido desde "+fechaIniVigencia+" hasta "+fechaFinVigencia)
	
	p.setFont('Arial Narrow', 10)
	p.drawString(4.45*inch, 2.6*inch,", salvo indicación en contra del Comité de")
	p.drawString(1.15*inch, 2.4*inch,"Certificación de Producción Ecológica de CITAGRO, y siempre que se mantengan las condiciones de aplicación del")
	p.drawString(1.15*inch, 2.2*inch,"sistema de producción")
	
	diaHoy = str(expediente.F_iniciovigencia.day)
	mesHoy = getMes(expediente.F_iniciovigencia.month)
	anyoHoy = str(expediente.F_iniciovigencia.year)
	p.drawCentredString(4*inch, 2*inch,"Expedido en Sevilla, el "+diaHoy+" de "+mesHoy+" de "+anyoHoy)
	
	p.setFont('Arial Narrow Bold', 10)
	p.drawString(1.15*inch, 1.4*inch,"Alejandro Rodríguez Merino")
	p.setFont('Arial Narrow', 10)
	p.drawString(1.15*inch, 1.25*inch,"Director Gerente")
	
	p.setFont('Arial Narrow Cursiva', 7)
	p.drawString(40,42,"Este documento es propiedad del Servicio de Certificación de CITAGRO, debiendo ser devuelto en caso de ser requerido. Este documento carece de validez sin su anexo, y sustituye y anula a cualquier")
	p.drawString(40,34,"otro emitido con anterioridad. La validez de este certificado puede verificarse consultando al Servicio de Certificación de CITAGRO. PPS-10-02-D21")

	
	p.setFont('Arial Narrow', 10)
	p.setFillColorRGB(0.89,0.67,0)
	p.drawString(267,63,'www.citagro.es')
	p.setFont('Arial Narrow', 6)
	p.setFillColorRGB(0,0,0)
	p.drawString(340,105,'Tlfno: 954 467 486')
	p.drawString(340,97,'Fax:: 954 460 470')
	p.setFillColorRGB(0.89,0.67,0)
	p.drawString(340,89,'ISLA DE LA CARTUJA')
	p.setFillColorRGB(0,0,0)
	p.drawString(340,81,'Leonardo da Vinci, 2')
	p.drawString(340,73,'Edificio IAT - 41092 Sevilla')
	
	p.setFont('Arial Narrow', 6)
	p.setFillColorRGB(0.5,0.5,0.5)
	parcelas = Parcela.objects.filter(expediente=expediente.id)
	if len(parcelas) >= 15:
		if len(parcelas) % 15 == 0:
			ntotal = str(1 + len(parcelas)/15)
		else:
			ntotal = str(2 + len(parcelas)/15)
	else:
		ntotal = "2"

	p.drawCentredString(4*inch, 23,"1  /  "+ntotal)
	p.setFillColorRGB(0,0,0)
	p.line(40,55,7.7*inch,55)
	p.showPage()
	
	npaginas = 1
	
	p.drawImage(filename2,220, 70,width=115,height=40)
	p.drawImage(filename3,430, 70,width=72,height=56)
			
	width, height = A4
			
	p.setFont('Arial Narrow', 16)
		 
	p.drawCentredString(4*inch,770,'Anexo al Certificado de Conformidad')
	p.drawCentredString(4*inch,750,'AGRICULTURA ECOLÓGICA')
			
	p.setFont('Arial Narrow Bold', 11)
	p.drawCentredString(4*inch,725,codigo)
	p.setFont('Arial Narrow Bold', 12)
	p.drawCentredString(4*inch, 690,producto)
			
	data= [['Nº', 'EXPLOTACIÓN', '', '', '','','SUPERFICIE','','','FECHA\n DE\n INICIO','','CULTIVO\n (PAC)','','','CALIFICACIÓN','',''],
			['', 'Pr', 'Mu', 'Po', 'Pa','Re','','','','','','','','','','','']]

	cont = 1
	parcelasR = []
	siguienteP = False
		
	if len(parcelas)>15:
		parcelasL = []
		for x in range(0,15):
			parcelasL.append(parcelas[x])
		for y in range(15,len(parcelas)):
			parcelasR.append(parcelas[y])
		parcelas = parcelasL
		siguienteP = True
		
	for parcela in parcelas:
		fila = []
		fila.append(cont)
		fila.append(parcela.provincia.CodProvincia)
		fila.append(parcela.municipio.CodMunicipio)
		fila.append(parcela.poligono)
		fila.append(parcela.parcela)
		fila.append(parcela.recinto)
		fila.append(parcela.superficie_hectareas)
		fila.append("")
		fila.append("")
		fila.append(tansformaFecha(parcela.f_ag_ec_rec))
		fila.append("")
		cultivo = parcela.prod_ag.Cultivo
		cult = ''
		if len(cultivo) > 15:
			arrayCultivo = cultivo.split();
			for x in range(0,int(len(arrayCultivo)/2)):
				cult = cult+arrayCultivo[x]+" "
				if x == (int(len(arrayCultivo)/2) -1):
					cult = cult+"\n"
			for x in range(int(len(arrayCultivo)/2),len(arrayCultivo)):
				cult = cult+arrayCultivo[x]+" "
			cultivo = cult
		fila.append(cultivo)
		fila.append("")
		fila.append("")
		nota = parcela.Calificacion
		calif = ""
		if nota == '1':
			calif = "PRODUCCIÓN NO\n ECOLÓGICA"
		elif nota == '2':
			calif = "PERIODO\n CONVERSIÓN"
		elif nota == '3':
			calif = "PRODUCCIÓN\n ECOLÓGICA"
		fila.append(calif)
		fila.append("")
		fila.append("")
		data.append(fila)
		cont = cont + 1

	pieTabla = ['Nota 1: La calificación "Producción No Ecológica" se ajusta a lo indicado en el Art.11 R834/2007\n Nota 2: Los productos que tengan la calificación "PRODUCCIÓN NO ECOLÓGICA" tienen que comercializarse como productos no ecológicos', '', '', '', '','','','','','','','','','','','','']
	data.append(pieTabla)
			   
	tam = 2 + cont
	t=Table(data,5*[0.41*inch], tam*[0.35*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,-1),0.5,colors.black),
				('ALIGN',(0,0),(-1,-1),'CENTER'),
				('VALIGN',(0,0),(-1,-1),'MIDDLE'),
				('FONT',(0,0),(16,1),'Arial Narrow Bold'),
				('SIZE',(0,0),(16,1),10),
				('FONT',(0,-1),(16,-1),'Arial Narrow Cursiva'),
				('FONTSIZE',(0,-1),(16,-1),4),
				('SPAN',(0,0),(0,1)),
				('SPAN',(1,0),(5,0)),
				('SPAN',(6,0),(8,1)),
				('SPAN',(9,0),(10,1)),
				('SPAN',(11,0),(13,1)),
				('SPAN',(14,0),(16,1)),
				('SPAN',(0,-1),(16,-1)),
				 ]))
							  
	for x in range(2, cont+2):
		t.setStyle(TableStyle([
			('FONT',(0,x),(16,x),'Arial Narrow'),
			('SIZE',(0,x),(16,x),9),
			('SPAN',(6,x),(8,x)),
			('SPAN',(9,x),(10,x)),
			('SPAN',(11,x),(13,x)),
			('SPAN',(14,x),(16,x)),
		]))
			
	t.wrapOn(p,width,height)
	
	pos = 555
	
	if cont > 2:
		pos = pos - 25*(cont-2)

	t.drawOn(p,45,pos)
	
	p.setFont('Arial Narrow', 6)
	p.setFillColorRGB(0,0,0)
	p.rect(55,167,480,30, fill=0)
	p.drawString(60, 190,"CÓDIGO DESCRIPCIÓN USO SIGPAC")
	p.drawString(60, 184,"AG Corrientes y superficies de agua; CF Cítricos-Frutal; CI  Cítricos; CS Cítricos-Frutal de cáscara; CV Cítricos-Viñedo; ED Edificaciones; FL Frutal de cáscara-Olivar; FS Frutal de cáscara; FV Frutal de ")
	p.drawString(60, 178,"cáscara-Viñedo; FY Frutal; IM Improductivo; IV Invernaderos y cultivos bajo plástico; OC Olivar-Cítricos; OF Olivar-Frutal; OV Olivar; PA Pasto arbolado; PR Pasto arbustivo; PS Pastizal; FF Frutal de ")
	p.drawString(60, 172,"cáscara-Frutal; TA Tierra arable; TH Huerta; VF Frutal-Viñedo; VI Viñedo; VO Olivar-Viñedo; ZC Zona concentrada; ZV Zona censurada.")
			
	p.setFont('Arial Narrow', 10)
	p.drawCentredString(4*inch, 2*inch,"Expedido en Sevilla, el "+diaHoy+" de "+mesHoy+" de "+anyoHoy)
			
	p.setFont('Arial Narrow Bold', 10)
	p.drawString(1.15*inch, 1.4*inch,"Alejandro Rodríguez Merino")
	p.setFont('Arial Narrow', 10)
	p.drawString(1.15*inch, 1.25*inch,"Director Gerente")
			
	p.setFont('Arial Narrow Cursiva', 7)
	p.drawString(40,42,"Este documento es propiedad del Servicio de Certificación de CITAGRO, debiendo ser devuelto en caso de ser requerido. Este documento carece de validez sin su anexo, y sustituye y anula a cualquier")
	p.drawString(40,34,"otro emitido con anterioridad. La validez de este certificado puede verificarse consultando al Servicio de Certificación de CITAGRO. PPS-10-02-D21")

			
	p.setFont('Arial Narrow', 10)
	p.setFillColorRGB(0.89,0.67,0)
	p.drawString(267,63,'www.citagro.es')
	p.setFont('Arial Narrow', 6)
	p.setFillColorRGB(0,0,0)
	p.drawString(340,105,'Tlfno: 954 467 486')
	p.drawString(340,97,'Fax:: 954 460 470')
	p.setFillColorRGB(0.89,0.67,0)
	p.drawString(340,89,'ISLA DE LA CARTUJA')
	p.setFillColorRGB(0,0,0)
	p.drawString(340,81,'Leonardo da Vinci, 2')
	p.drawString(340,73,'Edificio IAT - 41092 Sevilla')
			
	p.setFont('Arial Narrow', 6)
	p.setFillColorRGB(0.5,0.5,0.5)
	npaginas = npaginas + 1
	p.drawCentredString(4*inch, 23, str(npaginas)+"  /  "+ntotal)
	p.setFillColorRGB(0,0,0)
	p.line(40,55,7.7*inch,55)

	p.showPage()
	
	while siguienteP:
		
		parcelas = parcelasR
		parcelasR = []
		
		if len(parcelas)>15:
			parcelasL = []
			for x in range(0,15):
				parcelasL.append(parcelas[x])
			for y in range(15,len(parcelas)):
				parcelasR.append(parcelas[y])
			parcelas = parcelasL
			siguienteP = True
		else:
			siguienteP = False
	
		p.drawImage(filename2,220, 70,width=115,height=40)
		p.drawImage(filename3,430, 70,width=72,height=56)
				
		width, height = A4
				
		p.setFont('Arial Narrow', 16)
			 
		p.drawCentredString(4*inch,770,'Anexo al Certificado de Conformidad')
		p.drawCentredString(4*inch,750,'AGRICULTURA ECOLÓGICA')
				
		p.setFont('Arial Narrow Bold', 11)
		p.drawCentredString(4*inch,725,codigo)
		p.setFont('Arial Narrow Bold', 12)
		p.drawCentredString(4*inch, 690,producto)
				
		data= [['Nº', 'EXPLOTACIÓN', '', '', '','','SUPERFICIE','','','FECHA\n DE\n INICIO','','CULTIVO\n (PAC)','','','CALIFICACIÓN','',''],
				['', 'Pr', 'Mu', 'Po', 'Pa','Re','','','','','','','','','','','']]
		cont2 = 1
		for parcela in parcelas:
			fila = []
			fila.append(cont)
			fila.append(parcela.provincia.CodProvincia)
			fila.append(parcela.municipio.CodMunicipio)
			fila.append(parcela.poligono)
			fila.append(parcela.parcela)
			fila.append(parcela.recinto)
			fila.append(parcela.superficie_hectareas)
			fila.append("")
			fila.append("")
			fila.append(tansformaFecha(parcela.f_ag_ec_rec))
			fila.append("")
			cultivo = parcela.prod_ag.Cultivo
			cult = ''
			if len(cultivo) > 15:
				arrayCultivo = cultivo.split();
				for x in range(0,int(len(arrayCultivo)/2)):
					cult = cult+arrayCultivo[x]+" "
					if x == (int(len(arrayCultivo)/2) -1):
						cult = cult+"\n"
				for x in range(int(len(arrayCultivo)/2),len(arrayCultivo)):
					cult = cult+arrayCultivo[x]+" "
				cultivo = cult
			fila.append(cultivo)
			fila.append("")
			fila.append("")
			nota = parcela.Calificacion
			calif = ""
			if nota == '1':
				calif = "PRODUCCIÓN NO\n ECOLÓGICA"
			elif nota == '2':
				calif = "PERIODO\n CONVERSIÓN"
			elif nota == '3':
				calif = "PRODUCCIÓN\n ECOLÓGICA"
			fila.append(calif)
			fila.append("")
			fila.append("")
			data.append(fila)
			cont = cont + 1
			cont2 = cont2 + 1

		pieTabla = ['Nota 1: La calificación "Producción No Ecológica" se ajusta a lo indicado en el Art.11 R834/2007\n Nota 2: Los productos que tengan la calificación "PRODUCCIÓN NO ECOLÓGICA" tienen que comercializarse como productos no ecológicos', '', '', '', '','','','','','','','','','','','','']
		data.append(pieTabla)
				   
		tam = 2 + cont2
		t=Table(data,5*[0.41*inch], tam*[0.35*inch])
		t.setStyle(TableStyle([
					('GRID',(0,0),(-1,-1),0.5,colors.black),
					('ALIGN',(0,0),(-1,-1),'CENTER'),
					('VALIGN',(0,0),(-1,-1),'MIDDLE'),
					('FONT',(0,0),(16,1),'Arial Narrow Bold'),
					('SIZE',(0,0),(16,1),10),
					('FONT',(0,-1),(16,-1),'Arial Narrow Cursiva'),
					('FONTSIZE',(0,-1),(16,-1),4),
					('SPAN',(0,0),(0,1)),
					('SPAN',(1,0),(5,0)),
					('SPAN',(6,0),(8,1)),
					('SPAN',(9,0),(10,1)),
					('SPAN',(11,0),(13,1)),
					('SPAN',(14,0),(16,1)),
					('SPAN',(0,-1),(16,-1)),
					 ]))
								  
		for x in range(2, cont2+2):
			t.setStyle(TableStyle([
				('FONT',(0,x),(16,x),'Arial Narrow'),
				('SIZE',(0,x),(16,x),9),
				('SPAN',(6,x),(8,x)),
				('SPAN',(9,x),(10,x)),
				('SPAN',(11,x),(13,x)),
				('SPAN',(14,x),(16,x)),
			]))
				
		t.wrapOn(p,width,height)
		pos = 555
	
		if cont2 > 2:
			pos = pos - 25*(cont2-2)

		t.drawOn(p,45,pos)
				
		p.setFont('Arial Narrow', 10)
		p.drawCentredString(4*inch, 2*inch,"Expedido en Sevilla, el "+diaHoy+" de "+mesHoy+" de "+anyoHoy)
				
		p.setFont('Arial Narrow Bold', 10)
		p.drawString(1.15*inch, 1.4*inch,"Alejandro Rodríguez Merino")
		p.setFont('Arial Narrow', 10)
		p.drawString(1.15*inch, 1.25*inch,"Director Gerente")
				
		p.setFont('Arial Narrow Cursiva', 7)
		p.drawString(40,42,"Este documento es propiedad del Servicio de Certificación de CITAGRO, debiendo ser devuelto en caso de ser requerido. Este documento carece de validez sin su anexo, y sustituye y anula a cualquier")
		p.drawString(40,34,"otro emitido con anterioridad. La validez de este certificado puede verificarse consultando al Servicio de Certificación de CITAGRO. PPS-10-02-D21")

				
		p.setFont('Arial Narrow', 10)
		p.setFillColorRGB(0.89,0.67,0)
		p.drawString(267,63,'www.citagro.es')
		p.setFont('Arial Narrow', 6)
		p.setFillColorRGB(0,0,0)
		p.drawString(340,105,'Tlfno: 954 467 486')
		p.drawString(340,97,'Fax:: 954 460 470')
		p.setFillColorRGB(0.89,0.67,0)
		p.drawString(340,89,'ISLA DE LA CARTUJA')
		p.setFillColorRGB(0,0,0)
		p.drawString(340,81,'Leonardo da Vinci, 2')
		p.drawString(340,73,'Edificio IAT - 41092 Sevilla')
				
		p.setFont('Arial Narrow', 6)
		p.setFillColorRGB(0.5,0.5,0.5)
		npaginas = npaginas + 1
		p.drawCentredString(4*inch, 23, str(npaginas)+"  /  "+ntotal)
		p.setFillColorRGB(0,0,0)
		p.line(40,55,7.7*inch,55)
		
		p.setFont('Arial Narrow', 6)
		p.setFillColorRGB(0,0,0)
		p.rect(55,167,480,30, fill=0)
		p.drawString(60, 190,"CÓDIGO DESCRIPCIÓN USO SIGPAC")
		p.drawString(60, 184,"AG Corrientes y superficies de agua; CF Cítricos-Frutal; CI  Cítricos; CS Cítricos-Frutal de cáscara; CV Cítricos-Viñedo; ED Edificaciones; FL Frutal de cáscara-Olivar; FS Frutal de cáscara; FV Frutal de ")
		p.drawString(60, 178,"cáscara-Viñedo; FY Frutal; IM Improductivo; IV Invernaderos y cultivos bajo plástico; OC Olivar-Cítricos; OF Olivar-Frutal; OV Olivar; PA Pasto arbolado; PR Pasto arbustivo; PS Pastizal; FF Frutal de ")
		p.drawString(60, 172,"cáscara-Frutal; TA Tierra arable; TH Huerta; VF Frutal-Viñedo; VI Viñedo; VO Olivar-Viñedo; ZC Zona concentrada; ZV Zona censurada.")
	
		
		p.showPage()
	
	p.save()
	pdf = buffer.getvalue()
	buffer.close()
	response.write(pdf)
	return response
	
@login_required()
def informeVisita(request,id_Informe):
	
	informe = InformeVisita.objects.get(id = id_Informe)	
	auditoria = informe.auditoria
	codOperador = auditoria.visita.expediente.CodOperador
	visita = auditoria.visita
	response = HttpResponse(content_type='application/pdf')
	response['Content-Disposition'] = 'attachment; filename="Informe de Visita.pdf"'
	buffer = BytesIO()

	styles= {
        'observaciones': ParagraphStyle(
            'observaciones',
			fontName='Arial Narrow',
			bulletFontName = 'Arial Narrow',
			allowWidows = 1,
			alignment = 0,
			splitLongWords = 2,
			leading = 10,
			bulletFontSize = 9,
			fontSize = 7,
			textColor = black,
        ),
		'resumen': ParagraphStyle(
            'resumen',
			fontName='Arial Narrow',
			bulletFontName = 'Arial Narrow',
			allowWidows = 1,
			alignment = 0,
			splitLongWords = 2,
			leading = 12,
			bulletFontSize = 9,
			fontSize = 9,
			textColor = black,
        ),
        'reglamento': ParagraphStyle(
            'reglamento',
			fontName='Arial Narrow',
			bulletFontName = 'Arial Narrow',
			allowWidows = 1,
			alignment = 0,
			splitLongWords = 2,
			leading = 10,
			bulletFontSize = 9,
			fontSize = 9,
			textColor = black,
        ),
    }
	
	
	p = canvas.Canvas(response)
	
	imagenFondo = RepositorioImagenes.objects.get(id=7)
	filename = imagenFondo.imagen.path
	p.drawImage(filename,360, 28,width=215,height=215)
	
	imagenLogo = RepositorioImagenes.objects.get(id=2)
	filename2 = imagenLogo.imagen.path
	p.drawImage(filename2,70, 765,width=115,height=40)
	p.setFont('Arial Narrow', 9)

	codExpediente = codOperador[0:6]+"/"+codOperador[7:9]+"/"+codOperador[10:12]
	p.drawString(70,745,'Expediente: '+auditoria.acta)
	fechaAuditoria = tansformaFecha(auditoria.f_Auditoria)
	p.drawString(70,733,"Fecha: "+fechaAuditoria)
	
	imagenTexto = RepositorioImagenes.objects.get(id=5)
	filename3 = imagenTexto.imagen.path
	p.drawImage(filename3,425, 765,width=95,height=7)
	
	p.setFont('Arial Narrow', 12)
	p.drawString(305,733,'Visita de Control - Producción Ecológica')
	
	p.setFont('Arial Narrow Bold', 14)
	p.rect(140,605,300,95, fill=0)
	p.drawCentredString(4*inch,680,"INFORME DE VISITA")
	p.setFont('Arial Narrow', 18)
	p.drawCentredString(4*inch,653,"PRODUCCIÓN ECOLÓGICA")
	p.setFont('Arial Narrow', 18)
	anyoAuditoria = str(auditoria.f_Auditoria.year)
	p.drawCentredString(4*inch,620,anyoAuditoria)
	
	p.setFont('Arial Narrow Bold', 12)
	p.drawCentredString(4*inch,573,u"OPERADOR Nº "+codExpediente)
	
	cliente = visita.expediente.id_cliente
	nombreCliente = cliente.Nombre+" "+cliente.Apellido1+" "+cliente.Apellido2
	p.setFont('Arial Narrow Bold', 12)
	p.drawCentredString(4*inch,553,nombreCliente.upper())
	
	width, height = A4
	
	data1 = [[u"Nº INFORME:",'','','','','',informe.num_informe,'','','AUDITORÍA:','','','',auditoria.visita.actuacion,'','','','','','','','','','','']]
	
	t=Table(data1,5*[0.25*inch],[0.35*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,-1),0.5,colors.black),
				('FONT',(0,0),(5,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(5,0),8),
				('VALIGN',(0,0),(-1,0),'MIDDLE'),
				('BACKGROUND',(0,0),(0,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('FONT',(6,0),(8,0),'Arial Narrow'),
				('ALIGN',(6,0),(8,0),'CENTER'),
				('SIZE',(6,0),(8,0),10),
				('FONT',(9,0),(12,0),'Arial Narrow Bold'),
				('SIZE',(9,0),(12,0),8),
				('BACKGROUND',(9,0),(12,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('FONT',(13,0),(24,0),'Arial Narrow'),
				('SIZE',(13,0),(24,0),10),
				('SPAN',(0,0),(5,0)),
				('SPAN',(6,0),(8,0)),
				('SPAN',(9,0),(12,0)),
				('SPAN',(13,0),(24,0)),
				 ]))
	t.wrapOn(p,width,height)
	pos = 495
	t.drawOn(p,70,pos)
	
	fechaAud = fechaAuditoria
	fechas = informe.fechas_auditoria.split()
	for fecha in fechas:
		anyo = fecha[0:4]
		mes = fecha[5:7]
		dia = fecha[8:10]
		fechaAud = fechaAud + "  " +dia +"/"+mes+"/"+anyo
	
				 
	data2 = [['FECHAS DE LA\nAUDITORÍA:','','','','','',fechaAud, '', '','','','','','','','','','','','','','','','','']]
	t=Table(data2,5*[0.25*inch],[0.35*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,-1),0.5,colors.black),
				('FONT',(0,0),(5,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(5,0),8),
				('VALIGN',(0,0),(-1,0),'MIDDLE'),
				('BACKGROUND',(0,0),(0,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('FONT',(6,0),(24,0),'Arial Narrow'),
				('SIZE',(6,0),(24,0),10),
				('SPAN',(0,0),(5,0)),
				('SPAN',(6,0),(24,0)),
				 ]))
	t.wrapOn(p,width,height)
	pos = 470
	t.drawOn(p,70,pos)
	
	reglamento = informe.reglamento.split("\n")

	parrafos = "\n\n"
	
	for x in reglamento:
		parrafos = parrafos + x + "<br/>"
	parrafos = parrafos + "\n"
	texto = Paragraph(parrafos, styles['reglamento']) 




	'''texto = "\n\n"
	linea = ""
	for regla in reglamento:
		reglaPartida = regla.split()
		for palabra in reglaPartida:
			if len(linea) < 80:
				linea = linea + palabra + " "
				texto = texto + palabra + " "
			else:
				texto = texto +"\n"
				texto = texto + palabra + " "
				linea = palabra + " "
		linea = ""
		texto = texto + "\n\n"'''
	
	data3 = [['REGLAMENTACIÓN\nESPECÍFICA:','','','','','',texto,'','','','','','','','','','','','','','','','','',''],
			['','','','','','','','','','','','','','','','','','','','','','','','',''],
			['','','','','','','','','','','','','','','','','','','','','','','','','']]
	t=Table(data3,5*[0.25*inch],3*[0.50*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,-1),0.5,colors.black),
				('FONT',(0,0),(5,2),'Arial Narrow Bold'),
				('SIZE',(0,0),(5,2),8),
				('VALIGN',(0,0),(-1,-1),'MIDDLE'),
				('BACKGROUND',(0,0),(0,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('FONT',(6,0),(24,0),'Arial Narrow'),
				('SIZE',(6,0),(24,0),5),
				('SPAN',(0,0),(5,2)),
				('SPAN',(6,0),(24,2)),
				 ]))
	t.wrapOn(p,width,height)
	pos = 362
	t.drawOn(p,70,pos)	

	p.setFillColorRGB(1,1,1)
	p.rect(0.97*inch,3.55*inch,6.25*inch,1.15*inch, fill=1)
	p.setFillColorRGB(0,0,0)
	p.setFont('Arial Narrow Bold', 7)
	p.drawString(76,320,'NOMBRE DEL OPERADOR/ORGANIZACIÓN:')
	p.setFont('Arial Narrow', 9)
	p.drawString(243,320,nombreCliente.upper())
	p.setFont('Arial Narrow Bold', 7)
	p.drawString(76,303,'DIRECCIÓN:')
	p.setFont('Arial Narrow', 9)
	p.drawString(125,303,cliente.Domicilio)
	p.setFont('Arial Narrow Bold', 7)
	p.drawString(76,286,'POBLACIÓN:')
	p.setFont('Arial Narrow', 9)
	poblacion = cliente.Municipio.Municipio
	p.drawString(127,286,poblacion)
	p.setFont('Arial Narrow Bold', 7)
	p.drawString(76,270,'PROVINCIA:')
	p.setFont('Arial Narrow', 9)
	p.drawString(127,270,cliente.Provincia.Provincia)
	p.setFont('Arial Narrow Bold', 7)
	p.drawString(380,286,'CÓDIGO POSTAL:')
	p.setFont('Arial Narrow', 9)
	p.drawString(450,286,cliente.CP)
	listaCultivos = []
	if visita.expediente.tipoAgricultura == 'AE':
	
		cultivos = Parcela.objects.filter(expediente = visita.expediente, ag_eco = 'SI')
		
		for cultivo in cultivos:
			if not cultivo.prod_ag.Cultivo in listaCultivos:
				listaCultivos.append(cultivo.prod_ag.Cultivo)
	elif visita.expediente.tipoAgricultura == 'GA':
		cultivos = Ganado.objects.filter(expedienteGanado = visita.expediente, ag_eco = 'SI')
		for cultivo in cultivos:
			if not cultivo.prod_ag.Producto in listaCultivos:
				listaCultivos.append(cultivo.prod_ag.Producto)
	else:
		cultivos = Industria.objects.filter(expediente = visita.expediente, ag_eco = 'SI')
		for cultivo in cultivos:
			if not cultivo.producto.Actividad in listaCultivos:
				listaCultivos.append(cultivo.producto.Actividad)
	texto = ''
	cont = 0
	for cultivo in listaCultivos:
		if cultivo == 'ALOE':
			cultivo = 'ALOE VERA'
		if cont == 0:
			texto = texto + cultivo 
		elif cont == (len(listaCultivos) - 1):
			texto = texto + " y " + cultivo
		else:
			texto = texto + ", " + cultivo 
		cont = cont + 1
	texto = texto + " en Produccion Ecologica"
		
	textoAlcance = Paragraph(texto, styles['resumen']) 
	
	data4 = [['ALCANCE DE LA\nAUDITORÍA:','','','','','',textoAlcance,'','','','','','','','','','','','','','','','','','']]
	t=Table(data4,5*[0.25*inch],[0.50*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,0),0.5,colors.black),
				('FONT',(0,0),(5,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(5,0),8),
				('VALIGN',(0,0),(-1,0),'MIDDLE'),
				('BACKGROUND',(0,0),(0,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('FONT',(6,0),(24,0),'Arial Narrow'),
				('SIZE',(6,0),(24,0),10),
				('SPAN',(0,0),(5,0)),
				('SPAN',(6,0),(24,0)),
				 ]))
	t.wrapOn(p,width,height)
	pos = 190
	t.drawOn(p,70,pos)	
	
	data5 = [['REPRESENTANTE DE\nLA ORGANIZACIÓN:','','','','','','','','','','','','','','','','','','','','','','','','']]
	t=Table(data5,5*[0.25*inch],[0.60*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,0),0.5,colors.black),
				('FONT',(0,0),(5,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(5,0),8),
				('VALIGN',(0,0),(-1,0),'MIDDLE'),
				('BACKGROUND',(0,0),(0,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('SPAN',(0,0),(5,0)),
				('SPAN',(6,0),(24,0)),
				 ]))
	t.wrapOn(p,width,height)
	pos = 117
	t.drawOn(p,70,pos)	
	
	p.setFont('Arial Narrow Bold', 8)
	p.drawString(184,145,'NOMBRE:')
	p.setFont('Arial Narrow', 9)
	p.drawString(230,145,nombreCliente.upper())
	p.setFont('Arial Narrow Bold', 8)
	p.drawString(184,125,'CARGO:')
	p.setFont('Arial Narrow', 9)
	p.drawString(230,125,'OPERADOR')
	p.setFont('Arial Narrow', 9)
	p.drawString(290,85,'CENTRO DE INNOVACIÓN Y TECNOLOGÍA AGROALIMENTARIA')
	
	p.setFillColorRGB(0.3,0.3,0.3)
	p.setFont('Arial Narrow', 8)
	p.drawString(76,30,'PPS-10-02-D3 - V00')
	p.drawString(4*inch, 0.4*inch,"1/6")
	p.showPage()
	
	p.drawImage(filename2,70, 765,width=115,height=40)
	p.drawImage(filename3,425, 765,width=95,height=7)
	p.setFont('Arial Narrow', 9)
	p.setFillColorRGB(0,0,0)
	p.drawString(70,745,'Expediente: '+auditoria.acta)
	p.drawString(70,733,"Fecha: "+fechaAuditoria)
	p.setFont('Arial Narrow', 12)
	p.drawString(305,733,'Visita de Control - Producción Ecológica')
	
	data = [['¿REQUIERE ENVÍO PLAN DE\nACCIONES CORRECTIVAS?','','','','','','', '', '','','','','','','','','','','','','','','','','']]
	t=Table(data,5*[0.25*inch],[0.70*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,-1),0.5,colors.black),
				('FONT',(0,0),(7,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(7,0),8),
				('VALIGN',(0,0),(-1,0),'MIDDLE'),
				('BACKGROUND',(0,0),(0,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('SPAN',(0,0),(7,0)),
				('SPAN',(8,0),(24,0)),
				 ]))
	t.wrapOn(p,width,height)
	pos = 630
	t.drawOn(p,70,pos)
	
	
	p.setFillColorRGB(0,0,0)
	p.setFont('Arial Narrow Bold', 10)
	p.drawString(250,650,"SÍ")
	p.setFillColorRGB(1,1,1)
	p.setStrokeColorRGB(0.2,0.3,0.5)
	p.rect(265,650,10,10, fill=0)
	p.setFillColorRGB(0,0,0)
	p.drawString(300,650,"NO")
	p.setFillColorRGB(1,1,1)
	p.setStrokeColorRGB(0.2,0.3,0.5)
	p.rect(320,650,10,10, fill=0)
	
	if auditoria.solicita_PAC == 'SI':
		p.line(265,650,275,660)
		p.line(265,660,275,650)
	elif auditoria.solicita_PAC == 'NO':
		p.line(320,650,330,660)
		p.line(320,660,330,650)
		
	
	p.setStrokeColorRGB(0,0,0)
	p.setLineWidth(inch*0.005)
	p.rect(0.973*inch,7.75*inch,6.25*inch,1*inch, fill=1)
	p.setFont('Arial Narrow Bold', 8)
	p.setFillColorRGB(0,0,0)
	p.drawString(76,615,'EQUIPO AUDITOR:')
	p.setFont('Arial Narrow', 9)
	nombreEquipo = informe.equipo_auditor
	p.drawString(150,615,nombreEquipo)
	p.setFont('Arial Narrow Bold', 8)
	p.drawString(76,595,'AUDITOR/ES:')
	p.setFont('Arial Narrow', 9)
	nombreInspector = visita.inspector.Nombre+" "+visita.inspector.Apellido1+" "+visita.inspector.Apellido2
	todosAuditores = nombreInspector
	auditores = informe.auditores.split("/")
	cont = 0
	if len(auditores) > 1:
		todosAuditores = todosAuditores + ", "
		for auditor in auditores:
			if cont == (len(auditores) -1):
				todosAuditores = todosAuditores + auditor
			else:
				todosAuditores = todosAuditores + auditor+ ", " 
	
	p.drawString(140,595,todosAuditores)
	p.setFont('Arial Narrow Bold', 8)
	p.drawString(76,575,'OBSERVADOR/ES:')
	p.setFont('Arial Narrow', 9)
	observadores = informe.observadores.split("/")
	obsr = ""
	cont = 0
	for observador in observadores:
		if cont == (len(observadores) -1):
			obsr = obsr + observador
		else:
			obsr = obsr + observador + ", "
		cont = cont + 1
	p.drawString(159,575,obsr)
	p.setFont('Arial Narrow Bold', 10)
	p.drawCentredString(4*inch,520,'RESUMEN DEL INFORME')
	
	p.setFillColorRGB(0,0,0)
	p.setFont('Arial Narrow', 10)
	
	referencias = auditoria.des_muestras.split(";")
	texto = ''
	for referencia in referencias:
		texto = texto + " " +referencia + "."
	
	refActas = Paragraph(texto, styles['resumen']) 
	
	data = [['¿SE HAN TOMADO\nMUESTRAS?','','','','','','', '', '','','','','','','','','','','','','','','','',''],
			['ACTA DE MUESTREO','','','','','','', '', '','','','','','','','','','','','','','','','',''],
			['REFERENCIA ACTAS\nDE MUESTREO','','','','','',refActas, '', '','','','','','','','','','','','','','','','','']]
	t=Table(data,5*[0.25*inch],3*[0.70*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,-1),0.5,colors.black),
				('FONT',(0,0),(5,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(5,0),8),
				('FONT',(0,1),(5,1),'Arial Narrow Bold'),
				('SIZE',(0,1),(5,1),8),
				('FONT',(0,2),(5,2),'Arial Narrow Bold'),
				('SIZE',(0,2),(5,2),8),
				('VALIGN',(0,0),(-1,-1),'MIDDLE'),
				('BACKGROUND',(0,0),(0,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('BACKGROUND',(0,1),(0,1),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('BACKGROUND',(0,2),(0,2),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('SPAN',(0,0),(5,0)),
				('SPAN',(6,0),(24,0)),
				('SPAN',(0,1),(5,1)),
				('SPAN',(6,1),(24,1)),
				('SPAN',(0,2),(5,2)),
				('SPAN',(6,2),(24,2)),
				 ]))
	t.wrapOn(p,width,height)
	pos = 350
	t.drawOn(p,70,pos)
	
	p.setFont('Arial Narrow Bold', 10)
	p.drawString(250,470,"SÍ")
	p.setFillColorRGB(1,1,1)
	p.setStrokeColorRGB(0.2,0.3,0.5)
	p.rect(265,470,10,10, fill=0)
	p.setFillColorRGB(0,0,0)
	p.drawString(300,470,"NO")
	p.setFillColorRGB(1,1,1)
	p.setStrokeColorRGB(0.2,0.3,0.5)
	p.rect(320,470,10,10, fill=0)
	
	if auditoria.n_muestras > 0:
		p.line(265,470,275,480)
		p.line(265,480,275,470)
	else:
		p.line(320,470,330,480)
		p.line(320,480,330,470)

	p.setFont('Arial Narrow Bold', 10)
	p.setFillColorRGB(0,0,0)
	p.drawString(250,420,"SÍ")
	p.setFillColorRGB(1,1,1)
	p.setStrokeColorRGB(0.2,0.3,0.5)
	p.rect(265,420,10,10, fill=0)
	p.setFillColorRGB(0,0,0)
	p.drawString(300,420,"NO")
	p.setFillColorRGB(1,1,1)
	p.setStrokeColorRGB(0.2,0.3,0.5)
	p.rect(320,420,10,10, fill=0)
	
	if auditoria.actaMuestreo == 'SI':
		p.line(265,420,275,430)
		p.line(265,430,275,420)
	else:
		p.line(320,420,330,430)
		p.line(320,430,330,420)
		
	
	
	p.setFillColorRGB(0.3,0.3,0.3)
	p.setFont('Arial Narrow', 8)
	p.drawString(76,30,'PPS-10-02-D3 - V00')
	p.drawString(4*inch, 0.4*inch,"2/6")
	p.showPage()
	
	p.drawImage(filename2,70, 765,width=115,height=40)
	p.drawImage(filename3,425, 765,width=95,height=7)
	p.setFont('Arial Narrow', 9)
	p.setFillColorRGB(0,0,0)
	p.drawString(70,745,'Expediente: '+auditoria.acta)
	p.drawString(70,733,"Fecha: "+fechaAuditoria)
	p.setFont('Arial Narrow', 12)
	p.drawString(305,733,'Visita de Control - Producción Ecológica')
	
	arrayParrafos = auditoria.descripcion.split('\n')
	
	
	parrafos = "<br/>"
	
	for x in arrayParrafos:
		parrafos = parrafos +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +x + "<br/>"
	parrafos = parrafos + "<br/>"
	texto = Paragraph(parrafos, styles['resumen']) 
	
	data= [['RESUMEN DE LA VISITA','','','','','','', '', '','','','','','','','','','','','','','','','','']]
	data.append([texto,'','','','','','', '', '','','','','','','','','','','','','','','','',''])
				   		   
	t=Table(data,5*[0.25*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,-1),0.5,colors.black),
				('FONT',(0,0),(5,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(5,0),10),
				('VALIGN',(0,0),(-1,-1),'MIDDLE'),
				('ALIGN',(0,0),(24,0),'CENTER'),
				('BACKGROUND',(0,0),(0,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('SPAN',(0,0),(24,0)),
				('FONT',(0,1),(24,1),'Arial Narrow'),
				('SIZE',(0,1),(24,1),10),
				('SPAN',(0,1),(24,1)),
				 ]))
	t.wrapOn(p,width,height)
	w, h = t.wrap(0, 0)
	pos = 700 - h
	t.drawOn(p,70,pos)

	p.setFillColorRGB(0.3,0.3,0.3)
	p.setFont('Arial Narrow', 8)
	p.drawString(76,30,'PPS-10-02-D3 - V00')
	p.drawString(4*inch, 0.4*inch,"3/6")
	p.showPage()

	p.drawImage(filename2,70, 765,width=115,height=40)
	p.drawImage(filename3,425, 765,width=95,height=7)
	p.setFont('Arial Narrow', 9)
	p.setFillColorRGB(0,0,0)
	p.drawString(70,745,'Expediente: '+auditoria.acta)
	p.drawString(70,733,"Fecha: "+fechaAuditoria)
	p.setFont('Arial Narrow', 12)
	p.drawString(305,733,'Visita de Control - Producción Ecológica')
	
	pos = 700

	p.setFont('Arial Narrow Bold', 10)
	p.drawCentredString(4*inch, pos,"INCUMPLIMIENTOS DETECTADOS")
	p.setFont('Arial Narrow', 6)
	p.drawString(1*inch, pos-20,"(Utilizar para los requisitos que requieren la presentación por la Organización de un Plan de Acciones Correctivas posterior a la realización de la visita,")
	p.drawString(2.5*inch, pos-29,"según se indica en el punto 3 de las Disposiciones Finales del presente Informe).")
	p.drawString(2*inch, pos-38,"(D: Incumplimiento Desviación; NC-IRR: Incumplimiento Irregularidad ; NC-INF: Incumplimiento Infracción).")
	
	data= [['Ref.\nInc.','Clasif.\nInc.','','REQUISITO','','','', '', '','','','','','','Apdo.\nRegl./Proced','','','Parcelas/\nexplotaciones/\nproducto con\nincumplimiento','','','','OBSERVACIONES','','','','']]
	
	incumplimientos = Incumplimiento.objects.filter(auditoria = auditoria)

	cont = 1

	if len(incumplimientos) > 0:
		for incumplimiento in incumplimientos:
				fila = []
				fila.append(cont)
				if incumplimiento.tipoIncumplimiento == 'D':
					fila.append('D')
				elif incumplimiento.tipoIncumplimiento == 'NC':
					if incumplimiento.tipoNoConf == 'IR':
						fila.append('NC-IRR')
					elif incumplimiento.tipoNoConf == 'IN':
						fila.append('NC-INF')
				fila.append("")
				parag2 = Paragraph(incumplimiento.incumplimiento, styles['observaciones'])
				fila.append(parag2)
				fila.append("")
				fila.append("")
				fila.append("")
				fila.append("")
				fila.append("")
				fila.append("")
				fila.append("")
				fila.append("")
				fila.append("")
				fila.append("")
				fila.append(incumplimiento.reglproced)
				fila.append("")
				fila.append("")
				fila.append(incumplimiento.parcelas)
				fila.append("")
				fila.append("")
				fila.append("")
				parag = Paragraph(incumplimiento.observaciones, styles['observaciones'])
				fila.append(parag)
				fila.append("")
				fila.append("")
				fila.append("")
				fila.append("")
				data.append(fila)
				cont = cont + 1
		tam = len(incumplimientos)
	else:
		vacio = ['','','','','','','', '', '','','','','','','','','','','','','','','','','','']
		data.append(vacio)
		data.append(vacio)
		tam = 2
				   		   
	t=Table(data,0.26*inch)
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,-1),0.5,colors.black),
				('FONT',(0,0),(2,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(2,0),8),
				('SIZE',(3,0),(13,0),10),
				('SIZE',(14,0),(20,0),8),
				('SIZE',(21,0),(25,0),10),
				('VALIGN',(0,0),(-1,-1),'MIDDLE'),
				('ALIGN',(0,0),(25,-1),'CENTER'),
				('BACKGROUND',(0,0),(25,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('SPAN',(1,0),(2,0)),
				('SPAN',(3,0),(13,0)),
				('SPAN',(14,0),(16,0)),
				('SPAN',(17,0),(20,0)),
				('SPAN',(21,0),(25,0)),
				 ]))
				 
	for x in range(1, tam+1):
		t.setStyle(TableStyle([
			('FONT',(0,x),(25,x),'Arial Narrow'),
			('SIZE',(0,x),(25,x),7),
			('SPAN',(1,x),(2,x)),
			('SPAN',(3,x),(13,x)),
			('SPAN',(14,x),(16,x)),
			('SPAN',(17,x),(20,x)),
			('SPAN',(21,x),(25,x)),
		 ]))
		 
	w, h = t.wrap(0, 0)
	pos_ini = pos - 60
	pos = pos_ini - h
	#t.drawOn(p,50,pos)
	contR = 0

	
	p.setFillColorRGB(1,1,1)
	p.rect(1.10*inch,1*inch,3*inch,0.8*inch, fill=1)
	p.rect(4.10*inch,1*inch,3*inch,0.8*inch, fill=1)

	p.setFillColorRGB(0,0,0)
	p.setFont('Arial Narrow Bold', 9)
	
	p.drawString(160,120,'ENTERADO')
	p.drawString(116,110,'OPERADOR/REPRESENTANTE')
	p.drawString(375,120,'ENTERADO')
	p.drawString(325,110,'OPERADOR/REPRESENTANTE')
	
	t.drawOn(p,50,pos)
	
	
	p.setFillColorRGB(0.3,0.3,0.3)
	p.setFont('Arial Narrow', 8)
	p.drawString(76,30,'PPS-10-02-D3 - V00')
	p.drawString(4*inch, 0.4*inch,"4/6")
	p.showPage()
	
	p.drawImage(filename2,70, 765,width=115,height=40)
	p.drawImage(filename3,425, 765,width=95,height=7)
	p.setFont('Arial Narrow', 9)
	p.setFillColorRGB(0,0,0)
	p.drawString(70,745,'Expediente: '+auditoria.acta)
	p.drawString(70,733,"Fecha: "+fechaAuditoria)
	p.setFont('Arial Narrow', 12)
	p.drawString(305,733,'Visita de Control - Producción Ecológica')
	
	arrayParrafos = auditoria.observaciones.split('\r\n')

	parrafos = "<br/>"
	cuentaRetorno = 0
	for x in arrayParrafos:
		parrafos = parrafos +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +x + "<br/>"
		cuentaRetorno = cuentaRetorno +2
	parrafos = parrafos + "<br/>"
	texto = Paragraph(parrafos, styles['resumen']) 
		
	pos = 690
	if contR > 1:
		t=Table(data3,0.26*inch)
		t.setStyle(TableStyle([
					('GRID',(0,0),(-1,-1),0.5,colors.black),
					('FONT',(0,0),(2,0),'Arial Narrow Bold'),
					('SIZE',(0,0),(2,0),8),
					('SIZE',(3,0),(13,0),10),
					('SIZE',(14,0),(20,0),8),
					('SIZE',(21,0),(25,0),10),
					('VALIGN',(0,0),(-1,-1),'MIDDLE'),
					('ALIGN',(0,0),(25,-1),'CENTER'),
					('BACKGROUND',(0,0),(25,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
					('SPAN',(1,0),(2,0)),
					('SPAN',(3,0),(13,0)),
					('SPAN',(14,0),(16,0)),
					('SPAN',(17,0),(20,0)),
					('SPAN',(21,0),(25,0)),
					 ]))
						 
		for x in range(1, contR ):
			t.setStyle(TableStyle([
				('FONT',(0,x),(25,x),'Arial Narrow'),
				('SIZE',(0,x),(25,x),8),
				('SPAN',(1,x),(2,x)),
				('SPAN',(3,x),(13,x)),
				('SPAN',(14,x),(16,x)),
				('SPAN',(17,x),(20,x)),
				('SPAN',(21,x),(25,x)),
			 ]))

		w, h = t.wrap(0, 0)
		pos = pos - h
		t.drawOn(p,50,pos)
		pos = pos - 80
	else:
		pos = 670
	
	data= [['OBSERVACIONES','','','','','','', '', '','','','','','','','','','','','','','','','','']]
			
				   		   
	t=Table(data,5*[0.25*inch], [0.5*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,0),0.5,colors.black),
				('FONT',(0,0),(5,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(5,0),10),
				('VALIGN',(0,0),(-1,0),'MIDDLE'),
				('ALIGN',(0,0),(24,0),'CENTER'),
				('BACKGROUND',(0,0),(0,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('SPAN',(0,0),(24,0)),
				 ]))
	t.wrapOn(p,width,height)
	
	t.drawOn(p,70,pos)
						
	data2= [[texto,'','','','','','', '', '','','','','','','','','','','','','','','','','']]
	t=Table(data2,5*[0.25*inch], [cuentaRetorno*0.16*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,0),0.5,colors.black),
				('FONT',(0,0),(24,0),'Arial Narrow'),
				('SIZE',(0,0),(24,0),10),
				('VALIGN',(0,0),(-1,0),'MIDDLE'),
				('SPAN',(0,0),(24,0)),
				 ]))
	t.wrapOn(p,width,height)
	pos = pos - 23
	for x in range(cuentaRetorno-2):
		if x % 2 == 0:
			pos = pos - 12
		else:
			pos = pos -11
	t.drawOn(p,70,pos)

	p.setFillColorRGB(0.3,0.3,0.3)
	p.setFont('Arial Narrow', 8)
	p.drawString(76,30,'PPS-10-02-D3 - V00')
	p.drawString(4*inch, 0.4*inch,"5/6")

	p.showPage()
	
	p.drawImage(filename2,70, 765,width=115,height=40)
	p.drawImage(filename3,425, 765,width=95,height=7)
	p.setFont('Arial Narrow', 9)
	p.setFillColorRGB(0,0,0)
	p.drawString(70,745,'Expediente: '+auditoria.acta)
	p.drawString(70,733,"Fecha: "+fechaAuditoria)
	p.setFont('Arial Narrow', 12)
	p.drawString(305,733,'Visita de Control - Producción Ecológica')
	
	p.setFont('Arial Narrow Bold', 10)
	p.drawCentredString(4*inch,700,'DISPOSICIONES FINALES')
	p.setFont('Arial Narrow', 9)
	p.drawString(70,670,'1. La organización se queda con copia de este informe.')
	p.drawString(70,650,'2. Los Incumplimientos han sido aclarados y entendidos.')
	p.drawString(70,630,'3. En aquellos casos en los que se indique en la página 2 del presente informe la necesidad de envío')
	p.drawString(80,615,'de Plan de Acciones Correctivas (PAC), la organización se compromete a presentar a CITAGRO dicho')
	p.drawString(80,600,'Plan en 30 días naturales a partir de la fecha de este Informe, indicando para cada Incumplimiento')
	p.drawString(80,585,'el estudio de las causas, la acción correctiva propuesta, el responsable de su implantación, el tiempo')
	p.drawString(80,570,'estimado y las evidencias documentales correspondientes.')
	p.drawString(70,550,'4. Indicar la verificación de la corrección de los Incumplimientos pendientes de anteriores auditorías')
	p.drawString(80,535,'según corresponda.')
	p.drawString(80,515,'- '+informe.verificacion)
	p.drawString(70,495,'5. El equipo inspector informa que esta visita se ha realizado a través de un muestreo, por lo que')
	p.drawString(80,480,'pueden existir otros Incumplimientos no identificados en este informe.')
	p.drawString(70,460,'6. Los Incumplimientos se señalan frente a los requisitos del Reglamento de referencia aplicable.')
	p.drawString(70,440,'7. En el caso de que exista alguna modificación del alcance de la certificación (actividades, productos, ')
	p.drawString(80,425,'emplazamientos), se indicará expresamente la misma en este campo. ')
	p.drawString(80,405,'- '+informe.modificacion)
	
	p.setFont('Arial Narrow Bold', 10)
	p.drawCentredString(4*inch,380,'RELACIÓN DE PARTICIPANTES EN EL PROCESO DE AUDITORÍA')
	p.setFont('Arial Narrow', 9)
	p.drawCentredString(4*inch,360,'(Reunión Inicial, Entrevistados en el Proceso y Reunión Final)')
	
	data= [['NOMBRE Y APELLIDOS','','','','','','', '', '','','','','CARGO/ENTIDAD','','','','','','','','','','','',''],
		   [nombreCliente.upper(),'','','','','','', '', '','','','','OPERADOR','','','','','','','','','','','',''],
		   [nombreInspector.upper(),'','','','','','', '', '','','','','CITAGRO','','','','','','','','','','','','']]
	excusados = informe.excusados.split(">")
	if len(observadores) > 0:
		for observador in observadores:
			if observador :
				datoObs = 'OBSERVADOR'
			else:
				datoObs = ''
			nuevo = [observador.upper(),'','','','','','', '', '','','','',datoObs,'','','','','','','','','','','','']
			data.append(nuevo)
	else:
		data.append(['','','','','','','', '', '','','','','','','','','','','','','','','','',''])
	
	
	data.append(['EXCUSADOS','','','','','','', '', '','','','','','','','','','','','','','','','',''])
	
	if len(excusados) > 0:
		for excusado in excusados:
			if excusado:
				datosExcusado = excusado.split("/")
				fila = [datosExcusado[0].upper(),'','','','','','', '', '','','','',datosExcusado[1],'','','','','','','','','','','','']
			else:
				fila = ['','','','','','','', '', '','','','','','','','','','','','','','','','','']
			data.append(fila)
	else:
		data.append(['','','','','','','', '', '','','','','','','','','','','','','','','','',''])
					   		   
	t=Table(data,5*[0.25*inch])
	t.setStyle(TableStyle([
				('GRID',(0,0),(-1,-1),0.5,colors.black),
				('FONT',(0,0),(24,0),'Arial Narrow Bold'),
				('SIZE',(0,0),(24,0),9),
				('VALIGN',(0,0),(-1,-1),'MIDDLE'),
				('ALIGN',(0,0),(24,0),'CENTER'),
				('BACKGROUND',(0,0),(24,0),colors.Color(red=0.93,green=0.93,blue=0.93)),
				('SPAN',(0,0),(11,0)),
				('SPAN',(12,0),(24,0)),
				('SPAN',(0,1),(11,1)),
				('SPAN',(12,1),(24,1)),
				('SPAN',(0,2),(11,2)),
				('SPAN',(12,2),(24,2)),
				('FONT',(0,1),(24,2),'Arial Narrow'),
				('SIZE',(0,1),(24,2),8),
				
				 ]))
	if len(observadores)>0:
		for x in range(3,3+len(observadores)):
			t.setStyle(TableStyle([
					('SPAN',(0,x),(11,x)),
					('SPAN',(12,x),(24,x)),
					('FONT',(0,x),(24,x),'Arial Narrow'),
					('SIZE',(0,x),(24,x),8),
					 ]))
	
	t.setStyle(TableStyle([
		('FONT',(0,3+len(observadores)),(5,3+len(observadores)),'Arial Narrow Bold'),
		('SIZE',(0,3+len(observadores)),(5,3+len(observadores)),9),
		('ALIGN',(0,3+len(observadores)),(24,3+len(observadores)),'CENTER'),
		('BACKGROUND',(0,3+len(observadores)),(24,3+len(observadores)),colors.Color(red=0.93,green=0.93,blue=0.93)),
		('SPAN',(0,3+len(observadores)),(24,3+len(observadores))),
		 ]))

	for x in range(3+len(observadores)+1,3+len(observadores)+len(excusados)+1):
		t.setStyle(TableStyle([
				('SPAN',(0,x),(11,x)),
				('SPAN',(12,x),(24,x)),
				('FONT',(0,x),(24,x),'Arial Narrow'),
				('SIZE',(0,x),(24,x),8),
				 ]))
		
	t.wrapOn(p,width,height)
	w, h = t.wrap(0, 0)
	pos = 350 - h
	t.drawOn(p,70,pos)
	
	
	p.setFont('Arial Narrow', 10)
	
	diaHoy = str(auditoria.f_Auditoria.day)
	mesHoy = getMes(auditoria.f_Auditoria.month)
	anyoHoy = str(auditoria.f_Auditoria.year)
	p.drawString(380, 160,"En Sevilla a "+diaHoy+" de "+mesHoy+" de "+anyoHoy)
	
	p.setFont('Arial Narrow Bold', 9)
	p.drawString(120,130,'EL EQUIPO AUDITOR')
	p.drawString(300,130,'EL REPRESENTANTE DE LA ORGANIZACIÓN ')
	
	p.setFillColorRGB(0.3,0.3,0.3)
	p.setFont('Arial Narrow', 8)
	p.drawString(76,30,'PPS-10-02-D3 - V00')
	p.drawString(4*inch, 0.4*inch,"6/6")
	p.showPage()

	p.save()
	pdf = buffer.getvalue()
	buffer.close()
	response.write(pdf)
	return response
	
	
	
	
	
	
	
	
	
	
	
	

