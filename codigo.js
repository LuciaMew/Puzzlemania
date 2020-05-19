var _ANCHO_ = 360,
    _ALTO_ = 240,
    ncols = 6,
    nfilas = 4,
    dificultad = "Fácil",
    dim = 60,
    MatrizOrigen = [],
    MatrizPuzzle = [],
    hacomenzado = 0,
    movimientos = 0,
    segundos = 0,
    ec1,ef2,ec2,efa,eca,
    dif = [[6,4],[9,6],[12,8]],
    ef1 = null,
    cols, fils,
    estaSms = false;

function prepararCanvas(){
    let cvs = document.querySelectorAll('canvas');

    cvs.forEach(function(e){
        e.width = _ANCHO_;
        e.height = _ALTO_;
    });

    /* ZONA PARA MOSTRAR LA IMAGEN */
    dibujarTexto();

    //drag&drop --> arrastrar y soltar imagen. Diapositiva 60 del tema 7 API's HTML.
    let cv01 = document.querySelector('#cv01'); //Guarda el primer canvas en una variable.
    cv01.ondragover = function(e){ //se dispara cuando el elemento arrastrado esta sobre el objetivo de colocacion.
        if(hacomenzado == 0 && !estaSms){ //resalte el canvas donde pueden subir la imagen mientras no haya emprzado el juego.
            e.stopPropagation(); //dejamos de propagar el evento para que no llegue al navegador y se quede en el canvas.
            e.preventDefault();
            document.getElementById("cv01").style.border="2px solid #00AA00FF"; //resalto el borde del canvas.
        }
    };
    cv01.ondragleave = function(e){ //se dispara cuando el elemento arrastrado sale del objetivo de colocacion.
        if(hacomenzado == 0){
            dibujarTexto();
            document.getElementById("cv01").style.border="1px solid #000000"; //para que vuelva a la normalidad el borde cuando el raton arrastrando un elemento esta fuera del canvas.
        }
    }
    cv01.ondrop = function(e){ //se dispara cuando el elemento arrastrado cae en el destino de colocacion.
        if(hacomenzado == 0){
            e.stopPropagation();
            e.preventDefault();

            let fichero = e.dataTransfer.files[0],
                fr = new FileReader();

            if (fichero.type.match('image/*')){ //Si el tipo de archivo es imagen.
                document.getElementById("sms").innerHTML = ""; //borro el parrafo de error.
                cv01.width = cv01.width;  //limpio los canvas primero.
                /*cv02.width = cv02.width;*/
                fr.onload = function(){ //carga la imagen que se arrastra.
                    let img = new Image();
                    img.onload = function(){
                        let ctx01 = cv01.getContext('2d');
                        ctx01.drawImage(img, 0, 0, cv01.width, cv01.height);
                        saberDificultad(); //para que pinte la imagen en el canvas 2 pero con las lineas.
                        /*let ctx02 = cv02.getContext('2d');
                        ctx02.drawImage(img, 0, 0, cv02.width, cv02.height);*/
                    };
                    img.src = fr.result;
                    //document.getElementById("cv01").style.border="1px solid #000000";
                };
                fr.readAsDataURL(fichero); //operacion asincrona --> necesita onload antes.
                //Activo la seleccion de la dificultad y el color de las lineas.
                document.getElementById("dificultad").disabled = false;
                document.getElementById("color-lineas").disabled = false;
            }else{// El formato del archivo arrastrado no es una imagen.
                dibujarTexto();
                document.getElementById("sms").innerHTML = "<br>No es un formato de imagen";
                document.getElementById("sms").classList.add("msjError");
                document.getElementById("foto").value="";
            }
        }
    };
    cv01.onclick = function(e){ //se activa cuando se clicka con el puntero del mouse el elemento.
        if(hacomenzado == 0 && !estaSms){
            document.getElementById("cv01").style.border="2px solid #00AA00FF"; //resalto el borde del canvas.
            popFileSelector(); //para cargar la imagen si clican en el canvas.
            //saberDificultad();
        }
    };
    cv01.onmousemove = function(e){ //se activa cuando el puntero del mouse se mueve fuera de un elemento.
        if(hacomenzado == 0 && !estaSms){
            document.getElementById("cv01").style.border="2px solid #00AA00FF"; //para que el borde vuelva a la normalidad.
        }
    };
    cv01.onmouseout = function(e){ //se activa cuando el puntero del mouse se mueve fuera de un elemento.
        document.getElementById("cv01").style.border="1px solid #000000"; //para que el borde vuelva a la normalidad.
    };
}

