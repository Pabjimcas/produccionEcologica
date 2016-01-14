(function(){
	
	var expediente = angular.module('Visitas',["ui.bootstrap", "ngCookies","ngResource"]);

	expediente.config(function ($interpolateProvider) {
			$interpolateProvider.startSymbol("[[");
			$interpolateProvider.endSymbol("]]");
		}
	);

	expediente.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';
	}]);
		
	expediente.controller("VisitasPlanificadas",['$http','$log','$scope',function($http,$log,$scope){

		var contenidoInicial = document.getElementById("visitasTabla").rows;
		var htmlInicial = document.getElementById("visitasTabla").tBodies[0].innerHTML;
		var arrayAuditores = [];
		var arrayPAC = [];
		var arrayAuxiliar = [];
		$scope.inicia = function(){
			opciones = document.getElementById("selectAuditor").options;
			for (i=1; i<opciones.length;i++){
				filas = contenidoInicial;
				htmlContent = "";
				cont = 1;
				for (j=1; j< filas.length; j++){
					fecha = filas[j].cells[1].innerHTML;
					actuacion = filas[j].cells[2].innerHTML;
					inspector =filas[j].cells[3].innerHTML;
					cliente= filas[j].cells[4].innerHTML;
					codigo=filas[j].cells[5].innerHTML;
					if(inspector == opciones[i].value){
						htmlContent = htmlContent +"<tr><td class='text-center'>"+cont+"</td>"+
						"<td>"+fecha+"</td>"+
						"<td>"+actuacion+"</td>"+
						"<td>"+inspector+"</td>"+
						"<td>"+cliente+"</td>"+
						"<td>"+codigo+"</td></tr>";
						cont++;
					}
				}
				arrayAuditores.push({id: opciones[i].value,htmlContent: htmlContent})
			}
		
		};
		
		$scope.inicia2 = function(){
			opciones2 = document.getElementById("selectPAC").options;
			opciones = document.getElementById("selectAuditor").options;
			for (i=1; i<opciones.length;i++){
				filas = contenidoInicial;
				htmlContent = "";
				cont = 1;
				for (j=1; j< filas.length; j++){
					fecha = filas[j].cells[1].innerHTML;
					inspector =filas[j].cells[2].innerHTML;
					cliente= filas[j].cells[3].innerHTML;
					codigo=filas[j].cells[4].innerHTML;
					precisaPAC=filas[j].cells[5].innerHTML;
					poseePAC=filas[j].cells[6].innerHTML;
					evaluado=filas[j].cells[7].innerHTML;
					if(inspector == opciones[i].value){
						htmlContent = htmlContent +"<tr><td class='text-center'>"+cont+"</td>"+
						"<td>"+fecha+"</td>"+
						"<td>"+inspector+"</td>"+
						"<td>"+cliente+"</td>"+
						"<td>"+codigo+"</td>"+
						"<td>"+precisaPAC+"</td>"+
						"<td>"+poseePAC+"</td>"+
						"<td>"+evaluado+"</td></tr>";
						cont++;
					}
					
				}
				arrayAuditores.push({id: opciones[i].value,htmlContent: htmlContent})
			}
			for (i=1; i<opciones2.length;i++){
				filas = contenidoInicial;
				htmlContent2 = "";
				cont2 = 1;
				for (j=1; j< filas.length; j++){
					fecha = filas[j].cells[1].innerHTML;
					inspector =filas[j].cells[2].innerHTML;
					cliente= filas[j].cells[3].innerHTML;
					codigo=filas[j].cells[4].innerHTML;
					precisaPAC=filas[j].cells[5].innerHTML;
					poseePAC=filas[j].cells[6].innerHTML;
					evaluado=filas[j].cells[7].innerHTML;
					if(precisaPAC == opciones2[i].value){
						htmlContent2 = htmlContent2 +"<tr><td class='text-center'>"+cont2+"</td>"+
						"<td>"+fecha+"</td>"+
						"<td>"+inspector+"</td>"+
						"<td>"+cliente+"</td>"+
						"<td>"+codigo+"</td>"+
						"<td>"+precisaPAC+"</td>"+
						"<td>"+poseePAC+"</td>"+
						"<td>"+evaluado+"</td></tr>";
						cont2++;
					}
				}
				arrayPAC.push({id: opciones2[i].value,htmlContent: htmlContent2})
			}
		
		};
		
		$scope.cambiaAuditor = function(){
			if($scope.AuditorSelect){
				
				for (i=0; i<arrayAuditores.length;i++){
					if(arrayAuditores[i].id == $scope.AuditorSelect){
						document.getElementById("visitasTabla").tBodies[0].innerHTML = arrayAuditores[i].htmlContent;
						break;
					}
				}	
			}else{
				document.getElementById("visitasTabla").tBodies[0].innerHTML = htmlInicial;
			}
			
		};
		$scope.cambiaAuditor2 = function(){
			if($scope.AuditorSelect && !$scope.PACSelect){
				for (i=0; i<arrayAuditores.length;i++){
					if(arrayAuditores[i].id == $scope.AuditorSelect){
						document.getElementById("visitasTabla").tBodies[0].innerHTML = arrayAuditores[i].htmlContent;
						break;
					}
				}
			}else{
				if($scope.AuditorSelect){
						opciones = document.getElementById("selectAuditor").options;
						var contenidoInicial3 = document.getElementById("visitasTabla").rows;
						var html2= document.getElementById("visitasTabla").tBodies[0].innerHTML;
						
						for(i = 0;i<arrayAuxiliar.length; i++){
							if($scope.PACSelect == arrayAuxiliar[i].id && $scope.AuditorSelect == arrayAuxiliar[i].idAudi){
								document.getElementById("visitasTabla").tBodies[0].innerHTML = arrayAuxiliar[i].htmlContent;
								break;
							}
						}
						if (i == arrayAuxiliar.length){
						
							for (i=1; i<opciones.length;i++){
								filas = contenidoInicial3;
								htmlContent = "";
								cont = 1;
								for (j=1; j< filas.length; j++){
									fecha = filas[j].cells[1].innerHTML;
									inspector =filas[j].cells[2].innerHTML;
									cliente= filas[j].cells[3].innerHTML;
									codigo=filas[j].cells[4].innerHTML;
									precisaPAC=filas[j].cells[5].innerHTML;
									poseePAC=filas[j].cells[6].innerHTML;
									evaluado=filas[j].cells[7].innerHTML;
									if(precisaPAC == opciones[i].value){
										htmlContent = htmlContent +"<tr><td class='text-center'>"+cont+"</td>"+
										"<td>"+fecha+"</td>"+
										"<td>"+inspector+"</td>"+
										"<td>"+cliente+"</td>"+
										"<td>"+codigo+"</td>"+
										"<td>"+precisaPAC+"</td>"+
										"<td>"+poseePAC+"</td>"+
										"<td>"+evaluado+"</td></tr>";
										cont++;
									}
									
								}
								arrayAuxiliar.push({idAudi: $scope.AuditorSelect,id: opciones[i].value,htmlContent: htmlContent});
							}
							for(i = 0;i<arrayAuxiliar.length; i++){
								if($scope.PACSelect == arrayAuxiliar[i].id && $scope.AuditorSelect == arrayAuxiliar[i].idAudi){
									document.getElementById("visitasTabla").tBodies[0].innerHTML = arrayAuxiliar[i].htmlContent;
									break;
								}
							}
						}
						
					}else{
						document.getElementById("visitasTabla").tBodies[0].innerHTML = htmlInicial;
						$scope.AuditorSelect = '';
						$scope.PACSelect='';
					}
			}
			
		};
		$scope.cambiaPAC = function(){
			if($scope.PACSelect && !$scope.AuditorSelect){
				for (i=0; i<arrayPAC.length;i++){
					if(arrayPAC[i].id == $scope.PACSelect){
						document.getElementById("visitasTabla").tBodies[0].innerHTML = arrayPAC[i].htmlContent;
						break;
					}
				}	
			}else{
				if($scope.PACSelect){
					opciones = document.getElementById("selectPAC").options;
					var contenidoInicial2 = document.getElementById("visitasTabla").rows;
					var html= document.getElementById("visitasTabla").tBodies[0].innerHTML;
					
					for(i = 0;i<arrayAuxiliar.length; i++){
						if($scope.PACSelect == arrayAuxiliar[i].id && $scope.AuditorSelect == arrayAuxiliar[i].idAudi){
							document.getElementById("visitasTabla").tBodies[0].innerHTML = arrayAuxiliar[i].htmlContent;
							break;
						}
					}
					if (i == arrayAuxiliar.length){
					
						for (i=1; i<opciones.length;i++){
							filas = contenidoInicial2;
							htmlContent = "";
							cont = 1;
							for (j=1; j< filas.length; j++){
								fecha = filas[j].cells[1].innerHTML;
								inspector =filas[j].cells[2].innerHTML;
								cliente= filas[j].cells[3].innerHTML;
								codigo=filas[j].cells[4].innerHTML;
								precisaPAC=filas[j].cells[5].innerHTML;
								poseePAC=filas[j].cells[6].innerHTML;
								evaluado=filas[j].cells[7].innerHTML;
								if(precisaPAC == opciones[i].value){
									htmlContent = htmlContent +"<tr><td class='text-center'>"+cont+"</td>"+
									"<td>"+fecha+"</td>"+
									"<td>"+inspector+"</td>"+
									"<td>"+cliente+"</td>"+
									"<td>"+codigo+"</td>"+
									"<td>"+precisaPAC+"</td>"+
									"<td>"+poseePAC+"</td>"+
									"<td>"+evaluado+"</td></tr>";
									cont++;
								}
								
							}
							arrayAuxiliar.push({idAudi: $scope.AuditorSelect,id: opciones[i].value,htmlContent: htmlContent});
						}
						for(i = 0;i<arrayAuxiliar.length; i++){
							if($scope.PACSelect == arrayAuxiliar[i].id && $scope.AuditorSelect == arrayAuxiliar[i].idAudi){
								document.getElementById("visitasTabla").tBodies[0].innerHTML = arrayAuxiliar[i].htmlContent;
								break;
							}
						}
					}
					
				}else{
					document.getElementById("visitasTabla").tBodies[0].innerHTML = htmlInicial;
					$scope.AuditorSelect = '';
					$scope.PACSelect='';
				}
			}
			
		};

	}]);
})();


