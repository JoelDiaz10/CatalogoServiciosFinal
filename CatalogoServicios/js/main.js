// JavaScript Document

/* 
* sistema de logs 
*/
var i_log = 0;
function mkLog(text){
	var date = new Date();
	var txt = i_log + " - " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ": " + text;
	i_log++;
	console.log(txt);
	//$("#log").append(txt  + "<br>");
}



/* 
* variables de la aplicación
*/
	var existe_db
	var db
	


/* 
* carga inicial de la app
*/
function onBodyLoad() {    
	document.addEventListener("deviceready", onDeviceReady(), false);
}

function onDeviceReady(){
	mkLog("Aplicación cargada y lista");
    //navigator.notification.alert("PhoneGap is working");
	existe_db = window.localStorage.getItem("existe_db");
	db = window.openDatabase("catalogo_servicios", "1.0", "DB del curso Phonegap", 200000);
	if(existe_db == null){
		creaDB();
		alert("se creo la base de datos");
	}else{
		cargaDatos();
	}
	
	
	$("#btnGuardar").click(function(e){
		if($.id != -1){
		 	saveEditForm();
		 }else{
			saveNewForm();
		}
	 });

	$("#btnEliminar").click(function(e){
		if($.id != -1)
		 	deleteForm();
	 });
}


/* 
* creación de la base de datos
*/
function creaDB(){
	db.transaction(creaNuevaDB, errorDB, creaSuccess);
	
}

function creaNuevaDB(tx){
	mkLog("Creando base de datos");
	
	tx.executeSql('DROP TABLE IF EXISTS catalogo_servicios');
	
	var sql = "CREATE TABLE IF NOT EXISTS catalogo_servicios ( "+
		"id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"nombre VARCHAR(50), " +
		"foto VARCHAR(200), " +
		"telefono VARCHAR(30), " +
		"email VARCHAR(30), " +
		"domicilio VARCHAR(200), " + 
		"categoria VARCHAR(200), " + 
		"nota VARCHAR(300) )";
		
	tx.executeSql(sql);
	
	tx.executeSql("INSERT INTO catalogo_servicios (id,nombre,foto,telefono,email,domicilio,categoria,nota) VALUES (1,'Maria','','6699900970','mariia@ccumazatlan.mx','Hotel del Cid #5796','amigos','Prueba primer Insert PhoneGap')");
}


function creaSuccess(){
	window.localStorage.setItem("existe_db", 1);
	cargaDatos();
}

function errorDB(err){
	mkLog("Error procesando SQL " + err.code);
	navigator.notification.alert("Error procesando SQL " + err.code);
}



/* 
* carga de datos desde la base de datos
*/
function cargaDatos(){
	db.transaction(cargaRegistros, errorDB);
}

function cargaRegistros(tx){
	mkLog("Cargando registros de la base de datos");
	tx.executeSql('SELECT * FROM catalogo_servicios', [], cargaDatosSuccess, errorDB);
}

function cargaDatosSuccess(tx, results){
	mkLog("Recibidos de la DB " + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros");
		navigator.notification.alert("No hay contactos en la base de datos");
	}
	
	for(var i=0; i<results.rows.length; i++){
		var persona = results.rows.item(i);
		var selector = $("#lista_" + persona.categoria + " ul");
		var foto = persona.foto;
		if(foto == ""){
			foto = "assets/no_foto.png";
		}
		selector.append('<li id="li_'+persona.id+'"><a href="#infoService" data-uid='+persona.id+' class="linkDetalles"><div class="interior_lista"><img src="'+ foto +'" class="img_peq"/><span>' + persona.nombre + '</span></div></a><a href="#form"  data-theme="a" data-uid='+persona.id+'  class="linkForm">Predet.</a></li>').listview('refresh');
	}
	
	$(".linkDetalles").click(function(e){
		$.id = $(this).data("uid");
	});
	
	$(".linkForm").click(function(e){
		$.id = $(this).data("uid");
	});
}




/*
* vista detalle ======================================
*/

$(document).on("pagebeforeshow", "#infoService", function(){
	if(db != null){
		db.transaction(queryDBFindByID, errorDB);
	}
});



function queryDBFindByID(tx) {
    tx.executeSql('SELECT * FROM catalogo_servicios WHERE id='+$.id, [], queryDetalleSuccess, errorDB);
}

function queryDetalleSuccess(tx, results) {
	mkLog("Recibidos de la DB en vista detalle" + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros para la vista detalle");
		navigator.notification.alert("No hay detalles para ese elemento");
	}
	
	$.registro = results.rows.item(0);
	$("#categoria").html($.registro.categoria);
		var _foto = $.registro.foto;
		if(_foto == ""){
			_foto = "assets/no_foto.png";
		}
		$("#foto_img").attr("src", _foto);
		$("#nombre").html($.registro.nombre);
		$("#num_tel").html($.registro.telefono);
		$("#telefono").attr("href", "tel:" + $.registro.telefono);
		$("#emails").html("Email: " + $.registro.email);
}





/*
* vista detalle
*/
//vista de la página de edición
$(document).on('pagebeforeshow', '#form', function(){ 
	mkLog('ID recuperado en vista form: ' + $.id);
	
	initForm();
	if(db != null && $.id != -1){
		db.transaction(queryDBFindByIDForm, errorDB);
	}
});

