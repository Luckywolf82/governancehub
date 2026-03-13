import { useEffect, useState } from "react";

export default function RepoFileExplorer() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetch(
      "https://api.github.com/repos/Luckywolf82/governancehub/git/trees/main?recursive=1"
    )
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.tree || []);
      });
  }, []);

  return (
    <div>
      <h2>Repository Files</h2>

      {files.map((file) => {
        const raw = `https://raw.githubusercontent.com/Luckywolf82/governancehub/main/${file.path}`;

        return (
          <div key={file.path}>
            <a href={raw} target="_blank">
              {file.path}
            </a>
          </div>
        );
      })}
    </div>
  );
}
