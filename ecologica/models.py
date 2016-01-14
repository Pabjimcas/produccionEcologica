# coding=utf-8
from django.db import models
from django.contrib.auth.models import User
#from rest_framework.authtoken.models import Token

gen = (
		('H', 'Hombre'),
		('M', 'Mujer'),
		('X','No procede'),
    )
	
actividad = (
		('SI', 'Si'),
		('NO', 'No'),
    )

prodParal = (
		('SI','Si'),
		('NO','No'),
		('NP','NP')
	)

pago = (
		('R', 'Recurrente'),
		('U', 'Unico'),
    )
tipoIncump = (
		('D','Desviacion'),
		('NC','No Conformidad'),
	)
	
NoConf = (
		('','Sin no conformidad'),
		('IR','Irregularidad'),
		('IN','Infraccion'),
	)
	
riesgo2 = (
		('S', 'Si'),
		('N', 'No'),
    )

est = (
        ('ALTA', 'Alta'),
        ('BAJA', 'Baja'),
    )
	
cali = (
        (1, 'Primer anyo en practicas'),
        (2, 'Periodo conversion'),
        (3, 'Agricultura ecologica'),
    )
eval_riesgo = (
		(0, 'Escala 0'),
		(1, 'Escala 1'),
		(2, 'Escala 2'),
		(3, 'Escala 3'),
		(4, 'Escala 4'),
		(5, 'Escala 5'),
		(6, 'Escala 6'),
	)
tipo_procesado = (
		('E', 'Elaboracion'),
		('X', 'Envasado'),
		('C', 'Comercializacion'),
		('I', 'Importacion'),
		('P', 'Exportacion'),
	)
tipo_comercializacion = (
		(1, 'Mayorista'),
		(2, 'Minorista'),
	)
USUARIO = (
		('R', 'Técnico Responsable'),
		('A', 'Auditor'),
		('G', 'Gestor'),
	)
forma_presentacion = (
		(1,'A granel'),
		(2,'Envasado cerrado'),
		(3,'Otros'),
	)
forma_pago = (
		('D','Domiciliado'),
		('T','Transferencia'),
		('','No definido'),
	)

	
class Perfil(models.Model):
	user = models.ForeignKey(User, unique=True,related_name='perfil')
	TipoUsuario = models.CharField(max_length=2,
                                   choices=USUARIO,
                                   default='R')
	def __unicode__(self):
		texto = self.TipoUsuario
		return texto

class Provincia(models.Model):
	CodProvincia = models.CharField(max_length=20)
	Provincia = models.CharField(max_length=20)
	
	class Meta:
		ordering = ['CodProvincia']
	
	def __unicode__(self):
		texto = self.Provincia
		return texto
		
class Municipio(models.Model):
	
	CodMunicipio = models.CharField(max_length=20)
	CodCatastral = models.CharField(max_length=20)
	Municipio = models.CharField(max_length=80)
	idProvincia = models.ForeignKey(Provincia,related_name='municipios')
	
	class Meta:
		ordering = ['idProvincia','CodMunicipio']
	
	def __unicode__(self):
		texto = self.Municipio
		return texto
		
class FormaJuridica(models.Model):
	Letra = models.CharField(max_length=1)
	Forma_Juridica = models.CharField(max_length=50)
	
	def __unicode__(self):
		texto = self.Forma_Juridica
		return texto
		
		