function queryDBFindByIDForm(tx) {
    tx.executeSql('SELECT * FROM agenda_curso WHERE id='+$.id, [], queryFormSuccess, errorDB);
}

function queryFormSuccess(tx, results) {
	mkLog("Recibidos de la DB en vista actualizar" + results.rows.length + " registros");
	if(results.rows.length == 0){
		mkLog("No se han recibido registros para la vista actualizar");
		navigator.notification.alert("No hay detalles para ese elemento");
	}
	
	$.registro = results.rows.item(0);
	
		$.imageURL = $.registro.foto;
		if($.imageURL == ""){
			$.imageURL = "assets/no_foto.png";
		}
		$("#fotoEdit_img").attr("src", $.imageURL);
		$("#ti_nombre").html($.registro.nombre);
		$("#tel").html($.registro.telefono);
		$("#email").html($.registro.email);
		$("#domicilio").html($.registro.domicilio);		
		$("#nota").html($.registro.nota);

		$("#cat_"+$.registro.categoria).trigger("click").trigger("click");	//$("#cat_"+$.registro.categoria).attr("checked",true).checkboxradio("refresh");
		
}
$(document).on('pagebeforeshow', '#incio', function(){ 
	$.id = -1;
});
function initForm(){
	$.imageURL = "assets/no_foto.png";
	
	$("#fotoEdit_img").attr("src", $.imageURL);
	$("#ti_nombre").val("");
	$("#tel").val("");
	$("#email").val("");
	$("#domicilio").val("");   	
	$("#nota").val("");

	$("#cat_amigos").trigger("click").trigger("click") //Clic a una cat elegina

	
}


/*
* modificando registros Pendienteeeee las categoriasaaas!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
function saveEditForm(){
	if(db != null){
		db.transaction(queryDBUpdateForm, errorDB, updateFormSuccess);
	}
}

function queryDBUpdateForm(tx){
	var cat = $("#cajaCategorias").find("input:checked").val();
	tx.executeSql('UPDATE agenda_curso SET nombre="'+$("#ti_nombre").val()+'",foto = "'+$.imageURL+'",telefono="'+$("#tel").val()+'",email="'+$("#email").val()+'",domicilio="'+$("#domicilio").val()+'",categoria="'+cat+'",nota="'+$("#nota").val()+'" WHERE id='+$.id);
}
function updateFormSuccess(tx) {
	var selector = $("#li_"+$.id);
	
	var selector = $("#li_"+$.id).clone(true);
	selector.find("img").attr("src", $.imageURL);
	selector.find("a:first").find("span").html($("#nombreE").val());
	
	
	$("#li_"+$.id).remove();
	
	var cat = $("#cajaCategorias").find("input:checked").val();
	var lista = $("#lista_" + cat + " ul")
	lista.append(selector).listview('refresh');
	
	
	$.mobile.changePage("#home");
}


/*
* Eliminar registro
*/
function deleteForm(){
	if(db != null){
		db.transaction(queryDBUpdateForm, errorDB, updateFormSuccess);
	}
}

function queryDBDeleteForm(tx){
	//var cat = $("#cajaCategorias").find("input:checked").val();
	tx.executeSql('DELETE FROM agenda_curso WHERE id='+$.id);
}
function deleteFormSuccess(tx) {
	
	/*var selector = $("#li_"+$.id);
	var selector = $("#li_"+$.id).clone(true);
	selector.find("img").attr("src", $.imageURL);
	selector.find("a:first").find("span").html($("#nombreE").val());*/
	$("#li_"+$.id).remove();
	/*var cat = $("#cajaCategorias").find("input:checked").val();
	var lista = $("#lista_" + cat + " ul")
	lista.append(selector).listview('refresh');*/
	$.mobile.changePage("#home");
}



/*
* creando registros
*/
function saveNewForm(){
	if(db != null){
		db.transaction(queryDBInsertForm, errorDB);
	}
}

function queryDBInsertForm(tx){
	var cat = $("#cajaCategorias").find("input:checked").val();
	
	tx.executeSql("INSERT INTO agenda_curso (nombre,foto,telefono,email,domicilio,categoria,nota) VALUES ('"+$("#ti_nombre").val()+"','"+$.imageURL+"','"+$("#tel").val()+"','"+$("#email").val()+"','"+$("#domicilio").val()+"','"+cat+"','"+$("#nota").val()+"')", [], newFormSuccess, errorDB);
}
function newFormSuccess(tx, results) {
	var cat = $("#cajaCategorias").find("input:checked").val();
	var lista = $("#lista_" + cat + " ul")
	
	
	var obj = $('<li id="li_'+results.insertId+'"><a href="#infoService" data-uid='+results.insertId+' class="linkDetalles"><div class="interior_lista"><img src="'+ $.imageUR +'" class="img_peq"/><span>' + $("#ti_nombre").val() + '</span></div></a><a href="#form"  data-theme="a" data-uid='+results.insertId+'  class="linkForm">Predet.</a></li>');
	obj.find('.linkDetalles').bind('click', function(e){
		$.id = $(this).data('uid');
	});
	
	obj.find('.linkForm').bind('click', function(e){
		$.id = $(this).data('uid');
	});
	lista.append(obj).listview('refresh');
	
	
	$.mobile.changePage("#home");
}