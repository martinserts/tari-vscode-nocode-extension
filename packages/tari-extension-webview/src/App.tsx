import { useEffect, useState } from "react";
import { useTariStore } from "./store/tari-store";
import Signers from "./Signers";
import SignerActions from "./SignerActions";

if (import.meta.env.DEV) {
  await import("@vscode-elements/webview-playground");
}

function App() {
  const messenger = useTariStore((state) => state.messenger);
  const signer = useTariStore((state) => state.signer);
  const configuration = useTariStore((state) => state.configuration);
  const setConfiguration = useTariStore((state) => state.setConfiguration);
  const restoreState = useTariStore((state) => state.restoreState);
  const [signersOpen, setSignersOpen] = useState(true);

  useEffect(() => {
    restoreState().catch(console.log);
  }, [restoreState]);

  useEffect(() => {
    if (messenger) {
      messenger
        .send("getConfiguration", undefined)
        .then((configuration) => {
          setConfiguration(configuration);
        })
        .catch((error: unknown) => {
          console.error("Failed to get configuration", error);
        });
    }
  }, [messenger, setConfiguration]);

  useEffect(() => {
    if (signer) {
      setSignersOpen(false);
    }
  }, [signer]);

  if (configuration) {
    return (
      <>
        {import.meta.env.DEV ? <vscode-dev-toolbar></vscode-dev-toolbar> : null}

        <Signers
          configuration={configuration}
          open={signersOpen}
          onToggle={(open) => {
            setSignersOpen(open);
          }}
        />
        {signer && <SignerActions signer={signer} />}
      </>
    );
  } else {
    return <></>;
  }
}

export default App;
