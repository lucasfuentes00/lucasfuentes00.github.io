class Game {
  //REFERENCIADO DE PARZIBYTE
  static SQUARE_LENGTH = screen.width > 420 ? 37 : 27;    //resolución y tamaño del rectángulo
  static COLUMNS = 4;
  static ROWS = 10;
  static CANVAS_WIDTH = this.SQUARE_LENGTH * this.COLUMNS;
  static CANVAS_HEIGHT = this.SQUARE_LENGTH * this.ROWS;
  static EMPTY_COLOR = "#eaeaea";
  static BORDER_COLOR = "#ffffff";
  static MAX_FAULTS = -50;    //numero mínimo de puntaje
  static PIECE_SPEED = 500; //en ms. bpm = 120 => 0.5s

  constructor(canvasId) {
    this.canvasId = canvasId;
    this.board = [];    //array de puntos del rectángulo
    this.song = null;   //array de puntos (notas) de la cancion
    this.globalX = 0;   //referencia x del rectángulo
    this.globalY = 0;   //referencia y del rectángulo
    this.paused = true;
    this.sounds = {};   //array de sonidos (background, wrong y game over)
    this.canPlay = false;
    this.intervalId = null;   //utilizado para ejecutar en bucle al main
    this.score = 0;         //puntaje del jugador
    this.flag = false;      //para comprobar si no se presionó una tecla cuando se indicaba
    this.init();
  }

  init() {
    this.initDomElements();   //inicializar el DOM
    this.initSounds();        //inicializar sonidos
    this.resetGame();
    this.draw();              //dibujar en el canvas
    this.initControls();     //inicializar botones
  }

  resetGame() {
    this.score = 0;
    this.sounds.background.currentTime = 0;
    this.sounds.background.pause();
    this.initBoard();
    this.assignSong();    //inicializar cancion
    this.restartGlobalX();
    this.count = 0;     //indice top del array cancion
    this.step = 0;      //indice bottom del array cancion
    this.globalY = 0;
    this.refreshScore();
    this.pauseGame();
  }

  initControls() {    //REFERENCIADO DE PARZIBYTE
    document.addEventListener("keydown", (e) => {
      const { code } = e;
      if (!this.canPlay && code !== "KeyP") {
        return;
      }
      switch (code) {
        case "KeyA":
          this.checkButton(-1);   //si se presionó un botón, comprobar que sea en el sitio y momento indicado
          break;
        case "KeyS":
          this.checkButton(0);
          break;
        case "KeyD":
          this.checkButton(1);
          break;
        case "KeyF":
          this.checkButton(2);
          break;
        case "KeyP":
          this.pauseOrResumeGame();
          break;
      }
    });

    this.$btnA.addEventListener("click", () => {
      if (!this.canPlay) return;
      this.checkButton(-1);
    });
    this.$btnS.addEventListener("click", () => {
      if (!this.canPlay) return;
      this.checkButton(0);
    });
    this.$btnD.addEventListener("click", () => {
      if (!this.canPlay) return;
      this.checkButton(1);
    });
    this.$btnF.addEventListener("click", () => {
      if (!this.canPlay) return;
      this.checkButton(2);
    });
    [this.$btnPause, this.$btnResume].forEach($btn => $btn.addEventListener("click", () => {
      this.pauseOrResumeGame();
    }));
  }

  pauseOrResumeGame() { //REFERENCIADO DE PARZIBYTE
    if (this.paused) {
      this.resumeGame();
      this.$btnResume.hidden = true;
      this.$btnPause.hidden = false;
    } else {
      this.pauseGame();
      this.$btnResume.hidden = false;
      this.$btnPause.hidden = true;
    }
  }

  pauseGame() { //REFERENCIADO DE PARZIBYTE
    this.sounds.background.pause();
    this.paused = true;
    this.canPlay = false;
    clearInterval(this.intervalId);
  }

  resumeGame() { //REFERENCIADO DE PARZIBYTE
    this.sounds.background.play();
    this.refreshScore();
    this.paused = false;
    this.canPlay = true;
    this.intervalId = setInterval(this.mainLoop.bind(this), Game.PIECE_SPEED);  //reproduccion en bucle del main.
    //toma en cuenta el estado del juego. se reproduce a la velocidad escogida de cancion.
  }

  draw() { //REFERENCIADO DE PARZIBYTE
    let x = 0, y = 0;
    for (const row of this.board) {
      x = 0;
      for (const point of row) {
        this.canvasContext.fillStyle = point.color;
        this.canvasContext.fillRect(x, y, Game.SQUARE_LENGTH, Game.SQUARE_LENGTH);
        this.canvasContext.restore();
        this.canvasContext.strokeStyle = Game.BORDER_COLOR;
        this.canvasContext.strokeRect(x, y, Game.SQUARE_LENGTH, Game.SQUARE_LENGTH);
        x += Game.SQUARE_LENGTH;
      }
      y += Game.SQUARE_LENGTH;
    }
    setTimeout(() => {
      requestAnimationFrame(this.draw.bind(this));
    }, 17);
  }

  paintPoints() {           //pinta la canción en el orden correcto en el rectángulo.
    if (!this.song) return; //si no se iicializó la canción, no pinta

    if (this.count == 0) {

      const point = this.song.points[this.count];
      this.board[this.globalY][point.x + this.globalX].color = point.color;

    } else {

      if (this.count >= Game.ROWS) this.step++;

      for (let i = this.step; i <= this.count; i++) //recorremos la ventana del array que cabe en la tabla
      {
        const point = this.song.points[i];
        this.board[(this.globalY - i) % Game.ROWS][point.x + this.globalX].color = point.color;
      }

      /* this.step indica desde donde se empieza a recorrer el array para pintarlo, y this.count indica cuando
      termina. dado que el array de cancion tiene un tamaño mucho mayor que el de la tabla, al recorrerlo nos interesa
      solo la parte del array que entra.

      el array tiene la información de la x de cada punto (correspondiente a los botones), pero la y es la misma para
      todos. se le resta un "offset" (la i del for) para que al pintarlos en la tabla aparezcan los puntos unos detras
      de otros, en vez de que todos caigan a la vez en una misma fila.

      para que entre en la tabla la posicion y al pintar debe estar referenciada a la tabla, no al array, por lo que
      se calcula el resto del indice respeccto al tamaño vertical de la tabla.*/

    }
  }

  loadSound(src) {    //para cargar los sonidos y la cancion
    const sound = document.createElement("audio");
    sound.src = src;
    sound.setAttribute("preload", "auto");
    sound.setAttribute("controls", "none");
    sound.style.display = "none";
    document.body.appendChild(sound);
    return sound;
  }

  mainLoop() {    //bucle principal del juego
    if (!this.canPlay) {
      return;         //si esta pausado, no se ejecuta.
    }

    this.assignSong();

    if (this.count % Game.ROWS == 0) {
      this.restartGlobalX();          //al recorrer una fila completa, regresar el indice del eje x al principio
    }

    this.syncBoard();   //limpiar y pintar la tabla
    this.globalY++;     //aumentar indice y de tabla
    this.count++;       //aumentar indice del array

    if (this.count == this.song.melody.length) {  //si llega al final, acaba el juego
      this.$score.textContent = `ENHORABUENA!`;
      this.pauseGame();
    }

    this.checkLastRow();    //comprobamos si no se a presionado un boton cuando se debia
    this.checkMinScore();
    this.flag = false;
  }

  assignSong() {
    this.song = new Song();
  }

  refreshScore() {  //REFERENCIADO DE PARZIBYTE
    this.$score.textContent = `Score: ${this.score}`;
  }

  restartGlobalX() {  //REFERENCIADO DE PARZIBYTE
    this.globalX = Math.floor(Game.COLUMNS / 2) - 1;
  }

  syncBoard() {
    this.cleanBoard();
    this.paintPoints();
  }

  initSounds() {
    this.sounds.background = this.loadSound("../assets/my_favorite_things.mp3");  //cancion
    this.sounds.wrong = this.loadSound("../assets/wrong.mp3");          //sonido error
    this.sounds.lick = this.loadSound("../assets/game_over_lick.mp3");  //sonido game over
  }

  initDomElements() {
    this.$canvas = document.querySelector("#" + this.canvasId);
    this.$score = document.querySelector("#puntaje");
    this.$progress = document.querySelector("#progreso");
    this.$btnPause = document.querySelector("#btnPausar");
    this.$btnResume = document.querySelector("#btnIniciar");
    this.$btnA = document.querySelector("#btnA");
    this.$btnS = document.querySelector("#btnS");
    this.$btnD = document.querySelector("#btnD");
    this.$btnF = document.querySelector("#btnF");
    this.$canvas.setAttribute("width", Game.CANVAS_WIDTH + "px");
    this.$canvas.setAttribute("height", Game.CANVAS_HEIGHT + "px");
    this.canvasContext = this.$canvas.getContext("2d");
  }

  initBoard() {
    this.board = [];
    for (let y = 0; y < Game.ROWS; y++) {
      this.board.push([]);
      for (let x = 0; x < Game.COLUMNS; x++) {
        if (y == Game.ROWS - 2) {
          switch (x) {    //pintamos la penultima fila con los colores de los botones
            case 0:
              this.board[y].push({
                color: "#eeffe3",
                taken: false,
              });
              break;

            case 1:
              this.board[y].push({
                color: "#ffd6d6",
                taken: false,
              });
              break;

            case 2:
              this.board[y].push({
                color: "#fdffd4",
                taken: false,
              });
              break;

            case 3:
              this.board[y].push({
                color: "#d4ecff",
                taken: false,
              });
              break;

            default:
              this.board[y].push({
                color: Game.EMPTY_COLOR,
                taken: false,
              });
              break;

          }

        } else {
          this.board[y].push({
            color: Game.EMPTY_COLOR,
            taken: false,
          });

        }
      }
    }
  }

  cleanBoard() {
    for (let y = 0; y < Game.ROWS; y++) {
      for (let x = 0; x < Game.COLUMNS; x++) {
        if (y == Game.ROWS - 2) {
          switch (x) {
            case 0:
              this.board[y][x] = {
                color: "#eeffe3",
                taken: false,
              };
              break;

            case 1:
              this.board[y][x] = {
                color: "#ffd6d6",
                taken: false,
              };
              break;

            case 2:
              this.board[y][x] = {
                color: "#fdffd4",
                taken: false,
              };
              break;

            case 3:
              this.board[y][x] = {
                color: "#d4ecff",
                taken: false,
              };
              break;

            default:
              this.board[y][x] = {
                color: Game.EMPTY_COLOR,
                taken: false,
              };
              break;

          }

        } else {
          this.board[y][x] = {
            color: Game.EMPTY_COLOR,
            taken: false,
          };

        }
      }
    }
  }

  checkButton(x) {

    //si al presionar un boton este tiene el color correspondiente al mismo, aumenta la puntuacion

    if (this.board[Game.ROWS - 2][x + this.globalX].color == "#aded82" ||
        this.board[Game.ROWS - 2][x + this.globalX].color == "#e86868" ||
        this.board[Game.ROWS - 2][x + this.globalX].color == "#f1f77e" ||
        this.board[Game.ROWS - 2][x + this.globalX].color == "#5faded")
        {
            this.score = this.score + 5;
            this.refreshScore();
            this.$progress.textContent = 'Correcto!';
            this.flag = true;
    } else {
      this.score = this.score - 5;
      this.refreshScore();
      this.$progress.textContent = 'Incorrecto!';
      this.sounds.wrong.play();
      this.flag = false;
    }

    this.checkMinScore();   //comprobamos si el puntaje llego al minimo y se acaba
  }

  checkLastRow(){

    //si ha pasado una nota por los botones y no se ha presionado, disminuye el puntaje

    if ((this.board[Game.ROWS - 1][-1 + this.globalX].color == "#aded82" ||
        this.board[Game.ROWS - 1][0 + this.globalX].color == "#e86868" ||
        this.board[Game.ROWS - 1][1 + this.globalX].color == "#f1f77e" ||
        this.board[Game.ROWS - 1][2 + this.globalX].color == "#5faded")
        && this.flag == false)
        {
            this.score = this.score - 5;
            this.refreshScore();
            this.sounds.wrong.play();
            this.$progress.textContent = 'Falta!';
    }
  }

  checkMinScore() {
    if (this.score == Game.MAX_FAULTS) {  //si se llega al minimo, acaba el juego
      this.canPlay = false;
      this.sounds.background.pause();
      this.sounds.lick.play();
      this.$score.textContent = `HA PERDIDO`;
    }
  }

  async resetButton() {
    this.resetGame();
  }
}