class Cliente(models.Model):
	nifcif = models.CharField(max_length=9)
	Nombre = models.CharField(max_length=70) 
	F_sepa = models.DateField(blank=True,null=True)
	Apellido1 = models.CharField(max_length=70,blank=True) 
	Apellido2 = models.CharField(max_length=70,blank=True)
	Genero = models.CharField(max_length=1,
                                   choices=gen,
                                   default='H')
	Telefono1 = models.CharField(max_length=9) 
	Telefono2 = models.CharField(max_length=9,blank=True)
	Fax = models.CharField(max_length=9,blank=True)
	Email = models.EmailField(max_length=75,blank=True)
	Web = models.URLField(max_length=200,blank=True)
	Provincia = models.ForeignKey(Provincia)
	Municipio = models.ForeignKey(Municipio)						   
	Domicilio = models.CharField(max_length=250)
	CP = models.CharField(max_length=5)
	iban = models.CharField(max_length=20,blank=True)
	p_recur = models.CharField(max_length=2,
                                   choices=pago,
                                   default='R',blank=True)
	esiban = models.CharField(max_length=4,blank=True)
	f_pago = models.CharField(max_length=2,
                                   choices=forma_pago,
                                   default='',blank=True)
	observaciones = models.TextField(blank=True)
	def __unicode__(self):
		texto = self.Nombre+" "+self.Apellido1+" "+self.Apellido2
		return texto

class Inspector (models.Model):
	nif = models.CharField(max_length=9)
	Nombre = models.CharField(max_length=70) 
	Apellido1 = models.CharField(max_length=70,blank=True) 
	Apellido2 = models.CharField(max_length=70,blank=True)
	Telefono1 = models.CharField(max_length=9,blank=True) 
	Telefono2 = models.CharField(max_length=9,blank=True) 
	categoria = models.CharField(max_length=2,
                                   choices=USUARIO,
                                   default='R')
	
	def __unicode__(self):
		texto = self.Nombre+" "+self.Apellido1+" "+self.Apellido2
		return texto
		
	def rol(self):
		return self.get_categoria_display()
		
	def usuario(self):
		perfil = Perfil.objects.get(id=self.id)
		return perfil.user
	
class usuarioInspector (models.Model):
	inspector = models.ForeignKey(Inspector,related_name='usInspector')
	expedientes = models.CharField(max_length=8,blank=True) 
	clientes = models.CharField(max_length=8,blank=True)
	contactos = models.CharField(max_length=8,blank=True)
	interlocutores = models.CharField(max_length=8,blank=True)
	parcelas = models.CharField(max_length=8,blank=True)
	v_realizadas = models.CharField(max_length=8,blank=True)
	p_visitas = models.CharField(max_length=8,blank=True)
	ev_riesgos = models.CharField(max_length=8,blank=True)
	facturacion = models.CharField(max_length=8,blank=True)
	auditorias = models.CharField(max_length=8,blank=True)
	certifica = models.CharField(max_length=8,blank=True)
	inspectores = models.CharField(max_length=8,blank=True)
	archivos = models.CharField(max_length=14,blank=True)
	
		
