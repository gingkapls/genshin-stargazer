import { useLocalStorage } from "../hooks/useLocalStorage.tsx";

function Instructions() {
  const [showInstructions, setShowInstructions] = useLocalStorage(
    "showInstructions",
    true
  );

  return (
    <>
      <section
        className={"instructions" + " " + (!showInstructions && "hidden")}
      >
        <p>
          ※ You can upload screenshots of your Genshin Impact in-game wish
          history to export them. The images can be added to the queue one by
          one or multiple at a time until you press the scan button. The images
          are processed as soon as they are added. The export button exports the
          wish history as an excel spreadsheet that can be used imported into
          wish trackers.
        </p>
        <p>
          If an image can not be processed, you will get an error and that
          upload batch will be discarded. Please open an issue on github along
          with the image if that image was a valid wish history screenshot.
        </p>
        <p>All the processing is done on your device, no data is uploaded.</p>
      </section>
      <button
        className="btn"
        onClick={() => setShowInstructions(!showInstructions)}
      >
        {showInstructions ? "Hide" : "Show"} instructions
      </button>
    </>
  );
}

export { Instructions };
