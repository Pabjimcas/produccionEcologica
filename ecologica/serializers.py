from rest_framework import serializers
from ecologica.models import Provincia,Municipio,FormaJuridica,ContactoOperador,Expediente,InterlocutoresVisita,User,Cliente,ProductoAgricola,ProductoGanaderia,ProductoIndustria,Variedades,Parcela,VisitaParcela,HistoricoCultivos,Inspector,RepositorioImagenes,RecolectorParcelas,riesgo,RecolectorErrores,Ganado,Facturacion,NuevosExpedientes,AccionesCorrectivas,Evaluacion
from ecologica.models import Auditoria, Incumplimiento,Perfil,Industria,usuarioInspector,Historico_Certificados,parcelas_visita,ganado_visita,industria_visita,InformeVisita

class PerfilSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = Perfil
		fields = ('id','user','TipoUsuario')


class UsuariosSerializer(serializers.ModelSerializer):
	
	perfil = PerfilSerializer(many=True, read_only=True)
	class Meta:
		model = User
		fields = ('id','username','first_name','last_name','is_staff','is_active','perfil')
		
class MunicipioSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = Municipio
		fields = ('id','CodMunicipio','CodCatastral','Municipio','idProvincia')
		
class ProvinciaSerializer(serializers.ModelSerializer):
	
	municipios = MunicipioSerializer(many=True, read_only=True)
	
	class Meta:
		model = Provincia
		fields = ('id','CodProvincia','Provincia','municipios')
		
class InterlocutoresSerializer(serializers.ModelSerializer):

	class Meta:
		model = InterlocutoresVisita
		fields = ('id','nif','Nombre','TelefonoFijo','TelefonoMovil','Email','AtiendeVisita','FirmaVisita','idExpediente')

class ContactoSerializer(serializers.ModelSerializer):
	
	prov = serializers.ReadOnlyField(source='Provincia.Provincia')
	mun = serializers.ReadOnlyField(source='Municipio.Municipio')
	codprov = serializers.ReadOnlyField(source='Provincia.CodProvincia')
	codmun = serializers.ReadOnlyField(source='Municipio.CodMunicipio')
	class Meta:
		model = ContactoOperador
		fields = ('id','nif','Nombre','Apellido1','Apellido2','Genero','Telefono1','Telefono2','Fax','Email','Provincia','Municipio','Domicilio','CP','id_operador','prov','mun','codprov','codmun')
		
class FormaJuridicaSerializer(serializers.ModelSerializer):

	class Meta:
		model = FormaJuridica
		fields = ('id','Letra','Forma_Juridica')
		
class ProductoAgricolaSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = ProductoAgricola
		fields = ('id','CodActividad','Actividad','CodCultivo','Cultivo')

		
class ProductoGanaderiaSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = ProductoGanaderia
		fields = ('id','CodProducto','Producto','CodActividad','Actividad')
		
class ProductoIndustriaSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = ProductoIndustria
		fields = ('id','CodProducto','Producto','CodActividad','Actividad')
		
class VariedadesSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = Variedades
		fields = ('id','CodCultivo','Cultivo','CodVariedad','Variedad')
		
class UsuarioInspectorSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = usuarioInspector
		fields = ('id','inspector','expedientes','clientes','contactos','interlocutores','parcelas','v_realizadas','p_visitas','ev_riesgos','facturacion','auditorias','certifica','inspectores','archivos')
		
class InspectorSerializer(serializers.ModelSerializer):
	
	usInspector = UsuarioInspectorSerializer(many=True, read_only=True)
	
	class Meta:
		model = Inspector
		fields = ('id','nif','Nombre','Apellido1','Apellido2','Telefono1','Telefono2','usInspector','categoria')
		
class IncumplimientoSerializer(serializers.ModelSerializer):
	
	f_visita = serializers.ReadOnlyField(source='auditoria.visita.f_visita')
	f_audi = serializers.ReadOnlyField(source='auditoria.f_Auditoria')
	class Meta:
		model = Incumplimiento
		fields = ('id','auditoria','f_visita','tipoIncumplimiento','tipoNoConf','incumplimiento','reglproced','parcelas','observaciones','f_audi','ref','incumpRef','fase_proc','producto','f_detect','condicion','inc_completo')
		
class AccionesCorrectivasSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = AccionesCorrectivas
		fields = ('id','auditoria','f_pac','f_ampac','pide_ampac','preg1','espreg1','preg2','espreg2','preg3','espreg3','preg4','espreg4')

class EvaluacionSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = Evaluacion 
		fields = ('id','auditoria','f_eval','eval','evaluador')
		
class InformeVisitaSerializer(serializers.ModelSerializer):

	nombreIns = serializers.ReadOnlyField(source='auditoria.visita.inspector.Nombre')
	apellido1Ins = serializers.ReadOnlyField(source='auditoria.visita.inspector.Apellido1')
	apellido2Ins = serializers.ReadOnlyField(source='auditoria.visita.inspector.Apellido2')
	f_Auditoria = serializers.ReadOnlyField(source='auditoria.f_Auditoria')
	
	class Meta:
		model = InformeVisita 
		fields = ('id','nombreIns','apellido1Ins','verificacion','modificacion','apellido2Ins','auditoria','f_Auditoria','num_informe','fechas_auditoria','reglamento','equipo_auditor','auditores','observadores','excusados')
		
class AuditoriaSerializer(serializers.ModelSerializer):
	
	incumplimientos = IncumplimientoSerializer(many=True, read_only=True)
	accionesCorrectivas = AccionesCorrectivasSerializer(many=True, read_only=True)
	evaluacion = EvaluacionSerializer(many=True, read_only=True)
	nombreIns = serializers.ReadOnlyField(source='visita.inspector.Nombre')
	apellido1Ins = serializers.ReadOnlyField(source='visita.inspector.Apellido1')
	apellido2Ins = serializers.ReadOnlyField(source='visita.inspector.Apellido2')
	f_inivig = serializers.ReadOnlyField(source='visita.expediente.F_iniciovigencia')
	f_finvig = serializers.ReadOnlyField(source='visita.expediente.F_finalvigencia')
	vigente = serializers.ReadOnlyField(source='visita.expediente.vigente')
	completada = serializers.ReadOnlyField(source='visita.completada')
	inspector = serializers.ReadOnlyField(source='visita.inspector.id')
	Informes = InformeVisitaSerializer(many=True, read_only=True)
	
	class Meta:
		model = Auditoria
		fields = ('id','f_Auditoria','actaMuestreo','visita','solicita_PAC','descripcion','observaciones','inspector','n_incumplimientos','n_muestras','des_muestras','acta','incumplimientos','accionesCorrectivas','evaluacion','nombreIns','apellido1Ins','apellido2Ins','f_inivig','f_finvig','vigente','completada','Informes')
	
class HistoricoCultivosSerializer(serializers.ModelSerializer):	
	class Meta:
		model = HistoricoCultivos
		fields = ('id','producto','variedad','parcela','f_alta','f_baja','Estado')
		
class HistoricoCertificadosSerializer(serializers.ModelSerializer):	
	class Meta:
		model = Historico_Certificados
		fields = ('id','expediente','F_iniciovigencia','F_finalvigencia')
		
class IndustriaSerializer(serializers.ModelSerializer):
	prov = serializers.ReadOnlyField(source='provincia.Provincia')
	mun = serializers.ReadOnlyField(source='municipio.Municipio')
	codprov = serializers.ReadOnlyField(source='provincia.CodProvincia')
	codmun = serializers.ReadOnlyField(source='municipio.CodCatastral')
	codact = serializers.ReadOnlyField(source='producto.CodActividad')
	actgen = serializers.ReadOnlyField(source='producto.Actividad')
	prod = serializers.ReadOnlyField(source='producto.Producto')
	codproducto = serializers.ReadOnlyField(source='producto.CodProducto')
	procesados = serializers.ReadOnlyField(source='prodcts')
	envasesProd = serializers.ReadOnlyField(source="envases")
	marcs = serializers.ReadOnlyField(source="marcas")
	
	class Meta:
		model = Industria
		fields = ('id','inscrito','procesados','envasesProd','marcs','matriculaRIA','provincia','municipio','declar_pac','Domicilio','CP','utmX','utmY','regSanit','regEmbotella','f_control','Estado','F_baja','expediente','ag_eco','tipProc','tipoCom','producto','codact','actgen','prod','codproducto','F_altaProducto','F_bajaProducto','productoCambiado','desc_product','f_ag_eco_prod','capacidad','form_pres','tam_emb','marcas_referencia','valor_produccion','prov','mun','codprov','codmun')
		