class Expediente(models.Model):

	ag = (
		('AE', 'Agricultura Ecologica'),
		('GA', 'Ganaderia'),
		('IN', 'Industria'),
    )
	
	tipoAgricultura = models.CharField(max_length=2,
                                   choices=ag,
                                   default='AE')
	indProdParalela = models.CharField(max_length=2,
									choices=prodParal,
									default='NP')
	F_iniciovigencia = models.DateField(blank=True)
	F_finalvigencia = models.DateField(blank=True)
	responsable = models.ForeignKey(Inspector,default=2)
	anyo = models.IntegerField(blank=True)
	
	vigente = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	haestadovigente = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	idDocumento = models.CharField(max_length=30,blank=True)
	CodSipea = models.CharField(max_length=15,blank=True)
	CodOperador = models.CharField(max_length=15)
						   
	F_juridica = models.ForeignKey(FormaJuridica)

	Fecha_recepcion = models.DateField()
	Fecha_aecologica = models.DateField()
	
	Estado = models.CharField(max_length=4,
                                   choices=est,
                                   default='ALTA')
								   
	F_baja = models.DateField(blank=True)
	
	con_actividad = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
								   
	F_cese_activ = models.DateField(blank=True)
								
	#Informacion Adicional#
	
	#Asociado a alguna ASOCIACION AGRARIA
	aso_ag = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	asociacion_agraria = models.CharField(max_length=100,blank=True)
	#Socio de alguna cooperativa
	s_cop = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	cooperativa = models.CharField(max_length=100,blank=True)
	info_contac1 = models.CharField(max_length=9,blank=True) #Persona de contacto
	#Comercializan a traves de una industria
	com_ind = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	industria = models.CharField(max_length=100,blank=True)
	info_contac2 = models.CharField(max_length=9,blank=True) #Persona de contacto
	#Entidad que le gestiona la PAC
	entidadPac = models.CharField(max_length=100,blank=True)
	info_contac3 = models.CharField(max_length=9,blank=True) #Persona de contacto
	id_cliente = models.ForeignKey(Cliente,related_name="expedientes")
	
	def numeroParcelasEco(self):
		parcelaseco = Parcela.objects.filter(expediente=self.id,ag_eco = "SI")
		return len(parcelaseco)
	
	def numeroParcelasNoEco(self):
		parcelasNOeco = Parcela.objects.filter(expediente=self.id,ag_eco = "NO")
		return len(parcelasNOeco)
		
	def numeroParcelasGanadoEco(self):
		parcelaseco = Ganado.objects.filter(expedienteGanado=self.id,ag_eco = "SI")
		return len(parcelaseco)
	def numeroParcelasGanadoNoEco(self):
		parcelasNOeco = Ganado.objects.filter(expedienteGanado=self.id,ag_eco = "NO")
		return len(parcelasNOeco)
		
	def supParcelasEco(self):
		suma = 0
		parcelaseco = Parcela.objects.filter(expediente=self.id,ag_eco = "SI")
		for parcela in parcelaseco:
			suma = suma + parcela.superficie_hectareas
		return suma
		
	def supGanadoEco(self):
		suma = 0
		parcelaseco = Ganado.objects.filter(expediente=self.id,ag_eco = "SI")
		for parcela in parcelaseco:
			suma = suma + parcela.superficie_hectareas
		return suma
		
	def supParcelasNoEco(self):
		suma = 0
		parcelaseco = Parcela.objects.filter(expediente=self.id,ag_eco = "NO")
		for parcela in parcelaseco:
			suma = suma + parcela.superficie_hectareas
		return suma
		
	def supGanadoNoEco(self):
		suma = 0
		parcelaseco = Ganado.objects.filter(expediente=self.id,ag_eco = "NO")
		for parcela in parcelaseco:
			suma = suma + parcela.superficie_hectareas
		return suma
		
	def __unicode__(self):
		texto = self.CodOperador
		return texto
	
class Facturacion(models.Model):
	expediente = models.ForeignKey(Expediente,related_name='facturacion')
	f_fact = models.DateField()
	concepto = models.CharField(max_length=200,blank=True)
	importe = models.DecimalField(max_digits=10, decimal_places=2)
	
class ContactoOperador(models.Model):

	nif = models.CharField(max_length=9)
	Nombre = models.CharField(max_length=70) 
	Apellido1 = models.CharField(max_length=70) 
	Apellido2 = models.CharField(max_length=70)
	Genero = models.CharField(max_length=1,
                                   choices=gen,
                                   default='H')
	Telefono1 = models.CharField(max_length=9) 
	Telefono2 = models.CharField(max_length=9,blank=True)
	Fax = models.CharField(max_length=9,blank=True)
	Email = models.EmailField(max_length=75,blank=True)
	Provincia = models.ForeignKey(Provincia)
	Municipio = models.ForeignKey(Municipio)						   
	Domicilio = models.CharField(max_length=250)
	CP = models.CharField(max_length=5)
	id_operador = models.ForeignKey(Expediente,related_name='contacto')


	
class InterlocutoresVisita(models.Model):
	nif = models.CharField(max_length=9)
	Nombre = models.CharField(max_length=70)
	TelefonoFijo = models.CharField(max_length=9,blank=True) 
	TelefonoMovil = models.CharField(max_length=9)
	Email = models.EmailField(max_length=75,blank=True)
	AtiendeVisita = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	FirmaVisita = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	idExpediente = models.ForeignKey(Expediente,related_name = "interlocutores")
	
