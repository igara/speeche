import * as electron from "electron";
import * as React from "react";
import * as ReactDOM from "react-dom";

const AppComponent = () => {
  const [speechToTextTextAreaValue, setSpeechToTextTextAreaValue] = React.useState("");

  React.useEffect(() => {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = true;

    recognition.onresult = event => {
      setSpeechToTextTextAreaValue(`${speechToTextTextAreaValue}
${event.results[event.results.length - 1][0].transcript}`);
    };
    recognition.onend = () => {
      recognition.start();
    };

    recognition.start();
  });

  return (
    <main>
      <h1>speeche</h1>
      <hr />
      <button onClick={() => electron.ipcRenderer.send("createTwitterWindow")}>Twitter</button>
      <br />
      ログインしタイムラインを表示すると自動読み込み開始します
      <hr />
      自動で音声入力されます
      <br />
      <textarea defaultValue={speechToTextTextAreaValue} readOnly={true} />
    </main>
  );
};

ReactDOM.render(<AppComponent />, document.getElementById("app"));
