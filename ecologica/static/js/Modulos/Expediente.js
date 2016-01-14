(function(){
	
	var expediente = angular.module('Expediente',["ui.bootstrap", "ngCookies","ngResource"]);
	var expedienteId = 0; 

	expediente.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';
	}]);

	expediente.config(function ($interpolateProvider) {
			$interpolateProvider.startSymbol("[[");
			$interpolateProvider.endSymbol("]]");
		}
	);
	
	expediente.controller("Expediente",['$http','$log','$scope','$filter',function($http,$log,$scope,$filter){
		
		$scope.nomodifica = true;
		var documento = "";
		var haestadovigente = "";
		var fini ="";
		var ffin ="";
		var actgen = [];
		var fechaHoy = new Date();
		var parcelas = [];
		$scope.superficie1 = 0;
		var superficie1 = 0;
		$scope.superficie2 = 0;
		var superficie2 = 0;
		$scope.siguiente4 = true;
		$scope.siguiente5 = true;
		var idRecolector = 0;
		var conid = 0;
		var visid = 0;
		var audid = 0;
		var incumID = 0;
		var informeId = 0;
		var provi = 0;
		var muni = 0;
		$scope.puntuacion = 0;
		$scope.visita = {incump: 0,muestras:0};
		var planificadas = [];
		var auditorias = [];
		var auditoriasAuditor = [];
		var planificadasAuditor = [];
		var visitas = [];
		var contador = 0;
		var cont = 0;
		var vigente = 'NO';
		var paso1 = false;
		var paso2 = false;
		var factID = 0;
		$scope.tamanyos = [];
		$scope.marcas = [];
		$scope.muestraPlanificacion = true;
		$scope.fechasAuditoria = [];
		$scope.auditoresExtra = [];
		$scope.observadores = [];
		$scope.excusados = [];
		document.getElementById("myBtn").disabled = true;
		$scope.idPanel = 'Pla';
		
		
		$scope.contacto = {nif: '',nombre: '',apellido1: '',apellido2: '',gen: 'X',
		tel1: '',tel2:'',fax: '',email:'', domicilio:'',cp:''};
		
		$scope.parcela = {eco: 'SI',poligono: '',parcela: '',recinto: '',superficie: '',dpac: 'SI',estado: 'ALTA',cosecha: '0',calificacion: 1,fcalif: fechaHoy};
		var hay1 = 0;
		var hay2 = 0;
		$scope.inicializaExpediente = function(idExpediente,tipo,idAudit){
		

				$http.get('/api/expedientes/'+idExpediente).success(function(dato){
					var estad = dato.Estado;
					var activ = dato.con_actividad;
					var fechahoy = new Date();
					
					var incumplimientosVisita = [];
					var infVisita = [];
					var acciones = [];
					for (var i= 0; i< dato.visitas.length; i++){

						for(var j= 0; j < dato.visitas[i].auditorias.length; j++){
							for(var w=0; w<dato.visitas[i].auditorias[j].incumplimientos.length; w++){
								//if(dato.visitas[i].auditorias[j].incumplimientos.length > 0){
									var incump = {id: dato.visitas[i].auditorias[j].id,f_audi: dato.visitas[i].auditorias[j].f_Auditoria, incump: dato.visitas[i].auditorias[j].incumplimientos[w]};
									incumplimientosVisita.push(incump);	
								//}
							}
							for(var w=0; w<dato.visitas[i].auditorias[j].Informes.length; w++){

								var infor = {id: dato.visitas[i].auditorias[j].id, inform: dato.visitas[i].auditorias[j].Informes[w]};
								
								infVisita.push(infor);
							}
							for(var w=0; w<dato.visitas[i].auditorias[j].accionesCorrectivas.length; w++){

								var acc = {id: dato.visitas[i].auditorias[j].id, f_audi:dato.visitas[i].auditorias[j].f_Auditoria,acc: dato.visitas[i].auditorias[j].accionesCorrectivas[w]};
								
								acciones.push(acc);
							}
							
						}
					}
					
					
					$scope.incumplimientosVisita = incumplimientosVisita;
					$scope.informesVisita = infVisita;
					$scope.accionesCorrect = acciones;

					day = fechahoy.getDate();
					if(day.toString().length < 2){
						day = "0"+day.toString();
					}
					
					$scope.pp = dato.indProdParalela;
					$scope.codExp = dato.CodOperador;
					$scope.codSipea = dato.CodSipea;
					$scope.fj = dato.F_juridica;
					$scope.frecp =  new Date(dato.Fecha_recepcion);
					$scope.finscri = dato.Fecha_aecologica;
					$scope.finscrip = new Date(dato.Fecha_aecologica);
					$scope.contactos = dato.contacto;
					$scope.interlocutores = dato.interlocutores;
					$scope.est = estad;
					$scope.act = activ;
					$scope.asag= dato.aso_ag;
					$scope.asoc =dato.asociacion_agraria;
					$scope.coop= dato.s_cop;
					$scope.cooperativa =dato.cooperativa;
					$scope.ind= dato.com_ind;
					$scope.industria =dato.industria;
					$scope.PAC= dato.entidadPac;
					$scope.pc1 =dato.info_contac1;
					$scope.pc2 =dato.info_contac2;
					$scope.pc3 =dato.info_contac3;
					$scope.haestadovigente = dato.haestadovigente;
					$scope.vigent = dato.vigente;
					documento = dato.idDocumento;
					$scope.evaluaciones = dato.riesgo;
					fini = dato.F_iniciovigencia;
					ffin = dato.F_finalvigencia;
					fechaHoy = new Date();
					fechaVigencia = new Date(ffin);
					$scope.certificados = dato.certificados;

					
					$scope.idDoc=dato.idDocumento;
					if(estad == "ALTA"){
						document.getElementById("fbaja").value = fechahoy.toJSON().substring(0,8)+day;
					}else if(estad == "BAJA"){
						document.getElementById("fbaja").value = dato.F_baja;
					}
					if(activ == "SI"){
						document.getElementById("fcact").value = fechahoy.toJSON().substring(0,8)+day;
					}else if(activ == "NO"){
						document.getElementById("fcact").value = dato.F_cese_activ;
					}


					$http.get('/api/clientes/'+dato.id_cliente).success(function(dato2){
						$scope.Nombre = dato2.Nombre;
						$scope.Apellido1 = dato2.Apellido1;
						$scope.Apellido2 = dato2.Apellido2;
						$scope.Telefono = dato2.Telefono1;
						$scope.Provincia = dato2.prov;			
						$scope.Municipio = dato2.mun;
						
					});
					$log.log(dato.industria)
					if(tipo == 'AE'){
						datosparcelas = dato.parcelas;
						actividades = [];
						idActiv = [];
						for (i=0; i< datosparcelas.length; i++){
							if(idActiv.indexOf(datosparcelas[i].codcultivo) == -1){
								idActiv.push(datosparcelas[i].codcultivo);
								actividades.push({producto: datosparcelas[i].cultivo ,codProducto: datosparcelas[i].codcultivo, id: datosparcelas[i].prod_ag})
							}
						}
						$scope.tipoProductos = actividades;
					}else if(tipo == 'GA'){
						datosparcelas = dato.parcelasGanado;
						$scope.tipoAcuicola = 0;
						actividades = [];
						idActiv = [];
						for (i=0; i< datosparcelas.length; i++){
							if(idActiv.indexOf(datosparcelas[i].codOrientacion) == -1){
								idActiv.push(datosparcelas[i].codOrientacion);
								actividades.push({producto: datosparcelas[i].Orientacion ,codProducto: datosparcelas[i].codOrientacion, id: datosparcelas[i].prod_ag})
							}
						}
						$scope.tipoProductos = actividades;
					}else if(tipo == 'IN'){
						datosparcelas = dato.industrias;
						actividades = [];
						idActiv = [];
						for (i=0; i< datosparcelas.length; i++){
							if(idActiv.indexOf(datosparcelas[i].codact) == -1){
								idActiv.push(datosparcelas[i].codact);
								actividades.push({producto: datosparcelas[i].actgen ,codProducto: datosparcelas[i].codact, id: datosparcelas[i].producto})
							}
						}
						$scope.tipoProductos = actividades;
					}
				
				$scope.parcelas = datosparcelas;
				parcelas = datosparcelas;
				
				if(tipo == 'GA' || tipo == 'AE'){
					for (i=0;i<parcelas.length;i++){
						if(parcelas[i].ag_eco == "SI"){
							superficie1 += parseFloat(parcelas[i].superficie_hectareas);
						}else if(parcelas[i].ag_eco == "NO"){
							superficie2 += parseFloat(parcelas[i].superficie_hectareas);
						}
						if(superficie1 > 0){
							$scope.siguiente4 = false;
						}
						if(superficie2 > 0){
							$scope.siguiente5 = false;
						}
						$scope.superficie1 = superficie1.toFixed(4);
						$scope.superficie2 = superficie2.toFixed(4);
					}
				}else{
					for (i=0;i<parcelas.length;i++){
						if(parcelas[i].ag_eco == "SI"){
							hay1 += 1;
						}else if(parcelas[i].ag_eco == "NO"){
							hay2 += 1;
						}
						if(hay1 > 0){
							$scope.siguiente4 = false;
						}
						if(hay2 > 0){
							$scope.siguiente5 = false;
						}
					}
				}
				
				$scope.facturas = dato.facturacion;
				for (i=0;i<dato.visitas.length;i++){
					planificadas.push(dato.visitas[i]);
					if(idAudit != "" && idAudit == dato.visitas[i].inspector){
						planificadasAuditor.push(dato.visitas[i]);
					}
					for(j=0;j<dato.visitas[i].auditorias.length; j++){
						if(idAudit != "" && idAudit == dato.visitas[i].auditorias[j].inspector){
							auditoriasAuditor.push(dato.visitas[i].auditorias[j])
						}
						auditorias.push(dato.visitas[i].auditorias[j]);
					}
					if (dato.visitas[i].completada == 'SI'){
						visitas.push(dato.visitas[i]);
					}
				}
				$scope.auditorias = auditorias;
				$scope.auditoriasAuditor = auditoriasAuditor;
				$scope.planificadasAuditor = planificadasAuditor;
				$log.log(planificadas)
				$scope.planificadas = planificadas;
				$scope.visitas = visitas;
				
				
			});
				
			$http.get('/api/municipios').success(function(dato){	
				$scope.municipios = dato;
			});
			
			if (tipo == 'AE'){
			
			$http.get('/api/ProductoAgricola').success(function(dato){	
				$scope.cultivos = dato;
			});
			
			$http.get('/api/Variedades').success(function(dato){
				$scope.variedad = dato;
			});
			}else if(tipo =='GA'){
			
			$http.get('/api/ProductoGanaderia').success(function(dato){	
				$scope.orientaciones = dato;
			});
			}else {
				$http.get('/api/ProductoIndustria').success(function(dato){	
					$scope.productosIndustria = dato;
				});
				
			}
			
			$http.get('/api/RecolectorParcelas/').success(function(dato){	
				if (dato.length > 1){
					idRecolector = dato[dato.length -1].id;
				}
			});
		};
		
		$scope.limpiarVisita = function(){
			document.getElementById("formularioVisita").reset();
		};
		
		$scope.anadeMedida = function(medida,id){
			$scope.medida = medida;
			$scope.idMedida = id;
		};
		
		var id= 1;
		
		$scope.anadeTamanyo = function(){
			var tamanyos = $scope.tamanyos;
			if($scope.cant_tam){
				if($scope.medida){
					tamanyos.push({id: id,cantidad: $scope.cant_tam, medidaId: $scope.idMedida, medida: $scope.medida})
					$scope.tamanyos=tamanyos;
					$scope.cant_tam = "";
					id++;
				}else{
					alert("Introduzca una medida");
				}
			}else{
				alert("Introduzca una cantidad");
			}
		};
		$scope.eliminaTamanyo = function(tamid){
			var tamanyos = $scope.tamanyos;
			var index;
			for (i=0; i<tamanyos.length; i++){
				if(tamanyos[i].id == tamid){
					index = i;
				}
			}
				tamanyos.splice(index,1);
			$scope.tamanyos = tamanyos;
		};
		var idM = 1;
		$scope.anadeMarca = function(){
			var marcas = $scope.marcas;
			if($scope.m_ref){
				marcas.push({id: idM, marca: $scope.m_ref})
				$scope.marcas=marcas;
				$scope.m_ref = "";
				idM++;
			}else{
				alert("Introduzca una marca");
			}
		};
		$scope.eliminaMarca = function(marid){
			var marcas = $scope.marcas;
			var index;
			for (i=0; i<marcas.length; i++){
				if(marcas[i].id == marid){
					index = i;
				}
			}
				marcas.splice(index,1);
			$scope.marcas = marcas;
		};
		
		
		$scope.eliminarVisita = function(visitaid,num){
			var x;
			if (num == 1 || num == 2){
				if (confirm("¿Desea eliminar esta visita?") == true) {
					$http.delete('/api/VisitaParcela/'+visitaid).
					success(function(data,status,headers,config){
						$log.log("Eliminado")
						var index = 0;
						if (num == 1){
							visitas = $scope.visitas;
						}else if(num == 2){
							visitas = $scope.planificadas;
						}
						
						for (i=0; i<visitas.length; i++){
							if(visitas[i].id == visitaid){
								index = i;
							}
						}
						visitas.splice(index,1);
						if (num == 1){
							$scope.visitas = visitas;
						}else if(num == 2){
							$scope.planificadas = visitas;
						}
						
					}).
					error(function(data,status,headers,config){
						$log.log(data)
					});
				
					}
			}else if(num == 3){
				if (confirm("¿Desea eliminar esta auditoría?") == true) {
					$http.delete('/api/Auditoria/'+visitaid).
					success(function(data,status,headers,config){
						$log.log("Eliminado")
						var index = 0;
						visitas = $scope.auditorias;
						
						for (i=0; i<visitas.length; i++){
							if(visitas[i].id == visitaid){
								index = i;
							}
						}
						visitas.splice(index,1);
						$scope.auditorias = visitas;
						
					}).
					error(function(data,status,headers,config){
						$log.log(data)
					});
				}
			}else if(num == 4){
				if (confirm("¿Desea eliminar este incumplimiento?") == true) {
					$http.delete('/api/Incumplimiento/'+visitaid).
					success(function(data,status,headers,config){
						$log.log("Eliminado")
						var index = 0;
						visitas = $scope.incumplimientos;
						
						for (i=0; i<visitas.length; i++){
							if(visitas[i].id == visitaid){
								index = i;
							}
						}
						visitas.splice(index,1);
						$scope.incumplimientos = visitas;
						
					}).
					error(function(data,status,headers,config){
						$log.log(data)
					});
				}
			}else if(num == 5){
				if (confirm("¿Desea eliminar esta visita?") == true) {
					$http.delete('/api/VisitaParcela/'+visitaid).
					success(function(data,status,headers,config){
						var index = 0;
						visitas = $scope.planificadasAuditor;
						
						for (i=0; i<visitas.length; i++){
							if(visitas[i].id == visitaid){
								index = i;
							}
						}
						visitas.splice(index,1);
						$scope.planificadasAuditor = visitas;
						
					}).
					error(function(data,status,headers,config){
						$log.log(data)
					});
				}
			}else if(num == 6){
				if (confirm("¿Desea eliminar esta auditoría?") == true) {
					$http.delete('/api/Auditoria/'+visitaid).
					success(function(data,status,headers,config){
						$log.log("Eliminado")
						var index = 0;
						visitas = $scope.auditoriasAuditor;
						
						for (i=0; i<visitas.length; i++){
							if(visitas[i].id == visitaid){
								index = i;
							}
						}
						visitas.splice(index,1);
						$scope.auditoriasAuditor = visitas;
						
					}).
					error(function(data,status,headers,config){
						$log.log(data)
					});
				}
			}
		};
		
		
		$scope.editaVisita = function(visitaID,tipoVis){
			$('.collapse').collapse('show')
			$scope.modificaVisita = true;
			visid = visitaID;
			$http.get('/api/VisitaParcela/'+visitaID).
				success(function(data){
					$log.log(data);
					$scope.fvisita = new Date(data.f_visita);
					$scope.descripcion = data.descripcion;
					$scope.inspector = data.inspector;
					$scope.tact = data.actuacion;
					if (tipoVis == 'AE'){
						$scope.cargadas = data.parcelasVisita;
						$scope.estadoCargada = data.parcelasVisita.incidencia;
					}else if(tipoVis == 'GA'){
						$scope.cargadas = data.ganadoVisita;
						$scope.estadoCargada = data.ganadoVisita.incidencia;
					}else if(tipoVis == 'IN'){
						$scope.cargadas = data.industriaVisita;
						$scope.estadoCargada = data.industriaVisita.incidencia;
					}	
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		$scope.editaAuditoria = function(audiID){
			$('.collapse').collapse('show')
			$scope.modificaAuditoria = true;
			audid = audiID;
			$http.get('/api/Auditoria/'+audiID).
				success(function(data){
				$scope.faudi = new Date(data.f_Auditoria);
					$scope.visitaPlanif = data.visita;
					$scope.visita.incump = data.n_incumplimientos;
					$scope.visita.muestras = data.n_muestras;
					$scope.descripcion2 = data.descripcion
					$scope.solPac=data.solicita_PAC;
					$scope.descmuestras=data.des_muestras;
					$scope.acta = data.acta;
					$scope.observ1 = data.observaciones;
					$scope.actaM = data.actaMuestreo;
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		$scope.editaIncumplimiento = function(incumpID){
			$('.collapse').collapse('show')
			$scope.modificaIncumplimiento = true;
			incumID = incumpID;
			$http.get('/api/Incumplimiento/'+incumpID).
				success(function(data){
					$scope.selectAudi = data.auditoria;
					$scope.tipoIncp = data.tipoIncumplimiento;
					$scope.tipoNC = data.tipoNoConf;
					$scope.apdo = data.reglproced;
					$scope.expl =data.parcelas;
					$scope.descripcion3 = data.incumplimiento;
					$scope.descripcion4 = data.observaciones;
					$scope.ref = data.ref;
					$scope.t_inc = data.incumpRef;
					$scope.fase = data.fase_proc;
					$scope.forma_deteccion = data.f_detect;
					$scope.condicionalidad = data.condicion;
					$scope.t_product = data.producto;
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		$scope.CancelaInf = function(){
			$('.collapse').collapse('hide');
			$scope.modificaInforme = false;
		}
		$scope.modificaInf = function(){

		}
		$scope.editaInforme = function(infId){
			$('.collapse').collapse('show');
			$scope.modificaInforme = true;
			informeId = infId;
			$http.get('/api/informeVisita/'+informeId).
				success(function(data){
					$scope.selectAudi = data.auditoria;
					$scope.n_inf = data.num_informe;
					$scope.equipo = data.equipo_auditor;
					$scope.fechaAudi = data.f_Auditoria;
					var fechas = data.fechas_auditoria.split(" ");
					var listaFechas = [];
					id = 1;
					for (var i in fechas){
						var fech = new Date(fechas[i]);
						listaFechas.push({fecha: fech, id: id});
						id++;
					}

					$scope.fechasAuditoria = listaFechas;
					
					
					$scope.nombreAuditor = data.nombreIns+" "+data.apellido1Ins+" "+data.apellido2Ins;
					var auditores = data.auditores.split("/");
					var listaAuditores = [];
					id = 1;
					for (var i in auditores){
						var audi = auditores[i];
						listaAuditores.push({audit: audi, id: id});
						id++;
					}
					$scope.auditoresExtra = listaAuditores;
					var observadores = data.observadores.split("/");
					var listaObservadores = [];
					id=1;
					for (var i in observadores){
						var observ = observadores[i];
						listaObservadores.push({observ:observ, id:id})
						id++;
					}
					$scope.observadores = listaObservadores;
					$scope.reglamento = data.reglamento;
					$scope.verificacion = data.verificacion;
					$scope.modificacion = data.modificacion;
					var excusados = data.excusados.split(">");
					var listaExcusados = [];
					id=1;
					for (var i in excusados){
						var excusado = excusados[i].split("/");
						listaExcusados.push({nombre:excusado[0],motivo:excusado[1],id:id});
						id++;
					}
					$scope.excusados = listaExcusados;


				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		$scope.CancelaMod = function(){
			$('.collapse').collapse('hide')
			$scope.modificaVisita = false;
			$scope.modificaAuditoria = false;
			$scope.modificaIncumplimiento = false;
			document.getElementById("formularioVisita").reset();
		};
		$scope.comparaAuditor = function(idAudit){
			$http.get('/api/VisitaParcela/'+$scope.visitaPlanif).
				success(function(data){
					if (data.inspector == idAudit){
						if($scope.faudi){
							document.getElementById("auditoriaBoton").disabled = false;
						}else{
							document.getElementById("auditoriaBoton").disabled = true;
						}
					}else{
						document.getElementById("auditoriaBoton").disabled = true;
					}
				});
		};
		


		$scope.comprueba = function(){
			
			if($scope.visitaPlanif){
				
				$http.get('/api/VisitaParcela/'+$scope.visitaPlanif).
				success(function(data){
					acta = data.codigoExpediente;
					actuacion = data.actuacion;
					actuaciones = actuacion.split(" ");
					siglas = "";
					for (i=0;i<actuaciones.length;i++){
						siglas = siglas+actuaciones[i].substring(0,1);
					}
					$scope.acta = acta.substring(0,6)+"/"+acta.substring(7,9)+"/"+acta.substring(10,12)+"/"+siglas;
					if($scope.faudi){
					document.getElementById("auditoriaBoton").disabled = false;
					}else{
						document.getElementById("auditoriaBoton").disabled = true;
					}
				});
				
			}else{
				document.getElementById("auditoriaBoton").disabled = true;
			}
		};
		
		$scope.guardarRiesgo = function(idExp){
			fecha = document.getElementById("f_eval").value;
			$http.post('/api/Riesgos/',{idExpediente:idExp, vinc_s_r: $scope.vinc_s_r, alc_cert: $scope.alc_cert,
			no_conf: $scope.no_conf, ap_dir_cont: $scope.radio1, ap_ind_cont: $scope.radio2,ent_prod: $scope.radio3,
			prod_par: $scope.radio4, cont_res: $scope.radio5, cont_amb: $scope.radio6,cont_ant: $scope.radio7,
			rie_sust: $scope.radio8,volumen: $scope.Volumen,puntuacion: $scope.puntuacion,f_eval: fecha}).
			success(function(data,status,headers,config){
					riesgo = $scope.evaluaciones;
					riesgo.push(data);
					$scope.evaluaciones = riesgo;

			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
		};
		$scope.eliminarRiesgo = function(riesgoId){
			var x;
			if (confirm("¿Desea eliminar esta evaluación?") == true) {
				$http.delete('/api/Riesgos/'+riesgoId).
				success(function(data,status,headers,config){
					$log.log("Eliminado")
					var index = 0;
					riesgo = $scope.evaluaciones;
					for (i=0; i<riesgo.length; i++){
						if(riesgo[i].id == riesgoId){
							index = i;
						}
					}
					riesgo.splice(index,1);
					$scope.evaluaciones = riesgo;
					
				}).
				error(function(data,status,headers,config){
					$log.log("Error")
				});
			} 
		};
		$scope.editaRiesgo = function(riesgoId){
			rId = riesgoId;
			$scope.modificaRiesgo = true;
			$http.get('/api/Riesgos/'+riesgoId).
				success(function(data){
					$scope.f_eval = new Date(data.f_eval);
					$scope.vinc_s_r = data.vinc_s_r;
					$scope.alc_cert = data.alc_cert;
					$scope.no_conf = data.no_conf;
					$scope.radio1 = data.ap_dir_cont;
					$scope.radio2 = data.ap_ind_cont
					$scope.radio3 = data.ent_prod;
					$scope.radio4 = data.prod_par;
					$scope.radio5 = data.cont_res;
					$scope.radio6 = data.cont_amb;
					$scope.puntuacion = data.puntuacion;
					
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		
		$scope.evalua = function(){
			cont = 0;
			if($scope.f_eval){
				cont += 2;	
			}
			if($scope.vinc_s_r){
				cont += 10;
			}
			if($scope.alc_cert){
				cont += 10;
			}
			if($scope.no_conf){
				cont += 10;
			}
			if($scope.radio1){
				cont += 8;
			}
			if($scope.radio2){
				cont += 8;
			}
			if($scope.radio3){
				cont += 8;
			}
			if($scope.radio4){
				cont += 8;
			}
			if($scope.radio5){
				cont += 8;
			}
			if($scope.radio6){
				cont += 8;
			}
			if($scope.radio7){
				cont += 8;
			}
			if($scope.radio8){
				cont += 8;
			}
			if($scope.Volumen){
				cont += 4
			}
			
			document.getElementById("textProgreso").style.width = cont+"%";
			document.getElementById("textProgreso").innerHTML = cont+"%";
			
			if(cont == 100){
				
				
				$scope.puntuacion = parseInt($scope.radio1)+parseInt($scope.radio2)+
				parseInt($scope.radio3)+parseInt($scope.radio4)+parseInt($scope.radio5)+parseInt($scope.radio6)
				+parseInt($scope.radio7)+parseInt($scope.radio8);
				if($scope.puntuacion < 10){
					document.getElementById("score").className="alert alert-success";
				}else if($scope.puntuacion < 20){
					document.getElementById("score").className="alert alert-warning";
				}else{
					document.getElementById("score").className="alert alert-danger";
				}
				document.getElementById("myBtn").disabled = false;
			}else{
				document.getElementById("myBtn").disabled = true;
			}
		};
		
		$scope.editaContacto = function(contactoid){
			$scope.modificaContacto = true;	
			conid = contactoid;
			$http.get('/api/contacto/'+conid).
				success(function(data){
					$log.log(data);
					$scope.contacto = {nif: data.nif,nombre: data.Nombre,apellido1: data.Apellido1,apellido2: data.Apellido2,gen: data.Genero ,
					tel1: data.Telefono1,tel2:data.Telefono2,fax: data.Fax,email:data.Email, domicilio:data.Domicilio,cp:data.CP};
					$scope.provincia = data.prov;
					$scope.municipio = data.mun;
					$scope.provinciaSeleccionada = data.Provincia;
					$scope.municipioSeleccionado = data.Municipio;
					provi = data.Provincia;
					muni = data.Municipio;
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		
		$scope.agregaOperador = function(nif,nombre,ap1,ap2,gen,tel1,tel2,fax,email,prov,mun,domi,cp,expedienteId){
			
			cont = {nif: nif, Nombre: nombre,Apellido1: ap1, Apellido2: ap2, Genero: gen,
			Telefono1: tel1, Telefono2: tel2, Fax: fax, Email: email,Provincia: prov, Municipio: mun,
			Domicilio: domi,CP: cp,id_operador: expedienteId};
			$http.post('/api/contacto/',cont).
			success(function(data,status,headers,config){
				var contactos = $scope.contactos;
				contactos.push(data);
				$scope.contactos = contactos;
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
			
			
		};
		
		$scope.guardarContacto = function(idOperador){		
			cont = {nif: $scope.contacto.nif, Nombre: $scope.contacto.nombre,
			Apellido1: $scope.contacto.apellido1, Apellido2: $scope.contacto.apellido2, Genero: $scope.contacto.gen,
			Telefono1: $scope.contacto.tel1, Telefono2: $scope.contacto.tel2, Fax: $scope.contacto.fax, Email: $scope.contacto.email,
			Provincia: $scope.provinciaSeleccionada, Municipio: $scope.municipioSeleccionado,Domicilio: $scope.contacto.domicilio,CP: $scope.contacto.cp,
			id_operador: idOperador};
			$http.post('/api/contacto/',cont).
			success(function(data,status,headers,config){
				var contactos = $scope.contactos;
				contactos.push(data);
				$scope.contactos = contactos;
				$scope.siguiente2 = true;
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
			
			
		};
		$scope.cancelarCont = function(){
			$scope.modificaContacto = false;
			$scope.modificaContacto2 = false;			
		};
		
		$scope.modificaContact2 = function(idExp){
			prov = $scope.provinciaSeleccionada;
			mun =  $scope.municipioSeleccionado;
			$log.log(prov);
			
			idContacto = conid;
			
			cont = {nif: $scope.contacto.nif, Nombre: $scope.contacto.nombre,
			Apellido1: $scope.contacto.apellido1, Apellido2: $scope.contacto.apellido2, Genero: $scope.contacto.gen,
			Telefono1: $scope.contacto.tel1, Telefono2: $scope.contacto.tel2, Fax: $scope.contacto.fax, Email: $scope.contacto.email,
			Provincia: prov, Municipio: mun,Domicilio: $scope.contacto.domicilio,CP: $scope.contacto.cp,
			id_operador: idExp};
			$http.put('/api/contacto/'+idContacto,cont).
			success(function(data,status,headers,config){
				contactos = $scope.contactos;
				
				var index = 0;
				for (i=0; i<contactos.length; i++){
					if(contactos[i].id == idContacto){
						index = i;
					}
				}
				contactos.splice(index,1);
				contactos.push(data);
				$scope.contactos = contactos;
				
				//document.getElementById("formularioContacto").reset();
				$scope.modificaContacto = false;
				$scope.modificaContacto2 = false;
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
		};
		
		$scope.eliminarContacto = function(contactoid){
			$log.log(contactoid);
			var x;
			if (confirm("¿Desea eliminar este contacto?") == true) {
				$http.delete('/api/contacto/'+contactoid).
				success(function(data,status,headers,config){
					var contactos = $scope.contactos;
					var index = 0;
					for (i=0; i<contactos.length; i++){
						if(contactos[i].id == contactoid){
							index = i;
						}
					}
					contactos.splice(index,1);
					$scope.contactos = contactos;
					if(contactos.length == 0){
						$scope.siguiente2 = false;
					}
				}).
				error(function(data,status,headers,config){
					$log.log("Error")
				});
			} 
			
    
			
		};
		$scope.limpiarContacto = function(){
			document.getElementById("formularioContacto").reset();
		};
		
		$scope.creaFactura = function(idExp){
			fact = document.getElementById("fact").value;
			importe = document.getElementById("importe").value;
			concept = document.getElementById("concepto").value;
			$http.post('/api/Facturacion/',{expediente: idExp,f_fact: fact,concepto: concept,importe: importe }).
			success(function(data1,status,headers,config){
				facturas = $scope.facturas;
				facturas.push(data1);
				$scope.facturas = facturas;
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
		};
		
		$scope.eliminarParcela2 = function(parcelaid,tipo){
			var x;
			
				if(tipo == 'AE'){
				if (confirm("¿Desea eliminar esta parcela?") == true) {
				$http.delete('/api/Parcela/'+parcelaid).
				success(function(data,status,headers,config){
					$log.log("Eliminado")
					var index = 0;
					for (i=0; i<parcelas.length; i++){
						if(parcelas[i].id == parcelaid){
							index = i;
							if(parcelas[i].ag_eco == "SI"){
								superficie1 -= parseFloat(parcelas[i].superficie_hectareas);
								$scope.superficie1 = superficie1.toFixed(4);
								if(superficie1 == 0){
									$scope.siguiente4 = true;
								}
							}else if (parcelas[i].ag_eco == "NO"){
								superficie2 -= parseFloat(parcelas[i].superficie_hectareas);
								$scope.superficie2 = superficie2.toFixed(4);
								if(superficie2 == 0){
									$scope.siguiente5 = true;
								}
							}
						}
					}
					parcelas.splice(index,1);
					$scope.parcelas = parcelas;
					$http.delete('/api/RecolectorParcelas/'+idRecolector);

				}).
				error(function(data,status,headers,config){
					$log.log("Error")
				});
				}}else if(tipo == 'GA'){
					if (confirm("¿Desea eliminar esta parcela?") == true) {
					$http.delete('/api/Ganado/'+parcelaid).
				success(function(data,status,headers,config){
					$log.log("Eliminado")
					var index = 0;
					for (i=0; i<parcelas.length; i++){
						if(parcelas[i].id == parcelaid){
							index = i;
							if(parcelas[i].ag_eco == "SI"){
								superficie1 -= parseFloat(parcelas[i].superficie_hectareas);
								$scope.superficie1 = superficie1.toFixed(4);
								if(superficie1 == 0){
									$scope.siguiente4 = true;
								}
							}else if (parcelas[i].ag_eco == "NO"){
								superficie2 -= parseFloat(parcelas[i].superficie_hectareas);
								$scope.superficie2 = superficie2.toFixed(4);
								if(superficie2 == 0){
									$scope.siguiente5 = true;
								}
							}
						}
					}
					parcelas.splice(index,1);
					$scope.parcelas = parcelas;
					$http.delete('/api/RecolectorParcelas/'+idRecolector);

				}).
				error(function(data,status,headers,config){
					$log.log("Error")
				});
				}}else if(tipo == 'IN'){
				if (confirm("¿Desea eliminar este producto?") == true) {
					$http.delete('/api/Industria/'+parcelaid).
				success(function(data,status,headers,config){
					$log.log("Eliminado")
					var index = 0;
					for (i=0; i<parcelas.length; i++){
						if(parcelas[i].id == parcelaid){
							index = i;
							if(parcelas[i].ag_eco == "SI"){
								hay1 -= 1;
								if(hay1 == 0){
									$scope.siguiente4 = true;
								}
							}else if (parcelas[i].ag_eco == "NO"){
								hay2 -= 1;
								if(hay2 == 0){
									$scope.siguiente5 = true;
								}
							}
						}
					}
					parcelas.splice(index,1);
					$scope.parcelas = parcelas;
					$http.delete('/api/RecolectorParcelas/'+idRecolector);

				}).
				error(function(data,status,headers,config){
					$log.log("Error")
				});
			} }
		};
		
		$scope.guardarParcela1 = function(fins,expId,tipoAg){
			
			finscrip = fins;
			fae = document.getElementById("fae").value;
			if($scope.parcela.eco=="SI"){
				
				fcont = document.getElementById("fcontrol").value;
			}
			
			day3 = $scope.parcela.fcalif.getDate();
			if(day3.toString().length < 2){
				day3 = "0"+day3.toString();
			}
			fcal = $scope.parcela.fcalif.toJSON().substring(0,8)+day3;
			
			if(tipoAg == 'GA' || tipoAg == 'AE'){
			poli = $scope.parcela.poligono;
			parce = $scope.parcela.parcela;
			recin = $scope.parcela.recinto;
			
			while(String(poli).length < 3){
				poli = "0"+poli;
			}
			while(String(parce).length < 5){
				parce = "0"+parce;
			}
			while(String(recin).length < 5){
				recin = "0"+recin;
			}
			superf = document.getElementById("superficie").value;
			}
			if(tipoAg == 'GA'){
				$http.get('/api/ProductoGanaderia').success(function(dato){
					for(i=0;i<dato.length; i++){
						actgen = document.getElementById("ActGen2").value;
						if(dato[i].Actividad == actgen){
							product = document.getElementById("productoGan").value;
							if(dato[i].CodProducto == product){
								producto = dato[i].id;
								codExplotREGA = document.getElementById("codigoExplotacion").value;
								muni = document.getElementById("munSeleccionado").value;
								provi = document.getElementById("provSeleccionada").value;
								produccion = document.getElementById("Produccion").value;
								sr = document.getElementById("sr").value;
								gcult = document.getElementById("grupoCultivo").value;
								tipoC = document.getElementById("tipoAcuicola").value;
								if($scope.parcela.eco=="SI"){
									parcela = {provincia: provi, municipio: muni, poligono: poli,
									parcela: parce, recinto: recin,superficie_hectareas: superf,prod_ag: producto,
									sr: sr,f_ag_ec_rec: fae,f_control: fcont, Estado: $scope.parcela.estado,F_baja_rec:fcal,
									F_calificacion: fcal,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac,F_altaProducto: fae,
									F_bajaProducto: fcal,expedienteGanado: expId,ag_eco: $scope.parcela.eco,codExplotREGA: codExplotREGA,grupoCultivo: gcult,
									raza: $scope.Raza,animales: $scope.animales, regApicola: $scope.regApicola, regAcuicola: $scope.regAcuicola,
									tipoAcuicola: tipoC,utmX: $scope.utmX,utmY: $scope.utmY,produccion: produccion,
									F_altaProducto: finscrip,F_bajaProducto: fcal,productoCambiado : "NO"};
								}else if($scope.parcela.eco=="NO"){
									parcela = {provincia: provi, municipio: muni, poligono: poli,
									parcela: parce, recinto: recin,superficie_hectareas: superf,prod_ag: producto,
									sr: 'S',f_ag_ec_rec: fcal,f_control: fcal, Estado: "BAJA",F_baja_rec:fcal,
									F_calificacion: fcal,Calificacion: "1",declar_pac: "NO",F_altaProducto: finscrip,
									F_bajaProducto: fcal,expedienteGanado: expId,ag_eco: $scope.parcela.eco,codExplotREGA: codExplotREGA,grupoCultivo: gcult,
									raza: $scope.Raza,animales: $scope.animales, regApicola: $scope.regApicola, regAcuicola: $scope.regAcuicola,
									tipoAcuicola: tipoC,utmX: $scope.utmX,utmY: $scope.utmY,produccion: produccion,
									F_altaProducto: fcal,F_bajaProducto: fcal,productoCambiado : "NO"};
								}
								$http.post('/api/Ganado/',parcela).
								success(function(data,status,headers,config){
								
									$http.get('/api/Ganado/'+data.id).success(function(dato){	
										if(dato.ag_eco == "SI"){
											superficie1 += parseFloat(dato.superficie_hectareas);
											$scope.superficie1 = superficie1.toFixed(4);
											$scope.siguiente4 = false;
										}else if(dato.ag_eco == "NO"){
											superficie2 += parseFloat(dato.superficie_hectareas);
											$scope.superficie2 = superficie2.toFixed(4);
											$scope.siguiente5 = false;
										}
										parcelas.push(dato);
										$scope.parcelas = parcelas;
										$http.post('/api/RecolectorParcelas/',{nParcelas: 1,tipoParcela: 'GA'}).
											success(function(data,status,headers,config){
												idRecolector = data.id;
											});
									});
									document.getElementById("formularioParcela").poli.value = "";
									document.getElementById("formularioParcela").parce.value = "";
									document.getElementById("formularioParcela").recin.value = "";
									document.getElementById("formularioParcela").superficie.value = "";

									if (data.ag_eco == "NO"){
										document.getElementById("eco").value = "NO";
									}

								}).
								error(function(data,status,headers,config){
									$log.log(data);
								});
							break;
							}
						}
					}
				});
			}else if (tipoAg == 'AE'){
			
			vari = String($scope.vari);
			vari2 = $scope.vari;
			
			if (vari == "" || vari =="undefined"){
				vari = "818";
			}
			
			var cultivo ="";
			$http.get('/api/ProductoAgricola').success(function(dato){
				
				for(i=0;i<dato.length; i++){
					activ = document.getElementById("ActGen").value;
					if(dato[i].Actividad == activ){
						cultiv = document.getElementById("cultivo").value;
						if(dato[i].CodCultivo == cultiv){
							
							cultivo = dato[i].id;
							provi = document.getElementById("provSeleccionada").value;
							muni = document.getElementById("munSeleccionado").value;
							sr = document.getElementById("sr").value
							if($scope.parcela.eco=="SI"){
								parcela = {provincia: provi, municipio: muni, poligono: poli,
								parcela: parce, recinto: recin,superficie_hectareas: superf,prod_ag: cultivo,
								variedad: vari,sr: sr,f_ag_ec_rec: fae,f_control: fcont, Estado: $scope.parcela.estado,F_baja_rec:fcal,
								F_calificacion: fcal,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac, cosecha_anual: $scope.parcela.cosecha,F_altaProducto: fae,
								F_bajaProducto: fcal,expediente: expId,ag_eco: $scope.parcela.eco,productoCambiado : "NO"};
							}else if($scope.parcela.eco=="NO"){
								parcela = {provincia: provi, municipio: muni, poligono: poli,
								parcela: parce, recinto: recin,superficie_hectareas: superf,prod_ag: cultivo,
								variedad: vari,sr: sr,f_ag_ec_rec: fcal,f_control: fcal, Estado: "BAJA",F_baja_rec:fcal,
								F_calificacion: fcal,Calificacion: "1",declar_pac: "NO", cosecha_anual: 0,F_altaProducto: fcal,
								F_bajaProducto: fcal,expediente: expId ,ag_eco: $scope.parcela.eco,productoCambiado : "NO"};
							}
							
							$http.post('/api/Parcela/',parcela).
								success(function(data,status,headers,config){
								
									$http.get('/api/Parcela/'+data.id).success(function(dato){	
										if(dato.ag_eco == "SI"){
											superficie1 += parseFloat(dato.superficie_hectareas);
											$scope.superficie1 = superficie1.toFixed(4);
											$scope.siguiente4 = false;
										}else if(dato.ag_eco == "NO"){
											superficie2 += parseFloat(dato.superficie_hectareas);
											$scope.superficie2 = superficie2.toFixed(4);
											$scope.siguiente5 = false;
										}
										parcelas.push(dato);
										$scope.parcelas = parcelas;
										$http.post('/api/RecolectorParcelas/',{nParcelas: 1}).
											success(function(data,status,headers,config){
												idRecolector = data.id;
											});
									});
									document.getElementById("formularioParcela").poli.value = "";
									document.getElementById("formularioParcela").parce.value = "";
									document.getElementById("formularioParcela").recin.value = "";
									document.getElementById("formularioParcela").superficie.value = "";
									document.getElementById("formularioParcela").cosecha.value = "0";


									if (data.ag_eco == "NO"){
										document.getElementById("eco").value = "NO";
									}

								}).
								error(function(data,status,headers,config){
									$log.log(data);
								});
							break;
						}
					}
				}
			});}else if (tipoAg == 'IN'){
			
			var producto ="";
			
			matricula = $scope.matRIA;
				var tproc = "";
				if($scope.RIA == 'NO'){
					matricula = 'NO PROCEDE';
				}
				sanit = $scope.regSan;
				if($scope.RIA == 'NO'){
					sanit = 'NO PROCEDE';
				}
				if($scope.Elaboracion){
					tproc = tproc+'E';
				}
				if($scope.Envasado){
					tproc = tproc+'X';
				}
				if($scope.Comercializacion){
					tproc = tproc+'C';
				}
				if($scope.Importacion){
					tproc = tproc+'I';
				}
				if($scope.Exportacion){
					tproc = tproc+'P';
				}

				f_ae_prod = document.getElementById("f_ins_ae").value;
				
				t_emb="";
				var tam = $scope.tamanyos;
				for(i=0;i<tam.length;i++){
					t_emb = t_emb+tam[i].cantidad+" "+tam[i].medidaId;
					if(i != tam.length-1){
						if(tam.length>1){
							t_emb=t_emb+",";
						}
					}
				}
				marc = "";
				var marcas = $scope.marcas;
				for(i=0;i<marcas.length;i++){
					marc = marc+marcas[i].marca;
					if(i != marcas.length-1){
						if(marcas.length>1){
							marc=marc+",";
						}
					}
				}
			
			$http.get('/api/ProductoIndustria').success(function(dato){
				for(i=0;i<dato.length; i++){
						if(dato[i].Producto == $scope.ActGen){
							if(dato[i].CodActividad == $scope.prodtIndustria){
								producto = dato[i].id;
								if($scope.parcela.eco=="SI"){
									parcela = {inscrito: $scope.RIA,matriculaRIA: matricula,provincia: $scope.provSelecionada, municipio: $scope.munSeleccionado,
									Domicilio: $scope.domicilio,CP: $scope.CP, producto: producto,utmX: $scope.UtmX,utmY: $scope.UtmY,regSanit: sanit,
									regEmbotella: $scope.regEmb, f_control: fcont, Estado: $scope.parcela.estado,F_baja:fcal,
									expediente: expId, ag_eco: $scope.parcela.eco, tipProc: tproc,
									tipoCom: $scope.tipoCom,F_altaProducto: fae, F_bajaProducto: fcal,productoCambiado : "NO",
									desc_product: $scope.descripcion, f_ag_eco_prod: f_ae_prod, 
									capacidad: $scope.c_prod, form_pres: $scope.for_pres, tam_emb: t_emb,
									marcas_referencia: marc, valor_produccion: $scope.v_comer,declar_pac: $scope.parcela.dpac};
								}else if($scope.parcela.eco=="NO"){
									parcela = {inscrito: $scope.RIA,matriculaRIA: matricula,provincia: $scope.provSelecionada, municipio: $scope.munSeleccionado,
									Domicilio: $scope.domicilio,CP: $scope.CP, producto:producto,utmX: $scope.UtmX,utmY: $scope.UtmY,regSanit: sanit,
									regEmbotella: $scope.regSan, f_control: fcal, Estado: "ALTA",F_baja:fcal,
									expediente: expId, ag_eco: $scope.parcela.eco, tipProc: tproc,
									tipoCom: $scope.tipoCom,F_altaProducto: finscrip, F_bajaProducto: fcal,productoCambiado : "NO",
									desc_product: $scope.descripcion, f_ag_eco_prod: finscrip, 
									capacidad: $scope.c_prod, form_pres: $scope.for_pres, tam_emb: t_emb,
									marcas_referencia: marc, valor_produccion: $scope.v_comer,declar_pac: "NO"};
								}
								
								$http.post('/api/Industria/',parcela).
								success(function(data,status,headers,config){
								
									$http.get('/api/Industria/'+data.id).success(function(dato){	
										if(dato.ag_eco == "SI"){
											$scope.siguiente4 = false;
											hay1 += 1;
										}else if(dato.ag_eco == "NO"){
											$scope.siguiente5 = false;
											hay2 += 1;
										}
										parcelas.push(dato);
										$scope.parcelas = parcelas;
										$http.post('/api/RecolectorParcelas/',{nParcelas: 1,tipoParcela: 'IN'}).
											success(function(data,status,headers,config){
												idRecolector = data.id;
											});
									});

									if (data.ag_eco == "NO"){
										document.getElementById("eco").value = "NO";
									}

								}).
								error(function(data,status,headers,config){
									$log.log(data);
								});
							break;
							}
						}
					}
			});}
				
		};
		
		$scope.pres = function(form_pres){
			var res = "";
			if(form_pres == 1){
				res = 'A granel';
			}else if(form_pres == 2){
				res = 'Envasado cerrado';
			}else{
				res = 'Otros';
			}
			return res;
		};
		
		$scope.modificar = function(){
			$scope.nomodifica = false;
		};
		$scope.cancelarExp = function(){
			$scope.nomodifica = true;
		};
		
		$scope.guardar = function(exp){
				estad = document.getElementById("estado").value;
				activid = document.getElementById("actividad").value;
				var dbaja = document.getElementById("fbaja").value;
				var dfc = document.getElementById("fcact").value;
				f_ini = "";
				f_fin = "";
				as_ag1 = document.getElementById("asag1").checked;
				if(as_ag1){
					as_ag = 'SI';
				}else{
					as_ag = 'NO';
				}
				asoc = document.getElementById("asoc").value;
				coop1 = document.getElementById("coop1").checked;
				if(coop1){
					coop = 'SI';
				}else{
					coop = 'NO';
				}
				cooperativa = document.getElementById("cooperativa").value;
				pc1 = document.getElementById("pc1").value;
				ind1= document.getElementById("ind1").checked;
				if(ind1){
					ind = 'SI';
				}else{
					ind = 'NO';
				}
				industria = document.getElementById("industria").value;
				pc2 = document.getElementById("pc2").value;
				PAC = document.getElementById("PAC").value;
				pc3 = document.getElementById("pc3").value;
				respons = document.getElementById("responsable").value;
				$http.get('/api/expedientes/'+exp).
					success(function(data){
						codExp = $scope.codExp;
						data.idDocumento = $scope.idDoc;
						data.responsable = respons;
						data.CodOperador = codExp;
						data.CodSipea = $scope.codSipea;
						data.F_baja = dbaja;
						data.F_cese_activ = dfc;
						data.F_juridica = $scope.fj;
						data.Fecha_recepcion = document.getElementById("frecp").value;
						data.Fecha_aecologica = document.getElementById("fins").value;
						data.Estado = estad;
						data.con_actividad = activid;
						data.aso_ag = as_ag;
						data.asociacion_agraria = asoc;
						data.s_cop = coop;
						data.cooperativa = cooperativa;
						data.info_contac1 = pc1;
						data.com_ind = ind;
						data.industria = industria;
						data.info_contac2 = pc2;
						data.entidadPac = PAC;
						data.info_contac3 = pc3;
						data.indProdParalela = $scope.pp;
						data.anyo = parseInt(codExp.substring(10,13))
						
						$http.put('/api/expedientes/'+exp,data).
						success(function(data,status,headers,config){
							location.reload();
						}).
						error(function(data,status,headers,config){
							$log.log(data);
						});	
					}).
					error(function(data,status,headers,config){
						$log.log("Error");
					});
			
		};
		
		$scope.generoExp = function(data){
		
			if(data=="H"){
				return "Hombre";
			}else if(data=="M"){
				return "Mujer";
			}else{
				return "No procede";
			}
		};
		$scope.tipoID = function(data){
		
			if(isNaN(data.charAt(data.length-1)))
			{
				return "NIF";
			}else if (isNaN(data.charAt(0))){
				return "CIF";
			}
		};
		
		$scope.interlocutores = [];
		$scope.inter = {nif: '',nombre: '',tel1: '',tel2:'',email:''};
		
		
		$scope.guardarInterloc3 = function(expid){
		
			var at_vis = 'NO';
			var fir_vis = 'NO';
			if (document.getElementById("atvis").checked){
				at_vis = 'SI';
			}
			if(document.getElementById("firvis").checked){
				fir_vis = 'SI';
			}
			
			inter = {nif: $scope.inter.nif, Nombre: $scope.inter.nombre,
			TelefonoFijo: $scope.inter.tel1, TelefonoMovil: $scope.inter.tel2,Email: $scope.inter.email,
			AtiendeVisita: at_vis, FirmaVisita: fir_vis,
			idExpediente: expid};
			$http.post('/api/interlocutor/',inter).
			success(function(data,status,headers,config){
				var interlocutores = $scope.interlocutores;
				interlocutores.push(data);
				$scope.interlocutores = interlocutores;
				$scope.siguiente3 = true;
				$log.log("Creado");
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
			
		};
		
		$scope.guardarInterloc4 = function(idExp){
			contint = document.getElementById("contactoInterlocutor").value;
			firv = "NO";
			atv = "NO";
			if (document.getElementById("firvis2").checked){
				firv = "SI";
			}
			$log.log(firv);
			if (document.getElementById("atvis2").checked){
				atv = "SI";
			}
			$http.get('/api/contacto/'+contint).
				success(function(data){
					inter = {nif: data.nif, Nombre: data.Nombre,
			TelefonoFijo: data.Telefono2, TelefonoMovil: data.Telefono1,Email: data.Email,
			AtiendeVisita: atv, FirmaVisita: firv,
			idExpediente: idExp};
			$http.post('/api/interlocutor/',inter).
			success(function(data,status,headers,config){
				var interlocutores = $scope.interlocutores;
				interlocutores.push(data);
				$scope.interlocutores = interlocutores
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
			
		};
		
		$scope.hayContacto = function(contactos){
			if(contactos> 0){
				return true;
			}
			return false;
		}
		
		$scope.eliminarInterlocutor = function(interlocutorid){
			var x;
			if (confirm("¿Desea eliminar este interlocutor?") == true) {
				$http.delete('/api/interlocutor/'+interlocutorid).
				success(function(data,status,headers,config){
					$log.log("Eliminado")
					var index = 0;
					var interlocutores = $scope.interlocutores;
					for (i=0; i<interlocutores.length; i++){
						if(interlocutores[i].id == interlocutorid){
							index = i;
						}
					}
					interlocutores.splice(index,1);
					$scope.interlocutores = interlocutores;
					if(interlocutores.length == 0){
						$scope.siguiente3 = true;
					}
				}).
				error(function(data,status,headers,config){
					$log.log("Error")
				});
			} 
			
    
			
		};
		
		$scope.editaInterlocutor = function(interid){
			$scope.modificaInterlocutor = true;	
			conid = interid;
			$http.get('/api/interlocutor/'+conid).
				success(function(data){
					$scope.inter = {nif: data.nif,nombre: data.Nombre,tel1: data.TelefonoFijo,tel2:data.TelefonoMovil,email:data.Email};
					$scope.atvis = data.AtiendeVisita;
					$scope.firvis = data.FirmaVisita;
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		
		$scope.cancelar = function(){
			$scope.modificaInterlocutor = false;	
		};
		
		$scope.modificaInterlocut = function(idExp){
		
			atvis = document.getElementById("atvis").checked;
				if(atvis){
					atvis = 'SI';
				}else{
					atvis = 'NO';
				}
			firvis = document.getElementById("firvis").checked;
				if(firvis){
					firvis = 'SI';
				}else{
					firvis = 'NO';
				}
			idInterlocutor = conid;
			inter = {nif: $scope.inter.nif, Nombre: $scope.inter.nombre,
			TelefonoFijo: $scope.inter.tel1, TelefonoMovil: $scope.inter.tel2,Email: $scope.inter.email,
			AtiendeVisita: atvis, FirmaVisita: firvis,
			idExpediente: idExp};
			$http.put('/api/interlocutor/'+idInterlocutor,inter).
			success(function(data,status,headers,config){
				var interlocutores = $scope.interlocutores;
				
				var index = 0;
				for (i=0; i<interlocutores.length; i++){
					if(interlocutores[i].id == idInterlocutor){
						index = i;
					}
				}
				interlocutores.splice(index,1);
				interlocutores.push(data);
				$scope.interlocutores = interlocutores;
				
				$scope.modificaInterlocutor = false;

			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
		};
		
		$scope.cambiaPanel = function(id){
			if ($scope.idPanel == 'Vis'){
				document.getElementById($scope.idPanel).className = "list-group-item list-group-item-success"
			}else{
				document.getElementById($scope.idPanel).className = "list-group-item"
			}
			if (id == 'Vis'){
				document.getElementById(id).className = "list-group-item list-group-item-success active"
			}else{
				document.getElementById(id).className = "list-group-item active"
			}
			$scope.idPanel = id;
			
		};

		$scope.cambiaAuditoria = function(idAudit){
			var puede = false;
			cont = 10;
			contador = 0;
			$scope.certificado = false;
			$http.get('/api/Auditoria/'+$scope.selectAudi).
				success(function(data){
					if(idAudit){
						if(data.inspector == idAudit){
							puede = true;
						}else{
							puede = false;
						}
					}else{
						puede = true;
					}
					if(puede){
						document.getElementById("incumpButton").disabled=false;
						$scope.mensaje ="";
					if(data.solicita_PAC == 'SI'){
						$scope.solPAC = true;
					}else{
						$scope.solPAC = false;
						cont += 40
						$scope.PAC = "No precisa PAC";
						$scope.precisa = "NO PRECISA DE ACCIONES CORRECTIVAS"
						$scope.descripcionPAC = data.descripcion;
					}
					if(data.vigente == 'SI'){
						if(data.completada == 'SI'){
							$scope.fechaInicio = new Date(data.f_inivig);
							$scope.fechaFin = new Date(data.f_finvig);
							vigente = 'SI';
							$scope.modificaCertificado = true;
						}else{
							$scope.modificaCertificado = false;
						}
					}else{
						$scope.fechaInicio = "";
						$scope.fechaFin = "";
						$scope.vigent = 'NO';
						vigente = 'NO';
						$scope.modificaCertificado = false;
					}
					$scope.incumplimientos = data.incumplimientos;
					if(data.incumplimientos.length > 0){
						contador = parseInt(data.incumplimientos[data.incumplimientos.length-1].ref);
					}
					$scope.auditor = data.nombreIns+" "+data.apellido1Ins+" "+data.apellido2Ins;
					$scope.cumplimentado = '';
					
					if (data.accionesCorrectivas.length > 0){
						cont += 40;
						
						if(data.accionesCorrectivas[0].preg1 == 'SI' && data.accionesCorrectivas[0].preg2 == 'SI'
						&& data.accionesCorrectivas[0].preg3 == 'SI' && data.accionesCorrectivas[0].preg4 == 'SI'){
							$scope.cumplimentado = 'SI';
						}else{
							$scope.cumplimentado = 'NO';
						}
						$scope.muestraAcciones = true;
						$scope.fPAC = new Date(data.accionesCorrectivas[0].f_pac)
						
						if(data.accionesCorrectivas[0].f_ampac){
							$scope.fAMPAC = new Date(data.accionesCorrectivas[0].f_ampac)
							$scope.ampac = "AMPAC"
						}else{
							$scope.fAMPAC = "";
							$scope.ampac = "";
						}
						$scope.preg1 = data.accionesCorrectivas[0].preg1;
						$scope.preg2 = data.accionesCorrectivas[0].preg2;
						$scope.preg3 = data.accionesCorrectivas[0].preg3;
						$scope.preg4 = data.accionesCorrectivas[0].preg4;
						$scope.descp1 = data.accionesCorrectivas[0].espreg1;
						$scope.descp2 = data.accionesCorrectivas[0].espreg2;
						$scope.descp3 = data.accionesCorrectivas[0].espreg3;
						$scope.descp4 = data.accionesCorrectivas[0].espreg4;
					}else{
						$scope.muestraAcciones = false;
						$scope.fPAC = "";
						$scope.fAMPAC = "";
						$scope.preg1 = "";
						$scope.preg2 = "";
						$scope.preg3 = "";
						$scope.preg4 = "";
						$scope.descp1 = "";
						$scope.descp2 = "";
						$scope.descp3 = "";
						$scope.descp4 = "";
					}
					if (data.evaluacion.length > 0){
						$scope.resultado = data.evaluacion[0].eval;
						if(data.evaluacion[0].eval == 'S'){
							cont += 50;
						}else{
							cont += 40;
						}
						$scope.fEV = new Date(data.evaluacion[0].f_eval);
						$scope.muestraEvaluacion = true;
						$scope.inspector2 = data.evaluacion[0].evaluador;
					}else{
						$scope.resultado = "";
						$scope.fEV = "";
						$scope.muestraEvaluacion = false;
						$scope.inspector2 = ""
					}
					document.getElementById("textProgreso2").style.width = cont+"%";
					document.getElementById("textProgreso2").innerHTML = cont+"%";
					if(cont == 10){
						document.getElementById("textProgreso2").className = "progress-bar progress-bar-danger progress-bar-striped";
					}else if(cont == 50){
						document.getElementById("textProgreso2").className = "progress-bar progress-bar-warning progress-bar-striped";
					}else if(cont == 90){
						document.getElementById("textProgreso2").className = "progress-bar progress-bar-info progress-bar-striped";
					}else if(cont == 100){
						$scope.certificado = true;
						document.getElementById("textProgreso2").className = "progress-bar progress-bar-success progress-bar-striped";
					}
					
					vigent = document.getElementById("vigente").value;
					
					$log.log(vigent);
					if (cont == 100 && vigent == 'SI'){
						if($scope.fechaInicio && $scope.fechaFin){
							document.getElementById("botoncertificar").disabled = false;
						}else{
							document.getElementById("botoncertificar").disabled = true;
						}
					}else{
						document.getElementById("botoncertificar").disabled = true;
					}
					}else{
						$scope.mensaje = "Esta auditoría está planificada por otra persona";
						document.getElementById("incumpButton").disabled=true;
					}
					$scope.fechaAudi = new Date(data.f_Auditoria);
					$scope.nombreAuditor = data.nombreIns+" "+data.apellido1Ins+" "+data.apellido2Ins
					
					if(data.Informes.length > 0){
						$scope.n_inf = parseInt(data.Informes[data.Informes.length-1].num_informe)+1;
						$scope.reglamento = data.Informes[data.Informes.length-1].reglamento;
					}else{
						$scope.n_inf  = 1;
						$scope.reglamento = "- Reglamento (CE) Nº 834/2007 del Consejo sobre producción y etiquetado de productos ecológicos y por el que se deroga el Reglamento (CEE) nº 2092.\n- Reglamento (CE) Nº 889/2008 de la Comisión por el que se establecen las disposiciones de aplicación del Reglamento (CE) nº 834/2007 del Consejo sobre producción ecológica, con respecto a la producción ecológica, su etiquetado y su control.\n- Instrucciones de la Secretaría general del Medio Rural y la Producción Ecológica."
					}
					
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		
		$scope.anadeFecha = function(){
			listaFechas = $scope.fechasAuditoria;
			id = 1;
			if (listaFechas.length > 0){
				id = listaFechas[listaFechas.length-1].id + 1;
			}
			fech = $scope.faudi;
			listaFechas.push({fecha: fech, id: id});
			$scope.fechasAuditoria = listaFechas;
			$scope.faudi = "";
		};
		$scope.eliminaFA = function(fid){
			listaFechas = $scope.fechasAuditoria;
			var index;
			for (i=0; i<listaFechas.length; i++){
				if(listaFechas[i].id == fid){
					index = i;
				}
			}
				listaFechas.splice(index,1);
			$scope.fechasAuditoria = listaFechas;
		};
		$scope.anadeAuditor = function(){
			listaAuditores = $scope.auditoresExtra;
			id = 1;
			if (listaAuditores.length > 0){
				id = listaAuditores[listaAuditores.length-1].id + 1;
			}
			listaAuditores.push({audit: $scope.Nuevoauditor, id: id});
			$scope.auditoresExtra = listaAuditores;
			$scope.Nuevoauditor = "";
		};
		$scope.eliminAD = function(aid){
			listaAuditores = $scope.auditoresExtra;
			var index;
			for (i=0; i<listaAuditores.length; i++){
				if(listaAuditores[i].id == aid){
					index = i;
				}
			}
			listaAuditores.splice(index,1);
			$scope.auditoresExtra = listaAuditores;
		};
		$scope.anadeObservador = function(){
			listaObservadores = $scope.observadores;
			id = 1;
			if (listaObservadores.length > 0){
				id = listaObservadores[listaObservadores.length-1].id + 1;
			}
			listaObservadores.push({observ: $scope.Nuevobservador, id: id});
			$scope.observadores = listaObservadores;
			$scope.Nuevobservador = "";
		};
		$scope.eliminOB = function(oid){
			listaObservadores = $scope.observadores;
			var index;
			for (i=0; i<listaObservadores.length; i++){
				if(listaObservadores[i].id == oid){
					index = i;
				}
			}
			listaObservadores.splice(index,1);
			$scope.observadores = listaObservadores;
		};
		
		$scope.anadeExcusado = function(){
			listaExcusados = $scope.excusados;
			id = 1;
			if (listaExcusados.length > 0){
				id = listaExcusados[listaExcusados.length-1].id + 1;
			}
			listaExcusados.push({nombre: $scope.excusado, id: id});
			$scope.excusados = listaExcusados;
			$scope.excusado = "";
		};
		
		$scope.eliminEX = function(eid){
			listaExcusados = $scope.excusados;
			var index;
			for (i=0; i<listaExcusados.length; i++){
				if(listaExcusados[i].id == eid){
					index = i;
				}
			}
			listaExcusados.splice(index,1);
			$scope.excusados = listaExcusados;
		};
		
		$scope.modInforme = function(){
			fechasAud = $scope.fechasAuditoria;
			fechas = "";
			for(i=0;i<fechasAud.length;i++){
				dia = String(parseInt(fechasAud[i].fecha.toJSON().substring(8,10))+1);
				while (dia.length < 2){
					dia = "0"+dia;
				}
				fechas = fechas+fechasAud[i].fecha.toJSON().substring(0,8)+dia+" ";
			}
			auditores= $scope.auditoresExtra;
			auditors = "";
			for(i=0;i<auditores.length;i++){
				if (i==auditores.length-1){
					auditors = auditors + auditores[i].audit; 
				}else{
					auditors = auditors + auditores[i].audit+"/"; 
				}
				
			}
			observadores= $scope.observadores;
			observadr = "";
			for(i=0;i<observadores.length;i++){
				if (i==observadores.length-1){
					observadr = observadr + observadores[i].observ; 
				}else{
					observadr = observadr + observadores[i].observ+"/"; 
				}
			}
			excusados= $scope.excusados;
			excusads = "";
			for(i=0;i<excusados.length;i++){
				motivo = document.getElementById("motivo"+excusados[i].id).value;
				if (i==excusados.length-1){
					excusads = excusads + excusados[i].nombre+"/"+motivo; 
				}else{
					excusads = excusads + excusados[i].nombre+"/"+motivo+">"; 
				}
			}
			
			informe = {auditoria: $scope.selectAudi, num_informe: $scope.n_inf,fechas_auditoria: fechas,
			reglamento: $scope.reglamento, equipo_auditor: $scope.equipo, auditores: auditors,observadores: observadr,
			excusados: excusads,verificacion: $scope.verificacion,modificacion: $scope.modificacion};
			
			
			$http.put('/api/informeVisita/'+informeId,informe).
				success(function(data,status,headers,config){

					$('.collapse').collapse('hide')
			
					informes = $scope.informesVisita;
				
					var index = 0;
					for (i=0; i<informes.length; i++){
						if(informes[i].id == informeId){
							index = i;
						}
					}
				
					informes.splice(index,1);
					informes.push(data);
					$scope.informesVisita = informes;
				
					$scope.modificaInforme = false;

			});
			
		}


		$scope.creaInforme = function(){

			fechasAud = $scope.fechasAuditoria;
			fechas = "";
			for(i=0;i<fechasAud.length;i++){
				dia = String(parseInt(fechasAud[i].fecha.toJSON().substring(8,10))+1);
				while (dia.length < 2){
					dia = "0"+dia;
				}
				fechas = fechas+fechasAud[i].fecha.toJSON().substring(0,8)+dia+" ";
			}
			auditores= $scope.auditoresExtra;
			auditors = "";
			for(i=0;i<auditores.length;i++){
				if (i==auditores.length-1){
					auditors = auditors + auditores[i].audit; 
				}else{
					auditors = auditors + auditores[i].audit+"/"; 
				}
				
			}
			observadores= $scope.observadores;
			observadr = "";
			for(i=0;i<observadores.length;i++){
				if (i==observadores.length-1){
					observadr = observadr + observadores[i].observ; 
				}else{
					observadr = observadr + observadores[i].observ+"/"; 
				}
			}
			excusados= $scope.excusados;
			excusads = "";
			for(i=0;i<excusados.length;i++){
				motivo = document.getElementById("motivo"+excusados[i].id).value;
				if (i==excusados.length-1){
					excusads = excusads + excusados[i].nombre+"/"+motivo; 
				}else{
					excusads = excusads + excusados[i].nombre+"/"+motivo+">"; 
				}
			}
			
			informe = {auditoria: $scope.selectAudi, num_informe: $scope.n_inf,fechas_auditoria: fechas,
			reglamento: $scope.reglamento, equipo_auditor: $scope.equipo, auditores: auditors,observadores: observadr,
			excusados: excusads,verificacion: $scope.verificacion,modificacion: $scope.modificacion};
			
			
			$http.post('/api/informeVisita/',informe).
				success(function(data,status,headers,config){
					informes = $scope.informesVisita;
					informes.push(data);
					$scope.informesVisita = informes;
			});
		
		};

		$scope.eliminarInforme = function(id){
			if (confirm("¿Desea eliminar este informe de visita?") == true) {
					$http.delete('/api/informeVisita/'+id).
					success(function(data,status,headers,config){
						$log.log("Eliminado")
						var index = 0;
						informes = $scope.informesVisita;
						
						for (i=0; i<informes.length; i++){
							if(informes[i].id == id){
								index = i;
							}
						}
						informes.splice(index,1);
						$scope.informesVisita = informes;
						
					}).
					error(function(data,status,headers,config){
						$log.log(data)
					});
				}
		}
		
		
		$scope.cambiaFecha = function(){
			vigent = document.getElementById("vigente").value;
			if (cont == 100 && vigent == 'SI'){
				if($scope.fechaInicio && $scope.fechaFin){
					document.getElementById("botoncertificar").disabled = false;
				}else{
					document.getElementById("botoncertificar").disabled = true;
				}
			}else{
				document.getElementById("botoncertificar").disabled = true;
			}
		}
		
		
		$scope.modificaPlan = function(idExp,auditorId,tipoExp){
		
			day = $scope.fvisita.getDate();
			if(day.toString().length < 2){
				day = "0"+day.toString();
			}
			fvis = $scope.fvisita.toJSON().substring(0,8)+day;
			descrip = $scope.descripcion;
			
			visita = {f_visita:fvis ,expediente : idExp,descripcion : descrip, 
			inspector: $scope.inspector,actuacion: $scope.tact};
			
			
			$http.put('/api/VisitaParcela/'+visid,visita).
			success(function(data,status,headers,config){
				
				$('.collapse').collapse('hide')
				
				visitas = $scope.planificadasAuditor;
				
				var index = 0;
				for (i=0; i<visitas.length; i++){
					if(visitas[i].id == visid){
						index = i;
					}
				}
				
				visitas.splice(index,1);
				visitas.push(data);
				$scope.planificadasAuditor = visitas;
				visitas2 = $scope.planificadas;
				var index = 0;
				for (i=0; i<visitas2.length; i++){
					if(visitas2[i].id == visid){
						index = i;
					}
				}
				visitas2.splice(index,1);
				visitas2.push(data);
				$scope.planificadas = visitas2;
				
				$scope.modificaVisita = false;

			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
		};
		
		$scope.modificaAudi = function(idExp,auditorId){
		
			day = $scope.faudi.getDate();
			if(day.toString().length < 2){
				day = "0"+day.toString();
			}
			fvis = $scope.faudi.toJSON().substring(0,8)+day;
			descrip = $scope.descripcion2;
			muestras = $scope.visita.muestras;	
			incumplimientos = $scope.visita.incump;
			descrip5 = $scope.observ1;
			
			pac = document.getElementById("solicitaPAC").value;
			descrip2 = $scope.descmuestras;
			
			visita = {f_Auditoria:fvis ,visita : $scope.visitaPlanif,descripcion : descrip, 
			n_incumplimientos: incumplimientos, n_muestras: muestras,solicita_PAC: $scope.solPac,des_muestras: descrip2,
			acta: $scope.acta,observaciones: descrip5,actaMuestreo: $scope.actaM};
			
			$http.put('/api/Auditoria/'+audid,visita).
			success(function(data,status,headers,config){
				$('.collapse').collapse('hide')
				visitas = $scope.auditoriasAuditor;
				
				var index = 0;
				for (i=0; i<visitas.length; i++){
					if(visitas[i].id == visid){
						index = i;
					}
				}
				visitas.splice(index,1);
				visitas.push(data);
				$scope.auditoriasAuditor = visitas;
				
				visitas2 = $scope.auditorias;
				
				var index = 0;
				for (i=0; i<visitas2.length; i++){
					if(visitas2[i].id == visid){
						index = i;
					}
				}
				visitas2.splice(index,1);
				visitas2.push(data);
				$scope.auditorias = visitas2;
				
				$scope.modificaAuditoria = false;

			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
		};
		
		
		$scope.modificaIncump = function(idExp,tipoExp){
			
			descrip = $scope.descripcion3;
			
			tiponc = $scope.tipoNC;
			if($scope.tipoIncp == 'D'){
				tiponc = '';
			}
			
			contador = $scope.ref;
			fase = $scope.fase;

			incumplimiento = {auditoria: $scope.selectAudi,tipoIncumplimiento: $scope.tipoIncp,
							tipoNoConf: tiponc, incumplimiento: $scope.descripcion3,reglproced: $scope.apdo, parcelas: $scope.expl,
							observaciones : $scope.descripcion4,ref: contador,incumpRef: $scope.t_inc, fase_proc: fase,
							producto: $scope.t_product,f_detect: $scope.forma_deteccion, condicion: $scope.condicionalidad };
		
			
			$http.put('/api/Incumplimiento/'+incumID,incumplimiento).
				success(function(data,status,headers,config){
					$('.collapse').collapse('hide')
					//visitas = $scope.incumplimientos;
					var visitas2 = $scope.incumplimientosVisita;
					console.log(visitas2);
					//var index = 0;
					var index2 = 0;
					/*for (i=0; i<visitas.length; i++){
						if(visitas[i].id == incumID){
							index = i;
						}
					}*/
					for (i=0; i<visitas2.length; i++){
						if(visitas2[i].incump.id == incumID){
							index2 = i;
						}
					}
					//visitas.splice(index,1);
					//visitas.push(data);
					visitas2.splice(index2,1);
					var incump = {id: data.id, f_audi: data.f_audi, incump: data};
									
					visitas2.push(incump);
					console.log(visitas2);
					//$scope.incumplimientos = visitas;
					$scope.incumplimientosVisita = visitas2;
					
					$scope.modificaIncumplimiento = false;

				}).
				error(function(data,status,headers,config){
					$log.log(data);
				});
	

		};
		
		$scope.modificaCertif = function(idExp){
			$http.get('/api/expedientes/'+idExp).
				success(function(data,status,headers,config){
					data.F_iniciovigencia = document.getElementById("fechaInicio").value;
					data.F_finalvigencia = document.getElementById("fechaFin").value;
					data.vigente = $scope.vigent;
					$http.put('/api/expedientes/'+idExp,data).
					success(function(data2,status,headers,config){
					});
				});
		};
		
		
		$scope.certificar = function(idExp){
		
			$http.get('/api/expedientes/'+idExp).
				success(function(data,status,headers,config){
					fini = data.F_iniciovigencia;
					ffin = data.F_finalvigencia;
					vig = data.vigente;
					data.F_iniciovigencia = document.getElementById("fechaInicio").value;
					data.F_finalvigencia = document.getElementById("fechaFin").value;
					data.vigente = 'SI';
					data.idDocumento = parseInt(data.idDocumento)+1; 
					$http.put('/api/expedientes/'+idExp,data).
					success(function(data2,status,headers,config){
						if(data.haestadovigente == 'SI' || vig == 'SI'){
							$http.post('/api/historicoCertificados/',{expediente: idExp, F_iniciovigencia: fini, F_finalvigencia: ffin}).
							success(function(data3,status,headers,config){
								
							});
						}
						idAut = $scope.selectAudi;
						$http.get('/api/Auditoria/'+idAut).
							success(function(data4,status,headers,config){
								idVis = data4.visita;
								$http.get('/api/VisitaParcela/'+idVis).
								success(function(data5,status,headers,config){
									data5.completada = 'SI';
									$http.put('/api/VisitaParcela/'+idVis,data5).
									success(function(data6,status,headers,config){
										location.reload();
									});
								});
							});
						
						
					});
					
					
				});
			
		};
		
		
		$scope.guardarVisita = function(idExp,tipoExp){
		
			fvis = document.getElementById("fvisita").value
			descrip = $scope.descripcion;
		
		
			visita = {f_visita:fvis ,expediente : idExp,descripcion : descrip, 
			inspector: $scope.inspector,actuacion: $scope.tact,completada: 'NO'};
			
			$http.post('/api/VisitaParcela/',visita).
				success(function(data,status,headers,config){
					var cargadas = $scope.cargadas;
					if(tipoExp == 'AE'){
						for(i=0;i<cargadas.length;i++){
							datosParcela = {visita: data.id, incidencia: 'ALTA', motivoBaja: '', parcela: cargadas[i].id}
							$http.post('/api/parcelasVisita/',datosParcela).
								success(function(data2,status,headers,config){
									$scope.cargadas="";
								}).
								error(function(data2,status,headers,config){
									$log.log(data2)
								});
						}
						
					}
					else if(tipoExp == 'GA'){
						for(i=0;i<cargadas.length;i++){
							var acui = 'N';
							if (cargadas[i].regAcuicola != ''){
								acui = 'S';
							}
							datosParcela = {visita: data.id, incidencia: 'ALTA', motivoBaja: '', ganado: cargadas[i].id,esAcuicola: acui}
							$http.post('/api/ganadoVisita/',datosParcela).
								success(function(data2,status,headers,config){
									$scope.cargadas="";
								}).
								error(function(data2,status,headers,config){
									$log.log(data2)
								});
						}
						
					}
					else if(tipoExp == 'IN'){
						for(i=0;i<cargadas.length;i++){
							
							datosParcela = {visita: data.id, incidencia: 'ALTA', motivoBaja: '', industria: cargadas[i].id}
							$http.post('/api/industriaVisita/',datosParcela).
								success(function(data2,status,headers,config){
									$scope.cargadas="";
								}).
								error(function(data2,status,headers,config){
									$log.log(data2)
								});
						}
						
					}
					vis = $scope.planificadas;
					vis.push(data);
					$scope.planificadas = vis;
					
				}).
				error(function(data,status,headers,config){
					$log.log(data)
				});
		};
		$scope.guardarVisita2 = function(idExp,idAudit,tipoExp){


			fvis = document.getElementById("fvisita").value
			descrip = $scope.descripcion;

			visita = {f_visita:fvis ,expediente : idExp,descripcion : descrip, 
			inspector: idAudit,actuacion: $scope.tact,completada: 'NO'};
			
			$http.post('/api/VisitaParcela/',visita).
				success(function(data,status,headers,config){

					var cargadas = $scope.cargadas;
					if(tipoExp == 'AE'){
						for(i=0;i<cargadas.length;i++){
							datosParcela = {visita: data.id, incidencia: 'ALTA', motivoBaja: '', parcela: cargadas[i].id}
							$http.post('/api/parcelasVisita/',datosParcela).
								success(function(data2,status,headers,config){
									$scope.cargadas="";
								}).
								error(function(data2,status,headers,config){
									$log.log(data2)
								});
						}
						
					}
					else if(tipoExp == 'GA'){
						for(i=0;i<cargadas.length;i++){
							var acui = 'N';
							if (cargadas[i].regAcuicola != ''){
								acui = 'S';
							}
							datosParcela = {visita: data.id, incidencia: 'ALTA', motivoBaja: '', ganado: cargadas[i].id,esAcuicola: acui}
							$http.post('/api/ganadoVisita/',datosParcela).
								success(function(data2,status,headers,config){
									$scope.cargadas="";
								}).
								error(function(data2,status,headers,config){
									$log.log(data2)
								});
						}
						
					}
					else if(tipoExp == 'IN'){
						for(i=0;i<cargadas.length;i++){
							
							datosParcela = {visita: data.id, incidencia: 'ALTA', motivoBaja: '', industria: cargadas[i].id}
							$http.post('/api/industriaVisita/',datosParcela).
								success(function(data2,status,headers,config){
									$scope.cargadas="";
								}).
								error(function(data2,status,headers,config){
									$log.log(data2)
								});
						}
						
					}
					vis = $scope.planificadasAuditor;
					vis.push(data);
					$scope.planificadasAuditor = vis;
					
				}).
				error(function(data,status,headers,config){
					$log.log(data)
				});

		};
		$scope.guardarAuditoria= function(){
		

			f_audi = document.getElementById("faudi").value
			descrip = $scope.descripcion2;
			pac = document.getElementById("solicitaPAC").value;
			descrip2 = $scope.descmuestras;
			descrip3 = $scope.observ1;
		
			auditoria = {f_Auditoria:f_audi ,visita : $scope.visitaPlanif,descripcion : descrip, 
			n_incumplimientos: $scope.visita.incump, n_muestras: $scope.visita.muestras,solicita_PAC: pac,des_muestras: descrip2,
			acta: $scope.acta,observaciones: descrip3,actaMuestreo: $scope.actaM};
			
			$http.post('/api/Auditoria/',auditoria).
				success(function(data,status,headers,config){
					vis = $scope.auditorias;
					vis.push(data);
					$scope.auditorias = vis;
				}).
				error(function(data,status,headers,config){
					$log.log(data)
				});
		};
		$scope.guardarAuditoria2= function(){
		

			f_audi = document.getElementById("faudi").value
			descrip = $scope.descripcion2;
			pac = document.getElementById("solicitaPAC").value;
		
			auditoria = {f_Auditoria:f_audi ,visita : $scope.visitaPlanif,descripcion : descrip, 
			n_incumplimientos: $scope.visita.incump, n_muestras: $scope.visita.muestras,solicita_PAC: pac};
			
			$http.post('/api/Auditoria/',auditoria).
				success(function(data,status,headers,config){
					vis = $scope.auditoriasAuditor;
					vis.push(data);
					$scope.auditoriasAuditor = vis;
				}).
				error(function(data,status,headers,config){
					$log.log(data)
				});
		};
		
		$scope.tipoIncumplimiento= function(incump){
			var ret = '';
			if(incump == 'T'){
				ret = "Todas";
			}else if (incump == 'D'){
				ret = "Desviación";
			}else if (incump == 'NC'){
				ret = 'No conformidad';
			}
			return ret;
		}
		
		$scope.tipoNoConformidad = function(noc){
			var ret = '';
			if(noc == 'S'){
				ret = "";
			}else if (noc == 'IR'){
				ret = "Irregularidad";
			}else if (noc == 'IN'){
				ret = 'Infracción';
			}
			return ret;
		}
		
		$scope.guardarIncump= function(tipoExp){
		
			descrip = $scope.descripcion3;
			
			tiponc = $scope.tipoNC;
			if($scope.tipoIncp == 'D'){
				tiponc = '';
			}
			
			contador = contador+1;
			fase = $scope.fase;
			

			incumplimiento = {auditoria: $scope.selectAudi,tipoIncumplimiento: $scope.tipoIncp,
						tipoNoConf: tiponc, incumplimiento: $scope.descripcion3,reglproced: $scope.apdo, parcelas: $scope.expl,
						observaciones : $scope.descripcion4,ref: contador,incumpRef: $scope.t_inc, fase_proc: fase,
						producto: $scope.t_product,f_detect: $scope.forma_deteccion, condicion: $scope.condicionalidad };
			
			$http.post('/api/Incumplimiento/',incumplimiento).
				success(function(data2,status,headers,config){
					vis = $scope.incumplimientos;
					vis.push(data2);
					$scope.incumplimientos = vis;
				}).
				error(function(data,status,headers,config){
					$log.log(data)
				});

		};
		$scope.guardarAcciones= function(){
			
			fpac = document.getElementById("fPAC").value;
			fampac = document.getElementById("fAMPAC").value;
			if(fampac){
				pideAmpac = "SI";
			}else{
				pideAmpac = "NO";
				fampac = null;
			}
			

			acciones = {auditoria: $scope.selectAudi,f_pac: fpac,
						f_ampac: fampac,pideAmpac: pideAmpac, preg1: $scope.preg1,
						preg2 : $scope.preg2,preg3: $scope.preg3, preg4 : $scope.preg4,
						espreg1: $scope.descp1,espreg2: $scope.descp2,espreg3: $scope.descp3,espreg4: $scope.descp4
						};
			
			$http.post('/api/AccionesCorrectivas/',acciones).
				success(function(data,status,headers,config){
					$scope.cambiaAuditoria();
				}).
				error(function(data,status,headers,config){
					$log.log(data)
				});
		};
		$scope.modificaAcciones= function(){
			
			fpac = document.getElementById("fPAC").value;
			fampac = document.getElementById("fAMPAC").value;

			
			$log.log(fampac)
			
			if(fampac){
				pideAmpac = "SI";
			}else{
				pideAmpac = "NO";
				fampac = null;
			}

			acciones = {auditoria: $scope.selectAudi,f_pac: fpac,
						f_ampac: fampac,pideAmpac: pideAmpac, preg1: $scope.preg1,
						preg2 : $scope.preg2,preg3: $scope.preg3, preg4 : $scope.preg4,
						espreg1: $scope.descp1,espreg2: $scope.descp2,espreg3: $scope.descp3,espreg4: $scope.descp4
						};
			$http.get('/api/Auditoria/'+$scope.selectAudi).
				success(function(data){
					idAC = data.accionesCorrectivas[0].id;
					$http.put('/api/AccionesCorrectivas/'+idAC,acciones).
						success(function(data,status,headers,config){
							$scope.cambiaAuditoria();
							$('.collapse').collapse('hide');
						}).
						error(function(data,status,headers,config){
							$log.log(data)
						});
				});
		};
		
		$scope.guardarEvaluacion= function(audId){
			
			fev = document.getElementById("fEV").value;
			$log.log(audId);
			evaluacion = {auditoria: $scope.selectAudi,f_eval: fev ,
			eval: $scope.resultado,evaluador: audId};
			
			$http.post('/api/Evaluacion/',evaluacion).
				success(function(data,status,headers,config){
					$scope.cambiaAuditoria();
				}).
				error(function(data,status,headers,config){
					$log.log(data)
				});
		};
		$scope.modificaEvaluacion= function(audId){
			
			fev = document.getElementById("fEV").value;

			evaluacion = {auditoria: $scope.selectAudi,f_eval: fev ,
			eval: $scope.resultado,evaluador: audId};
			$http.get('/api/Auditoria/'+$scope.selectAudi).
				success(function(data){
				idEV = data.evaluacion[0].id;
				$http.put('/api/Evaluacion/'+idEV,evaluacion).
					success(function(data,status,headers,config){
						$scope.cambiaAuditoria();
					}).
					error(function(data,status,headers,config){
						$log.log(data)
					});
				});
		};	
		$scope.cargadas = [];
		$scope.cargarDatos = function(tipoExp){
			seleccionadas = document.getElementsByClassName("blankCheckbox");
			$log.log(seleccionadas)
			parcelas = $scope.parcelas;
			cargadas = $scope.cargadas;
			if($scope.modificaVisita){
				for (i=0;i<parcelas.length;i++){
					for (j=0;j<seleccionadas.length;j++){
						if(seleccionadas[j].checked){
							if(parcelas[i].id == seleccionadas[j].value){
								$log.log(parcelas[i]);
								if(tipoExp == 'AE'){
									datosParcela = {visita: visid, incidencia: 'ALTA', motivoBaja: '', parcela: parcelas[i].id}
									$http.post('/api/parcelasVisita/',datosParcela).
										success(function(data2,status,headers,config){
											
											cargadas.push(data2);
										}).
										error(function(data2,status,headers,config){
											$log.log(data2)
										});
								}
								else if(tipoExp == 'GA'){
									var acui = 'N';
									if (parcelas[i].regAcuicola != ''){
										acui = 'S';
									}
									datosParcela = {visita: data.id, incidencia: 'ALTA', motivoBaja: '', ganado: parcelas[i].id,esAcuicola: acui}
									$http.post('/api/ganadoVisita/',datosParcela).
										success(function(data2,status,headers,config){
											cargadas.push(data2);
										}).
										error(function(data2,status,headers,config){
											$log.log(data2)
										});
								}
								else if(tipoExp == 'IN'){
									datosParcela = {visita: data.id, incidencia: 'ALTA', motivoBaja: '', industria: parcelas[i].id}
									$http.post('/api/industriaVisita/',datosParcela).
										success(function(data2,status,headers,config){
											cargadas.push(data2);
										}).
										error(function(data2,status,headers,config){
											$log.log(data2)
										});
									
								}
								
							}
						}
					}
				}
			}else{
				
				for (i=0;i<parcelas.length;i++){
					for (j=0;j<seleccionadas.length;j++){
						if(seleccionadas[j].checked){
							if(parcelas[i].id == seleccionadas[j].value){
								cargadas.push(parcelas[i]);
								document.getElementById("blankCheckbox"+parcelas[i].id).checked = false;
								document.getElementById("blankCheckbox"+parcelas[i].id).disabled = true;
							}
						}
					}
				}
			}
			$scope.cargadas = cargadas;
			if($scope.selectTodos){
				document.getElementById("selectTodos").disabled = true;
				$scope.selectTodos = false;
			}
			
		};
		$scope.eliminaCargada = function(id,tipoExp){
			var cargadas = $scope.cargadas;
			
			
			if($scope.modificaPlan){
					if(tipoExp == 'AE'){
						$http.delete('/api/parcelasVisita/'+id).
						success(function(data2,status,headers,config){
							$log.log("Eliminado")
						}).
						error(function(data2,status,headers,config){
									$log.log(data2)
						});
					}else if (tipoExp == 'GA'){
						$http.delete('/api/ganadoVisita/'+id).
						success(function(data2,status,headers,config){
							$log.log("Eliminado")
						}).
						error(function(data2,status,headers,config){
									$log.log(data2)
						});
					}else if (tipoExp == 'IN'){
						$http.delete('/api/industriaVisita/'+id).
						success(function(data2,status,headers,config){
							$log.log("Eliminado")
						}).
						error(function(data2,status,headers,config){
									$log.log(data2)
						});
				}
				
			}else{
				document.getElementById("blankCheckbox"+id).disabled = false;
				if (cargadas.length <1){
					document.getElementById("selectTodos").disabled = false;
				}
			}
				
			var index;
			for (i=0; i<cargadas.length; i++){
				if(cargadas[i].id == id){
					index = i;
				}
			}
			cargadas.splice(index,1);
			$scope.cargadas = cargadas;
			
		};
		$scope.cambiaEstadoCargada = function(id){
			estado = document.getElementById("estadoCargada"+id).value;
			$scope.idParcela = id;
			if (estado == 'BAJA'){
				$scope.motivoBaja = true;
			}else{
				$scope.motivoBaja = false;
			}
		};
		$scope.cancelaBaja = function(){
			document.getElementById("estadoCargada"+$scope.idParcela).value = 'ALTA';
			$scope.motivoBaja = false;
		};
		$scope.darDeBaja = function(tipoExp){
			if(tipoExp == 'AE'){
				$http.get('/api/parcelasVisita/'+$scope.idParcela).success(function(dato){
					dato.incidencia = estado;
					dato.motivoBaja = $scope.motivo;
					$http.put('/api/parcelasVisita/'+$scope.idParcela,dato).
						success(function(data,status,headers,config){
						$scope.motivoBaja = false;
						});
					});
			}else if (tipoExp == 'GA'){
				$http.get('/api/ganadoVisita/'+$scope.idParcela).success(function(dato){
					dato.incidencia = estado;
					dato.motivoBaja = $scope.motivo;
					$http.put('/api/ganadoVisita/'+$scope.idParcela,dato).
						success(function(data,status,headers,config){
						$scope.motivoBaja = false;
						});
				});
			}else if (tipoExp == 'IN'){
				$http.get('/api/industriaVisita/'+$scope.idParcela).success(function(dato){
					dato.incidencia = estado;
					dato.motivoBaja = $scope.motivo;
					$http.put('/api/industriaVisita/'+$scope.idParcela,dato).
						success(function(data,status,headers,config){
						$scope.motivoBaja = false;
						});
				});
			}
		};
		$scope.modificaFactura = function(facturaID){
			$('.collapse').collapse('show');
			$scope.modFact = true;
			factID = facturaID;
			$http.get('/api/Facturacion/'+facturaID).success(function(dato){
				$scope.fact = new Date(dato.f_fact);
				$scope.concepto = dato.concepto;
				$scope.importe = dato.importe;
			});
		}
		$scope.editaAccionCorrectiva = function(idAccion){
			$scope.modificaAcciones = false;
			$('.collapse').collapse('show');
			var orderBy = $filter('orderBy');
			var audsAc = orderBy($scope.auditorias, '-f_Auditoria', false);
			console.log(audsAc);
			for (var i = 0; i<audsAc.length; i++){
				if(audsAc[i].id == idAccion){

					document.getElementById("selectAudi").selectedIndex = i+1;
					$scope.selectAudi = document.getElementById("selectAudi").value;
					break;
				}
			}
			$scope.cambiaAuditoria($scope.auditor);
			console.log();
			
		}
		$scope.editaFactura = function(){
			$http.get('/api/Facturacion/'+factID).success(function(dato){
				dato.f_fact = document.getElementById("fact").value;
				dato.concepto = $scope.concepto;
				dato.importe = $scope.importe;
				$http.put('/api/Facturacion/'+factID,dato).
					success(function(data,status,headers,config){
					facturas = $scope.facturas;
					$('.collapse').collapse('hide');
					console.log(facturas);
					var index = 0;
					for (i=0; i<facturas.length; i++){
						if(facturas[i].id == factID){
							index = i;
						}
					}
					facturas.splice(index,1);
					facturas.push(data);
					console.log(facturas);
					$scope.facturas = facturas;
					$scope.modFact = false;
					});

			});
		}
		$scope.eliminarFactura = function(facturaID){
			if (confirm("¿Desea eliminar esta factura?") == true) {
					$http.delete('/api/Facturacion/'+facturaID).
					success(function(data,status,headers,config){
						facturas = $scope.facturas;
						var index = 0;
						for (i=0; i<facturas.length; i++){
							if(facturas[i].id == factID){
								index = i;
							}
						}
						facturas.splice(index,1);

						$scope.facturas = facturas;
						});
				}
		}
			
	
	}]);
})();