class riesgo(models.Model):
	idExpediente = models.ForeignKey(Expediente,related_name = "riesgo")
	vinc_s_r = models.CharField(max_length=2,
                                   choices=riesgo2,
                                   default='N')
	alc_cert = models.CharField(max_length=2,
                                   choices=riesgo2,
                                   default='N')
	no_conf = models.CharField(max_length=2,
                                   choices=riesgo2,
                                   default='N')
	ap_dir_cont = models.CharField(max_length=2,
									choices = eval_riesgo,
									default=0)
	ap_ind_cont = models.CharField(max_length=2,
									choices = eval_riesgo,
									default=0)
	ent_prod = models.CharField(max_length=2,
									choices = eval_riesgo,
									default=0)
	prod_par = models.CharField(max_length=2,
									choices = eval_riesgo,
									default=0)
	cont_res = models.CharField(max_length=2,
									choices = eval_riesgo,
									default=0)
	cont_amb = models.CharField(max_length=2,
									choices = eval_riesgo,
									default=0)
	cont_ant = models.CharField(max_length=2,
									choices = eval_riesgo,
									default=0)
	rie_sust = models.CharField(max_length=2,
									choices = eval_riesgo,
									default=0)
	volumen = models.CharField(max_length=70) 
	puntuacion = models.IntegerField()
	f_eval = models.DateField()
	
	
	
class ProductoAgricola(models.Model):
	CodActividad = models.CharField(max_length=2)
	Actividad = models.CharField(max_length=70)
	CodCultivo = models.CharField(max_length=10)
	Cultivo = models.CharField(max_length=70)
	def __unicode__(self):
		texto = self.Cultivo
		return texto
	
	
class ProductoGanaderia(models.Model):
	CodProducto = models.CharField(max_length=10)
	Producto = models.CharField(max_length=70)
	CodActividad = models.CharField(max_length=3)
	Actividad = models.CharField(max_length=70)
	def __unicode__(self):
		texto = self.Producto
		return texto
	
class ProductoIndustria(models.Model):
	CodProducto = models.CharField(max_length=10)
	Producto = models.CharField(max_length=70)
	CodActividad = models.CharField(max_length=3)
	Actividad = models.CharField(max_length=70)
	
class Variedades(models.Model):
	CodCultivo = models.CharField(max_length=10)
	Cultivo = models.CharField(max_length=70)
	CodVariedad = models.CharField(max_length=3)
	Variedad = models.CharField(max_length=70)
	def __unicode__(self):
		texto = self.Variedad
		return texto

	

class Parcela(models.Model):
	SR = (
        ("S", 'Secano'),
		("R", 'Regadio'),
    )
	provincia = models.ForeignKey(Provincia)
	municipio = models.ForeignKey(Municipio)
	poligono = models.CharField(max_length=3)
	parcela = models.CharField(max_length=5)
	recinto = models.CharField(max_length=5)
	superficie_hectareas = models.FloatField()
	prod_ag =  models.ForeignKey(ProductoAgricola)
	variedad = models.ForeignKey(Variedades)
	sr = models.CharField(max_length=10,
                                   choices=SR,
                                   default="SECANO")
	f_ag_ec_rec = models.DateField(blank=True,null=True)
	f_control = models.DateField(blank=True,null=True)
	Estado = models.CharField(max_length=4,
                                   choices=est,
                                   default='ALTA')
	F_baja_rec = models.DateField(blank=True,null=True)
	F_calificacion = models.DateField(blank=True,null=True)
	Calificacion = models.CharField(max_length=1,
                                   choices=cali,
                                   default=1)
	declar_pac = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
	cosecha_anual = models.IntegerField()
	F_altaProducto = models.DateField(blank=True,null=True)
	F_bajaProducto = models.DateField(blank=True,null=True)
	productoCambiado= models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	expediente = models.ForeignKey(Expediente,related_name="parcelas")
	ag_eco = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
								   