/* ZONA PARA MOSTRAR LA IMAGEN */
function dibujarTexto(){ //texto de `no hay imagen seleccionada`.
    let cv  = document.getElementById('cv01'),
        ctx = cv.getContext('2d');

    cv.width = cv.width; //limpio el canvas primero.
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.shadowOffsetX = 5; //la sombra se mueve desde el rectangulo hacia la derecha 5px.
    ctx.shadowOffsetY = 5; //la sombra se mueve desde el rectangulo hacia abajo 5px.
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000';
    ctx.fillText('Haz click o arrastra una imagen aquí', _ANCHO_ / 2, _ALTO_ / 2); //texto relleno.
    //ctx.strokeText('Haz click o arrastra una imagen aquí', _ANCHO_ / 2, _ALTO_ / 2); //texto pintado solo bordes.
    ctx.lineWidth = 2; //cambia el ancho de la linea.
}
function popFileSelector(){ //funcion que abre el explorador de archivos desde la imagen.
    let el = document.getElementById('foto');
    if (el) {
        el.click();
    }
}
function preview(e){ //para cambiar la imagen.
    let idFile = "foto";
    if(e.files && e.files[0]){ //PREGUNTAR
        if (e.files[0].type.match('image.*')){ // Comprobamos que sea un formato de imagen.
            let imgsize = document.getElementById(idFile).files[0].size;
            let reader= new FileReader(); // Inicializamos un FileReader. Permite que las aplicaciones web lean ficheros (o informacion en buffer) almacenados en el cliente de forma asincrona.
            reader.onload=function(e){ // El evento onload se ejecuta cada vez que se ha leido el archivo correctamente.
                document.getElementById("sms").innerHTML = ""; //borro el parrafo de error.
                pintarImagen(e.target.result);
            }
            reader.onerror=function(e){ // El evento onerror se ejecuta si ha encontrado un error de lectura.
                dibujarTexto(); //pongo el texto de que no hay imagen en el canvas.
                document.getElementById("sms").innerHTML = "<br>Error de lectura en la imagen seleccionada"; //pongo un mensaje del error.
                //document.getElementById("cv01").style.border="1px solid #000000";
                document.getElementById("sms").classList.add("msjError"); //le pongo el estilo de la clase msjError.
                document.getElementById("foto").value=""; //borro la seleccion.
            }
            reader.readAsDataURL(e.files[0]); // Indicamos que lea la imagen seleccionada por el usuario de su disco duro.
        }else{ // El formato del archivo no es una imagen.
            dibujarTexto();
            document.getElementById("sms").innerHTML = "<br>No es un formato de imagen";
            //document.getElementById("cv01").style.border="1px solid #000000";
            document.getElementById("sms").classList.add("msjError");
            document.getElementById("foto").value="";
        }
    }
}
function pintarImagen(imagen){ //pintta la imagen cargada desde el explorador de archivos en el canvas 1 y 2.
    let cv01 = document.getElementById('cv01'),
        ctx01 = cv01.getContext('2d'),
        cv02 = document.getElementById('cv02'),
        ctx02 = cv02.getContext('2d'),
        img = new Image();

    img.onload = function(){//que es lo que tiene que hacer cuando cargue la imagen.
        cv01.width = cv01.width; //limpio los canvas primero.
        cv02.width = cv02.width;
        ctx01.drawImage(img, 0, 0, cv01.width, cv01.height); //va a ir desde el punto 0,0 hasta el ancho y alto del canvas.
        //ctx02.drawImage(img, 0, 0, cv02.width, cv02.height);
        saberDificultad();
    };
    img.src = imagen;
    //Activo la seleccion de la dificultad y el color de las lineas.
    document.getElementById("dificultad").disabled = false;
    document.getElementById("color-lineas").disabled = false;
    //document.getElementById("cv01").style.border="1px solid #000000";
}
function saberDificultad(){ //para saber la dificultad elegida y que pinte las lineas del canvas e inicialice las variables necesarias. Se invoca cada ves que cambien el color de la linea o la dificultad.
    let d = document.getElementById("dificultad");
    /*console.log(d);
    console.log(d.selectedIndex);*/
    nivel = d.selectedIndex; //PARA SABER LA DIFICULTAD
    if(d.selectedIndex == 0){
        ncols = 6;
        nfilas = 4;
        dificultad = "Fácil";
        dim = 60;
    }
    if(d.selectedIndex == 1){
        ncols = 9;
        nfilas = 6;
        dificultad = "Medio";
        dim = 40;
    }
    if(d.selectedIndex == 2){
        ncols = 12;
        nfilas = 8;
        dificultad = "Difícil";
        dim = 30;
    }
    iniciarMatrices();
    dibujarLineas();
}
function iniciarMatrices(){ //inicia las matrices (la original para luego comparar si esta bien y la desordenada del juego).
    MatrizOrigen = [];
    MatrizPuzzle = [];
    for(let i=0; i<ncols; i++){
        MatrizOrigen[i] = [];
        MatrizPuzzle[i] = [];
        for(let j=0; j<nfilas; j++){
            MatrizOrigen[i][j] = String(i) + String(j);
            MatrizPuzzle[i][j] = String(i) + String(j);
        }
    }
    /*console.log("mO1: ");
    console.log(MatrizOrigen);
    console.log("mP1: ");
    console.log(MatrizPuzzle);*/
}
function dibujarLineas(){ //pinta la imagen en el canvas 2 (el del juego) y pinta las lineas.
    let cv = document.querySelector('#cv02'),
        ctx = cv.getContext('2d'),
        dim1 = cv.width / ncols,
        dim2 = cv.height / nfilas;

    /*cv.width = cv.width; //limpio el canvas primero.*/
    copiarCanvas();
    ctx.beginPath();
    ctx.strokeStyle = document.querySelector('#color-lineas').value;
    ctx.lineWidth = 2;

    for(let j=0; j<ncols;j++){
        //lineas verticales
        ctx.moveTo(j*dim1, 0);
        ctx.lineTo(j*dim1, cv.height);
    }
    for(let i=0; i<nfilas;i++){
        //lineas horizontales
        ctx.moveTo(0, i*dim2);
        ctx.lineTo(cv.width, i*dim2);
    }

    ctx.rect(0, 0, cv.width, cv.height); //para que me dibuje las lineas de los bordes del canvas que faltan, de forma optimizada.
    ctx.stroke();//para que pinte las lineas del for todas a la vez.
    if(segundos<=0)
        document.getElementById("jugar").disabled = false;
}

