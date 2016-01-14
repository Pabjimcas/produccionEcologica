(function(){
	
	var expediente = angular.module('Riesgos',["ui.bootstrap", "ngCookies","ngResource"]);
	var expedienteId = 0; 


	expediente.config(function ($interpolateProvider) {
			$interpolateProvider.startSymbol("[[");
			$interpolateProvider.endSymbol("]]");
		}
	);

	expediente.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';
	}]);
	
	expediente.controller("Ranking",['$http','$log','$scope',function($http,$log,$scope){
		
		var fechaHoy = new Date();
		var fechaPasada = new Date();
		fechaPasada.setFullYear(2008);
		//parseInt(fechaHoy.getFullYear())-1
		$scope.fecha_ini = fechaPasada;
		$scope.fecha_fin = fechaHoy;
		var exito=18;
		var seleccionados = [];
		var seleccionado = {index: 0,elemento: ""};
		var noSeleccionados = [];
		var expedientes = [];
		
		$scope.iniciaRanking = function(n_exp){
			
			$http.get('/api/Riesgos/').
				success(function(data){
					expedientes = data;
					expedientes.sort(function(a, b){
						var comp1 = b.puntuacion - a.puntuacion
					return comp1});
					
					porcentaje = Math.ceil(parseFloat(n_exp)*0.1);
					$scope.n_select = porcentaje;
					ids = [];
					
					for(i=0; i< expedientes.length;i++){
						if(porcentaje > 0){
							if(expedientes[i].estado == 'ALTA'){
								f_eval = new Date(expedientes[i].f_eval);
								if(f_eval >= fechaPasada && f_eval <= fechaHoy){
									seleccionados.push(expedientes[i]);
									porcentaje = porcentaje - 1;
									ids.push(expedientes[i].id)
								}
							}
						}else{
							break;
						}
					}

					for(j=i;j<expedientes.length;j++){
						if(expedientes[j].estado == 'ALTA'){
							f_eval = new Date(expedientes[j].f_eval);
							if(ids.indexOf(expedientes[j].id) == -1){
								if(f_eval >= fechaPasada && f_eval <= fechaHoy){
									noSeleccionados.push(expedientes[j])
								}
							}
						}
					}
					n_filas = seleccionados.length + noSeleccionados.length;
					if(n_filas > 0){
						$scope.n_filas = n_filas; 
					}
					$scope.seleccionados = seleccionados;
					$scope.noSeleccionados = noSeleccionados;
				}).
				error(function(data,status,headers,config){
					$log.log(data);
				});
		};
		$scope.modificaRanking = function(){
			seleccionados = [];
			noSeleccionados = [];
			exito = 18;
			f_ini = document.getElementById("fecha_ini").value;
			f_fin = document.getElementById("fecha_fin").value;
			cont = $scope.n_selec;
			exp_ranking = [];
			ids = [];
			for(i=0; i< expedientes.length;i++){
				if(expedientes[i].f_eval >= f_ini && expedientes[i].f_eval <= f_fin){	
					exp_ranking.push(expedientes[i])
				}
			}
			exp_ranking.sort(function(a, b){
						var comp1 = b.puntuacion - a.puntuacion
					return comp1});
					
			porcentaje = Math.ceil(parseFloat(exp_ranking.length)*0.1);
			$scope.n_select = porcentaje;
			
			for(i=0; i< exp_ranking.length;i++){
				if(porcentaje > 0){
					$log.log(i)
					seleccionados.push(exp_ranking[i]);
				}else{
					noSeleccionados.push(exp_ranking[i]);
				}
				porcentaje--;
				
			}
			$scope.n_filas = exp_ranking.length;
			$scope.noSeleccionados = noSeleccionados;
			$scope.seleccionados = seleccionados;
		}
	}]);

})();