class ParcelaSerializer(serializers.ModelSerializer):
	
	prov = serializers.ReadOnlyField(source='provincia.Provincia')
	mun = serializers.ReadOnlyField(source='municipio.Municipio')
	codprov = serializers.ReadOnlyField(source='provincia.CodProvincia')
	codmun = serializers.ReadOnlyField(source='municipio.CodCatastral')
	codactgen = serializers.ReadOnlyField(source='prod_ag.CodActividad')
	actgen = serializers.ReadOnlyField(source='prod_ag.Actividad')
	cultivo = serializers.ReadOnlyField(source='prod_ag.Cultivo')
	codcultivo = serializers.ReadOnlyField(source='prod_ag.CodCultivo')
	codvari = serializers.ReadOnlyField(source='variedad.CodVariedad')
	vari = serializers.ReadOnlyField(source='variedad.Variedad')
	HistoricoCultivos = HistoricoCultivosSerializer(many=True, read_only=True)

	class Meta:
		model = Parcela
		fields = ('id','provincia','municipio','poligono','parcela','recinto','superficie_hectareas','prod_ag','variedad','sr','f_ag_ec_rec','f_control','Estado','F_baja_rec','F_calificacion','Calificacion','declar_pac','cosecha_anual','F_altaProducto','F_bajaProducto','productoCambiado','ag_eco','expediente','prov','mun','codprov','codmun','cultivo','HistoricoCultivos','actgen','codactgen','vari','codvari','codcultivo')
		
class GanadoSerializer(serializers.ModelSerializer):
	
	prov = serializers.ReadOnlyField(source='provincia.Provincia')
	mun = serializers.ReadOnlyField(source='municipio.Municipio')
	codprov = serializers.ReadOnlyField(source='provincia.CodProvincia')
	codmun = serializers.ReadOnlyField(source='municipio.CodCatastral')
	codactgen = serializers.ReadOnlyField(source='prod_ag.CodProducto')
	actgen = serializers.ReadOnlyField(source='prod_ag.Producto')
	Orientacion = serializers.ReadOnlyField(source='prod_ag.Actividad')
	codOrientacion = serializers.ReadOnlyField(source='prod_ag.CodActividad')

	class Meta:
		model = Ganado
		fields = ('id','provincia','municipio','poligono','parcela','recinto','superficie_hectareas','prod_ag','sr','f_ag_ec_rec','f_control','Estado','F_baja_rec','F_calificacion','Calificacion','declar_pac','ag_eco','expedienteGanado','prov','mun','codprov','codmun','Orientacion','actgen','codactgen','codOrientacion','codExplotREGA','grupoCultivo','raza','animales','regApicola','regAcuicola','tipoAcuicola','utmX','utmY','produccion','F_altaProducto','F_bajaProducto','productoCambiado')
	
class parcelas_visitaSerializer(serializers.ModelSerializer):	
			
	codprov = serializers.ReadOnlyField(source='parcela.provincia.CodProvincia')
	codmun = serializers.ReadOnlyField(source='parcela.municipio.CodCatastral')
	poligono = serializers.ReadOnlyField(source='parcela.poligono')
	parce = serializers.ReadOnlyField(source='parcela.parcela')
	recinto = serializers.ReadOnlyField(source='parcela.recinto')
			
	class Meta:
		model = parcelas_visita
		fields = ('id','pla_completa','act_completa','visita','incidencia','motivoBaja','parcela','codprov','codmun','poligono','parce','recinto')
		
class ganado_visitaSerializer(serializers.ModelSerializer):	
			
	
	class Meta:
		model = ganado_visita
		fields = ('id','pla_completa','act_completa','visita','incidencia','esAcuicola','motivoBaja','ganado')
		
class industria_visitaSerializer(serializers.ModelSerializer):	
			
	
	class Meta:
		model = industria_visita
		fields = ('id','pla_completa','act_completa','visita','incidencia','motivoBaja','industria')	
	
