export {};

declare namespace NodeJS {
  interface Global {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

declare global {
  const webkitSpeechRecognition: new () => SpeechRecognition;
}
