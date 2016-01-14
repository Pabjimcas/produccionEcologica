(function(){
	
	var expediente = angular.module('Facturacion',["ui.bootstrap", "ngCookies","ngResource"]);

	expediente.config(function ($interpolateProvider) {
			$interpolateProvider.startSymbol("[[");
			$interpolateProvider.endSymbol("]]");
		}
	);
	expediente.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';
	}]);
	
	expediente.controller("Factura",['$http','$log','$scope',function($http,$log,$scope){

		$scope.iniciaFactura = function(){
			$scope.dfact = 1;
			
		};
		$scope.generaFactura = function(){
			fechaIni = $scope.fini;
			diaIni = fechaIni.getDate();
			mesIni = String(parseInt(fechaIni.getMonth())+1);
			while (mesIni.length < 2){
				mesIni = '0'+mesIni;
			}
			anyoIni = fechaIni.getFullYear();
			fechaFin = $scope.ffin;
			diaFin = fechaFin.getDate();
			mesFin = String(parseInt(fechaFin.getMonth())+1);
			while (mesFin.length < 2){
				mesFin = '0'+mesFin;
			}
			factura = $scope.dfact;
			anyoFin = fechaFin.getFullYear();
			href='/excelfile2/'+anyoIni+"/"+mesIni+"/"+diaIni+"/"+anyoFin+"/"+mesFin+"/"+diaFin+"/"+factura;
			location.replace(href);	
		}
	}]);

})();