/* ZONA DEL PUZZLE */
function copiarCanvas(){
    let cv01 = document.querySelector("#cv01"),
        cv02 = document.querySelector("#cv02"),
        ctx01 = cv01.getContext('2d'),
        ctx02 = cv02.getContext('2d');

    //para pintar el canvas cuadradito por cuadradito.
    cv02.width = cv02.width; //limpio el canvas donde estara el juego (el 2) primero.
    for(let i=0; i<ncols; i++){
        for(let j=0; j<nfilas; j++){
            let num = Number(MatrizPuzzle[i][j]),
                c = Math.floor(num/10),
                f = num%10,
                [col,fila] = [c,f],
                imgData = ctx01.getImageData(col*dim, fila*dim, dim, dim);
            ctx02.putImageData(imgData, i*dim, j*dim);
        }
    }
    /*console.log("mO2: ");
    console.log(MatrizOrigen);
    console.log("mP2: ");
    console.log(MatrizPuzzle);*/
}
function jugar(){
    console.log("a jugaaar!!");
    let cv01 = document.querySelector('#cv01');
    document.getElementById("fin").disabled = "disabled";
    if(hacomenzado == 0){
        hacomenzado = 1;
        segundos = 0;
        desordenarMatriz();
        //Desactivo:
        document.getElementById("jugar").disabled = true;
        document.getElementById("foto").disabled = true;
        document.getElementById("dificultad").disabled = true;
        document.getElementById("color-lineas").disabled = true;
        //Activo:
        document.getElementById("fin").disabled = false;
        document.getElementById("ayuda").disabled = false;

        var piezas = numPiezasDesordenadas();
        console.log("p: " + piezas);

        movimiento_raton();
        smsMarcador(piezas);

        tiempo();
    }
}
function desordenarMatriz(){
    let n = nfilas*ncols; //para que desordene todas las piezas
    while(n>=0){
        //console.log('desordenando...');
        let fil1 = Math.floor(Math.random()*ncols),
            fil2 = Math.floor(Math.random()*ncols),
            col1 = Math.floor(Math.random()*nfilas),
            col2 = Math.floor(Math.random()*nfilas),
            antes = MatrizPuzzle[fil1][col1],
            despues = MatrizPuzzle[fil2][col2];
        //console.log("a1: " + antes);
        //console.log("d1: " + despues);
        MatrizPuzzle[fil1][col1] = despues;
        MatrizPuzzle[fil2][col2] = antes;
        n--;
    }
    dibujarLineas(); //para que redibuje el canvas desordenado.
    /*console.log("mO1: ");
    console.log(MatrizOrigen);
    console.log("mP1: ");
    console.log(MatrizPuzzle);*/
}
function numPiezasDesordenadas(){
    let nPiezasDes = 0;
    for(let i=0; i<ncols; i++){
        for(let j=0; j<nfilas; j++){
            /*console.log("comparacion: ");
            console.log(MatrizOrigen[i][j]);
            console.log(MatrizPuzzle[i][j]);*/
            if(MatrizOrigen[i][j] != MatrizPuzzle[i][j]){
                nPiezasDes ++;
            }
        }
    }
    return nPiezasDes;
}
function smsMarcador(piezas){ //Mensaje emergente cuando los datos son correctos en Login.
    let sms = document.createElement("p"),
        ref = document.getElementById('smsMarcador');
    sms.innerHTML = `<h3>Marcador:</h3>
                    <span id="piezas">Piezas desordenadas: </span>
                    <span id = "desord">${piezas}</span><br>
                    <span id="movimientos">Movimientos realizados: </span>
                    <span id = "movs">${movimientos}</span><br>
                    <span id="segundos">Segundos transcurridos: </span>
                    <span id="secs">${segundos}</span<br>`;
    ref.appendChild(sms);
}
function terminarJuego(){
    console.log("fin :(");
    document.getElementById("fin").disabled = true;
    document.getElementById("ayuda").disabled = true;
    parar();
    //console.log(segundos);
    // meter en el parrafo el mensaje que hay que mostrar en el div que he creado en el html.
    var piezas = numPiezasDesordenadas();
    console.log("p fin: " + piezas);
    hacomenzado = 0;
    smsFinalizarJuego(piezas);
}
function smsFinalizarJuego(piezas){ //Mensaje emergente cuando quieres parar de jugar.
    let ventana = document.getElementById('ventanaFinJuegoSinTerminar');
    ventana.style.marginTop = "200px";
    ventana.style.left = ((document.body.clientWidth-350) / 2) + "px"; //calcula el ancho de la pantalla del cliente para que salga en medio.
    ventana.style.display = 'block';

    let sms = document.createElement("p");
    sms.innerHTML = `<h3>Fin del Juego</h3>
                    <p>Has dejado ${piezas} piezas por colocar bien después de ${movimientos} movimientos y has empleado ${segundos} segundos.<br></p>
                    <input type="button" onclick="resetear();" value="Cerrar mensaje">`;
    estaSms = true;
    ventana.appendChild(sms);
}
function smsJuegoGanado(){ //Enviamos mensaje emergente para cuando se las piezas desordenadas son = 0.
    //console.log("Estás llegando aqui o no");
    let ventana = document.getElementById('ventanaFinJuegoGanado');
    ventana.style.marginTop = "200px";
    ventana.style.left = ((document.body.clientWidth-350) / 2) + "px"; //calcula el ancho de la pantalla del cliente para que salga en medio.
    ventana.style.display = 'block';

    let sms = document.createElement("p");
    sms.innerHTML = `<h3>¡Enhorabuena! ¡Has terminado el puzzle!</h3>
                    <p>Has conseguido ganar después de ${movimientos} movimientos y has empleado ${segundos} segundos.<br></p>
                    <input type="button" onclick="resetear();" value="Cerrar mensaje">`;
    estaSms = true;
    ventana.appendChild(sms);
}
function resetear(){
    //Inicializo variables globales:
    hacomenzado = 0;
    _ANCHO_ = 360;
    _ALTO_ = 240;
    ncols = 6;
    nfilas = 4;
    dificultad = "Fácil";
    dim = 60;
    MatrizOrigen = [];
    MatrizPuzzle = [];
    movimientos = 0;
    segundos = 0;
    estaSms = false;

    ec1;
    ef2;
    ec2;
    efa;
    eca;
    dif = [[6,4],[9,6],[12,8]];
    ef1 = null;
    cols;
    fils;
    //Preparo Canvas:
    prepararCanvas();
    //Desactivo:
    document.getElementById("jugar").disabled = true;
    document.getElementById("dificultad").disabled = true;
    document.getElementById("color-lineas").disabled = true;
    document.getElementById("fin").disabled = true;
    document.getElementById("ayuda").disabled = true;
    //Activo:
    document.getElementById("foto").disabled = false;
    //Borro Marcador:
    let ref = document.getElementById('smsMarcador'),
        ventana1 = document.getElementById('ventanaFinJuegoSinTerminar'),
        ventana2 = document.getElementById('ventanaFinJuegoGanado'),
        file = document.getElementById("foto"),
        color = document.getElementById("color-lineas");
    ref.innerHTML = "";
    ventana1.innerHTML = "";
    ventana2.innerHTML = "";
    file.value = "";
    color.value = "#000000"

    //Oculto el mensaje modal FinJuego:
    ocultarFinalizarJuego();
}
function sleep(time){ // funcion sleep en js, tiempo en milisegundos.
  return new Promise((resolve) => setTimeout(resolve, time)); //con una promesa.
}
function ocultarFinalizarJuego(){
    var ventana1 = document.getElementById('ventanaFinJuegoSinTerminar');
    var ventana2 = document.getElementById('ventanaFinJuegoGanado');
    sleep(300).then(() => { // uso del sleep
        //hacer algo despues del sleep
        ventana1.style.display = 'none';
        ventana2.style.display = 'none';
    });
}

