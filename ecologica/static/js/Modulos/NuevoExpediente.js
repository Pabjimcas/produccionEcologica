(function(){
	
	var expediente = angular.module('NuevoExpediente',["ui.bootstrap", "ngCookies","ngResource"]);
	var expedienteId = 0; 


	expediente.config(function ($interpolateProvider) {
			$interpolateProvider.startSymbol("[[");
			$interpolateProvider.endSymbol("]]");
		}
	);
	
	expediente.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRFToken'] = '{{ csrf_token|escapejs }}';
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
		
		$scope.agregaOperador = function(nif,nombre,ap1,ap2,gen,tel1,tel2,fax,email,prov,mun,domi,cp){
			cont = {nif: nif, Nombre: nombre,Apellido1: ap1, Apellido2: ap2, Genero: gen,
			Telefono1: tel1, Telefono2: tel2, Fax: fax, Email: email,Provincia: prov, Municipio: mun,
			Domicilio: domi,CP: cp,id_operador: expedienteId};
			$log.log(cont)
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
			$('.collapse').collapse('show')
			conid = contactoid;
			$http.get('/api/contacto/'+conid).
				success(function(data){
					$log.log(data);
					$scope.contacto = {nif: data.nif,nombre: data.Nombre,apellido1: data.Apellido1,apellido2: data.Apellido2,gen: data.Genero ,
					tel1: data.Telefono1,tel2:data.Telefono2,fax: data.Fax,email:data.Email, domicilio:data.Domicilio,cp:data.CP};
					$scope.provincia = data.prov;
					$scope.municipio = data.mun;
					$scope.codProv = data.codprov;
					$scope.codMuni = data.codmun;
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
			$('.collapse').collapse('hide')
			$scope.modificaContacto = false;
			$scope.modificaContacto2 = false;
			//document.getElementById("formularioContacto").reset();			
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
			$('.collapse').collapse('show')
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
			$('.collapse').collapse('hide')			
		};
		
	
	}]);
	
	expediente.controller("CreaParcela",['$http','$log','$scope',function($http,$log,$scope){
		
		$scope.tamanyos=[];
		$scope.marcas=[];
		$scope.iniciaParcela = function(){
			
			
			$http.get('/api/municipios').success(function(dato){	
				$scope.municipios = dato;
			});
			
			$http.get('/api/RecolectorParcelas/').success(function(dato){	
				idRecolector = dato[dato.length -1].id;
			});
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
		
		
		$scope.superficie1 = 0;
		$scope.superficie2 = 0;
		superficie1 = 0;
		superficie2 = 0;
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
				}else if($scope.tipoAgricultura == 'IN'){
					$http.delete('/api/Industria/'+parcelaid).
				success(function(data,status,headers,config){
					var index = 0;
					for (i=0; i<parcelas.length; i++){
						if(parcelas[i].id == parcelaid){
							index = i;
							if(parcelas[i].ag_eco == "SI"){
								if(superficie1 == 0){
									$scope.siguiente4 = true;
								}
							}else if (parcelas[i].ag_eco == "NO"){
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
		
		$scope.cambiaRIA = function(){
			var cods = ['04','11','14','18','21','23','29','41']
			var mT = String($scope.matRIA);
			if(mT.length > 2){
				for(i=0;i<cods.length;i++){
					if(cods[i] == mT.substring(0,2)){
						if(cods[i]=='04'){
							$scope.provSelecionada = 4;
						}else{
							$scope.provSelecionada = cods[i];
						}
						break;
					}
				}
			}
		};
		
		$scope.guardarParcela2 = function(){
		
			day1 = $scope.fins.getDate();
			if(day1.toString().length < 2){
				day1 = "0"+day1.toString();
			}
			finscrip = $scope.fins.toJSON().substring(0,8)+day1;
			finscrip = $scope.fins.toJSON().substring(0,8)+day1;
			fae = document.getElementById("fae").value;

			
			if($scope.parcela.eco=="SI"){
				day2 = $scope.fcontrol.getDate();
				if(day2.toString().length < 2){
					day2 = "0"+day2.toString();
				}
				fcont = $scope.fcontrol.toJSON().substring(0,8)+day2;
			}
			
			
			fcal = document.getElementById("fcalif").value;
			if(!fcal){
				fcal = null;
			}
			
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
									sr: $scope.sr,f_ag_ec_rec: fae,f_control: fcont, Estado: $scope.parcela.estado,F_baja_rec:fcal,
									F_calificacion: fcal,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac,F_altaProducto: fae,
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
								variedad: vari,sr: $scope.sr,f_ag_ec_rec: fae,f_control: fcont, Estado: $scope.parcela.estado,F_baja_rec:fcal,
								F_calificacion: fcal,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac, cosecha_anual: $scope.parcela.cosecha,F_altaProducto: fae,
								F_bajaProducto: fcal,expediente: expedienteId,ag_eco: $scope.parcela.eco,productoCambiado : "NO"};
							}else if($scope.parcela.eco=="NO"){
								parcela = {provincia: $scope.provSelecionada, municipio: $scope.munSeleccionado, poligono: poli,
								parcela: parce, recinto: recin,superficie_hectareas: $scope.parcela.superficie,prod_ag: cultivo,
								variedad: vari,sr: "S",f_ag_ec_rec: fcal,f_control: fcal, Estado: "BAJA",F_baja_rec:fcal,
								F_calificacion: fcal,Calificacion: "1",declar_pac: "NO", cosecha_anual: 0,F_altaProducto: fcal,
								F_bajaProducto: fcal,expediente: expedienteId,ag_eco: $scope.parcela.eco,productoCambiado : "NO"};
							}$log.log(parcela)

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
			}else if($scope.tipoAgricultura == 'IN'){
			
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
									expediente: expedienteId, ag_eco: $scope.parcela.eco, tipProc: tproc,
									tipoCom: $scope.tipoCom,F_altaProducto: f_ae_prod, F_bajaProducto: fcal,productoCambiado : "NO",
									desc_product: $scope.descripcion, f_ag_eco_prod: f_ae_prod, 
									capacidad: $scope.c_prod, form_pres: $scope.for_pres, tam_emb: t_emb,
									marcas_referencia: marc, valor_produccion: $scope.v_comer,declar_pac: $scope.parcela.dpac};
								}else if($scope.parcela.eco=="NO"){
									parcela = {inscrito: $scope.RIA,matriculaRIA: matricula,provincia: $scope.provSelecionada, municipio: $scope.munSeleccionado,
									Domicilio: $scope.domicilio,CP: $scope.CP, producto:producto,utmX: $scope.UtmX,utmY: $scope.UtmY,regSanit: sanit,
									regEmbotella: $scope.regSan, f_control: fcal, Estado: "ALTA",F_baja:fcal,
									expediente: expedienteId, ag_eco: $scope.parcela.eco, tipProc: tproc,
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
										}else if(dato.ag_eco == "NO"){
											$scope.siguiente5 = false;
										}
										parcelas.push(dato);
										$scope.parcelas = parcelas;
										$http.post('/api/RecolectorParcelas/',{nParcelas: 1,tipoParcela: 'ND'}).
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
				});
			}
			
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
		
		$scope.inicia = function(ultimo){
			$scope.tipoAgricultura = "AE";
			$scope.inser = 1;
			
			$http.get('/api/formajuridica').success(function(dato){
				$scope.formasJ = dato;
			});
			$scope.anyo = String(fechaActual.getFullYear()).substring(2,4);
			 exped= String(parseInt(ultimo)+1);
			 while (exped.length < 4){
					exped='0'+exped;
				}
			 $scope.expedienteId = exped;
			 $http.get('/api/ProductoAgricola').success(function(dato){	
				$scope.cultivos = dato;
				});
				$http.get('/api/Variedades').success(function(dato){
					$scope.variedad = dato;
				});
		};
		
		$scope.modificaTipo = function(ultimo){
			if($scope.tipoAgricultura == "AE"){
				exped= String(parseInt(ultimo)+1);
				while (exped.length < 4){
					exped='0'+exped;
				}
				$scope.expedienteId = exped;
				$http.get('/api/ProductoAgricola').success(function(dato){	
				$scope.cultivos = dato;
				});
				$http.get('/api/Variedades').success(function(dato){
					$scope.variedad = dato;
				});
			}else if($scope.tipoAgricultura == "GA"){
				exped = String(parseInt(ultimo)+1);
				while (exped.length < 4){
					exped='0'+exped;
				}
				$scope.expedienteId = exped;
				$http.get('/api/ProductoGanaderia').success(function(dato){	
				$scope.orientaciones = dato;
				});
			}else{
				exped= String(parseInt(ultimo)+1);
				while (exped.length < 4){
					exped='0'+exped;
				}
				$scope.expedienteId = exped;
				$http.get('/api/ProductoIndustria').success(function(dato){	
				$scope.productosIndustria = dato;
				});
			}
			
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
			
				expedienteC = {responsable: $scope.responsable,tipoAgricultura: $scope.tipoAgricultura,indProdParalela : $scope.pp ,CodSipea: $scope.codSipea, 
				CodOperador: codExp, F_baja: dbaja,  F_cese_activ: dfc,F_juridica: $scope.fj, Fecha_recepcion: $scope.frecp.toJSON().substring(0,8)+day1, Fecha_aecologica: finscrip,
				Estado: $scope.est, con_actividad: $scope.act, aso_ag: $scope.asag, asociacion_agraria: $scope.asoc, s_cop: $scope.coop,
				cooperativa: $scope.cooperativa, info_contac1: $scope.pc1, com_ind: $scope.ind, industria: $scope.industria,
				info_contac2: $scope.pc2, entidadPac: $scope.PAC, info_contac3: $scope.pc3, id_cliente: clienteid,vigente: "NO",haestadovigente: "NO",F_iniciovigencia: dbaja,F_finalvigencia: dbaja,idDocumento: 0,anyo:$scope.anyo}
				$log.log(expedienteC)
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
				$http.put('/api/expedientes/'+expedienteId,{responsable: $scope.responsable,tipoAgricultura: $scope.tipoAgricultura, CodSipea: $scope.codSipea, 
				CodOperador: codExp, F_baja: dbaja,  F_cese_activ: dfc,F_juridica: $scope.fj, Fecha_recepcion: $scope.frecp.toJSON().substring(0,8)+day1, Fecha_aecologica: finscrip,
				Estado: $scope.est, con_actividad: $scope.act, aso_ag: $scope.asag, asociacion_agraria: $scope.asoc, s_cop: $scope.coop,
				cooperativa: $scope.cooperativa, info_contac1: $scope.pc1, com_ind: $scope.ind, industria: $scope.industria,
				info_contac2: $scope.pc2, entidadPac: $scope.PAC, info_contac3: $scope.pc3,id_cliente: clienteid,vigente: "NO",haestadovigente: "NO",F_iniciovigencia: dbaja,F_finalvigencia: dbaja,idDocumento:0,anyo: $scope.anyo}).
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

})();


