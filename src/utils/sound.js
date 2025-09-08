// Play the bundled audio file in /public when triggered
// Reuse a single HTMLAudioElement to avoid multiple overlapping contexts
let cachedAudio = null
let cachedAudioTalebi = null
let cachedAudioNokhost = null
let cachedAudioAtshi = null
let cachedAudioFatehi = null

export function playShirzadSound() {
  try {
    if (!cachedAudio) {
      cachedAudio = new Audio('/goddamn.mp3')
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
  try {
    if (!cachedAudioTalebi) {
      cachedAudioTalebi = new Audio('/oh-my-god-bruh-ah-hell-no.mp3')
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
  try {
    if (!cachedAudioNokhost) {
      cachedAudioNokhost = new Audio('/my-movie-6_0RlWMvM.mp3')
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
  try {
    if (!cachedAudioAtshi) {
      cachedAudioAtshi = new Audio('/atashi.mp3')
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
  try {
    if (!cachedAudioFatehi) {
      cachedAudioFatehi = new Audio('/khabbodam.mp3')
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