class Industria(models.Model):
	inscrito = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
	matriculaRIA = models.CharField(max_length=12)
	provincia = models.ForeignKey(Provincia)
	municipio = models.ForeignKey(Municipio)
	Domicilio = models.CharField(max_length=250,blank=True)
	CP = models.CharField(max_length=5,blank=True)
	utmX = models.CharField(max_length=13,blank=True)
	utmY = models.CharField(max_length=13,blank=True)
	regSanit = models.CharField(max_length=13)
	regEmbotella = models.CharField(max_length=10,blank=True)
	f_control = models.DateField(blank=True,null=True)
	Estado = models.CharField(max_length=4,
                                   choices=est,
                                   default='ALTA')
	F_baja = models.DateField(blank=True,null=True)
	expediente = models.ForeignKey(Expediente,related_name="industrias")
	ag_eco = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
	tipProc = models.CharField(max_length=5,default="")
	tipoCom = models.CharField(max_length=1,
                                   choices=tipo_comercializacion,
                                   default=1)
	producto = models.ForeignKey(ProductoIndustria)
	F_altaProducto = models.DateField(blank=True,null=True)
	F_bajaProducto = models.DateField(blank=True,null=True)
	productoCambiado= models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	desc_product = models.CharField(max_length=1000,blank=True,default="")
	f_ag_eco_prod = models.DateField(blank=True,null=True)
	capacidad = models.CharField(max_length=10,default=0)
	form_pres = models.CharField(max_length=1,
                                   choices=forma_presentacion,
                                   default=1)
	tam_emb = models.CharField(max_length=250,default="")
	marcas_referencia = models.CharField(max_length=250,default="")
	valor_produccion = models.DecimalField(max_digits=10, decimal_places=2,default=0.00)
	declar_pac = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
	def prodcts(self):
		tipProc = self.tipProc
		listaProc = []
		for letra in tipProc:
			proc = ""
			if letra == 'E':
				proc = 'Elaboración'
			elif letra == 'X':
				proc = 'Envasado'
			elif letra == 'C':
				proc = 'Comercialización'
			elif letra == 'I':
				proc = 'Importación'
			else:
				proc = 'Exportación'
				
			j_son = {'procesado': proc.decode('utf-8'), 'letra': letra}
			listaProc.append(j_son)
		return listaProc
		
	def envases(self):
		listaEnvases = []
		env = (self.tam_emb).split(',')
		cont = 0
		for envase in env:
			datos = envase.split()
			envase2 = datos[1].replace('G','g')
			envase2 = envase2.replace('L','l')
			envase2 = envase2.replace('K','kg')
			envase2 = envase2.replace('M','ml')		
			
			j_son = {'id':cont,'cantidad': datos[0], 'medidaId': datos[1], 'medida': envase2}
			listaEnvases.append(j_son)
			cont += 1
		return listaEnvases
		
	def marcas(self):
		marc= (self.marcas_referencia).split(',')
		cont = 0
		listaMarcas = []
		for marca in marc:
	
			j_son = {'id':cont,'marca': marca}
			listaMarcas.append(j_son)
			cont += 1
		return listaMarcas
		
		
