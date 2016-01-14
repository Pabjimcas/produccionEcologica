(function(){
	
	var expediente = angular.module('Dashboard',["ui.bootstrap", "ngCookies","ngResource"]);

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
	
	
	expediente.controller("ArchivoSipea",['$http','$log','$scope','$filter',function($http,$log,$scope,$filter){
		
		var datos = [];
		var errores = [];
		$scope.inicia = function(){
			$http.get('/api/clientes/').success(function(dato){
				datos = dato;
				document.getElementById("iconoAE").className="fa fa-file-text-o fa-5x"
				document.getElementById("aeco").className="list-group-item list-group-item-success";
				document.getElementById("ganad").className="list-group-item list-group-item-warning";
				document.getElementById("industria").className="list-group-item list-group-item-info";
			});
		};
		
		$scope.actualizaAnyos = function(){
			$log.log("Toy naqui")
			$http.get('/api/expedientes/').success(function(dato){
				$log.log(dato.length-1)
				for(i=0;i<dato.length;i++){
					$log.log(i)
					dato[i].anyo = parseInt(dato[i].CodOperador.substring(10, 13))
					$http.put('/api/expedientes/'+dato[i].id,dato[i]).success(function(dato){
						$log.log("Actualizado")
					});
				}
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
						texto.push(expedientes[j].indProdParalela);
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
						texto.push(expedientes[j].indProdParalela);
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
						texto.push(parcelas[x].codExplotREGA.toUpperCase());
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
		
		function generarTextoIN() {
			var texto =[];
			var lines ="";
			
			for(i=0;i<datos.length;i++){
				expedientes = datos[i].expedientes;
				for(j=0;j<expedientes.length;j++){
					if(expedientes[j].tipoAgricultura == 'IN'){
					parcelas=expedientes[j].industrias;
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
						texto.push(expedientes[j].indProdParalela);
						texto.push("|");
						texto.push(parcelas[x].matriculaRIA);
						texto.push("|");
						texto.push(parcelas[x].codprov.substring(1,3));
						texto.push("|");
						texto.push(limpiar(parcelas[x].prov.toUpperCase()));
						texto.push("|");
						texto.push(parcelas[x].codmun);
						texto.push("|");
						texto.push(limpiar(parcelas[x].mun));
						texto.push("|");
						texto.push(parcelas[x].Domicilio);
						texto.push("|");
						texto.push(parcelas[x].CP);
						texto.push("|");
						texto.push(parcelas[x].utmX);
						texto.push("|");
						texto.push(parcelas[x].utmY);
						texto.push("|");
						texto.push(parcelas[x].regSanit);
						texto.push("|");
						texto.push(parcelas[x].regEmbotella);
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].f_control));
						texto.push("|");
						texto.push(parcelas[x].Estado);
						texto.push("|");
						if(parcelas[x].Estado == "BAJA"){
							texto.push(transformaFecha(parcelas[x].F_baja));
						}
						texto.push("|");
						if(expedientes[j].visitas.length > 0){
							texto.push(transformaFecha(expedientes[j].visitas[expedientes[j].visitas.length - 1].f_visita));
						}
						texto.push("|");
						texto.push(parcelas[x].tipProc);
						texto.push("|");
						texto.push(parcelas[x].tipoCom);
						texto.push("|");
						texto.push(parcelas[x].codproducto);
						texto.push("|");
						texto.push(limpiar(parcelas[x].prod));
						texto.push("|");
						texto.push(parcelas[x].codact);
						texto.push("|");
						texto.push(limpiar(parcelas[x].actgen));
						texto.push("|");
						texto.push(limpiar(parcelas[x].desc_product));
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].f_ag_eco_prod));
						texto.push("|");
						if(expedientes[j].vigente == "SI"){
							texto.push(expedientes[j].idDocumento);
						}
						texto.push("|");
						texto.push(parcelas[x].capacidad);
						texto.push("|");
						texto.push(transformaFecha(parcelas[x].F_altaProducto));
						texto.push("|");
						if(parcelas[x].productoCambiado == "SI"){
							texto.push(transformaFecha(parcelas[x].F_bajaProducto));
							arrayIds.push(parcelas[x].id);
						}
						texto.push("|");
						if(expedientes[j].vigente == "SI"){
							texto.push(transformaFecha(expedientes[j].F_iniciovigencia));
							texto.push("|");
							texto.push(transformaFecha(expedientes[j].F_finalvigencia));
						}else{
							texto.push("|");
						}
						texto.push(parcelas[x].form_pres);
						texto.push("|");
						texto.push(parcelas[x].tam_emb);
						texto.push("|");
						texto.push(parcelas[x].marcas_referencia);
						texto.push("|");
						texto.push(parcelas[x].valor_produccion);
						texto.push("|");
						
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
			}else if(tipo == 'IN'){
				texto = generarTextoIN();
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

	expediente.controller("ArchivoSice",['$http','$log','$scope','$filter',function($http,$log,$scope,$filter){
		
		$scope.nuevaFecha = function(){
			if ($scope.ffact){
				document.getElementById("iconoSICE").className="fa fa-file-text fa-5x";
				document.getElementById("plan").className = "list-group-item list-group-item-info";
				document.getElementById("actu").className = "list-group-item list-group-item-warning"
				document.getElementById("incu").className = "list-group-item list-group-item-danger"
			}else{
				document.getElementById("iconoSICE").className="fa fa-file-o fa-5x";
				document.getElementById("plan").className = "list-group-item list-group-item-info disabled";
				document.getElementById("actu").className = "list-group-item list-group-item-warning disabled"
				document.getElementById("incu").className = "list-group-item list-group-item-danger disabled"
			}
		};
		$scope.generaSice = function(id){
			fechaFact = $scope.ffact;
			diaIni = fechaFact.getDate();
			mesIni = String(parseInt(fechaFact.getMonth())+1);
			while (mesIni.length < 2){
				mesIni = '0'+mesIni;
			}
			anyoIni = fechaFact.getFullYear();
			fechaFact2 = $scope.ffact2;
			diaFin = fechaFact2.getDate();
			mesFin = String(parseInt(fechaFact2.getMonth())+1);
			while (mesFin.length < 2){
				mesFin = '0'+mesFin;
			}
			anyoFin = fechaFact2.getFullYear();
			if (id == 'PLA'){
				href='/planificaciones/'+anyoIni+"/"+mesIni+"/"+diaIni+"/"+anyoFin+"/"+mesFin+"/"+diaFin;
			}else if(id == 'ACT'){
				href='/actuaciones/'+anyoIni+"/"+mesIni+"/"+diaIni+"/"+anyoFin+"/"+mesFin+"/"+diaFin;
			}else if(id == 'INC'){
				href='/incumplimientos/'+anyoIni+"/"+mesIni+"/"+diaIni+"/"+anyoFin+"/"+mesFin+"/"+diaFin;
			}
			location.replace(href);	
		}


		function actualiza(cont,parcelas,ident,tipo){
			if(cont < parcelas.length){
				var id=parcelas[cont].id;
				if(ident == 'AE'){
					$log.log("ae");
					$http.get('/api/parcelasVisita/'+id).success(function(dato2){
						if(tipo == 'PLA'){
							dato2.pla_completa = 'S';
						}else if(tipo == 'ACT'){
							dato2.act_completa = 'S';
						}
						
						$http.put('/api/parcelasVisita/'+id,dato2).success(function(dato3){
	
							actualiza(cont+1,parcelas,ident,tipo);
						});	
					});
				}else if(ident == 'GA'){
					$log.log("ga");
					$http.get('/api/ganadoVisita/'+id).success(function(dato2){
						if(tipo == 'PLA'){
							dato2.pla_completa = 'S';
						}else if(tipo == 'ACT'){
							dato2.act_completa = 'S';
						}
						
						$http.put('/api/ganadoVisita/'+id,dato2).success(function(dato3){
		
							actualiza(cont+1,parcelas,ident,tipo);
						});	
					});
				}else if(ident == 'IN'){
					$log.log("IN");
					$http.get('/api/industriaVisita/'+id).success(function(dato2){
						if(tipo == 'PLA'){
							dato2.pla_completa = 'S';
						}else if(tipo == 'ACT'){
							dato2.act_completa = 'S';
						}
						
						$http.put('/api/industriaVisita/'+id,dato2).success(function(dato3){
	
							actualiza(cont+1,parcelas,ident,tipo);
						});	
					});
				}
			}else{
				document.getElementById("textProgreso").className="progress-bar progress-bar-default progress-bar-striped"
			}
			
		}
		function actualizaIncump(num,datos){
				if(num < datos.length){
					f_visita = new Date();
					if( f_visita >= $scope.ffact && f_visita <= $scope.ffact2){
						datos[num].inc_completo = 'S';
						var id = datos[num].id;
						$http.put('/api/Incumplimiento/'+id,datos[num]).success(function(dato3){
							actualizaIncump(num+1,datos);
						});
					}else{
						actualizaIncump(num+1,datos);
					}
				}else{
					document.getElementById("textProgreso").className="progress-bar progress-bar-default progress-bar-striped"
				}
			

		}

		$scope.desactivar = function(id){


			if(id != 'INC'){
				if(id == 'PLA'){
					document.getElementById("textProgreso").className="progress-bar progress-bar-info progress-bar-striped active"
				}else{
					document.getElementById("textProgreso").className="progress-bar progress-bar-warning progress-bar-striped active"
				}
			$http.get('/api/VisitaParcela').success(function(dato){
				$log.log(dato);
				
				
				for (var i in dato){
					
					f_visita = new Date(dato[i].f_visita);
					if( f_visita >= $scope.ffact && f_visita <= $scope.ffact2){
						
						var parcelas;
						var ganado;
						var industria;
						if (id == 'PLA'){
							parcelas = $filter('filter')(dato[i].parcelasVisita, {pla_completa: 'N' });
							ganado =  $filter('filter')(dato[i].ganadoVisita, {pla_completa: 'N' });
							industria = $filter('filter')(dato[i].industriaVisita, {pla_completa: 'N' });
						}else{
							parcelas = $filter('filter')(dato[i].parcelasVisita, {act_completa: 'N' });
							ganado =  $filter('filter')(dato[i].ganadoVisita, {act_completa: 'N' });
							industria = $filter('filter')(dato[i].industriaVisita, {act_completa: 'N' });
						}
						actualiza(0,parcelas,'AE',id);
						actualiza(0,ganado,'GA',id);
						actualiza(0,industria,'IN',id);
						
					}
						
				}
				
			});
			}else{
				document.getElementById("textProgreso").className="progress-bar progress-bar-danger progress-bar-striped active"
				$http.get('/api/Incumplimiento').success(function(dato){
					$log.log(dato);
					var datos = $filter('filter')(dato, {inc_completo: 'N' });
					$log.log(datos);
					actualizaIncump(0,datos);
				
				});	
			}
		}
	}]);

})();


