(function(){
	
	var expediente = angular.module('Parcela',["ui.bootstrap", "ngCookies","ngResource"]);
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
			}else if(tipo == "IN"){
			
			$http.get('/api/ProductoIndustria').success(function(dato){	
				$scope.productosIndustria = dato;
			});
			
			$http.get('/api/Industria/'+idPar).success(function(dato){
			
				var fcontrol = new Date(dato.f_control);
				var fechaBaja = new Date();
				var fechaInsc = new Date();
				
				if (dato.Estado == "BAJA"){
					fechaBaja = new Date(dato.F_baja);
				}
				if (dato.ag_eco == "SI"){
					fechaInsc = new Date(dato.f_ag_eco_prod);
				}
				
				finscrip = dato.f_ag_eco_prod;
				$scope.provinciaSeleccionada = dato.provincia;
				municipio = dato.municipio;
				$scope.RIA = dato.inscrito;
				if(dato.inscrito == 'NO'){
					$scope.matRIA = "";
					$scope.regSan = "";
				}else{
					$scope.matRIA = dato.matriculaRIA;
					$scope.regSan = dato.regSanit;
				}
				
				$scope.domicilio = dato.Domicilio;
				$scope.CP = dato.CP;
				$scope.utmx = dato.utmX;
				$scope.utmy = dato.utmY;
				$scope.regEmb = dato.regEmbotella;
				procesados = dato.procesados;
				for (i = 0; i< procesados.length; i++){
					if(procesados[i].letra == 'E'){
						document.getElementById("elaboracion").checked = true;
					}else if(procesados[i].letra == 'X'){
						document.getElementById("envasado").checked = true;
					}else if(procesados[i].letra == 'C'){
						document.getElementById("comercializacion").checked = true;
					}else if(procesados[i].letra == 'I'){
						document.getElementById("importacion").checked = true;
					}else{
						document.getElementById("exportacion").checked = true;
					}
				}
				$scope.tipoCom = dato.tipoCom;
				$scope.ActGen = dato.prod;
				$scope.prodtIndustria = dato.codact;
				$scope.descripcion = dato.desc_product;
				$scope.f_ins_ae = new Date(dato.f_ag_eco_prod)
				$scope.c_prod = dato.capacidad;
				$scope.tamanyos = dato.envasesProd;
				$scope.for_pres = dato.form_pres;
				$scope.v_comer = dato.valor_produccion;
				$scope.marcas = dato.marcs;
				$scope.parcela = {eco: dato.ag_eco,dpac: dato.declar_pac,
				fcontrol: fcontrol, estado: dato.Estado,fbaja: fechaBaja,finscrip : fechaInsc}
			});
			}
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
		
		$scope.cambiaProducto = function(){
			document.getElementById("prodDefecto").hidden = true;
		};
		
		$scope.Baja = function(){
			$scope.bajaCultivo = true;
		};	
		
		$scope.modifica = function(municipioId){
			$scope.nomodifica = false;
			
			$scope.parcela.cultivo = cultivoIni;
			$scope.municipioSelecionado = municipioId;
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
								F_calificacion: f_cali,Calificacion: $scope.parcela.calificacion,declar_pac: $scope.parcela.dpac, cosecha_anual: $scope.parcela.cosecha,F_altaProducto: f_altaProd,
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
			}else if(tipo == "IN"){
				
				var producto ="";
			$http.get('/api/ProductoIndustria').success(function(dato){
				
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
			
			day5 = $scope.parcela.fbaja.getDate();
			if(day5.toString().length < 2){
				day5 = "0"+day5.toString();
			}
			f_bajaProd = $scope.parcela.fbaja.toJSON().substring(0,8)+day5;
			
				for(i=0;i<dato.length; i++){
					
					if(dato[i].Producto == $scope.ActGen){
						$log.log(dato[i].CodActividad+">"+$scope.prodtIndustria)
						if(dato[i].CodActividad == $scope.prodtIndustria){
							producto = dato[i].id;
							
							var cambiado = "NO";
							f_altaProd = finscrip;
							if ($scope.bajaCultivo){
								cambiado = "SI";
								f_bajaProd = document.getElementById("fbajaproducto").value;
								f_altaProd = document.getElementById("faltaproducto").value;
							}
							
							matricula = $scope.matRIA;
				var tproc = "";
				if($scope.RIA == 'NO'){
					matricula = 'NO PROCEDE';
				}
				sanit = $scope.regSan;
				if($scope.RIA == 'NO'){
					sanit = 'NO PROCEDE';
				}
				elab = document.getElementById("elaboracion").checked;
				if(elab){
					tproc = tproc+'E';
				}
				envas = document.getElementById("envasado").checked;
				if(envas){
					tproc = tproc+'X';
				}
				comer = document.getElementById("comercializacion").checked;
				if(comer){
					tproc = tproc+'C';
				}
				importa = document.getElementById("importacion").checked;
				if(importa){
					tproc = tproc+'I';
				}
				exporta = document.getElementById("exportacion").checked;
				if(exporta){
					tproc = tproc+'P';
				}
				$log.log(tproc)
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
							
				parcela = {inscrito: $scope.RIA,matriculaRIA: matricula,provincia: $scope.provinciaSeleccionada, municipio: $scope.municipioSelecionado,
						Domicilio: $scope.domicilio,CP: $scope.CP, producto: producto,utmX: $scope.utmx,utmY: $scope.utmy,regSanit: sanit,
						regEmbotella: $scope.regEmb, f_control: f_cont, Estado: $scope.parcela.estado,F_baja:f_baja,
						expediente: idExp, ag_eco: $scope.parcela.eco, tipProc: tproc,
						tipoCom: $scope.tipoCom,F_altaProducto: finscrip, F_bajaProducto: f_bajaProd,productoCambiado : cambiado,
						desc_product: $scope.descripcion, f_ag_eco_prod: f_ae_prod, 
						capacidad: $scope.c_prod, form_pres: $scope.for_pres, tam_emb: t_emb,
						marcas_referencia: marc, valor_produccion: $scope.v_comer,declar_pac: $scope.parcela.dpac};
									
							$http.put('/api/Industria/'+idPar,parcela).
								success(function(data,status,headers,config){
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