class Ganado(models.Model):
	SR = (
        ("S", 'Secano'),
		("R", 'Regadio'),
    )
	GRUP = (
        (1, 'Dehesa'),
		(2, 'Pradera'),
		(3, 'Pasto'),
		(4, 'Pastizal'),
    )
	tipoSt = (
		(0,'Ninguno'),
        (1, 'Estanque'),
		(2, 'Estero'),
		(3, 'Jaula'),
		(4, 'Otra estructura fija'),
		(5, 'Otra estructura movil'),
    )
	provincia = models.ForeignKey(Provincia)
	municipio = models.ForeignKey(Municipio)
	poligono = models.CharField(max_length=3)
	parcela = models.CharField(max_length=5)
	recinto = models.CharField(max_length=5)
	superficie_hectareas = models.FloatField()
	prod_ag =  models.ForeignKey(ProductoGanaderia)
	
	sr = models.CharField(max_length=10,
                                   choices=SR,
                                   default="SECANO")
	f_ag_ec_rec = models.DateField()
	f_control = models.DateField()
	Estado = models.CharField(max_length=4,
                                   choices=est,
                                   default='ALTA')
	F_baja_rec = models.DateField(blank=True)
	F_calificacion = models.DateField()
	Calificacion = models.CharField(max_length=1,
                                   choices=cali,
                                   default=1)
	declar_pac = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')

	expedienteGanado = models.ForeignKey(Expediente,related_name="parcelasGanado")
	ag_eco = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
	codExplotREGA = models.CharField(max_length=14)
	grupoCultivo = models.CharField(max_length=1,
                                   choices=GRUP,
                                   default=1)
	raza = models.CharField(max_length=30,blank=True)
	animales = models.CharField(max_length=6,default='0')
	regApicola = models.CharField(max_length=10,blank=True)
	regAcuicola = models.CharField(max_length=15,blank=True)
	tipoAcuicola = models.CharField(max_length=1,
                                   choices=tipoSt,
                                   default=0,blank=True)
	utmX = models.CharField(max_length=13,blank=True)
	utmY = models.CharField(max_length=13,blank=True)
	produccion = models.IntegerField()
	F_altaProducto = models.DateField()
	F_bajaProducto = models.DateField(blank=True)
	productoCambiado= models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
								   	
class VisitaParcela (models.Model):
	f_visita = models.DateField()
	expediente = models.ForeignKey(Expediente,related_name="visitas")
	descripcion = models.TextField(blank=True)
	inspector = models.ForeignKey(Inspector)
	actuacion = models.CharField(max_length=70)
	completada = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
							   					   
	def __unicode__(self):
		texto = str(self.id)
		return texto	

class parcelas_visita (models.Model):
	visita = models.ForeignKey(VisitaParcela,related_name="parcelasVisita")
	
	incidencia = models.CharField(max_length=4,
                                   choices=est,
                                   default='ALTA')
	motivoBaja = models.TextField(blank=True,default='')
	parcela = models.ForeignKey(Parcela)
	pla_completa = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')
	act_completa = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')
	
class ganado_visita (models.Model):
	visita = models.ForeignKey(VisitaParcela,related_name="ganadoVisita")
	esAcuicola = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')
	incidencia = models.CharField(max_length=4,
                                   choices=est,
                                   default='ALTA')
	motivoBaja = models.TextField(blank=True,default='')
	ganado = models.ForeignKey(Ganado)
	pla_completa = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')
	act_completa = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')
	
class industria_visita (models.Model):
	visita = models.ForeignKey(VisitaParcela,related_name="industriaVisita")
	incidencia = models.CharField(max_length=4,
                                   choices=est,
                                   default='ALTA')
	motivoBaja = models.TextField(blank=True,default='')
	industria = models.ForeignKey(Industria)
	pla_completa = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')
	act_completa = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')

	
class Auditoria (models.Model):
	f_Auditoria = models.DateField()
	visita = models.ForeignKey(VisitaParcela,related_name="auditorias")
	descripcion = models.TextField(blank=True)
	n_incumplimientos = models.IntegerField()
	n_muestras = models.IntegerField()
	des_muestras = models.TextField(blank=True,default = '')
	acta = models.CharField(max_length=70,default='0')
	solicita_PAC = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	actaMuestreo = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	observaciones = models.TextField(blank=True,default = '')
								   
	def __unicode__(self):
		texto = str(self.f_Auditoria)
		return texto
	
	def accionesCorrectivas(self):
		acciones = AccionesCorrectivas.objects.filter(auditoria = self.id)
		return acciones
	
	def Evaluado(self):
		evaluado = Evaluacion.objects.filter(auditoria = self.id)
		res = ""
		if len(evaluado) > 0:
			calificacion = evaluado[0].eval
			if calificacion == 'N':
				res = 'NO CONFORME'
			else:
				res = 'CONFORME'
		return res
	