//.....voy por aqui
function ayuda(){
    console.log("ayudaaaa!!");
	document.getElementById("ayuda").disabled = true;
    for(let i=0; i<ncols; i++){
        for(let j=0; j<nfilas; j++){
            if(MatrizOrigen[i][j] != MatrizPuzzle[i][j]){
                let cv = document.getElementById("cv02"),
                    d = nivel,
                    x = cv.offsetX,
                    y = cv.offsetY,
                    dim = cv.width / dif[d][0],
                    dimy = cv.height / dif[d][1],
                    ctx = cv.getContext('2d');

                //Coloreo de rojo los lugares que no coincidan
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255, 0, 4, .5)';
                ctx.lineWidth = 4;
                ctx.fillRect(i * dim, j * dimy, dim, dimy);
                //BORRO LA AYUDA CUANDO EL RATON PASA POR ENCIMA
                cv.onmouseover = function(){
                    if(hacomenzado == 1){
                	   document.getElementById("ayuda").disabled = false; //lo activa.
                        dibujarLineas();
                    }
                }
            }
        }
    }
}
function tiempo(){
    ventan = window.setInterval(function (){
        segundos++;
        document.getElementById("secs").innerHTML = segundos;
    },1000);
}
function parar(){ //Esta funcion es para dejar de contar los segundos transcurridos.
    window.clearInterval(ventan);
}
function sacarFilaColumna(e){
    let x = e.offsetX,
        y = e.offsetY,
        dim = e.target.width / ncols,
        fila, col;

    //sacar fila y columna
    col = Math.floor(x / dim);
    fila = Math.floor(y / dim);
    return [col, fila];
}
//Calculamos la copiarCanvas();posición del ratón dentro del canvas
//Desde aqui tambien controlo el movimiento de fichas
function movimiento_raton(){
    cv02.onmousemove = function(e){
        if(hacomenzado == 1){
            //console.log(e);
            let x = e.offsetX,
                y = e.offsetY,
                dim = e.target.width / ncols,
                [col, fila] = sacarFilaColumna(e),
                cv = e.target,
                ctx = cv.getContext('2d'),
                dimy = cv.height / dif[nivel][1];

            //Funcion para cuando hacemos click en el canvas
            cv02.onclick = function(e){
                if(hacomenzado == 1){
                    let cv = e.target,
                        d = nivel,
                        x = e.offsetX,
                        y = e.offsetY,
                        dim = cv.width / dif[d][0],
                        dimy = cv.height / dif[d][1],
                        fila = Math.floor( y / dimy),
                        columna = Math.floor( x / dim),
                        c2 = document.getElementById("cv02"),
                        ctx2 = c2.getContext('2d');

                    if(x<1 || x>cv.width-1 || y<1 || y>cv.height-1){
                        return;
                    }

                    //Pinto de azul el recuadro sobre el que se hace click, cada vez que se hace click
                    //se limpia el anterior y se dibuja un cuadro azul nuevo
                    /*cv.width = cv.width; //esto no hace falta pq ya lo hace dibujarLineas();.
                    copiarCanvas();*/
                    dibujarLineas(); //limpia el canvas, copia la imagen de nuevo y dibuja las lineas.
                    let ctx = cv.getContext('2d');
                    ctx.beginPath();
                    ctx.fillStyle = 'rgba(50, 100, 255, 0.5)';
                    ctx.lineWidth = 4;
                    ctx.fillRect(columna * dim, fila * dimy, dim, dimy);
                    var variable;

                    //Guardo las coordenadas del primer y segundo click
                    if(ef1==null){
                        ef1=fila;
                        ec1=columna;
                    }else{
                        ef2=fila;
                        ec2=columna;

                        //Intercambio las piezas (la seleccionada antes con la seleccionada despues)
                        var ants = MatrizPuzzle[ec1][ef1];
                        var desps = MatrizPuzzle[ec2][ef2];
                        MatrizPuzzle[ec1][ef1] = desps;
                        MatrizPuzzle[ec2][ef2] = ants;

                        //Si la matriz ha cambiado incremento los movimientos y los muestro por pantalla
                        if(MatrizPuzzle[ec1][ef1]!=ants){
                            movimientos++;
                            document.getElementById("movs").innerHTML = movimientos;
                        }
                        dibujarLineas();
                    }
                    //Escribo en el html el número de piezas desordenadas que quedan
                    document.getElementById("desord").innerHTML = numPiezasDesordenadas();

                    //Si no quedan piezas desordenadas envío mensaje de juego ganado
                    if(numPiezasDesordenadas()==0){
                        parar();
                        dibujarLineas();
                        document.getElementById("ayuda").disabled = true;
                        document.getElementById("fin").disabled = true;
                        hacomenzado = 0;
                        smsJuegoGanado();
                    }
                    //Si las coordenadas del primer click coinciden con las del segundo
                    //reinicio la cuadricula para deseleccionar el cuadradito
                    if(ef1==ef2 && ec1==ec2){
                        dibujarLineas();
                    }
                    if(ef2!=null){
                        ef1=null;
                        ef2=null;
                        ec1=null;
                        ec2=null;
                    }
                }
            }
            //EstcopiarCanvas();o es para que vaya pintando todas las cuadriculas de alrededor de la seleccionada de negro
            //de esta forma conseguimos "borrar", la cuadricula verde anterior y hacer que vuelva a ser negra
            //sin borrar lo seleccionado con el ratón
            if(segundos>0){
                ctx.beginPath();
                ctx.strokeStyle = document.querySelector('#color-lineas').value;
                ctx.lineWidth = 2;
                ctx.strokeRect((col+1) * dim, (fila) * dimy, dim, dimy);
                ctx.strokeRect((col+1) * dim, (fila-1) * dimy, dim, dimy);
                ctx.strokeRect((col+1) * dim, (fila+1) * dimy, dim, dimy);
                ctx.strokeRect((col) * dim, (fila+1) * dimy, dim, dimy);
                ctx.strokeRect((col) * dim, (fila-1) * dimy, dim, dimy);
                ctx.strokeRect((col-1) * dim, (fila-1) * dimy, dim, dimy);
                ctx.strokeRect((col-1) * dim, (fila+1) * dimy, dim, dimy);
                ctx.strokeRect((col-1) * dim, (fila) * dimy, dim, dimy);
                ctx.closePath();

                //Pinto de verde el cuadrado sobre el que esta encima el ratón
                ctx.beginPath();
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 2;
                ctx.strokeRect(col * dim, fila * dimy, dim, dimy);
                ctx.closePath();
                //document.querySelector('#posXY').innerHTML = `(${x}, ${y}) (Col:${col},Fila:${fila})`;
            }
        }
    }
}
