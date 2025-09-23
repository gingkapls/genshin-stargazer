import { useLocalStorage } from "../hooks/useLocalStorage.tsx";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function Instructions() {
  const [showInstructions, setShowInstructions] = useLocalStorage(
    "showInstructions",
    true
  );

  const icon = showInstructions ? <ExpandLessIcon /> : <ExpandMoreIcon />;
  const text = showInstructions ? "Hide Instructions" : "Show Instructions";

  return (
    <>
      <section
        className={"instructions" + " " + (!showInstructions && "hidden")}
      >
        <p>
          ※ You can add screenshots of your Genshin Impact in-game wish history
          to export them. They can be added to the queue one by one or multiple
          at a time. The images are processed as soon as they are added and the
          scan button appears after that. The export button exports the wish
          history as an excel spreadsheet that can be imported into wish
          trackers.
        </p>
        <p>
          If an image can not be processed, you will get an error and that batch
          will be discarded. Please open an issue on{" "}
          <a
            href="https://github.com/gingkapls/genshin-wish-scanner"
            rel="noopener noreferrer"
          >
            Github
          </a>{" "}
          along with the image if that image was a valid wish history
          screenshot.
        </p>
        <p>All the processing is done on your device, no data is uploaded.</p>
      </section>
      <button
        className="btn"
        onClick={() => setShowInstructions(!showInstructions)}
      >
        {icon} {text}
      </button>
    </>
  );
}

export { Instructions };