class Song {
  constructor() {
    this.melody = [2, 4, 4, 3, 3, 2, 1, 1, 2, 3, 3, 2, 0, 4, 4, 3, 3, 2, 1, 1, 2, 3, 3, 2, 2, 4, 3, 2, 3, 2, 1, 4, 3, 2, 2, 2, 1, 2, 3, 4, 2, 3, 4, 4, 4, 3, 3, 3, 0, 0, 0, 0, 0,0 ,0, 0, 0, 0, 0];
    this.points = [];

    /* this.melody es un array referencia de las notas y su orden. segun la nota, se le asigna un punto con coordenadas
    en this.points. la idea es tener distintas melodias despues (distintos arrays this.melody) que escoja el usuario, y
    rellenar this.points segun la que se haya elegido.
    */

    for (let k = 0; k < this.melody.length; k++) {
      switch (this.melody[k]) {
        case 0:
          this.points[k] = new Point(0, 0);
          this.points[k].color = Game.EMPTY_COLOR;
          break;
        case 1:
          this.points[k] = new Point(-1, 0);
          this.points[k].color = "#aded82";
          break;
        case 2:
          this.points[k] = new Point(0, 0);
          this.points[k].color = "#e86868";
          break;
        case 3:
          this.points[k] = new Point(1, 0);
          this.points[k].color = "#f1f77e";
          break;
        case 4:
          this.points[k] = new Point(2, 0);
          this.points[k].color = "#5faded";
          break;
        default:
          this.points[k] = null;
          this.points[k].color = Game.EMPTY_COLOR;
          break;
      }
    }
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const game = new Game("canvas");
document.querySelector("#reset").addEventListener("click", () => {
  game.resetButton();
});
