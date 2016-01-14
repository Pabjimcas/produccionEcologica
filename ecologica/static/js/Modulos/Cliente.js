(function(){
	
	var expediente = angular.module('ClienteApp',["ui.bootstrap", "ngCookies","ngResource"]);

	expediente.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';
	}]);

	expediente.config(function ($interpolateProvider) {
			$interpolateProvider.startSymbol("[[");
			$interpolateProvider.endSymbol("]]");
		}
	);
	

	expediente.directive('nifcif', function() {
	return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.nifcif = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return false;
        }

		return validateDNI(viewValue);
      };
    }
  };
});


expediente.controller("Cliente",['$http','$log','$scope',function($http,$log,$scope){
			
		$scope.modifica = false;
		$scope.inicializaCliente = function(idCliente){
			$http.get('/api/clientes/'+idCliente).success(function(dato){
				$scope.client = dato;
				$scope.provinciaSeleccionada = dato.Provincia;
				$scope.municipioSeleccionado = dato.Municipio;
				if(dato.esiban){
					$scope.tipoCuenta = "IBAN";
				}else{
					$scope.tipoCuenta = "CCC";
				}
				$scope.client.Cuent1 = dato.iban.substring(0,4);
				$scope.client.Cuent2 = dato.iban.substring(4,8);
				$scope.client.Cuent3 = dato.iban.substring(8,10);
				$scope.client.Cuent4 = dato.iban.substring(10,20);
				$scope.gen = dato.Genero;
				$scope.formPago= dato.p_recur;
				$scope.pago = dato.f_pago;
				$scope.observaciones = dato.observaciones;
				if(dato.F_sepa){
					$scope.F_sepa = new Date(dato.F_sepa);
				}else{
					$scope.F_sepa = "";
				}
			});
			$http.get('/api/provincias').success(function(dato){	
				$scope.provincias = dato;
				$log.log(dato);
			});
			$http.get('/api/municipios').success(function(dato){	
				$scope.municipios = dato;
			});
			
		};
		
		$scope.modificaCliente = function(){
			$scope.modifica = true;
		};
		
		$scope.guardarCliente = function(clienteid){
		
			var provSel = $scope.provinciaSeleccionada;
			var munSel = $scope.municipioSelecionado;
			if ($scope.provinciaSeleccionada == null){
				provSel = $scope.client.Provincia;
			}
			if($scope.municipioSelecionado == null){
				munSel = $scope.client.Municipio;
			}
			ibn = $scope.client.Cuent1+$scope.client.Cuent2+$scope.client.Cuent3+$scope.client.Cuent4;
			if($scope.tipoCuenta == 'IBAN'){
				esiban = $scope.client.esiban;
			}else{
				esiban = '';
			}
			fsepa = document.getElementById("F_sepa").value;
			if (fsepa == '' || fsepa == null){
				fsepa = null;
			}
			$http.put('/api/clientes/'+clienteid,{nifcif:$scope.client.nifcif, Nombre: $scope.client.Nombre, Apellido1: $scope.client.Apellido1,
			Apellido2: $scope.client.Apellido2, Genero: $scope.gen, Telefono1: $scope.client.Telefono1, Telefono2: $scope.client.Telefono2,
			Fax: $scope.client.Fax, Email: $scope.client.Email, Web: $scope.client.Web, Domicilio: $scope.client.Domicilio, CP: $scope.client.CP,
			Provincia: provSel, Municipio: munSel,iban: ibn, esiban : esiban,F_sepa:fsepa ,p_recur:$scope.formPago,observaciones: $scope.observaciones, f_pago: $scope.pago}).
				success(function(data,status,headers,config){
					location.reload();
				});
		};
		
		$scope.cancelarModificacion = function(){
			$('.collapse').collapse('hide');
			$scope.modifica = false;
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
	}]);
var no_contiene;
var contiene = $("#expedientesTabla td").parent();

expediente.controller("ListaExpedientes",['$http','$log','$scope',function($http,$log,$scope){


		$scope.filtraTabla = function(){
			var filtro = $("#textFiltro").val();
			if(filtro != ""){
				 $("#expedientesTabla td").parent().hide();
				 $("#expedientesTabla td:contains("+filtro+")").parent().show();
				 $("#expedientesTabla td:contains("+filtro.toUpperCase()+")").parent().show();
				 $("#expedientesTabla td:contains("+filtro[0].toUpperCase() + filtro.slice(1)+")").parent().show();

			}else{
				 $("#expedientesTabla td").parent().show();
			}
		}


	}]);
	
	expediente.controller("CreaCliente",['$http','$log','$scope',function($http,$log,$scope){

		
		$scope.cliente = {nifcif: '',nombre: '',apellido1: '',apellido2: '',gen: 'X',
		tel1: '',tel2:'',fax: '',email:'',web:'', domicilio:'',cp:''};
		
		$scope.inicia = function(){
			$http.get('/api/municipios/').
				success(function(data){
				
					$scope.municipios = data;
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		
		$scope.guardar = function(){
			if($scope.Cuent1 && $scope.Cuent2 && $scope.Cuent3 && $scope.Cuent4){
				ibn = $scope.Cuent1+$scope.Cuent2+$scope.Cuent3+$scope.Cuent4;
				if($scope.tipoCuenta == 'IBAN'){
					esiban = $scope.esiban;
				}else{
					esiban = '';
				}
			}else{
				ibn = "";
				esiban = "";
			}
			fsepa = document.getElementById("F_sepa").value;
			if (fsepa == '' || fsepa == null){
				fsepa = null;
			}
			
			
			form_pag = $scope.formPago;
			if(!$scope.formPago){
				form_pag = "";
			}
			
			$http.post('/api/clientes/',{nifcif:$scope.cliente.nifcif, Nombre: $scope.cliente.nombre, Apellido1: $scope.cliente.apellido1,
			Apellido2: $scope.cliente.apellido2, Genero: $scope.cliente.gen, Telefono1: $scope.cliente.tel1, Telefono2: $scope.cliente.tel2,
			Fax: $scope.cliente.fax, Email: $scope.cliente.email, Web: $scope.cliente.web, Domicilio: $scope.cliente.domicilio, CP: $scope.cliente.cp,
			Provincia: $scope.provinciaSeleccionada, Municipio: $scope.municipioSeleccionado,esiban: esiban, iban: ibn,F_sepa: fsepa,p_recur: form_pag,observaciones: $scope.observaciones,f_pago: $scope.pago}).
			success(function(data,status,headers,config){
				location.replace("/clientes/"+data.id);
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
		};
		$scope.limpiar = function(){
			document.getElementById("formularioCliente").reset();
		};
	}]);

})();



