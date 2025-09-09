// Play the bundled audio file in /public when triggered
// Reuse a single HTMLAudioElement to avoid multiple overlapping contexts
// Global toggle to enable/disable all sounds. Default: disabled
// initialize from localStorage on client, default false
export let soundsEnabled = false

export function getSoundsEnabled() {
  return soundsEnabled
}

export function setSoundsEnabled(value) {
  soundsEnabled = !!value

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('app_sounds_enabled', soundsEnabled ? '1' : '0')
    }
  } catch (_) {}
}

// Sync initial value from localStorage when running in browser

if (typeof window !== 'undefined') {
  try {
    if (window.localStorage) {
      const stored = window.localStorage.getItem('app_sounds_enabled')

      soundsEnabled = stored === '1'
    }
  } catch (_) {}
}

let cachedAudio = null
let cachedAudioTalebi = null
let cachedAudioNokhost = null
let cachedAudioAtshi = null
let cachedAudioFatehi = null
let cachedAudioAmir = null
let cachedAudioMorteza = null
let cachedAudioSharif = null
let cachedAudioSadri = null
let cachedAudioPezhman = null
let cachedAudioPayamani = null
let cachedAudioKhanom = null

export function playShirzadSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudio) {
      cachedAudio = new Audio('/sounds/goddamn.mp3')
      cachedAudio.preload = 'auto'
      cachedAudio.volume = 0.9
    }

    try {
      cachedAudio.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudio.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // Fallback: ignore if audio cannot play
  }
}

export function playTalebiSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioTalebi) {
      cachedAudioTalebi = new Audio('/sounds/oh-my-god-bruh-ah-hell-no.mp3')
      cachedAudioTalebi.preload = 'auto'
      cachedAudioTalebi.volume = 0.9
    }

    try {
      cachedAudioTalebi.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioTalebi.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playNokhostSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioNokhost) {
      cachedAudioNokhost = new Audio('/sounds/my-movie-6_0RlWMvM.mp3')
      cachedAudioNokhost.preload = 'auto'
      cachedAudioNokhost.volume = 0.9
    }

    try {
      cachedAudioNokhost.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioNokhost.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playAtshiSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioAtshi) {
      cachedAudioAtshi = new Audio('/sounds/atashi.mp3')
      cachedAudioAtshi.preload = 'auto'
      cachedAudioAtshi.volume = 0.9
    }

    try {
      cachedAudioAtshi.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioAtshi.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playFatehiSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioFatehi) {
      cachedAudioFatehi = new Audio('/sounds/khabbodam.mp3')
      cachedAudioFatehi.preload = 'auto'
      cachedAudioFatehi.volume = 0.9
    }

    try {
      cachedAudioFatehi.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioFatehi.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playAmirSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioAmir) {
      cachedAudioAmir = new Audio('/sounds/george-micael-wham-careless-whisper-1.mp3')
      cachedAudioAmir.preload = 'auto'
      cachedAudioAmir.volume = 0.9
    }

    try {
      cachedAudioAmir.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioAmir.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playMortezaSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioMorteza) {
      cachedAudioMorteza = new Audio('/sounds/erro.mp3')
      cachedAudioMorteza.preload = 'auto'
      cachedAudioMorteza.volume = 0.9
    }

    try {
      cachedAudioMorteza.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioMorteza.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playsharifSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioSharif) {
      cachedAudioSharif = new Audio('/sounds/khoda-technologya.mp3')
      cachedAudioSharif.preload = 'auto'
      cachedAudioSharif.volume = 0.9
    }

    try {
      cachedAudioSharif.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioSharif.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playSadriSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioSadri) {
      cachedAudioSadri = new Audio('/sounds/cat-laugh-meme-1.mp3')
      cachedAudioSadri.preload = 'auto'
      cachedAudioSadri.volume = 0.9
    }

    try {
      cachedAudioSadri.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioSadri.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playPezhmanSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioPezhman) {
      cachedAudioPezhman = new Audio('/sounds/gopgopgop.mp3')
      cachedAudioPezhman.preload = 'auto'
      cachedAudioPezhman.volume = 0.9
    }

    try {
      cachedAudioPezhman.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioPezhman.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playPayamaniSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioPayamani) {
      cachedAudioPayamani = new Audio('/sounds/spiderman-meme-song.mp3')
      cachedAudioPayamani.preload = 'auto'
      cachedAudioPayamani.volume = 0.9
    }

    try {
      cachedAudioPayamani.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioPayamani.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}

export function playKhanomSound() {
  if (!soundsEnabled) return

  try {
    if (!cachedAudioKhanom) {
      cachedAudioKhanom = new Audio('/sounds/999-social-credit-siren.mp3')
      cachedAudioKhanom.preload = 'auto'
      cachedAudioKhanom.volume = 0.9
    }

    try {
      cachedAudioKhanom.currentTime = 0
    } catch (_) {}

    const playPromise = cachedAudioKhanom.play()

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {})
    }
  } catch (_) {
    // ignore
  }
}
