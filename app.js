(function(){
var PASS=80,start=Date.now();
SCORM.init();
var st=SCORM.get("cmi.core.lesson_status");
if(!st||st==="not attempted")SCORM.set("cmi.core.lesson_status","incomplete");
SCORM.commit();

var $=function(id){return document.getElementById(id)};
var slidesBox=$("slides");

/* ---------- Preguntas ---------- */
var Q=[
 {q:"¿Qué hizo que el correo que recibió Carlos fuera fraudulento?",o:["Tenía un logo de baja calidad","El dominio tenía una letra diferente a la del real","Llegó fuera del horario laboral","Venía con copia a varias personas"],c:1,w:"El dominio falso imitaba al real cambiando una sola letra."},
 {q:"Si el dominio real es davivienda.com, ¿cuál dirección es la legítima?",o:["pagos@davivlenda.com","pagos@davivienda.co","pagos@davivienda.com","pagos@davivienda-pagos.com"],c:2,w:"Solo la coincidencia exacta, letra por letra y con la misma extensión, es legítima."},
 {q:"Te piden cambiar la cuenta donde recibes los pagos. ¿Qué haces primero?",o:["Respondo el correo confirmando los datos","Llamo al teléfono que aparece en la firma del correo","Verifico con mi contacto por un canal que ya conocía","Hago el cambio, ya que el logo es correcto"],c:2,w:"Verifica por un canal conocido e independiente; el teléfono del correo también puede ser falso."},
 {q:"¿Por qué «corn» puede pasar por «com» en una dirección?",o:["Por un error de los servidores","Porque «rn» juntas se parecen a una «m»","Porque el correo cambia letras solo","No pueden confundirse"],c:1,w:"Es un truco visual: la «r» y la «n» juntas imitan una «m»."},
  {q:"¿Cuál es la regla de oro del capítulo?",o:["Responde rápido para no perder el pago","Revisa quién escribe antes de creer lo que pide","Confía si el correo dice URGENTE","Haz clic solo en los botones azules"],c:1,w:"Antes de actuar, confirma quién envía el mensaje."},
 {q:"¿Cuál es una señal de alerta típica?",o:["Un saludo cordial","Presión para actuar hoy y pedir confidencialidad","Un correo con número de factura","Un mensaje en español"],c:1,w:"La urgencia y la confidencialidad buscan que no te detengas a verificar."},
 {q:"¿Cómo revisas de forma segura a dónde lleva un enlace?",o:["Hago clic para ver la página","Se lo reenvío a un compañero","Paso el cursor sobre el enlace sin hacer clic","Lo abro en el celular"],c:2,w:"Al pasar el cursor ves el destino real sin abrirlo."},
 {q:"Detectaste un correo con dominio falso. ¿Qué haces después?",o:["Lo borro y no le digo a nadie","Respondo para advertir al delincuente","Lo reporto por canales oficiales y conservo el correo","Lo reenvío a todos mis contactos"],c:2,w:"Reportar protege a otros y conservar el correo ayuda a la investigación."}
];
var answers=[];
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function buildQuiz(){
  slidesBox.querySelectorAll(".qslide,.rslide").forEach(function(n){n.remove()});
  answers=[];
  Q.forEach(function(it,n){
    var s=document.createElement("section");s.className="slide qslide";s.dataset.lock="q"+n;
    var h="<div class='qn'>PREGUNTA "+(n+1)+" DE "+Q.length+"</div><p class='q'>"+it.q+"</p><div class='opts'>";
    shuffle(it.o.map(function(_,k){return k})).forEach(function(k){h+="<button class='opt' data-k='"+k+"'>"+it.o[k]+"</button>"});
    s.innerHTML=h+"</div><p class='why'></p>";
    s.querySelectorAll(".opt").forEach(function(b){b.onclick=function(){
      var k=+b.dataset.k,right=k===it.c;answers[n]=k;
      s.querySelectorAll(".opt").forEach(function(x){x.disabled=true;if(+x.dataset.k===it.c)x.classList.add("right")});
      if(!right)b.classList.add("wrong");
      s.querySelector(".why").innerHTML="<b style='color:"+(right?"var(--ok)":"var(--red)")+"'>"+(right?"¡Correcto! ":"Incorrecto. ")+"</b>"+it.w;
      var p="cmi.interactions."+n+".";
      SCORM.set(p+"id","q"+(n+1));SCORM.set(p+"type","choice");SCORM.set(p+"correct_responses.0.pattern",String(it.c));
      SCORM.set(p+"student_response",String(k));SCORM.set(p+"result",right?"correct":"wrong");SCORM.commit();
      unlock("q"+n);
    }});
    slidesBox.appendChild(s);
  });
  var r=document.createElement("section");r.className="slide rslide";r.id="result";slidesBox.appendChild(r);
  slides=[].slice.call(slidesBox.querySelectorAll(".slide"));
}

/* ---------- Navegación ---------- */
var slides=[],cur=0,unlocked={};
function unlock(key){unlocked[key]=true;nav()}
function locked(i){var k=slides[i].dataset.lock;return k&&!unlocked[k]}
function show(i){
  cur=i;slides.forEach(function(s,j){s.classList.toggle("on",j===i)});
  if(slides[i].id==="result")finish();
  if(i!==0){var v=$("vid");if(v&&!v.paused)v.pause();}
  nav();SCORM.set("cmi.core.lesson_location",String(i));SCORM.commit();
}
function nav(){
  var last=slides.length-1,isQ=slides[cur].classList.contains("qslide");
  $("prev").disabled=cur===0||isQ||slides[cur].id==="result";
  $("next").disabled=cur===last||locked(cur);
  var pct=Math.round(cur/last*100);$("pct").textContent=pct+"%";$("barfill").style.width=pct+"%";
  $("count").textContent=(cur+1)+" / "+slides.length;
}
$("prev").onclick=function(){if(cur>0)show(cur-1)};
$("next").onclick=function(){if(!$("next").disabled)show(cur+1)};
document.addEventListener("keydown",function(e){if(e.key==="ArrowRight")$("next").click();if(e.key==="ArrowLeft")$("prev").click()});

/* Video */
var v=$("vid");
if(SCORM.get("cmi.suspend_data").indexOf("video=1")>-1)unlocked.video=true;
v.addEventListener("ended",function(){SCORM.set("cmi.suspend_data","video=1");SCORM.commit();unlock("video")});
v.addEventListener("error",function(){unlock("video")},true);

/* Trucos */
var T=[
 ["Letra cambiada","Una «i» por una «l», una «o» por un cero.","pagos@pr<mark>o</mark>veedor.co → pagos@pr<mark>0</mark>veedor.co"],
 ["Letras disfrazadas","«rn» juntas parecen una «m».","co<mark>rn</mark>pras@… ≈ co<mark>m</mark>pras@…"],
 ["Letra de más o de menos","Una letra añadida u omitida pasa desapercibida.","fa<mark>c</mark>turacion@… → faturacion@…"],
 ["Extensión distinta","El nombre es igual, pero cambia el final.","@empresa<mark>.com</mark> → @empresa<mark>.co</mark>"],
 ["Nombre visible engañoso","El nombre que ves no es la dirección real. Ábrela completa.","«Tesorería Cliente» &lt;tesoreria@<mark>pagos-seguros.net</mark>&gt;"]
];
var seenT={};
T.forEach(function(t,i){var b=document.createElement("button");b.className="pill";b.textContent=(i+1)+". "+t[0];b.onclick=function(){showT(i)};$("tabs").appendChild(b)});
function showT(i){
  seenT[i]=1;[].forEach.call($("tabs").children,function(b,j){b.classList.toggle("cur",j===i);if(seenT[j])b.classList.add("seen")});
  $("trick").innerHTML="<b>"+T[i][0]+"</b><p>"+T[i][1]+"</p><code>"+T[i][2]+"</code>";
  if(Object.keys(seenT).length===T.length)unlock("tricks");
}
showT(0);

/* Práctica: una dirección a la vez */
var S=[{a:"pagos@davivlenda.com",h:[11],m:"Una «l» en lugar de la «i». ¡El mismo truco del correo que recibió Carlos!"},
       {a:"pagos@daviviemda.com",h:[13],m:"Una «m» en lugar de la «n»."},
       {a:"pagos@daviviendaa.com",h:[15,16],m:"Hay una «a» de más."},
       {a:"pagos@davivienda.co",h:[16,17,18],m:"Falta la «m»: cambió la extensión de .com a .co."}];
var si=0;
function spot(){
  var s=S[si],box=$("spot");
  box.innerHTML="<div class='sub'>Dirección "+(si+1)+" de "+S.length+"</div><div class='addr'></div><div class='fb'>¿Dónde está el cambio?</div>";
  var addr=box.querySelector(".addr"),fb=box.querySelector(".fb");
  s.a.split("").forEach(function(c,k){var e=document.createElement("span");e.className="ch";e.textContent=c;
    e.onclick=function(){
      if(s.h.indexOf(k)>-1){e.classList.add("hit");fb.innerHTML="<b style='color:var(--ok)'>¡Bien!</b> "+s.m;
        if(si<S.length-1){var b=document.createElement("button");b.className="btn";b.textContent="Siguiente dirección";b.onclick=function(){si++;spot()};box.appendChild(b)}
        else unlock("spot");
      }else{e.classList.remove("miss");void e.offsetWidth;e.classList.add("miss");fb.textContent="Esa no es. Lee letra por letra.";}
    };addr.appendChild(e)});
}
spot();

/* Resultado */
function finish(){
  var ok=0;Q.forEach(function(it,n){if(answers[n]===it.c)ok++});
  var score=Math.round(ok/Q.length*100),pass=score>=PASS;
  SCORM.set("cmi.core.score.raw",score);SCORM.set("cmi.core.score.min",0);SCORM.set("cmi.core.score.max",100);
  SCORM.set("cmi.core.lesson_status",pass?"passed":"failed");SCORM.set("cmi.core.session_time",fmt());SCORM.commit();
  var r=$("result");r.className="slide rslide on "+(pass?"pass":"fail");
  r.innerHTML="<div class='score'>"+score+"%</div><h2>"+(pass?"¡<b>Aprobaste</b>!":"Aún <b>no lo logras</b>")+"</h2><p class='cap'>Respondiste bien "+ok+" de "+Q.length+". "+
   (pass?"Recuerda: ante cualquier cambio de datos de pago, ¡quieto! y verifica.":"Necesitas 80 % para aprobar. Repasa la lección e inténtalo de nuevo.")+"</p>"+
   (pass?"":"<button class='btn' id='retry'>Repasar e intentar de nuevo</button>");
  var rt=$("retry");if(rt)rt.onclick=function(){buildQuiz();show(1)};
}
function fmt(){var s=Math.round((Date.now()-start)/1000),p=function(n){return(n<10?"0":"")+n};return p(Math.floor(s/3600))+":"+p(Math.floor(s%3600/60))+":"+p(s%60)}
window.addEventListener("beforeunload",function(){SCORM.set("cmi.core.session_time",fmt());SCORM.finish()});

buildQuiz();show(0);
})();