class InformeVisita (models.Model):
	auditoria = models.ForeignKey(Auditoria,related_name="Informes")
	num_informe = models.IntegerField(default = 1)
	fechas_auditoria = models.CharField(max_length=70,blank=True,default = '')
	reglamento = models.TextField(blank=True,default = '')
	equipo_auditor= models.CharField(max_length=70,blank=True,default = '')
	auditores = models.CharField(max_length=200,blank=True,default = '')
	observadores = models.CharField(max_length=200,blank=True,default = '')
	excusados = models.CharField(max_length=200,blank=True,default = '')
	verificacion = models.TextField(blank=True,default = '')
	modificacion = models.TextField(blank=True,default = '')
	
	
class Incumplimiento (models.Model):
	incpRef = (
		('P','Producto'),
        ('I', 'Instalacion'),
    )
	auditoria = models.ForeignKey(Auditoria,related_name="incumplimientos")
	tipoIncumplimiento = models.CharField(max_length=2,
                                   choices=tipoIncump,
                                   default='D')
	tipoNoConf= models.CharField(max_length=2,
                                   choices=NoConf,
                                   default='IN')
	reglproced = models.CharField(max_length=70)
	parcelas = models.CharField(max_length=100)
	incumplimiento = models.TextField(blank=True)
	ref = models.IntegerField()
	incumpRef= models.CharField(max_length=2,
                                   choices=incpRef,
                                   default='P')
	fase_proc = models.CharField(max_length=1,blank=True,default='')
	producto = models.CharField(max_length=10,blank=True,default='')
	f_detect = models.TextField(blank=True,default='')
	condicion = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')
	inc_completo = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')
	
	observaciones = models.TextField(blank=True)
	
class AccionesCorrectivas (models.Model):
	auditoria = models.ForeignKey(Auditoria,related_name="accionesCorrectivas")
	f_pac = models.DateField()
	f_ampac = models.DateField(blank=True,null=True)
	pide_ampac = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='NO')
	preg1 = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
	espreg1 = models.TextField(blank=True)
	preg2 = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
	espreg2 = models.TextField(blank=True)
	preg3 = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
	espreg3 = models.TextField(blank=True)
	preg4 = models.CharField(max_length=2,
                                   choices=actividad,
                                   default='SI')
	espreg4 = models.TextField(blank=True)

class Evaluacion (models.Model):
	auditoria = models.ForeignKey(Auditoria,related_name="evaluacion")
	f_eval = models.DateField()
	eval = models.CharField(max_length=1,
                                   choices=riesgo2,
                                   default='N')
	evaluador = models.ForeignKey(Inspector,default=2)
								   
class Historico_Certificados (models.Model):
	expediente = models.ForeignKey(Expediente,related_name="certificados")
	F_iniciovigencia = models.DateField(blank=True)
	F_finalvigencia = models.DateField(blank=True)
	
class HistoricoCultivos (models.Model):
	producto = models.ForeignKey(ProductoAgricola)
	variedad = models.ForeignKey(Variedades)
	parcela = models.ForeignKey(Parcela,related_name="HistoricoCultivos")
	f_alta = models.DateField()
	f_baja = models.DateField(blank=True)
	Estado = models.CharField(max_length=4,
                                   choices=est,
                                   default='ALTA')
								   
class RepositorioImagenes (models.Model):
	
	imagen = models.ImageField()	

class RecolectorParcelas (models.Model):	
	nParcelas = models.IntegerField(default=0)
	tipoParcela = models.CharField(max_length=70) 
	
class RecolectorErrores (models.Model):	
	idExp = models.ForeignKey(Expediente)
	error = models.CharField(max_length = 100)
	
class NuevosExpedientes(models.Model):	
	idExp = models.ForeignKey(Expediente)
	f_ingreso = models.DateField(auto_now=True)
							
'''for user in User.objects.all():
    Token.objects.get_or_create(user=user)'''

	
	

	
