import { useCallback, useEffect } from "react";
import viteLogo from "/vite.svg";

function App() {
  useEffect(() => {
    function a(e: MessageEvent) {
      console.log(e);
    }
    window.addEventListener("message", a);

    return () => {
      window.removeEventListener("message", a);
    };
  }, []);

  const test = useCallback(() => {
    const w = window.open(
      import.meta.env.VITE_PLAYER_URL,
      "test",
      "left=100,top=100,width=320,height=320",
    );
    w?.postMessage({ type: "recu ?" });
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank"></a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={test}>YOYO</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
