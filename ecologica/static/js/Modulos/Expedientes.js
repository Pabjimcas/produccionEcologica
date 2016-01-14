(function(){
	
	var expediente = angular.module('Expedientes',["ui.bootstrap", "ngCookies","ngResource"]);
	var expedienteId = 0; 

	expediente.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';
	}]);
	
	expediente.config(function ($interpolateProvider) {
			$interpolateProvider.startSymbol("[[");
			$interpolateProvider.endSymbol("]]");
		}
	);
	
	function validateDNI(dni)
	{
		var lockup = 'TRWAGMYFPDXBNJZSQVHLCKE';
		var valueDni=dni.substr(0,dni.length-1);
		var letra=dni.substr(dni.length-1,1).toUpperCase();

		if(lockup.charAt(valueDni % 23)==letra)
			return true;
		return false;
	};

	var expresion_regular_dni = /^[XYZ]?\d{5,8}[A-Z]$/;
	var expresion_regular_cif = /^[ABCDEFGHJNPQRSUVW]{1}/;
	expediente.directive('nifcif', function() {
	return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.nifcif = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

		if(expresion_regular_cif.test(viewValue)){
			return true;
		}else if(expresion_regular_dni.test(viewValue)){
			return validateDNI(viewValue);
		}else{
			return false;
		}
      };
    }
  };
});
	

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


	expediente.controller("ArchivoSipea",['$http','$log','$scope',function($http,$log,$scope){
		
		var datos = [];
		var errores = [];
		$scope.cargando = "Cargando datos, espere!";
		$scope.inicia = function(){
			$log.log("Inicio")
			$http.get('/api/clientes/').success(function(dato){
				datos = dato;
				$scope.cargando = "Listo!";
				document.getElementById("aeco").className="list-group-item list-group-item-success";
				document.getElementById("ganad").className="list-group-item list-group-item-warning";
			});
		};
		var arrayIds = [];
		
		function descargarArchivo(contenidoEnBlob, nombreArchivo,existError) {
			
			var reader = new FileReader();
			reader.onload = function (event) {
				var save = document.createElement('a');
				save.href = event.target.result;
				save.target = '_blank';
				save.download = nombreArchivo || 'archivo.dat';
				var clicEvent = new MouseEvent('click', {
					'view': window,
						'bubbles': true,
						'cancelable': true
				});
				save.dispatchEvent(clicEvent);
				(window.URL || window.webkitURL).revokeObjectURL(save.href);
			};
			reader.readAsDataURL(contenidoEnBlob);
			
		};
		
		function transformaFecha(fecha){
			return fecha.substring(8,10)+""+fecha.substring(5,7)+""+fecha.substring(0,4);
		};
		
		function limpiar(text){
      text = text.replace(/[Á]/, 'A');
      text = text.replace(/[É]/, 'E');
      text = text.replace(/[Í]/, 'I');
      text = text.replace(/[Ó]/, 'O');
      text = text.replace(/[Ú]/, 'U');
      text = text.replace(/[Ñ]/, 'N');
	  text = text.replace(/[á]/, 'a');
	   text = text.replace(/[à]/, 'a');
      text = text.replace(/[é]/, 'e');
      text = text.replace(/[í]/, 'i');
      text = text.replace(/[ó]/, 'o');
      text = text.replace(/[ú]/, 'u');
      text = text.replace(/[ñ]/, 'n');
      return text;
   }
		
		
		function generarTexto() {
			var texto =[];
			var lines ="";
			
			for(i=0;i<datos.length;i++){
				expedientes = datos[i].expedientes;
				for(j=0;j<expedientes.length;j++){
					if(expedientes[j].tipoAgricultura == 'AE'){
					parcelas=expedientes[j].parcelas;
					for(x=0;x<parcelas.length;x++){
						var idnif= 0;
						var idContnif= 0;
						if (parcelas[x].ag_eco=="SI"){
						if (validateDNI(datos[i].nifcif)){
							texto.push(1);
							idnif=1;
						}else{
							texto.push(2);
							idnif=2;
						}
						if(idnif==1){
							if(datos[i].Apellido1=="" || datos[i].Apellido1==null){
								errores.push({tipo: "cliente",Nombre: datos[i].Nombre ,id: datos[i].id,error: "Falta Primer Apellido"});
								break;
							}
							if(datos[i].Apellido2=="" || datos[i].Apellido2==null){
								errores.push({tipo: "cliente",Nombre: datos[i].Nombre ,id: datos[i].id,error: "Falta Segundo Apellido"});
								break;
							}
						}
						if(expedientes[j].contacto.length == 0){
							errores.push({tipo:"expediente",codExp: datos[i].expedientes[j].CodOperador,id: datos[i].expedientes[j].id,error: "Falta Contacto"});
							break;
						}
						if(expedientes[j].contacto[0].Apellido1 == "" || expedientes[j].contacto[0].Apellido1 == null){
							errores.push({tipo:"expediente",codExp: datos[i].expedientes[j].CodOperador,id: datos[i].expedientes[j].id,error: "Falta Primer Apellido Contacto"});
							break;
						}
						if(expedientes[j].contacto[0].Apellido2 == "" || expedientes[j].contacto[0].Apellido2 == null){
							errores.push({tipo:"expediente",codExp: datos[i].expedientes[j].CodOperador,id: datos[i].expedientes[j].id,error: "Falta Segundo Apellido Contacto"});
							break;
						}
						if(parseInt(parcelas[x].poligono) == 0){
							errores.push({tipo:"parcela", codExp: datos[i].expedientes[j].CodOperador,id: parcelas[x].id,error: "El polígono no puede ser cero"});
							break;
						}
						if(parseInt(parcelas[x].parcela) == 0){
							errores.push({tipo:"parcela", codExp: datos[i].expedientes[j].CodOperador,id: parcelas[x].id,error: "La parcela no puede ser cero"});
						}
						if(parseInt(parcelas[x].recinto) == 0){
							errores.push({tipo:"parcela", codExp: datos[i].expedientes[j].CodOperador,id: parcelas[x].id,error: "El recinto no puede ser cero"});
						}
						texto.push("|");
						texto.push(datos[i].nifcif);
						texto.push("|");
						texto.push(limpiar(datos[i].Nombre.toUpperCase()));
						texto.push("|");
						texto.push(limpiar(datos[i].Apellido1.toUpperCase()));
						texto.push("|");
						texto.push(limpiar(datos[i].Apellido2.toUpperCase()));
						texto.push("|");
						texto.push(expedientes[j].CodSipea);
						texto.push("|");
						texto.push(expedientes[j].CodOperador);
						texto.push("|");
						texto.push(datos[i].Genero);
						texto.push("|");
						texto.push(expedientes[j].formaJ);
						texto.push("|");
						texto.push(datos[i].Telefono1);
						texto.push("|");
						texto.push(datos[i].Telefono2);
						texto.push("|");
						texto.push(datos[i].Fax);
						texto.push("|");
						texto.push(limpiar(datos[i].Email));
						texto.push("|");
						texto.push(datos[i].Web);
						texto.push("|");
						texto.push(datos[i].codprov.substring(1,3));
						texto.push("|");
						texto.push(limpiar(datos[i].prov.toUpperCase()));
						texto.push("|");
						texto.push(datos[i].codmun);
						texto.push("|");
						texto.push(limpiar(datos[i].mun));
						texto.push("|");
						texto.push(limpiar(datos[i].Domicilio));
						texto.push("|");
						texto.push(datos[i].CP);
						texto.push("|");
						texto.push(transformaFecha(expedientes[j].Fecha_recepcion));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].nif);
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Nombre.toUpperCase()));
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Apellido1.toUpperCase()));
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Apellido2.toUpperCase()));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].Genero);
						texto.push("|");
						texto.push(expedientes[j].contacto[0].Telefono1);
						texto.push("|");
						texto.push(expedientes[j].contacto[0].Telefono2);
						texto.push("|");
						texto.push(expedientes[j].contacto[0].Fax);
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Email));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].codprov.substring(1,3));
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].prov.toUpperCase()));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].codmun);
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].mun));
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Domicilio));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].CP);
						texto.push("|");
						texto.push(transformaFecha(expedientes[j].Fecha_aecologica));
						texto.push("|");
						texto.push(expedientes[j].Estado);
						texto.push("|");
						if(expedientes[j].Estado == "BAJA"){
							texto.push(transformaFecha(expedientes[j].F_baja));
						}
						texto.push("|");
						texto.push(expedientes[j].con_actividad);
						texto.push("|");
						if(expedientes[j].con_actividad == "NO"){
							texto.push(transformaFecha(expedientes[j].F_cese_activ));
						}
						texto.push("|");
						texto.push(parcelas[x].codprov.substring(1,3));
						texto.push("|");
						texto.push(limpiar(parcelas[x].prov.toUpperCase()));
						texto.push("|");
						texto.push(parcelas[x].codmun);
						texto.push("|");
						texto.push(limpiar(parcelas[x].mun));
						texto.push("|");

						texto.push(parcelas[x].poligono);
						texto.push("|");
						
						texto.push(parcelas[x].parcela);
						texto.push("|");
						
						texto.push(parcelas[x].recinto);
						texto.push("|");
						superficie = parseInt((parcelas[x].superficie_hectareas)*100)
						texto.push(superficie);
						texto.push("|");
						texto.push(parcelas[x].sr);
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].f_ag_ec_rec));
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].f_control));
						texto.push("|");
						texto.push(parcelas[x].Estado);
						texto.push("|");
						if(parcelas[x].Estado == "BAJA"){
							texto.push(transformaFecha(parcelas[x].F_baja_rec));
						}
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].f_control));
						texto.push("|");
						texto.push(parcelas[x].Calificacion);
						texto.push("|");
						if(expedientes[j].visitas.length > 0){
							texto.push(transformaFecha(expedientes[j].visitas[expedientes[j].visitas.length - 1].f_visita));
						}
						texto.push("|");
						texto.push(parcelas[x].codactgen);
						texto.push("|");
						texto.push(limpiar(parcelas[x].actgen));
						texto.push("|");
						texto.push(parcelas[x].codcultivo);
						texto.push("|");
						texto.push(limpiar(parcelas[x].cultivo));
						texto.push("|");
						if(parcelas[x].codvari != "0"){
							texto.push(parcelas[x].codvari);
							texto.push("|");
							texto.push(limpiar(parcelas[x].vari));
							texto.push("|");
						}else{
							texto.push("|");
							texto.push("|");
						}
						if(parcelas[x].vigente == "SI"){
							texto.push(expedientes[j].idDocumento);
						}
						texto.push("|");
						texto.push(parcelas[x].cosecha_anual);
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].F_altaProducto));
						texto.push("|");
						if(parcelas[x].productoCambiado == "SI"){
							texto.push(transformaFecha(parcelas[x].F_bajaProducto));
							arrayIds.push(parcelas[x].id);
						}
						texto.push("|");
						
						if(parcelas[x].vigente == "SI"){
							texto.push(transformaFecha(expedientes[j].F_iniciovigencia));
							texto.push("|");
							texto.push(transformaFecha(expedientes[j].F_finalvigencia));
						}else{
							texto.push("|");
						}
						
						if (! (i == (datos.length -1) && j == (expedientes.length -1) && x == (parcelas.length -1))){
							texto.push("\r\n");
						}
					}
					}
					}
				}
			}
			texto.pop()
			//El contructor de Blob requiere un Array en el primer parámetro
			//así que no es necesario usar toString. el segundo parámetro
			//es el tipo MIME del archivo
			return new Blob(texto, {
				type: 'text/plain; charset=windows-1252'
			});
		};
		
		function generarTextoGA() {
			var texto =[];
			var lines ="";
			
			for(i=0;i<datos.length;i++){
				expedientes = datos[i].expedientes;
				for(j=0;j<expedientes.length;j++){
					if(expedientes[j].tipoAgricultura == 'GA'){
					parcelas=expedientes[j].parcelasGanado;
					for(x=0;x<parcelas.length;x++){
						var idnif= 0;
						var idContnif= 0;
						if (parcelas[x].ag_eco=="SI"){
						if (validateDNI(datos[i].nifcif)){
							texto.push(1);
							idnif=1;
						}else{
							texto.push(2);
							idnif=2;
						}
						if(idnif==1){
							if(datos[i].Apellido1=="" || datos[i].Apellido1==null){
								errores.push({tipo: "cliente",Nombre: datos[i].Nombre ,id: datos[i].id,error: "Falta Primer Apellido"});
								break;
							}
							if(datos[i].Apellido2=="" || datos[i].Apellido2==null){
								errores.push({tipo: "cliente",Nombre: datos[i].Nombre ,id: datos[i].id,error: "Falta Segundo Apellido"});
								break;
							}
						}
						if(expedientes[j].contacto.length == 0){
							errores.push({tipo:"expediente",codExp: datos[i].expedientes[j].CodOperador,id: datos[i].expedientes[j].id,error: "Falta Contacto"});
							break;
						}
						if(expedientes[j].contacto[0].Apellido1 == "" || expedientes[j].contacto[0].Apellido1 == null){
							errores.push({tipo:"expediente",codExp: datos[i].expedientes[j].CodOperador,id: datos[i].expedientes[j].id,error: "Falta Primer Apellido Contacto"});
							break;
						}
						if(expedientes[j].contacto[0].Apellido2 == "" || expedientes[j].contacto[0].Apellido2 == null){
							errores.push({tipo:"expediente",codExp: datos[i].expedientes[j].CodOperador,id: datos[i].expedientes[j].id,error: "Falta Segundo Apellido Contacto"});
							break;
						}
						if(parseInt(parcelas[x].poligono) == 0){
							errores.push({tipo:"parcela", codExp: datos[i].expedientes[j].CodOperador,id: parcelas[x].id,error: "El polígono no puede ser cero"});
							break;
						}
						if(parseInt(parcelas[x].parcela) == 0){
							errores.push({tipo:"parcela", codExp: datos[i].expedientes[j].CodOperador,id: parcelas[x].id,error: "La parcela no puede ser cero"});
						}
						if(parseInt(parcelas[x].recinto) == 0){
							errores.push({tipo:"parcela", codExp: datos[i].expedientes[j].CodOperador,id: parcelas[x].id,error: "El recinto no puede ser cero"});
						}
						texto.push("|");
						texto.push(datos[i].nifcif);
						texto.push("|");
						texto.push(limpiar(datos[i].Nombre.toUpperCase()));
						texto.push("|");
						texto.push(limpiar(datos[i].Apellido1.toUpperCase()));
						texto.push("|");
						texto.push(limpiar(datos[i].Apellido2.toUpperCase()));
						texto.push("|");
						texto.push(expedientes[j].CodSipea);
						texto.push("|");
						texto.push(expedientes[j].CodOperador);
						texto.push("|");
						texto.push(datos[i].Genero);
						texto.push("|");
						texto.push(expedientes[j].formaJ);
						texto.push("|");
						texto.push(datos[i].Telefono1);
						texto.push("|");
						texto.push(datos[i].Telefono2);
						texto.push("|");
						texto.push(datos[i].Fax);
						texto.push("|");
						texto.push(limpiar(datos[i].Email));
						texto.push("|");
						texto.push(datos[i].Web);
						texto.push("|");
						texto.push(datos[i].codprov.substring(1,3));
						texto.push("|");
						texto.push(limpiar(datos[i].prov.toUpperCase()));
						texto.push("|");
						texto.push(datos[i].codmun);
						texto.push("|");
						texto.push(limpiar(datos[i].mun));
						texto.push("|");
						texto.push(limpiar(datos[i].Domicilio));
						texto.push("|");
						texto.push(datos[i].CP);
						texto.push("|");
						texto.push(transformaFecha(expedientes[j].Fecha_recepcion));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].nif);
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Nombre.toUpperCase()));
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Apellido1.toUpperCase()));
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Apellido2.toUpperCase()));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].Genero);
						texto.push("|");
						texto.push(expedientes[j].contacto[0].Telefono1);
						texto.push("|");
						texto.push(expedientes[j].contacto[0].Telefono2);
						texto.push("|");
						texto.push(expedientes[j].contacto[0].Fax);
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Email));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].codprov.substring(1,3));
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].prov.toUpperCase()));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].codmun);
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].mun));
						texto.push("|");
						texto.push(limpiar(expedientes[j].contacto[0].Domicilio));
						texto.push("|");
						texto.push(expedientes[j].contacto[0].CP);
						texto.push("|");
						texto.push(transformaFecha(expedientes[j].Fecha_aecologica));
						texto.push("|");
						texto.push(expedientes[j].Estado);
						texto.push("|");
						if(expedientes[j].Estado == "BAJA"){
							texto.push(transformaFecha(expedientes[j].F_baja));
						}
						texto.push("|");
						texto.push(expedientes[j].con_actividad);
						texto.push("|");
						if(expedientes[j].con_actividad == "NO"){
							texto.push(transformaFecha(expedientes[j].F_cese_activ));
						}
						texto.push("|");
						texto.push(parcelas[x].codprov.substring(1,3));
						texto.push("|");
						texto.push(limpiar(parcelas[x].prov.toUpperCase()));
						texto.push("|");
						texto.push(parcelas[x].codmun);
						texto.push("|");
						texto.push(limpiar(parcelas[x].mun));
						texto.push("|");

						texto.push(parcelas[x].poligono);
						texto.push("|");
						
						texto.push(parcelas[x].parcela);
						texto.push("|");
						
						texto.push(parcelas[x].recinto);
						texto.push("|");
						superficie = parseInt((parcelas[x].superficie_hectareas)*100)
						texto.push(superficie);
						texto.push("|");
						texto.push(parcelas[x].sr);
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].f_ag_ec_rec));
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].f_control));
						texto.push("|");
						texto.push(parcelas[x].Estado);
						texto.push("|");
						if(parcelas[x].Estado == "BAJA"){
							texto.push(transformaFecha(parcelas[x].F_baja_rec));
						}
						texto.push("|");
						texto.push(parcelas[x].codExplotREGA);
						texto.push("|");
						texto.push(parcelas[x].grupoCultivo);
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].F_calificacion));
						texto.push("|");
						texto.push(parcelas[x].Calificacion);
						texto.push("|");
						if(expedientes[j].visitas.length > 0){
							texto.push(transformaFecha(expedientes[j].visitas[expedientes[j].visitas.length - 1].f_visita));
						}
						texto.push("|");
						texto.push(parcelas[x].codactgen);
						texto.push("|");
						texto.push(limpiar(parcelas[x].actgen));
						texto.push("|");
						texto.push(parcelas[x].codOrientacion);
						texto.push("|");
						texto.push(limpiar(parcelas[x].Orientacion));
						texto.push("|");
						texto.push(limpiar(parcelas[x].raza));
						texto.push("|");
						texto.push(parcelas[x].animales);
						texto.push("|");
						texto.push(parcelas[x].regApicola);
						texto.push("|");
						texto.push(parcelas[x].regAcuicola);
						texto.push("|");
						tip = parcelas[x].tipoAcuicola;
						if(tip == 0){
							tip = "";
						}
						texto.push(tip);
						texto.push("|");
						texto.push(parcelas[x].utmX);
						texto.push("|");
						texto.push(parcelas[x].utmY);
						texto.push("|");
						if(parcelas[x].vigente == "SI"){
							texto.push(expedientes[j].idDocumento);
						}
						texto.push("|");
						texto.push(parcelas[x].produccion);
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].F_altaProducto));
						texto.push("|");
						if(parcelas[x].productoCambiado == "SI"){
							texto.push(transformaFecha(parcelas[x].F_bajaProducto));
							arrayIds.push(parcelas[x].id);
						}
						texto.push("|");
						
						if(parcelas[x].vigente == "SI"){
							texto.push(transformaFecha(expedientes[j].F_iniciovigencia));
							texto.push("|");
							texto.push(transformaFecha(expedientes[j].F_finalvigencia));
						}else{
							texto.push("|");
						}
						
						if (! (i == (datos.length -1) && j == (expedientes.length -1) && x == (parcelas.length -1))){
							texto.push("\r\n");
						}
					}
					}
					}
				}
			}
			texto.pop()
			//El contructor de Blob requiere un Array en el primer parámetro
			//así que no es necesario usar toString. el segundo parámetro
			//es el tipo MIME del archivo
			return new Blob(texto, {
				type: 'text/plain; charset=windows-1252'
			});
		};
		
		function actualizaDatos(array){
		
			
			for(i =0; i< array.length; i++){
				var parId = array[i];
				$http.get('/api/Parcela/'+parId).success(function(dato){
					parcela = {provincia: dato.provincia, municipio: dato.municipio, poligono: dato.poligono,
								parcela: dato.parcela, recinto: dato.recinto,superficie_hectareas: dato.superficie_hectareas,
								prod_ag: dato.prod_ag, variedad: dato.variedad,sr: dato.sr,f_ag_ec_rec: dato.f_ag_ec_rec,f_control: dato.f_control,
								Estado: dato.Estado,F_baja_rec: dato.F_baja_rec,F_calificacion: dato.F_calificacion,
								Calificacion: dato.Calificacion,declar_pac: dato.declar_pac, cosecha_anual: dato.cosecha_anual,
								F_altaProducto: dato.F_altaProducto, F_bajaProducto: dato.F_bajaProducto, F_iniciovigencia: dato.F_iniciovigencia,
								F_finalvigencia: dato.F_finalvigencia,expediente: dato.expediente,ag_eco: dato.ag_eco,
								vigente: dato.vigente,haestadovigente: dato.haestadovigente,productoCambiado : "NO"};
					$http.put('/api/Parcela/'+parId,parcela).
						success(function(data,status,headers,config){

						}).
						error(function(data,status,headers,config){
							$log.log(data);
						});
				});
			}
		}
		
		$scope.generaTxt = function(tipo){
			var fechahoy = new Date();
			var nombreArchivo = "SIPEA_"+tipo+"_"+fechahoy.getDate()+"_"+String(parseInt(fechahoy.getMonth()) +1)+"_"+fechahoy.getFullYear();
			if(tipo == 'AE'){
				texto = generarTexto();
				actualizaDatos(arrayIds);
			}else if(tipo == 'GA'){
				texto = generarTextoGA();
			}
			
			if(errores.length > 0){
				if(errores[0].tipo == "cliente"){
					if (confirm(errores[0].Nombre+": "+errores[0].error) == true) {
						location.replace("/clientes/"+errores[0].id);
					}
				}else if (errores[0].tipo == "expediente"){
					if (confirm(errores[0].codExp+": "+errores[0].error) == true) {
						location.replace("/expedientes/"+errores[0].id);
					}
				}else if (errores[0].tipo == "parcela"){
					if (confirm(errores[0].codExp+": "+errores[0].error) == true) {
						location.replace("/parcelas/"+errores[0].id);
					}
				}
			}else{
				descargarArchivo(texto, nombreArchivo+'.txt');
			}
			while(arrayIds.length > 0) {
				arrayIds.pop();
			}
			$http.get('/api/RecolectorParcelas/').success(function(dato){
			
				for (i=0; i<dato.length; i++){
					$http.delete('/api/RecolectorParcelas/'+dato[i].id);
				}
			});
		};
		
		
	}]);
	
	
	
	expediente.controller("PanelController",function(){
		this.tab = 1;
		
		this.selectTab = function(setTab){
			this.tab = setTab;
		};
		this.isSelected = function(checkTab){
			return this.tab === checkTab;
		};

	});
	
	expediente.controller("RiesgoController",['$http','$log','$scope',function($http,$log,$scope){
		document.getElementById("myBtn").disabled = true;
		
		$scope.inicia = function(idExp){
			$http.get('/api/expedientes/'+idExp).success(function(dato){
				$scope.evaluaciones = dato.riesgo;
			});
		};
		
		$scope.puntuacion = 0;
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
				cont += 4;
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
		$scope.fecha = function(fechaIni){
			return fechaIni.substring(8,10)+"/"+fechaIni.substring(5,7)+"/"+fechaIni.substring(0,4);
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
	}]);
	
	expediente.controller("ExpedienteCliente",['$http','$log','$scope',function($http,$log,$scope){
	
		var aux = false;
		$scope.compruebaEstado = function(dato){
			if(dato == "ALTA"){
				aux = true;
			}else if(dato == "BAJA"){
				aux = false;
			}
			$scope.activo=aux;
		};
		
		
	}]);
	
	
	expediente.controller("ListaExpedientes",['$http','$log','$scope',function($http,$log,$scope){

		$scope.inicializa2 = function(idCliente){
			$http.get('/api/clientes/'+idCliente).success(function(dato){
				$scope.expedientes = dato.expedientes;
			});
		};
		
		tab = 1;
		
		this.selectTab = function(setTab){
			tab = setTab;
		};
		this.isSelected = function(checkTab){
			return tab === checkTab;
		};
		
		$scope.filtraTabla = function(){
			var filtro = $scope.filtro;
			if(filtro != ""){
				 $(".expedientesTabla td").parent().hide();
				 $(".expedientesTabla td:contains("+filtro+")").parent().show();
				 $(".expedientesTabla td:contains("+filtro.toUpperCase()+")").parent().show();
				 $(".expedientesTabla td:contains("+filtro[0].toUpperCase() + filtro.slice(1)+")").parent().show();

			}else{
				 $(".expedientesTabla td").parent().show();
			}
		}
		
		

	}]);
	
	expediente.controller("CreaCliente",['$http','$log','$scope',function($http,$log,$scope){

		var provincias = [];
		var municipios = [];
		
		$scope.cliente = {nifcif: '',nombre: '',apellido1: '',apellido2: '',gen: 'X',
		tel1: '',tel2:'',fax: '',email:'',web:'', domicilio:'',cp:''};
		
		$scope.inicia = function(){
			$http.get('/api/provincias/').
				success(function(data){
					for (i = 0; i < data.length; i++){
						provincias.push(data[i]);
						for (j = 0; j < data[i].municipios.length; j++){
							municipios.push(data[i].municipios[j]);
						}
					}
					$scope.provincias = provincias;
					$scope.municipios = municipios;
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		
		$scope.guardar = function(){
			
			if($scope.tipoCuenta == 'IBAN'){
				ibn = $scope.client.Cuent1+$scope.client.Cuent2+$scope.client.Cuent3+$scope.client.Cuent4+$scope.client.Cuent5;
				esiban = $scope.client.esiban;
			}else{
				esiban = '';
				ibn = $scope.client.Cuent1+$scope.client.Cuent2+$scope.client.Cuent6+$scope.client.Cuent7;
			}
			fsepa = document.getElementById("F_sepa").value;
			if (fsepa == '' || fsepa == null){
				fsepa = null;
			}
			
			$http.post('/api/clientes/',{nifcif:$scope.cliente.nifcif, Nombre: $scope.cliente.nombre, Apellido1: $scope.cliente.apellido1,
			Apellido2: $scope.cliente.apellido2, Genero: $scope.cliente.gen, Telefono1: $scope.cliente.tel1, Telefono2: $scope.cliente.tel2,
			Fax: $scope.cliente.fax, Email: $scope.cliente.email, Web: $scope.cliente.web, Domicilio: $scope.cliente.domicilio, CP: $scope.cliente.cp,
			Provincia: $scope.provinciaSeleccionada, Municipio: $scope.municipioSeleccionado,esiban: esiban, iban: ibn,F_sepa: fsepa,p_recur: $scope.formPago}).
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
	
	
	expediente.controller("CreaInspector",['$http','$log','$scope',function($http,$log,$scope){
		
		$scope.inspector = {nifcif: '',nombre: '',apellido1: '',apellido2: '',tel1: '',tel2:''};

		$scope.guardar = function(){
			$http.post('/api/Inspector/',{nif:$scope.inspector.nifcif, Nombre: $scope.inspector.nombre, Apellido1: $scope.inspector.apellido1,
			Apellido2: $scope.inspector.apellido2, Telefono1: $scope.inspector.tel1, Telefono2: $scope.inspector.tel2}).
			success(function(data,status,headers,config){
				location.replace("/inspectores");

			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
		};
		$scope.limpiar = function(){
			document.getElementById("formularioInspector").reset();
		};
		
		
		
		

	}]);
	
	expediente.controller("CreaContacto",['$http','$log','$scope',function($http,$log,$scope){

		var provincias = [];
		var municipios = [];
		var contactos = [];
		var conid = 0;
		var visid = 0;
		var provi = 0;
		var muni = 0;
		
		$scope.contacto = {nif: '',nombre: '',apellido1: '',apellido2: '',gen: 'X',
		tel1: '',tel2:'',fax: '',email:'', domicilio:'',cp:''};

		
		$scope.inicia = function(){
			$http.get('/api/provincias/').
				success(function(data){
					for (i = 0; i < data.length; i++){
						provincias.push(data[i]);
						for (j = 0; j < data[i].municipios.length; j++){
							municipios.push(data[i].municipios[j]);
						}
					}
					$scope.provincias = provincias;
					$scope.municipios = municipios;
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
				contactos.push(data);
				$scope.contactos = contactos;
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
			
			
		};
		
		
		
		$scope.guardarContacto = function(){		
			cont = {nif: $scope.contacto.nif, Nombre: $scope.contacto.nombre,
			Apellido1: $scope.contacto.apellido1, Apellido2: $scope.contacto.apellido2, Genero: $scope.contacto.gen,
			Telefono1: $scope.contacto.tel1, Telefono2: $scope.contacto.tel2, Fax: $scope.contacto.fax, Email: $scope.contacto.email,
			Provincia: $scope.provinciaSeleccionada, Municipio: $scope.municipioSeleccionado,Domicilio: $scope.contacto.domicilio,CP: $scope.contacto.cp,
			id_operador: expedienteId};
			$http.post('/api/contacto/',cont).
			success(function(data,status,headers,config){
				contactos.push(data);
				$scope.contactos = contactos;
				//document.getElementById("formularioContacto").reset();
				$scope.siguiente2 = true;
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
			
			
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
		
		$scope.cancelar = function(){
			$scope.modificaContacto = false;
			$scope.modificaContacto2 = false;
			//document.getElementById("formularioContacto").reset();			
		};
		
		$scope.guardarContacto2 = function(idExp){
			
			cont = {nif: $scope.contacto.nif, Nombre: $scope.contacto.nombre,
			Apellido1: $scope.contacto.apellido1, Apellido2: $scope.contacto.apellido2, Genero: $scope.contacto.gen,
			Telefono1: $scope.contacto.tel1, Telefono2: $scope.contacto.tel2, Fax: $scope.contacto.fax, Email: $scope.contacto.email,
			Provincia: $scope.provinciaSeleccionada, Municipio: $scope.municipioSeleccionado,Domicilio: $scope.contacto.domicilio,CP: $scope.contacto.cp,
			id_operador: idExp};
			$http.post('/api/contacto/',cont).
			success(function(data,status,headers,config){
				contactos = $scope.contactos;
				contactos.push(data);
				$scope.contactos = contactos;
				//document.getElementById("formularioContacto").reset();
				$scope.siguiente2 = true;
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
			
			
		};
		$scope.modificaContact = function(){
			prov = $scope.provinciaSeleccionada;
			mun =  $scope.municipioSeleccionado;
			idContacto = conid;
			
			cont = {nif: $scope.contacto.nif, Nombre: $scope.contacto.nombre,
			Apellido1: $scope.contacto.apellido1, Apellido2: $scope.contacto.apellido2, Genero: $scope.contacto.gen,
			Telefono1: $scope.contacto.tel1, Telefono2: $scope.contacto.tel2, Fax: $scope.contacto.fax, Email: $scope.contacto.email,
			Provincia: prov, Municipio: mun,Domicilio: $scope.contacto.domicilio,CP: $scope.contacto.cp,
			id_operador: expedienteId};
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
					$log.log("Eliminado")
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
		
		
		
		
		
		

	}]);
	
	
	
	expediente.controller("ListaInspectores",['$http','$log','$scope',function($http,$log,$scope){

		$scope.inicializa = function(){
			$http.get('/api/Inspector/').success(function(dato){
				$scope.inspectores= dato;
			});
		};

	}]);
	
	expediente.controller("CreaInterlocutor",['$http','$log','$scope',function($http,$log,$scope){
		var interlocutores = [];
		$scope.interlocutores = [];
		$scope.inter = {nif: '',nombre: '',tel1: '',tel2:'',email:''};
		
		$scope.guardarInterloc1 = function(){
			inter = {nif: $scope.inter.nif, Nombre: $scope.inter.nombre,
			TelefonoFijo: $scope.inter.tel1, TelefonoMovil: $scope.inter.tel2,Email: $scope.inter.email,
			AtiendeVisita: $scope.atvis, FirmaVisita: $scope.firvis,
			idExpediente: expedienteId};
			$http.post('/api/interlocutor/',inter).
			success(function(data,status,headers,config){
				interlocutores = $scope.interlocutores;
				$log.log(interlocutores);
				interlocutores.push(data);
				$scope.interlocutores = interlocutores
				$scope.siguiente3 = false;
				$log.log("Creado");
			}).
			error(function(data,status,headers,config){
				$log.log(data);
			});
			
		};
		
		$scope.guardarInterloc2 = function(){
			$http.get('/api/contacto/'+$scope.contint).
				success(function(data){
					inter = {nif: data.nif, Nombre: data.Nombre,
			TelefonoFijo: data.Telefono2, TelefonoMovil: data.Telefono1,Email: data.Email,
			AtiendeVisita: $scope.atvis2, FirmaVisita: $scope.firvis2,
			idExpediente: expedienteId};
			$http.post('/api/interlocutor/',inter).
			success(function(data,status,headers,config){
				interlocutores = $scope.interlocutores;
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
		
		$scope.modificaInterlocut2 = function(){
		
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
			idExpediente: expedienteId};
			$http.put('/api/interlocutor/'+idInterlocutor,inter).
			success(function(data,status,headers,config){
				interlocutores = $scope.interlocutores;
				
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
		
	
	}]);
	
	
	
	expediente.controller("Contacto",['$http','$log','$scope',function($http,$log,$scope){
		
		$scope.inicializaContacto = function(data,data2){
				
				
				$http.get('/api/provincias/'+data).success(function(dato2){
					$scope.Provincia = dato2.Provincia;
					
					for (i = 0; i < dato2.municipios.length; i++){
						if (dato2.municipios[i].id == data2){
							
							$scope.Municipio = dato2.municipios[i].Municipio;
							break;
						}
					}
				
				});

		};
	}]);
	
	expediente.controller("Cliente",['$http','$log','$scope',function($http,$log,$scope){
			
		$scope.modifica = false;
		$scope.inicializaCliente = function(idCliente){
			$http.get('/api/clientes/'+idCliente).success(function(dato){
				$scope.client = dato;
				$scope.provinciaSeleccionada = dato.Provincia;
				$scope.municipioSeleccionado = dato.Municipio;
				if(dato.esiban){
					$scope.tipoCuenta = "IBAN";
					$scope.client.Cuent3 = dato.iban.substring(8,12);
					$scope.client.Cuent4 = dato.iban.substring(12,16);
					$scope.client.Cuent5 = dato.iban.substring(16,20);
				}else{
					$scope.tipoCuenta = "CCC";
					$scope.client.Cuent6 = dato.iban.substring(8,10);
					$scope.client.Cuent7 = dato.iban.substring(10,20);
				}
				$scope.client.Cuent1 = dato.iban.substring(0,4);
				$scope.client.Cuent2 = dato.iban.substring(4,8);
				$scope.gen = dato.Genero;
				$scope.formPago= dato.p_recur;
				$scope.F_sepa = new Date(dato.F_sepa);
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
			if($scope.tipoCuenta == 'IBAN'){
				ibn = $scope.client.Cuent1+$scope.client.Cuent2+$scope.client.Cuent3+$scope.client.Cuent4+$scope.client.Cuent5;
				esiban = $scope.client.esiban;
			}else{
				esiban = '';
				ibn = $scope.client.Cuent1+$scope.client.Cuent2+$scope.client.Cuent6+$scope.client.Cuent7;
			}
			fsepa = document.getElementById("F_sepa").value;
			if (fsepa == '' || fsepa == null){
				fsepa = null;
			}
			$http.put('/api/clientes/'+clienteid,{nifcif:$scope.client.nifcif, Nombre: $scope.client.Nombre, Apellido1: $scope.client.Apellido1,
			Apellido2: $scope.client.Apellido2, Genero: $scope.gen, Telefono1: $scope.client.Telefono1, Telefono2: $scope.client.Telefono2,
			Fax: $scope.client.Fax, Email: $scope.client.Email, Web: $scope.client.Web, Domicilio: $scope.client.Domicilio, CP: $scope.client.CP,
			Provincia: provSel, Municipio: munSel,iban: ibn, esiban : esiban,F_sepa:fsepa ,p_recur:$scope.formPago}).
				success(function(data,status,headers,config){
					location.reload();
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
	}]);
	

	
	
	expediente.controller("Expediente",['$http','$log','$scope',function($http,$log,$scope){
		
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
		
		$scope.parcela = {eco: 'SI',poligono: '',parcela: '',recinto: '',superficie: '',dpac: 'SI',estado: 'ALTA',cosecha: '0',calificacion: 1,fcalif: fechaHoy};

		$scope.inicializaExpediente = function(idExpediente,tipo){
		

				$http.get('/api/expedientes/'+idExpediente).success(function(dato){
					var estad = dato.Estado;
					var activ = dato.con_actividad;
					var fechahoy = new Date();
					
					day = fechahoy.getDate();
					if(day.toString().length < 2){
						day = "0"+day.toString();
					}
					
					$scope.finscri = dato.Fecha_aecologica;
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
					fini = dato.F_iniciovigencia;
					ffin = dato.F_finalvigencia;
					fechaHoy = new Date();
					fechaVigencia = new Date(ffin);

					
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
					
					if(tipo == 'AE'){
						datosparcelas = dato.parcelas;
					}else if(tipo == 'GA'){
						datosparcelas = dato.parcelasGanado;
					}
				
				$scope.parcelas = datosparcelas;
				parcelas = datosparcelas;
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
				
				$scope.facturas = dato.facturacion;
				
				
			});
				
			$http.get('/api/municipios').success(function(dato){	
				$scope.municipios = dato;
			});
			
			$http.get('/api/ProductoAgricola').success(function(dato){	
				$scope.cultivos = dato;
			});
			$http.get('/api/ProductoGanaderia').success(function(dato){	
				$scope.orientaciones = dato;
			});
			$http.get('/api/Variedades').success(function(dato){
				$scope.variedad = dato;
			});
			
			$http.get('/api/RecolectorParcelas/').success(function(dato){	
				if (dato.length > 1){
					idRecolector = dato[dato.length -1].id;
				}
			});
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
			if (confirm("¿Desea eliminar esta parcela?") == true) {
				if(tipo == 'AE'){
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
				}else if(tipo == 'GA'){
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
				}
			} 
		};
		
		$scope.guardarParcela1 = function(fins,expId,tipoAg){
			
			finscrip = fins;
			
			if($scope.parcela.eco=="SI"){
				
				fcont = document.getElementById("fcontrol").value;
			}
			
			day3 = $scope.parcela.fcalif.getDate();
			if(day3.toString().length < 2){
				day3 = "0"+day3.toString();
			}
			fcal = $scope.parcela.fcalif.toJSON().substring(0,8)+day3;
			
			
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
									sr: sr,f_ag_ec_rec: finscrip,f_control: fcont, Estado: $scope.parcela.estado,F_baja_rec:fcal,
									F_calificacion: fcal,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac,F_altaProducto: finscrip,
									F_bajaProducto: fcal,expedienteGanado: expId,ag_eco: $scope.parcela.eco,codExplotREGA: codExplotREGA,grupoCultivo: gcult,
									raza: $scope.Raza,animales: $scope.animales, regApicola: $scope.regApicola, regAcuicola: $scope.regAcuicola,
									tipoAcuicola: tipoC,utmX: $scope.UtmX,utmY: $scope.UtmY,produccion: produccion,
									F_altaProducto: finscrip,F_bajaProducto: fcal,productoCambiado : "NO"};
								}else if($scope.parcela.eco=="NO"){
									parcela = {provincia: provi, municipio: muni, poligono: poli,
									parcela: parce, recinto: recin,superficie_hectareas: superf,prod_ag: producto,
									sr: 'S',f_ag_ec_rec: fcal,f_control: fcal, Estado: "BAJA",F_baja_rec:fcal,
									F_calificacion: fcal,Calificacion: "1",declar_pac: "NO",F_altaProducto: finscrip,
									F_bajaProducto: fcal,expedienteGanado: expId,ag_eco: $scope.parcela.eco,codExplotREGA: codExplotREGA,grupoCultivo: gcult,
									raza: $scope.Raza,animales: $scope.animales, regApicola: $scope.regApicola, regAcuicola: $scope.regAcuicola,
									tipoAcuicola: tipoC,utmX: $scope.UtmX,utmY: $scope.UtmY,produccion: produccion,
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
								variedad: vari,sr: sr,f_ag_ec_rec: finscrip,f_control: fcont, Estado: $scope.parcela.estado,F_baja_rec:fcal,
								F_calificacion: fcal,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac, cosecha_anual: $scope.parcela.cosecha,F_altaProducto: finscrip,
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
			});}
				
		};
		
		$scope.cambiaEstado = function(estbaja){
			if($scope.est == estbaja){
				return true;
			}
			return false;
		};
		
		$scope.cambiaActividad = function(actno){
			if($scope.act == actno){
				return true;
			}
			return false;
		};
		
		
		$scope.modificar = function(){
			$scope.nomodifica = false;
		};
		$scope.cancelarExp = function(){
			$scope.nomodifica = true;
		};
		
		$scope.guardar = function(exp,codExp,fj,fins,frecp,clienteid,idDocu){
		
				estad = document.getElementById("estado").value;
				activid = document.getElementById("actividad").value;
				var dbaja = document.getElementById("fbaja").value;

				var dfc = document.getElementById("fcact").value;
				$log.log(haestadovigente)
				f_ini = "";
				f_fin = "";
				docu = idDocu;
				
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

			$http.put('/api/expedientes/'+exp,{
				CodOperador: codExp, F_baja: dbaja,  F_cese_activ: dfc,F_juridica: fj, Fecha_recepcion: frecp, Fecha_aecologica: fins,
				Estado: estad, con_actividad: activid, aso_ag: as_ag, asociacion_agraria: asoc, s_cop: coop,
				cooperativa: cooperativa, info_contac1: pc1, com_ind: ind, industria: industria,
				info_contac2: pc2, entidadPac: PAC, info_contac3: pc3,id_cliente: clienteid,F_iniciovigencia:fini,
				F_finalvigencia: ffin,vigente: $scope.vigent,haestadovigente:$scope.haestadovigente,idDocumento: docu}).
				success(function(data,status,headers,config){
					location.reload();
				}).
				error(function(data,status,headers,config){
					$log.log(data);
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
		
		var interlocutores = [];
		$scope.interlocutores = [];
		$scope.inter = {nif: '',nombre: '',tel1: '',tel2:'',email:''};
		
		
		$scope.guardarInterloc3 = function(expid){
			inter = {nif: $scope.inter.nif, Nombre: $scope.inter.nombre,
			TelefonoFijo: $scope.inter.tel1, TelefonoMovil: $scope.inter.tel2,Email: $scope.inter.email,
			AtiendeVisita: $scope.atvis, FirmaVisita: $scope.firvis,
			idExpediente: expid};
			$http.post('/api/interlocutor/',inter).
			success(function(data,status,headers,config){
				interlocutores = $scope.interlocutores;
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
				interlocutores = $scope.interlocutores;
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
				interlocutores = $scope.interlocutores;
				
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
	}])
	
	
	expediente.controller("CreaParcela",['$http','$log','$scope',function($http,$log,$scope){
		
		
		$scope.iniciaParcela = function(){
			
			
			$http.get('/api/municipios').success(function(dato){	
				$scope.municipios = dato;
			});
			
		
			$http.get('/api/ProductoAgricola').success(function(dato){	
				$scope.cultivos = dato;
			});
			$http.get('/api/ProductoGanaderia').success(function(dato){	
				$scope.orientaciones = dato;
			});
			$http.get('/api/Variedades').success(function(dato){
				$scope.variedad = dato;
			});
			
			$http.get('/api/RecolectorParcelas/').success(function(dato){	
				idRecolector = dato[dato.length -1].id;
			});

		};
		$scope.superficie1 = 0;
		$scope.superficie2 = 0;
		superficie1 = 0;
		supericie2 = 0;
		parcelas = [];
		$scope.prodEco = function(){
			if($scope.eco == "SI"){
				return true;
			}
			return false;
		};
		
		$scope.eliminarParcela = function(parcelaid){
			var x;
			if (confirm("¿Desea eliminar esta parcela?") == true) {
				if($scope.tipoAgricultura == 'AE'){
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
				}else if($scope.tipoAgricultura == 'GA'){
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
				}
			} 
		};
		
		$scope.guardarParcela2 = function(){
		
			$log.log($scope.codigoExplotacion)
			day1 = $scope.fins.getDate();
			if(day1.toString().length < 2){
				day1 = "0"+day1.toString();
			}
			finscrip = $scope.fins.toJSON().substring(0,8)+day1;
			
			if($scope.parcela.eco=="SI"){
				day2 = $scope.fcontrol.getDate();
				if(day2.toString().length < 2){
					day2 = "0"+day2.toString();
				}
				fcont = $scope.fcontrol.toJSON().substring(0,8)+day2;
			}
			
			
			day3 = $scope.parcela.fcalif.getDate();
			if(day3.toString().length < 2){
				day3 = "0"+day3.toString();
			}
			fcal = $scope.parcela.fcalif.toJSON().substring(0,8)+day3;
			
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
			
			if($scope.tipoAgricultura == 'GA'){
				$http.get('/api/ProductoGanaderia').success(function(dato){
					for(i=0;i<dato.length; i++){
						if(dato[i].Actividad == $scope.ActGen2){
							if(dato[i].CodProducto == $scope.productoGan){
								producto = dato[i].id;
								$log.log($scope.tipoAcuicola)
								if($scope.parcela.eco=="SI"){
									parcela = {provincia: $scope.provSelecionada, municipio: $scope.munSeleccionado, poligono: poli,
									parcela: parce, recinto: recin,superficie_hectareas: $scope.parcela.superficie,prod_ag: producto,
									sr: $scope.sr,f_ag_ec_rec: finscrip,f_control: fcont, Estado: $scope.parcela.estado,F_baja_rec:fcal,
									F_calificacion: fcal,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac,F_altaProducto: finscrip,
									F_bajaProducto: fcal,expedienteGanado: expedienteId,ag_eco: $scope.parcela.eco,codExplotREGA: $scope.codigoExplotacion,grupoCultivo: $scope.grupoCultivo,
									raza: $scope.Raza,animales: $scope.animales, regApicola: $scope.regApicola, regAcuicola: $scope.regAcuicola,
									tipoAcuicola: $scope.tipoAcuicola,utmX: $scope.UtmX,utmY: $scope.UtmY,produccion: $scope.Produccion,
									F_altaProducto: finscrip,F_bajaProducto: fcal,productoCambiado : "NO"};
								}else if($scope.parcela.eco=="NO"){
									parcela = {provincia: $scope.provSelecionada, municipio: $scope.munSeleccionado, poligono: poli,
									parcela: parce, recinto: recin,superficie_hectareas: $scope.parcela.superficie,prod_ag: producto,
									sr: 'S',f_ag_ec_rec: fcal,f_control: fcal, Estado: "BAJA",F_baja_rec:fcal,
									F_calificacion: fcal,Calificacion: "1",declar_pac: "NO",F_altaProducto: finscrip,
									F_bajaProducto: fcal,expedienteGanado: expedienteId,ag_eco: $scope.parcela.eco,codExplotREGA: $scope.codigoExplotacion,grupoCultivo: $scope.grupoCultivo,
									raza: $scope.Raza,animales: $scope.animales, regApicola: $scope.regApicola, regAcuicola: $scope.regAcuicola,
									tipoAcuicola: $scope.tipoAcuicola,utmX: $scope.UtmX,utmY: $scope.UtmY,produccion: $scope.Produccion,
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
			}else if ($scope.tipoAgricultura == 'AE'){
			vari = String($scope.vari);
			
			if (vari == "" || vari =="undefined"){
				vari = "818";
			}
			var cultivo ="";
			$http.get('/api/ProductoAgricola').success(function(dato){

				for(i=0;i<dato.length; i++){
					if(dato[i].Actividad == $scope.ActGen){
						if(dato[i].CodCultivo == $scope.cultivo){
							cultivo = dato[i].id;
							
							if($scope.parcela.eco=="SI"){
								parcela = {provincia: $scope.provSelecionada, municipio: $scope.munSeleccionado, poligono: poli,
								parcela: parce, recinto: recin,superficie_hectareas: $scope.parcela.superficie,prod_ag: cultivo,
								variedad: vari,sr: $scope.sr,f_ag_ec_rec: finscrip,f_control: fcont, Estado: $scope.parcela.estado,F_baja_rec:fcal,
								F_calificacion: fcal,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac, cosecha_anual: $scope.parcela.cosecha,F_altaProducto: finscrip,
								F_bajaProducto: fcal,expediente: expedienteId,ag_eco: $scope.parcela.eco,productoCambiado : "NO"};
							}else if($scope.parcela.eco=="NO"){
								parcela = {provincia: $scope.provSelecionada, municipio: $scope.munSeleccionado, poligono: poli,
								parcela: parce, recinto: recin,superficie_hectareas: $scope.parcela.superficie,prod_ag: cultivo,
								variedad: vari,sr: "S",f_ag_ec_rec: fcal,f_control: fcal, Estado: "BAJA",F_baja_rec:fcal,
								F_calificacion: fcal,Calificacion: "1",declar_pac: "NO", cosecha_anual: 0,F_altaProducto: fcal,
								F_bajaProducto: fcal,expediente: expedienteId,ag_eco: $scope.parcela.eco,productoCambiado : "NO"};
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
										$http.post('/api/RecolectorParcelas/',{nParcelas: 1,tipoParcela: 'AE'}).
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
			});
			}
			
		};
		
		
	}]);
	
	
	expediente.controller("CreaExpediente",['$http','$log','$scope',function($http,$log,$scope){
		
		var fechaActual = new Date();
		$scope.siguiente = false;
		$scope.estado = false;
		$scope.est = "ALTA";
		$scope.act = "SI";
		$scope.fbaja = "";
		$scope.fcact = "";
		$scope.errores = false;
		var creado = false;
		
		$scope.inicia = function(){
			$scope.tipoAgricultura = "AE";
			$scope.inser = 1;
			
			$http.get('/api/formajuridica').success(function(dato){
				$scope.formasJ = dato;
			});
			$http.get('/api/expedientes').success(function(dato){
				if(dato.length == 0){
					expedienteId = 1;
				}else{
					expedienteId = dato[dato.length -1].id + 1;
				}
				
				num = String(expedienteId);
				while(num.length < 4){
					num = "0"+num;
				}
				
				$scope.expedienteId = num;
				$scope.anyo = String(fechaActual.getFullYear()).substring(2,4);

			});
		};
		
		$scope.comprueba = function(id){
			if(id == 1){
				var a = $scope.asag;
				if (a == "SI"){
					return true;
				}
			}
			if(id == 2){
				var a = $scope.coop;
				if (a == "SI"){
					return true;
				}
			}
			if(id == 3){
				var a = $scope.ind;
				if (a == "SI"){
					return true;
				}
			}
			if(id == 4){
				var a = $scope.est;
				if (a == "BAJA"){
					return true;
				}
			}
			if(id == 5){
				var a = $scope.act;
				if (a == "NO"){
					return true;
				}
			}
			return false;
		};
		
		$scope.guardar = function(clienteid){
		
			day1 = $scope.frecp.getDate();
			if(day1.toString().length < 2){
				day1 = "0"+day1.toString();
			}
			day2 = $scope.fins.getDate();
			if(day2.toString().length < 2){
				day2 = "0"+day2.toString();
			}
			
			var dbaja = "";
			if($scope.fbaja == ""){
				var d = new Date();;
				dat = d.getDate();
				if(dat.toString().length < 2){
					dat = "0"+dat.toString();
				}
				dbaja = d.toJSON().substring(0,8)+dat;
			}else{
				dat = $scope.fbaja.getDate();
				if(dat.toString().length < 2){
					dat = "0"+dat.toString();
				}
				dbaja = $scope.fbaja.toJSON().substring(0,8)+dat;
			}
			var dfc = "";
			if($scope.fcact == ""){
				var d = new Date();
				dat = d.getDate();
				
				if(dat.toString().length < 2){
					dat = "0"+dat.toString();
				}
				dfc = d.toJSON().substring(0,8)+dat;
			}else{
				dat = $scope.fcact.getDate();
				if(dat.toString().length < 2){
					dat = "0"+dat.toString();
				}
				dfc = $scope.fcact.toJSON().substring(0,8)+dat;
			}
			
			if($scope.inser == 1){
				codExp = "AN"+$scope.expedienteId+"-"+$scope.tipoAgricultura+"-"+$scope.anyo;
			}else if($scope.inser == 2){
				codExp = $scope.codExp;
			}
			
			finscrip = $scope.fins.toJSON().substring(0,8)+day2;
			
			if(creado == false){
			
				expedienteC = {tipoAgricultura: $scope.tipoAgricultura, CodSipea: $scope.codSipea, 
				CodOperador: codExp, F_baja: dbaja,  F_cese_activ: dfc,F_juridica: $scope.fj, Fecha_recepcion: $scope.frecp.toJSON().substring(0,8)+day1, Fecha_aecologica: finscrip,
				Estado: $scope.est, con_actividad: $scope.act, aso_ag: $scope.asag, asociacion_agraria: $scope.asoc, s_cop: $scope.coop,
				cooperativa: $scope.cooperativa, info_contac1: $scope.pc1, com_ind: $scope.ind, industria: $scope.industria,
				info_contac2: $scope.pc2, entidadPac: $scope.PAC, info_contac3: $scope.pc3, id_cliente: clienteid,vigente: "NO",haestadovigente: "NO",F_iniciovigencia: dbaja,F_finalvigencia: dbaja,idDocumento: 0}

				$http.post('/api/expedientes/',expedienteC).
				success(function(data,status,headers,config){
					$scope.errores = false;
					creado = true;
					expedienteId = data.id;
					$scope.siguiente = true;
					elementos = document.getElementById("formularioExpediente").elements;
					$scope.expediente_id = expedienteId;
				
					for (i=0;i<elementos.length; i++){
						elementos[i].disabled = true;
					}
					$http.post('/api/nuevosExpedientes/',{idExp: data.id}).
					success(function(data,status,headers,config){
					});
					

				}).
				error(function(data,status,headers,config){
				});
			}else{
				$http.put('/api/expedientes/'+expedienteId,{tipoAgricultura: $scope.tipoAgricultura, CodSipea: $scope.codSipea, 
				CodOperador: codExp, F_baja: dbaja,  F_cese_activ: dfc,F_juridica: $scope.fj, Fecha_recepcion: $scope.frecp.toJSON().substring(0,8)+day1, Fecha_aecologica: finscrip,
				Estado: $scope.est, con_actividad: $scope.act, aso_ag: $scope.asag, asociacion_agraria: $scope.asoc, s_cop: $scope.coop,
				cooperativa: $scope.cooperativa, info_contac1: $scope.pc1, com_ind: $scope.ind, industria: $scope.industria,
				info_contac2: $scope.pc2, entidadPac: $scope.PAC, info_contac3: $scope.pc3,id_cliente: clienteid,vigente: "NO",haestadovigente: "NO",F_iniciovigencia: dbaja,F_finalvigencia: dbaja,idDocumento:0}).
				success(function(data,status,headers,config){
					expedienteId = data.id;
					$log.log(expedienteId);
					$scope.siguiente = true;
					elementos = document.getElementById("formularioExpediente").elements;
					$scope.expediente_id = expedienteId;
				
					for (i=0;i<elementos.length; i++){
						elementos[i].disabled = true;
					}
					

				}).
				error(function(data,status,headers,config){
					$log.log(data);
				});
			
			}
			
			
		};
		$scope.limpiar = function(){
			document.getElementById("formularioExpediente").reset();
		};
		$scope.modificar = function(){
			elementos = document.getElementById("formularioExpediente").elements;
			
				for (i=0;i<elementos.length; i++){
					elementos[i].disabled = false;
				}
			$scope.estado = true;
			$scope.actividad = true;
			$scope.siguiente = false;

		};
		
		$scope.finalizar = function(expedienteid){
			location.replace("/expedientes/"+expedienteid);
		};
		
		
		
		
		
		

	}]);
	
	expediente.controller("Visitas",['$http','$log','$scope',function($http,$log,$scope){
		
		$scope.visita = {incump: 0,muestras:0};
		var planificadas = [];
		var auditorias = [];
		var visitas = [];
		$scope.inicia = function(idExp){
			$http.get('/api/expedientes/'+idExp).success(function(dato){
				$log.log(dato);
				for (i=0;i<dato.visitas.length;i++){
					if (dato.visitas[i].completada == 'NO'){
						planificadas.push(dato.visitas[i]);
						for(j=0;j<dato.visitas[i].auditorias.length; j++){
							auditorias.push(dato.visitas[i].auditorias[j]);
						}
					}else{
						visitas.push(dato.visitas[i]);
					}
				}
				$scope.auditorias = auditorias;
				$scope.planificadas = planificadas;
				$scope.visitas = visitas;
			});
		};
		
		this.tab = 1;
		
		this.selectTab = function(setTab){
			this.tab = setTab;
		};
		this.isSelected = function(checkTab){
			return this.tab === checkTab;
		};
		
		$scope.fecha = function(fechaIni){
			return fechaIni.substring(8,10)+"/"+fechaIni.substring(5,7)+"/"+fechaIni.substring(0,4);
		};
		
		$scope.limpiarVisita = function(){
			document.getElementById("formularioVisita").reset();
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
			}
		};
		
		
		$scope.editaVisita = function(visitaID){
			$scope.modificaVisita = true;
			visid = visitaID;
			$http.get('/api/VisitaParcela/'+visitaID).
				success(function(data){
					$log.log(data);
					$scope.fvisita = new Date(data.f_visita);
					$scope.descripcion = data.descripcion;
					$scope.inspector = data.inspector;
					$scope.tact = data.actuacion;
					$scope.visita.incump = data.n_incumplimientos;
					$scope.visita.muestras = data.n_muestras;
					
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		
		$scope.cancelar = function(){
			$scope.modificaVisita= false;		
		};
		var contador = 0;

		var cont = 0;
		var vigente = 'NO';
		
		$scope.cambiaAuditoria = function(){
			cont = 10;
			contador = 0;
			$scope.certificado = false;
			$log.log($scope.selectAudi)
			$http.get('/api/Auditoria/'+$scope.selectAudi).
				success(function(data){
					$log.log(data.vigente)
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
					}else{
						$scope.resultado = "";
						$scope.fEV = "";
						$scope.muestraEvaluacion = false;
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
					
				}).
				error(function(data,status,headers,config){
					$log.log("Error");
				});
		};
		
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
		
		$scope.modificaVisit = function(idExp){
		
			day = $scope.fvisita.getDate();
			if(day.toString().length < 2){
				day = "0"+day.toString();
			}
			fvis = $scope.fvisita.toJSON().substring(0,8)+day;
			descrip = $scope.descripcion;
			muestras = $scope.visita.muestras;	
			incumplimientos = $scope.visita.incump;
			
			visita = {f_visita:fvis ,expediente : idExp,descripcion : descrip, 
			inspector: $scope.inspector,actuacion: $scope.tact,n_incumplimientos: incumplimientos, n_muestras: muestras};
			
			$http.put('/api/VisitaParcela/'+visid,visita).
			success(function(data,status,headers,config){
				visitas = $scope.visitas;
				
				var index = 0;
				for (i=0; i<visitas.length; i++){
					if(visitas[i].id == visid){
						index = i;
					}
				}
				visitas.splice(index,1);
				visitas.push(data);
				$scope.visitas = visitas;
				
				$scope.modificaVisita = false;

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
					data.F_iniciovigencia = document.getElementById("fechaInicio").value;
					data.F_finalvigencia = document.getElementById("fechaFin").value;
					data.vigente = 'SI';
					data.idDocumento = parseInt(data.idDocumento)+1; 
					$http.put('/api/expedientes/'+idExp,data).
					success(function(data2,status,headers,config){
					});
				});
			idAut = $scope.selectAudi;
			$http.get('/api/Auditoria/'+idAut).
				success(function(data,status,headers,config){
					idVis = data.visita;
					$http.get('/api/VisitaParcela/'+idVis).
					success(function(data2,status,headers,config){
						data2.completada = 'SI';
						$http.put('/api/VisitaParcela/'+idVis,data2).
						success(function(data3,status,headers,config){
							location.reload();
						});
					});
				});
		};
		
		
		$scope.guardarVisita = function(idExp){
		
			fvis = document.getElementById("fvisita").value
			descrip = $scope.descripcion;
		
		
			visita = {f_visita:fvis ,expediente : idExp,descripcion : descrip, 
			inspector: $scope.inspector,actuacion: $scope.tact,completada: 'NO'};
			
			$http.post('/api/VisitaParcela/',visita).
				success(function(data,status,headers,config){
					vis = $scope.planificadas;
					vis.push(data);
					$scope.planificadas = vis;
				}).
				error(function(data,status,headers,config){
					$log.log(data)
				});
		};
		$scope.guardarAuditoria= function(){
		

			f_audi = document.getElementById("faudi").value
			descrip = $scope.descripcion2;
		
		
			auditoria = {f_Auditoria:f_audi ,visita : $scope.visitaPlanif,descripcion : descrip, 
			n_incumplimientos: $scope.visita.incump, n_muestras: $scope.visita.muestras};
			
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
		
		$scope.guardarIncump= function(){
		
			descrip = $scope.descripcion3;
			
			tiponc = $scope.tipoNC;
			if($scope.tipoIncp == 'D'){
				tiponc = 'S';
			}
			
			contador = contador+1;
			
			$log.log(contador)
		
			incumplimiento = {auditoria: $scope.selectAudi,tipoIncumplimiento: $scope.tipoIncp,
						tipoNoConf: tiponc, incumplimiento: $scope.descripcion3,reglproced: $scope.apdo, parcelas: $scope.expl,
						observaciones : $scope.descripcion4,ref: contador};
			
			$http.post('/api/Incumplimiento/',incumplimiento).
				success(function(data,status,headers,config){
					vis = $scope.incumplimientos;
					vis.push(data);
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
						}).
						error(function(data,status,headers,config){
							$log.log(data)
						});
				});
		};
		
		$scope.guardarEvaluacion= function(){
			
			fev = document.getElementById("fEV").value;

			evaluacion = {auditoria: $scope.selectAudi,f_eval: fev ,
			eval: $scope.resultado};
			
			$http.post('/api/Evaluacion/',evaluacion).
				success(function(data,status,headers,config){
					$scope.cambiaAuditoria();
				}).
				error(function(data,status,headers,config){
					$log.log(data)
				});
		};
		$scope.modificaEvaluacion= function(){
			
			fev = document.getElementById("fEV").value;

			evaluacion = {auditoria: $scope.selectAudi,f_eval: fev ,
			eval: $scope.resultado};
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
		
		
	}]);
	
	expediente.controller("Parcela",['$http','$log','$scope',function($http,$log,$scope){
		$scope.nomodifica = true;
		var finscrip = "";
		var documento = "";
		var provincia = "";
		var municipio = "";
		var cultivoIni = 0;
		var municipio = 0;
		$scope.iniciaParcela = function(idPar,tipo){
		
			$http.get('/api/municipios').success(function(dato){	
				$scope.municipios = dato;
			});
			
			if(tipo == "AE"){
			
			$http.get('/api/ProductoAgricola').success(function(dato){	
				$scope.cultivos = dato;
			});
			$http.get('/api/Variedades').success(function(dato){
				$scope.variedad = dato;
			});
			
			$http.get('/api/Parcela/'+idPar).success(function(dato){
			
				var fcontrol = new Date(dato.f_control);
				var fcalificacion = new Date(dato.F_calificacion);
				var fechaBaja = new Date();
				var fechaInsc = new Date();
				
				if (dato.Estado == "BAJA"){
					fechaBaja = new Date(dato.F_baja_rec);
				}
				if (dato.ag_eco == "SI"){
					fechaInsc = new Date(dato.f_ag_ec_rec);
				}
				
				finscrip = dato.f_ag_ec_rec;
				$scope.provinciaSeleccionada = dato.provincia;
				municipio = dato.municipio;
				documento = dato.idDocumento;
				
				
				cultivoIni = dato.codcultivo; 
				$scope.parcela = {eco: dato.ag_eco,poligono: dato.poligono,parcela: dato.parcela, recinto: dato.recinto,ActGen : dato.actgen,
				cultivo: "",superficie: dato.superficie_hectareas,dpac: dato.declar_pac,sr: dato.sr,cosecha:  dato.cosecha_anual,
				fcontrol: fcontrol,calificacion: dato.Calificacion,fcalif : fcalificacion, estado: dato.Estado,fbaja: fechaBaja,finscrip : fechaInsc}
				$log.log($scope.parcela)
			});
			}else if(tipo == "GA"){
			
			$http.get('/api/ProductoGanaderia').success(function(dato){	
				$scope.orientaciones = dato;
				$log.log(dato);
			});
			
			$http.get('/api/Ganado/'+idPar).success(function(dato){
			
				var fcontrol = new Date(dato.f_control);
				var fcalificacion = new Date(dato.F_calificacion);
				var fechaBaja = new Date();
				var fechaInsc = new Date();
				
				if (dato.Estado == "BAJA"){
					fechaBaja = new Date(dato.F_baja_rec);
				}
				if (dato.ag_eco == "SI"){
					fechaInsc = new Date(dato.f_ag_ec_rec);
				}
				
				finscrip = dato.f_ag_ec_rec;
				$scope.provinciaSeleccionada = dato.provincia;
				municipio = dato.municipio;
				
				$scope.codigoExplotacion = dato.codExplotREGA;
				$scope.grupoCultivo = dato.grupoCultivo;
				$scope.ActGen2 = dato.actgen;
				$scope.productoGan2 = dato.codOrientacion;
				$scope.productoGan = dato.codOrientacion;
				$scope.NombreProduct = dato.Orientacion;
				$scope.Raza = dato.raza;
				$scope.animales = dato.animales;
				$scope.regApicola = dato.regApicola;
				$scope.regAcuicola = dato.regAcuicola;
				$scope.tipoAcuicola = dato.tipoAcuicola;
				$scope.UtmX = dato.utmX;
				$scope.UtmY = dato.utmY;
				$scope.Produccion = dato.produccion;
				$scope.parcela = {eco: dato.ag_eco,poligono: dato.poligono,parcela: dato.parcela, recinto: dato.recinto,
				superficie: dato.superficie_hectareas,dpac: dato.declar_pac,sr: dato.sr,
				fcontrol: fcontrol,calificacion: dato.Calificacion,fcalif : fcalificacion, estado: dato.Estado,fbaja: fechaBaja,finscrip : fechaInsc}
			});
			}
		};
		
		
		$scope.modifica = function(municipioId){
			$scope.nomodifica = false;
			
			$scope.parcela.cultivo = cultivoIni;
			$scope.municipioSelecionado = municipioId;
		};
		$scope.modificaMunicipio = function(provinciaid){
			$scope.modificaMun = true;
		};
		
		$scope.Baja = function(){
			$scope.bajaCultivo = true;
		};	
		
		$scope.cancelar = function(){
			$scope.bajaCultivo = false;
		};
		
		$scope.guardarDatos = function(idPar,idExp,tipo){
		
		if(tipo == "AE"){
		vari = String($scope.vari);
			
			if (vari == "" || vari =="undefined"){
				vari = "818";
			}
			
		var cultivo ="";
			$http.get('/api/ProductoAgricola').success(function(dato){
			$log.log("Pulsado2");
				day1 = $scope.parcela.finscrip.getDate();
			if(day1.toString().length < 2){
				day1 = "0"+day1.toString();
			}
			f_ag_ec = $scope.parcela.finscrip.toJSON().substring(0,8)+day1;
			
			day2 = $scope.parcela.fcontrol.getDate();
			if(day2.toString().length < 2){
				day2 = "0"+day2.toString();
			}
			f_cont = $scope.parcela.fcontrol.toJSON().substring(0,8)+day2;
			
			day3 = $scope.parcela.fbaja.getDate();
			if(day3.toString().length < 2){
				day3 = "0"+day3.toString();
			}
			f_baja = $scope.parcela.fbaja.toJSON().substring(0,8)+day3;
			
			day4 = $scope.parcela.fcalif.getDate();
			if(day4.toString().length < 2){
				day4 = "0"+day4.toString();
			}
			f_cali = $scope.parcela.fcalif.toJSON().substring(0,8)+day4;
			
			day5 = $scope.parcela.fbaja.getDate();
			if(day5.toString().length < 2){
				day5 = "0"+day5.toString();
			}
			f_bajaProd = $scope.parcela.fbaja.toJSON().substring(0,8)+day5;
			
				for(i=0;i<dato.length; i++){
					if(dato[i].Actividad == $scope.parcela.ActGen){
						
						if(dato[i].CodCultivo == $scope.parcela.cultivo){
							cultivo = dato[i].id;
							var cambiado = "NO";
							f_altaProd = finscrip;
							if ($scope.bajaCultivo){
								cambiado = "SI";
								f_bajaProd = document.getElementById("fbajaproducto").value;
								f_altaProd = document.getElementById("faltaproducto").value;
							}
							parc = $scope.parcela.parcela;
							while (parc.length <5){
								parc = "0"+parc;
							}
							rec = $scope.parcela.recinto;
							while (rec.length <5){
								rec = "0"+rec;
							}
							pol = $scope.parcela.poligono;
							while (pol.length <3){
								pol = "0"+pol;
							}
							
							parcela = {provincia: $scope.provinciaSeleccionada, municipio: $scope.municipioSelecionado, poligono: pol,
								parcela: parc, recinto: rec,superficie_hectareas: $scope.parcela.superficie,prod_ag: cultivo,
								variedad: vari,sr: $scope.parcela.sr,f_ag_ec_rec: f_ag_ec,f_control: f_cont, Estado: $scope.parcela.estado,F_baja_rec:f_baja,
								F_calificacion: f_cali,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac, cosecha_anual: $scope.parcela.cosecha,F_altaProducto: finscrip,
								F_bajaProducto: f_bajaProd,expediente: idExp,ag_eco: $scope.parcela.eco,productoCambiado: cambiado};
							
							$log.log(parcela);
							$http.put('/api/Parcela/'+idPar,parcela).
								success(function(data,status,headers,config){
									$log.log("Guardado");
									location.reload();
								}).
								error(function(data,status,headers,config){
									$log.log(data);
								});
							break;
						}
					}
				}
			});
			}else if(tipo == "GA"){
				var producto ="";
			$http.get('/api/ProductoGanaderia').success(function(dato){
				day1 = $scope.parcela.finscrip.getDate();
			if(day1.toString().length < 2){
				day1 = "0"+day1.toString();
			}
			f_ag_ec = $scope.parcela.finscrip.toJSON().substring(0,8)+day1;
			
			day2 = $scope.parcela.fcontrol.getDate();
			if(day2.toString().length < 2){
				day2 = "0"+day2.toString();
			}
			f_cont = $scope.parcela.fcontrol.toJSON().substring(0,8)+day2;
			
			day3 = $scope.parcela.fbaja.getDate();
			if(day3.toString().length < 2){
				day3 = "0"+day3.toString();
			}
			f_baja = $scope.parcela.fbaja.toJSON().substring(0,8)+day3;
			
			day4 = $scope.parcela.fcalif.getDate();
			if(day4.toString().length < 2){
				day4 = "0"+day4.toString();
			}
			f_cali = $scope.parcela.fcalif.toJSON().substring(0,8)+day4;
			day5 = $scope.parcela.fbaja.getDate();
			if(day5.toString().length < 2){
				day5 = "0"+day5.toString();
			}
			f_bajaProd = $scope.parcela.fbaja.toJSON().substring(0,8)+day5;
			
				for(i=0;i<dato.length; i++){
					if(dato[i].Actividad == $scope.ActGen2){
						
						if(dato[i].CodProducto == $scope.productoGan){
							producto = dato[i].id;
							
							var cambiado = "NO";
							f_altaProd = finscrip;
							if ($scope.bajaCultivo){
								cambiado = "SI";
								f_bajaProd = document.getElementById("fbajaproducto").value;
								f_altaProd = document.getElementById("faltaproducto").value;
							}
							
							
							parc = $scope.parcela.parcela;
							while (parc.length <5){
								parc = "0"+parc;
							}
							rec = $scope.parcela.recinto;
							while (rec.length <5){
								rec = "0"+rec;
							}
							pol = $scope.parcela.poligono;
							while (pol.length <3){
								pol = "0"+pol;
							}
							
							parcela = {provincia: $scope.provinciaSeleccionada, municipio: $scope.municipioSelecionado, poligono: pol,
									parcela: parc, recinto: rec,superficie_hectareas: $scope.parcela.superficie,prod_ag: producto,
									sr: $scope.parcela.sr,f_ag_ec_rec: f_ag_ec,f_control: f_cont, Estado: $scope.parcela.estado,F_baja_rec:f_baja,
									F_calificacion: f_cali,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac,expedienteGanado: idExp,ag_eco: $scope.parcela.eco,codExplotREGA: $scope.codigoExplotacion,grupoCultivo: $scope.grupoCultivo,
									raza: $scope.Raza,animales: $scope.animales, regApicola: $scope.regApicola, regAcuicola: $scope.regAcuicola,
									tipoAcuicola: $scope.tipoAcuicola,utmX: $scope.UtmX,utmY: $scope.UtmY,produccion: $scope.Produccion,F_altaProducto: finscrip,
									F_bajaProducto: f_bajaProd,productoCambiado: cambiado};
							
							$http.put('/api/Ganado/'+idPar,parcela).
								success(function(data,status,headers,config){
									$log.log("Guardado");
									location.reload();
								}).
								error(function(data,status,headers,config){
									$log.log(data);
								});
							break;
						}
					}
				}
			});
			}
		};
	}]);

})();


