(function(){
	
	var expediente = angular.module('Inspector',["ui.bootstrap", "ngCookies","ngResource"]);

	expediente.config(function ($interpolateProvider) {
			$interpolateProvider.startSymbol("[[");
			$interpolateProvider.endSymbol("]]");
		}
	);

	expediente.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';
	}]);
	
	expediente.controller("InspectorController",['$http','$log','$scope',function($http,$log,$scope){
		$scope.usuario = "NO";
		var usuario = "NO";
		var cambia = "NO";
		$scope.muestraButton = true;
		$scope.cambiaUsuario = function(){
			$('.collapse').collapse('toggle')
		};
		$scope.seleccionaValores = function(){
			if($scope.usuario != usuario){
				cambia = "SI";
				if($scope.usuario == "SI"){
					$scope.muestraButton = false;
				}else{
					$scope.muestraButton = true;
				}
			}else{
				cambia = "NO";
			}
			if($scope.rol == 'A'){
				$scope.consexp = 'SI';
				$scope.modexp = 'NO';
				$scope.conscont = 'SI';
				$scope.modcont = 'SI';
				$scope.creacont = 'SI';
				$scope.consinter = 'SI';
				$scope.modinter = 'NO';
				$scope.creainter = 'NO';
				$scope.consparc = 'SI';
				$scope.modparc = 'SI';
				$scope.creaparc = 'NO';
				$scope.consvis = 'NO';
				$scope.modvis = 'NO';
				$scope.consplan = 'SI';
				$scope.modplan = 'SI';
				$scope.creaplan = 'SI';
				$scope.consriesgo = 'NO';
				$scope.modriesgo = 'NO';
				$scope.creariesgo = 'NO';
			}else if($scope.rol == 'R'){
				$scope.consclient = 'SI';
				$scope.modclient = 'SI';
				$scope.creaclient = 'NO';
				$scope.consfact = 'SI';
				$scope.modfact = 'NO';
				$scope.creafact = 'NO';
				$scope.consexpedientes = 'SI';
				$scope.modexpedientes = 'SI';
				$scope.creaexpedientes = 'NO';
				$scope.conscont = 'SI';
				$scope.modcont = 'SI';
				$scope.creacont = 'SI';
				$scope.consinter = 'SI';
				$scope.modinter = 'SI';
				$scope.creainter = 'SI';
				$scope.consparc = 'SI';
				$scope.modparc = 'SI';
				$scope.creaparc = 'SI';
				$scope.consvis = 'SI';
				$scope.modvis = 'NO';
				$scope.consvisplan = 'SI';
				$scope.modvisplan = 'SI';
				$scope.creavisplan = 'SI';
				$scope.consriesgo = 'SI';
				$scope.modriesgo = 'SI';
				$scope.creariesgo = 'SI';
				$scope.consaudi = 'SI';
				$scope.modaudi = 'SI';
				$scope.creaaudi = 'SI';
				$scope.gensip = 'SI';
				$scope.gencli = 'SI';
				$scope.genfac = 'SI';
				$scope.genclient = 'SI';
				$scope.gencer = 'NO';
			}else if($scope.rol == 'G'){
				$scope.consclient = 'SI';
				$scope.modclient = 'SI';
				$scope.creaclient = 'SI';
				$scope.consfact = 'SI';
				$scope.modfact = 'SI';
				$scope.creafact = 'SI';
				$scope.consexpedientes = 'SI';
				$scope.modexpedientes = 'SI';
				$scope.creaexpedientes = 'SI';
				$scope.conscont = 'SI';
				$scope.modcont = 'SI';
				$scope.creacont = 'SI';
				$scope.consinter = 'SI';
				$scope.modinter = 'SI';
				$scope.creainter = 'SI';
				$scope.consparc = 'SI';
				$scope.modparc = 'SI';
				$scope.creaparc = 'SI';
				$scope.consvis = 'SI';
				$scope.modvis = 'SI';
				$scope.consvisplan = 'SI';
				$scope.modvisplan = 'SI';
				$scope.creavisplan = 'SI';
				$scope.consriesgo = 'SI';
				$scope.modriesgo = 'SI';
				$scope.creariesgo = 'SI';
				$scope.consaudi = 'SI';
				$scope.modaudi = 'SI';
				$scope.creaaudi = 'SI';
				$scope.conscer = 'SI';
				$scope.modcer = 'NO';
				$scope.creacer = 'NO';
				$scope.consins= 'SI';
				$scope.modins= 'NO';
				$scope.creains = 'NO';
				$scope.gensip = 'SI';
				$scope.gencli = 'SI';
				$scope.genfac = 'SI';
				$scope.genclient = 'SI';
				$scope.gencer = 'SI';
			}
		};
		
		$scope.modificaInspector = function(){
			$log.log($scope.usuario)
			if($scope.usuario == 'NO'){
				if (cambia == "NO"){
					
					$http.get('/api/Inspector/'+$scope.idUs).success(function(dato){
						dato.categoria = $scope.rol;
						$http.put('/api/Inspector/'+dato.id,dato).success(function(dato2){
							location.reload();
						}).error(function(data,status,headers,config){
							$log.log(data);
						});
					});
				}else if(cambia == "SI"){
					
					$http.get('/api/perfil/'+$scope.idUs).success(function(dato2){
						$http.delete('/api/usuarios/'+dato2.user).success(function(dato3){
							$http.delete('/api/UsuarioInspector/'+$scope.idUsIns).success(function(dato4){
								location.reload();
							}).error(function(data,status,headers,config){
									$log.log(data);
							});
						});
					});
				}
			}else{
				if ($scope.rol != 'A'){
					expedientes = $scope.consexpedientes+" "+$scope.modexpedientes+" "+$scope.creaexpedientes;
					clientes = $scope.consclient+" "+$scope.modclient+" "+$scope.creaclient;
					facturacion = $scope.consfact+" "+$scope.modfact+" "+$scope.creafact;
					planificadas = $scope.consvisplan+" "+$scope.modvisplan+" "+$scope.creavisplan;
					auditorias = $scope.consaudi+" "+$scope.modaudi+" "+$scope.creaaudi;
					archivos = $scope.gensip+" "+$scope.gencli+" "+$scope.genfac+" "+$scope.genclient+" "+$scope.gencer;
					if ($scope.rol != 'R'){
						certifica = $scope.conscer+" "+$scope.modcer+" "+$scope.creacer;
						inspectores = $scope.consins+" "+$scope.modins+" "+$scope.creains;
					}else{
						certifica = 'NO NO NO';
						inspectores = 'NO NO NO';
					}
				}else{
					expedientes = $scope.consexp+" "+$scope.consexp;
					clientes = 'NO NO NO';
					facturacion = 'NO NO NO';
					planificadas = $scope.consplan+" "+$scope.modplan+" "+$scope.creaplan;
					auditorias = 'SI SI SI';
					certifica = 'NO NO NO';
					inspectores = 'NO NO NO';
					archivos = 'NO NO NO NO NO';
				}
				contactos = $scope.conscont+" "+$scope.modcont+" "+$scope.creacont;
				interlocutores = $scope.consinter+" "+$scope.modinter+" "+$scope.creainter;
				parcelas = $scope.consparc+" "+$scope.modparc+" "+$scope.creaparc;
				visitas = $scope.consvis+" "+$scope.modvis;
				riesgos = $scope.consriesgo+" "+$scope.modriesgo+" "+$scope.creariesgo;
			
				usInspector = {inspector: $scope.idUs, expedientes: expedientes, clientes: clientes,
								contactos: contactos, interlocutores: interlocutores, parcelas: parcelas,
								v_realizadas: visitas, p_visitas: planificadas, ev_riesgos: riesgos, 
								facturacion: facturacion, auditorias: auditorias, certifica: certifica, 
								inspectores: inspectores, archivos: archivos};
				$http.get('/api/Inspector/'+$scope.idUs).success(function(dato){
					dato.categoria = $scope.rol;
					$http.get('/api/perfil/'+$scope.idUs).success(function(dato2){
						dato2.TipoUsuario = $scope.rol;
						$http.put('/api/perfil/'+$scope.idUs,dato2).success(function(dato3){
							$http.put('/api/Inspector/'+$scope.idUs,dato).success(function(dato4){
								$http.put('/api/UsuarioInspector/'+$scope.idUsIns,usInspector).success(function(dato5){
									location.reload();
								}).error(function(data,status,headers,config){
										$log.log(data);
								});
							});
						});
					});
				});
			}
			
		};
		
		$scope.noUsuario = function(){
			$http.post('/api/Inspector/',{nif: $scope.nif, Nombre: $scope.nombre, Apellido1: $scope.apellido1, Apellido2: $scope.apellido2,
			Telefono1: $scope.tel1, Telefono2: $scope.tel2, categoria: $scope.rol}).
			success(function(data,status,headers,config){
				location.replace("/inspectores/");
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
		};
		
		$scope.editaUsuario = function(insId){
			$scope.idUs = insId;
			$('.collapse').collapse()
			$http.get('/api/Inspector/'+insId).success(function(dato){
				$scope.rol = dato.categoria;
				if(dato.usInspector.length > 0){
					$scope.usuario = 'SI';
					$scope.idUsIns = dato.usInspector[0].id;
					usuario = 'SI';
					expedientes = dato.usInspector[0].expedientes.split(" ");
					$scope.consexpedientes = expedientes[0];
					$scope.consexp = expedientes[0];
					$scope.modexpedientes = expedientes[1];
					$scope.modexp = expedientes[1];
					$scope.creaexpedientes = expedientes[2];
					$scope.creaexp = expedientes[2];
					clientes =  dato.usInspector[0].clientes.split(" ");
					$scope.consclient = clientes[0];
					$scope.modclient = clientes[1];
					$scope.creaclient = clientes[2];
					contactos = dato.usInspector[0].contactos.split(" ");
					$scope.conscont = contactos[0];
					$scope.modcont = contactos[1];
					$scope.creacont= contactos[2];
					interlocutores = dato.usInspector[0].interlocutores.split(" ");
					$scope.consinter = interlocutores[0];
					$scope.modinter = interlocutores[1];
					$scope.creainter= interlocutores[2];
					parcelas = dato.usInspector[0].parcelas.split(" ");
					$scope.consparc = parcelas[0];
					$scope.modparc = parcelas[1];
					$scope.creaparc=  parcelas[2];
					v_realizadas = dato.usInspector[0].v_realizadas.split(" ");
					$scope.consvis= v_realizadas[0];
					$scope.modvis = v_realizadas[1];
					$scope.creavis= v_realizadas[2];
					p_visitas = dato.usInspector[0].p_visitas.split(" ");
					$scope.consplan= p_visitas[0];
					$scope.consvisplan = p_visitas[0];
					$scope.modplan = p_visitas[1];
					$scope.modvisplan = p_visitas[1];
					$scope.creaplan= p_visitas[2];
					$scope.creavisplan = p_visitas[2];
					ev_riesgos = dato.usInspector[0].ev_riesgos.split(" ");
					$scope.consriesgo= ev_riesgos[0];
					$scope.modriesgo = ev_riesgos[1];
					$scope.creariesgo= ev_riesgos[2];
					ev_riesgos = dato.usInspector[0].ev_riesgos.split(" ");
					$scope.consriesgo= ev_riesgos[0];
					$scope.modriesgo = ev_riesgos[1];
					$scope.creariesgo= ev_riesgos[2];
					facturacion = dato.usInspector[0].facturacion.split(" ");
					$scope.consfact= facturacion[0];
					$scope.modfact = facturacion[1];
					$scope.creafact= facturacion[2];
					auditorias = dato.usInspector[0].auditorias.split(" ");
					$scope.consaudi= auditorias[0];
					$scope.modaudi = auditorias[1];
					$scope.creaaudi= auditorias[2];
					certifica = dato.usInspector[0].certifica.split(" ");
					$scope.conscer = certifica[0];
					$scope.modcer = certifica[1];
					$scope.creacer = certifica[2];
					inspectores = dato.usInspector[0].inspectores.split(" ");
					$scope.consins = inspectores[0];
					$scope.modins = inspectores[1];
					$scope.creains = inspectores[2];
					archivos = dato.usInspector[0].archivos.split(" ");
					$scope.gensip = archivos[0];
					$scope.gencli = archivos[1];
					$scope.genfac = archivos[2];
					$scope.genclient = archivos[3];
					$scope.gencer = archivos[4];
					
				}else{
					$scope.usuario = 'NO';
					usuario = 'NO';
				}
			});
		};
	}]);

})();


