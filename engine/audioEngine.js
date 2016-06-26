(function(LP) {

  //Creates an audio element
  function getSound(audioItem) {
    var sound = document.createElement("audio");

    sound.src = audioItem.src;
    sound.setAttribute("preload", "auto");
    sound.setAttribute("controls", "none");
    sound.style.display = "none";
    sound.volume = audioItem.volume;
    sound.loop = audioItem.loop;
    document.body.appendChild(sound);
    return sound;
  }

  //As we are not using any library like lodash We look for the audioItem going through the array
  function getAudioItem(key) {
    var index;
    
    for(index = 0; index < audioEngine.sounds.length; index++){
      if(audioEngine.sounds[index].name === key) {
        return audioEngine.sounds[index];
      }
    }
  }

  var audioEngine = {
    playSounds: true,
    playMusic: true,
    sounds : [
      {
        name : "fire",
        src : "/assets/audio/fire.wav",
        volume: 1,
        loop: false
      },
      {
        name : "explosion",
        src : "/assets/audio/explosion.wav",
        volume: 1,
        loop: false
      },
      {
        name : "game-over",
        src : "/assets/audio/game-over.wav",
        volume: 1,
        loop: false
      },
      {
        name : "win",
        src : "/assets/audio/win.wav",
        volume: 1,
        loop: false
      },
      {
        name : "hurry",
        src : "/assets/audio/hurry.wav",
        volume: 1,
        loop: false
      },
      {
        name : "touched",
        src : "/assets/audio/touched.wav",
        volume: 1,
        loop: false
      }
    ],
    gameMusic : {
        name : "music-game",
        src : "/assets/audio/music-game.mp3",
        volume: 0.5, //Valid values 0 to 1
        loop: true //Should start over when finished
    },
    setMusic : function (playMusic) {
      if(playMusic) {
        this.startMusic();
      } else {
        this.stopMusic();
      }
    },
    startMusic: function (){
      this.gameMusic.sound.play();
    },
    stopMusic: function (){
      //please stop it!!!
      this.gameMusic.sound.pause();
    },
    trigger: function(msg) {
      var audioItem = getAudioItem(msg);
      if(audioItem && this.playSounds) {
        audioItem.sound.play();
      }
    },
  };

  //Preloads all sounds
  LP.initAudioEngine = function () {
    var index, audioItem;
    
    for(index = 0; index < audioEngine.sounds.length; index++){
      audioItem = audioEngine.sounds[index];
      audioItem.sound = getSound(audioItem);
    }
    audioEngine.gameMusic.sound = getSound(audioEngine.gameMusic);
    if(audioEngine.playMusic) {
      audioEngine.startMusic();
    }
  }

  LP.audioEngine = audioEngine;

}(this.LP = this.LP || {}));