class VisitaParcelaSerializer(serializers.ModelSerializer):

	nombreIns = serializers.ReadOnlyField(source='inspector.Nombre')
	apellido1Ins = serializers.ReadOnlyField(source='inspector.Apellido1')
	apellido2Ins = serializers.ReadOnlyField(source='inspector.Apellido2')
	auditorias = AuditoriaSerializer(many=True, read_only=True)
	parcelasVisita = parcelas_visitaSerializer(many=True, read_only=True)
	ganadoVisita = ganado_visitaSerializer(many=True, read_only=True)
	industriaVisita = industria_visitaSerializer(many=True, read_only=True)
	codigoExpediente = serializers.ReadOnlyField(source='expediente.CodOperador')
	
	class Meta:
		model = VisitaParcela
		fields = ('id','f_visita','codigoExpediente','expediente','descripcion','inspector','actuacion','nombreIns','apellido1Ins','apellido2Ins','auditorias','completada','parcelasVisita','ganadoVisita','industriaVisita')
	
class RiesgoSerializer(serializers.ModelSerializer):

	expediente = serializers.ReadOnlyField(source='idExpediente.CodOperador')
	estado = serializers.ReadOnlyField(source='idExpediente.Estado')
	class Meta:
		model = riesgo
		fields = ('id','idExpediente','expediente','estado','vinc_s_r','alc_cert','no_conf','ap_dir_cont','ap_ind_cont','ent_prod','prod_par','cont_res','cont_amb','cont_ant','rie_sust','volumen','puntuacion','f_eval')
	

		

class FacturacionSerializer(serializers.ModelSerializer):
	
	class Meta:
		model = Facturacion
		fields = ('id','expediente','f_fact','concepto','importe')
		
class ExpedienteSerializer(serializers.ModelSerializer):
	
	interlocutores = InterlocutoresSerializer(many=True, read_only=True)
	contacto = ContactoSerializer(many=True, read_only=True)
	parcelas = ParcelaSerializer(many=True, read_only=True)
	parcelasGanado = GanadoSerializer(many=True, read_only=True)
	industrias = IndustriaSerializer(many=True, read_only=True)
	visitas = VisitaParcelaSerializer(many=True, read_only=True)
	formaJ = serializers.ReadOnlyField(source='F_juridica.Letra')
	riesgo = RiesgoSerializer(many=True, read_only=True)
	facturacion = FacturacionSerializer(many=True, read_only=True)
	certificados = HistoricoCertificadosSerializer(many=True, read_only=True)
	class Meta:
		model = Expediente
		fields = ('id','tipoAgricultura','indProdParalela','responsable','CodSipea','anyo','CodOperador','F_juridica','formaJ','Fecha_recepcion','Fecha_aecologica','Estado','F_baja','con_actividad','F_cese_activ','aso_ag','asociacion_agraria','s_cop','cooperativa','info_contac1','com_ind','industrias','info_contac2','entidadPac','info_contac3','interlocutores','contacto','id_cliente','parcelas','parcelasGanado','visitas','F_iniciovigencia','F_finalvigencia','vigente','haestadovigente','idDocumento','riesgo','facturacion','certificados')

		
class ClienteSerializer(serializers.ModelSerializer):
	
	expedientes = ExpedienteSerializer(many=True, read_only=True)
	prov = serializers.ReadOnlyField(source='Provincia.Provincia')
	mun = serializers.ReadOnlyField(source='Municipio.Municipio')
	codprov = serializers.ReadOnlyField(source='Provincia.CodProvincia')
	codmun = serializers.ReadOnlyField(source='Municipio.CodMunicipio')
	
	class Meta:
		model = Cliente
		fields = ('id','nifcif','F_sepa','p_recur','Nombre','Apellido1','Apellido2','Genero','Telefono1','Telefono2','Fax','Email','Web','Municipio','Provincia','Domicilio','CP','expedientes','prov','mun','codprov','codmun','iban','esiban','observaciones','f_pago')

class ImagenesSerializer(serializers.ModelSerializer):
    class Meta:
        model= RepositorioImagenes
        fields=('id','imagen')
		
class RecolectorParcelasSerializer(serializers.ModelSerializer):
    class Meta:
        model= RecolectorParcelas
        fields=('id','nParcelas')
		
class RecolectorErroresSerializer(serializers.ModelSerializer):
    class Meta:
        model= RecolectorErrores
        fields=('id','idExp','error')
			
class NuevosExpedientesSerializer(serializers.ModelSerializer):
    class Meta:
        model= NuevosExpedientes
        fields=('id','idExp','f_ingreso')	
		
