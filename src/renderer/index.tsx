import * as electron from "electron";
import * as ReactDOM from "react-dom";

const AppComponent = () => (
  <main>
    <h1>speeche</h1>
    <button onClick={() => electron.ipcRenderer.send("createTwitterWindow")}>Twitter</button>
    <br />
    ログインしタイムラインを表示すると自動読み込み開始します
    {/* <button onClick={() => electron.ipcRenderer.send("createFacebookWindow")}>Facebook</button> */}
  </main>
);

ReactDOM.render(AppComponent(), document.getElementById("app"));
