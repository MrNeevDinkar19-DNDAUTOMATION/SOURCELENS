import { useState } from "react";

/*
  ============================================
  FILE ICON
  ============================================
*/

const getFileIcon = (fileName) => {
  const extension = fileName
    .split(".")
    .pop()
    ?.toLowerCase();

  const icons = {
    js: "JS",
    jsx: "JSX",
    ts: "TS",
    tsx: "TSX",
    py: "PY",
    json: "{}",
    css: "#",
    scss: "#",
    html: "H",
    md: "MD",
    txt: "TXT",
    png: "IMG",
    jpg: "IMG",
    jpeg: "IMG",
    svg: "SVG",
  };

  return icons[extension] || "FILE";
};


/*
  ============================================
  FILE EXTENSION
  ============================================
*/

const getExtension = (fileName) => {
  const parts = fileName.split(".");

  if (parts.length === 1) {
    return "";
  }

  return `.${parts.pop()}`;
};


/*
  ============================================
  ANALYZABLE SOURCE FILE
  ============================================
*/

const isAnalyzableFile = (fileName) => {
  const extension = fileName
    .split(".")
    .pop()
    ?.toLowerCase();

  return [
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "css",
    "scss",
  ].includes(extension);
};


/*
  ============================================
  READ DIRECTORY RECURSIVELY
  ============================================
*/

const readDirectory = async (
  directoryHandle,
  parentPath = ""
) => {
  const files = [];

  for await (const [name, handle] of directoryHandle.entries()) {

    const currentPath = parentPath
      ? `${parentPath}/${name}`
      : name;


    /*
      FILE
    */

    if (handle.kind === "file") {
      const file = await handle.getFile();

      Object.defineProperty(
        file,
        "relativePath",
        {
          value: currentPath,
          configurable: true,
        }
      );

      files.push(file);
    }


    /*
      DIRECTORY
    */

    if (handle.kind === "directory") {

      const nestedFiles =
        await readDirectory(
          handle,
          currentPath
        );

      files.push(...nestedFiles);
    }
  }

  return files;
};


/*
  ============================================
  BUILD PROJECT TREE
  ============================================
*/

const buildFileTree = (files) => {

  const root = {
    name: "PROJECT",
    type: "folder",
    path: "",
    children: [],
  };


  files.forEach((file) => {

    const relativePath =
      file.relativePath ||
      file.webkitRelativePath ||
      file.name;


    const parts =
      relativePath.split("/");


    /*
      Remove project root
    */

    parts.shift();


    let current = root;


    parts.forEach((part, index) => {

      const isFile =
        index === parts.length - 1;


      let existing =
        current.children.find(
          (child) =>
            child.name === part
        );


      if (!existing) {

        existing = {
          name: part,

          type: isFile
            ? "file"
            : "folder",

          path:
            parts
              .slice(0, index + 1)
              .join("/"),

          children: [],

          file:
            isFile
              ? file
              : null,
        };


        current.children.push(
          existing
        );
      }


      current = existing;
    });
  });


  /*
    Sort folders first,
    then files alphabetically.
  */

  const sortTree = (node) => {

    node.children.sort((a, b) => {

      if (a.type !== b.type) {

        return a.type === "folder"
          ? -1
          : 1;
      }

      return a.name.localeCompare(
        b.name
      );
    });


    node.children.forEach(
      sortTree
    );
  };


  sortTree(root);

  return root;
};


/*
  ============================================
  DEPENDENCY ANALYZER
  ============================================
*/

const extractDependencies = (
  content,
  filePath
) => {

  const fileName =
    filePath.split("/").pop() || filePath;

  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();


  const dependencies = [];


  /*
    ==========================================
    JAVASCRIPT / TYPESCRIPT
    ==========================================
  */

  if (
    ["js", "jsx", "ts", "tsx"].includes(
      extension
    )
  ) {

    /*
      import ... from "..."
      import "..."
    */

    const importRegex =
      /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;

    let match;


    while (
      (match = importRegex.exec(content)) !== null
    ) {

      dependencies.push({
        source: filePath,
        target: match[1],

        type:
          match[1].startsWith(".")
            ? "local-import"
            : "package",
      });
    }


    /*
      export ... from "..."
    */

    const exportRegex =
      /export\s+[\s\S]*?\s+from\s+["']([^"']+)["']/g;


    while (
      (match = exportRegex.exec(content)) !== null
    ) {

      dependencies.push({
        source: filePath,
        target: match[1],

        type:
          match[1].startsWith(".")
            ? "local-import"
            : "package",
      });
    }


    /*
      require("...")
    */

    const requireRegex =
      /require\s*\(\s*["']([^"']+)["']\s*\)/g;


    while (
      (match = requireRegex.exec(content)) !== null
    ) {

      dependencies.push({
        source: filePath,
        target: match[1],

        type:
          match[1].startsWith(".")
            ? "local-import"
            : "package",
      });
    }


    /*
      dynamic import("...")
    */

    const dynamicImportRegex =
      /import\s*\(\s*["']([^"']+)["']\s*\)/g;


    while (
      (match = dynamicImportRegex.exec(content)) !== null
    ) {

      dependencies.push({
        source: filePath,
        target: match[1],

        type:
          match[1].startsWith(".")
            ? "local-import"
            : "package",
      });
    }
  }


  /*
    ==========================================
    PYTHON
    ==========================================
  */

  if (extension === "py") {

    /*
      import package
    */

    const importRegex =
      /^\s*import\s+([a-zA-Z0-9_\.]+)/gm;


    let match;


    while (
      (match = importRegex.exec(content)) !== null
    ) {

      dependencies.push({
        source: filePath,
        target: match[1],
        type: "package",
      });
    }


    /*
      from package import ...
    */

    const fromRegex =
      /^\s*from\s+([a-zA-Z0-9_\.]+)\s+import/gm;


    while (
      (match = fromRegex.exec(content)) !== null
    ) {

      dependencies.push({
        source: filePath,
        target: match[1],

        type:
          match[1].startsWith(".")
            ? "local-import"
            : "package",
      });
    }
  }


  /*
    ==========================================
    CSS / SCSS
    ==========================================
  */

  if (
    ["css", "scss"].includes(
      extension
    )
  ) {

    const cssImportRegex =
      /@import\s+(?:url\()?["']?([^"')]+)["']?\)?/g;


    let match;


    while (
      (match = cssImportRegex.exec(content)) !== null
    ) {

      dependencies.push({
        source: filePath,
        target: match[1],

        type: "style-import",
      });
    }
  }


  return dependencies;
};


/*
  ============================================
  CLEAN SOURCE BEFORE API ANALYSIS
  ============================================
*/

const prepareSourceForApiAnalysis = (content) => {

  let source = content;


  /*
    ------------------------------------------
    REMOVE BLOCK COMMENTS
    ------------------------------------------
  */

  source = source.replace(
    /\/\*[\s\S]*?\*\//g,
    ""
  );


  /*
    ------------------------------------------
    REMOVE SINGLE LINE COMMENTS
    ------------------------------------------
  */

  source = source.replace(
    /\/\/.*$/gm,
    ""
  );


  /*
    ------------------------------------------
    REMOVE SOURCE LENS ANALYZER REGEXES
    ------------------------------------------

    This prevents Source Lens from detecting
    its own regex definitions as APIs.

    Example:

    const fetchRegex =
      /\bfetch\s*\(\s*["'`].../

    That is analyzer code,
    NOT an actual API.
  */

  source = source.replace(
    /^\s*(?:const|let|var)\s+\w*Regex\s*=\s*\/.*?\/[a-z]*\s*;?\s*$/gim,
    ""
  );


  /*
    ------------------------------------------
    REMOVE MULTI-LINE REGEX DEFINITIONS
    ------------------------------------------

    Handles cases where the regex is split
    across multiple lines.
  */

  source = source.replace(
    /^\s*(?:const|let|var)\s+\w*Regex\s*=\s*\/[\s\S]*?\/[a-z]*\s*;?\s*$/gim,
    ""
  );


  return source;
};


/*
  ============================================
  API ANALYZER
  ============================================
*/

const extractApis = (
  content,
  filePath
) => {

  const fileName =
    filePath.split("/").pop() || filePath;

  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();


  const apis = [];


  /*
    Clean JavaScript / TypeScript before
    looking for API patterns.
  */

  const source =
    ["js", "jsx", "ts", "tsx"].includes(
      extension
    )
      ? prepareSourceForApiAnalysis(content)
      : content;


  /*
    ==========================================
    JAVASCRIPT / TYPESCRIPT
    ==========================================
  */

  if (
    ["js", "jsx", "ts", "tsx"].includes(
      extension
    )
  ) {

    /*
      Express / Router

      app.get("/users")
      router.post("/login")
    */

    const routeRegex =
      /\b(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*["'`]([^"'`]+)["'`]/gi;


    let match;


    while (
      (match = routeRegex.exec(source)) !== null
    ) {

      apis.push({
        source: filePath,
        method: match[1].toUpperCase(),
        path: match[2],
        type: "route",
      });
    }


    /*
      Express app.use()
    */

    const useRegex =
      /\bapp\.use\s*\(\s*["'`]([^"'`]+)["'`]/gi;


    while (
      (match = useRegex.exec(source)) !== null
    ) {

      apis.push({
        source: filePath,
        method: "USE",
        path: match[1],
        type: "route",
      });
    }


    /*
      fetch()
    */

    const fetchRegex =
      /\bfetch\s*\(\s*["'`]([^"'`]+)["'`]/gi;


    while (
      (match = fetchRegex.exec(source)) !== null
    ) {

      apis.push({
        source: filePath,
        method: "FETCH",
        path: match[1],
        type: "client-call",
      });
    }


    /*
      axios.get()
      axios.post()
      axios.put()
      axios.patch()
      axios.delete()
    */

    const axiosRegex =
      /\baxios\.(get|post|put|patch|delete|head|options)\s*\(\s*["'`]([^"'`]+)["'`]/gi;


    while (
      (match = axiosRegex.exec(source)) !== null
    ) {

      apis.push({
        source: filePath,
        method: match[1].toUpperCase(),
        path: match[2],
        type: "client-call",
      });
    }


    /*
      axios.request({
        url: "/api/..."
      })
    */

    const axiosRequestRegex =
      /\baxios\.request\s*\(\s*\{[\s\S]*?\burl\s*:\s*["'`]([^"'`]+)["'`]/gi;


    while (
      (match = axiosRequestRegex.exec(source)) !== null
    ) {

      apis.push({
        source: filePath,
        method: "REQUEST",
        path: match[1],
        type: "client-call",
      });
    }
  }


  /*
    ==========================================
    PYTHON
    ==========================================
  */

  if (extension === "py") {

    /*
      FastAPI

      @app.get("/users")
      @router.post("/login")
    */

    const fastApiRegex =
      /@(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*["'`]([^"'`]+)["'`]/gi;


    let match;


    while (
      (match = fastApiRegex.exec(content)) !== null
    ) {

      apis.push({
        source: filePath,
        method: match[1].toUpperCase(),
        path: match[2],
        type: "route",
      });
    }


    /*
      Flask

      @app.route("/users")
    */

    const flaskRegex =
      /@app\.route\s*\(\s*["'`]([^"'`]+)["'`]/gi;


    while (
      (match = flaskRegex.exec(content)) !== null
    ) {

      apis.push({
        source: filePath,
        method: "ROUTE",
        path: match[1],
        type: "route",
      });
    }


    /*
      Python requests

      requests.get()
      requests.post()
    */

    const requestsRegex =
      /\brequests\.(get|post|put|patch|delete|head)\s*\(\s*["'`]([^"'`]+)["'`]/gi;


    while (
      (match = requestsRegex.exec(content)) !== null
    ) {

      apis.push({
        source: filePath,
        method: match[1].toUpperCase(),
        path: match[2],
        type: "client-call",
      });
    }
  }


  return apis;
};


/*
  ============================================
  ANALYZE ENTIRE PROJECT
  ============================================
*/

const analyzeProject = async (files) => {

  const dependencies = [];

  const apis = [];


  for (const file of files) {

    if (
      !isAnalyzableFile(
        file.name
      )
    ) {
      continue;
    }


    try {

      const content =
        await file.text();


      const filePath =
        file.relativePath ||
        file.webkitRelativePath ||
        file.name;


      /*
        DEPENDENCIES
      */

      const detectedDependencies =
        extractDependencies(
          content,
          filePath
        );


      dependencies.push(
        ...detectedDependencies
      );


      /*
        APIS
      */

      const detectedApis =
        extractApis(
          content,
          filePath
        );


      apis.push(
        ...detectedApis
      );

    } catch (error) {

      console.error(
        `Unable to analyze ${file.name}:`,
        error
      );
    }
  }


  return {
    dependencies,
    apis,
  };
};


/*
  ============================================
  RESOLVE LOCAL IMPORT
  ============================================
*/

const resolveLocalImport = (
  sourceFile,
  importPath,
  allFiles
) => {

  if (
    !importPath.startsWith(".")
  ) {
    return null;
  }


  const sourceParts =
    sourceFile.split("/");


  /*
    Remove filename
  */

  sourceParts.pop();


  const importParts =
    importPath.split("/");


  const resolvedParts = [
    ...sourceParts,
    ...importParts,
  ];


  const normalizedParts = [];


  resolvedParts.forEach(
    (part) => {

      if (
        part === "." ||
        part === ""
      ) {
        return;
      }


      if (part === "..") {

        normalizedParts.pop();

      } else {

        normalizedParts.push(
          part
        );
      }
    }
  );


  let resolvedPath =
    normalizedParts.join("/");


  resolvedPath =
    resolvedPath.replace(
      /^\/+/,
      ""
    );


  /*
    Exact file match
  */

  const exactMatch =
    allFiles.find(
      (file) => {

        const filePath =
          file.relativePath ||
          file.webkitRelativePath ||
          file.name;

        return (
          filePath ===
          resolvedPath
        );
      }
    );


  if (exactMatch) {
    return resolvedPath;
  }


  /*
    JavaScript / TypeScript
    extension resolution
  */

  const extensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
  ];


  for (
    const extension of extensions
  ) {

    const match =
      allFiles.find(
        (file) => {

          const filePath =
            file.relativePath ||
            file.webkitRelativePath ||
            file.name;

          return (
            filePath ===
            `${resolvedPath}${extension}`
          );
        }
      );


    if (match) {
      return (
        match.relativePath ||
        match.webkitRelativePath ||
        match.name
      );
    }
  }


  /*
    index.js / index.ts etc.
  */

  for (
    const extension of extensions
  ) {

    const indexPath =
      `${resolvedPath}/index${extension}`;


    const match =
      allFiles.find(
        (file) => {

          const filePath =
            file.relativePath ||
            file.webkitRelativePath ||
            file.name;

          return (
            filePath ===
            indexPath
          );
        }
      );


    if (match) {
      return indexPath;
    }
  }


  return null;
};


/*
  ============================================
  RESOLVE DEPENDENCY CONNECTIONS
  ============================================
*/

const resolveDependencyConnections = (
  dependencies,
  files
) => {

  return dependencies.map(
    (dependency) => {

      if (
        dependency.type !==
        "local-import"
      ) {

        return {
          ...dependency,
          resolved: false,
          resolvedTarget: null,
        };
      }


      const resolvedTarget =
        resolveLocalImport(
          dependency.source,
          dependency.target,
          files
        );


      return {
        ...dependency,

        resolved:
          Boolean(resolvedTarget),

        resolvedTarget,
      };
    }
  );
};


/*
  ============================================
  ARCHITECTURE FLOW NODE
  ============================================
*/

const FlowNode = ({
  node,
  level = 0,
}) => {

  /*
    FILE
  */

  if (node.type === "file") {

    return (
      <div className="flow-file-node">

        <div className="flow-file-icon">
          {getFileIcon(node.name)}
        </div>


        <div className="flow-file-info">

          <strong>
            {node.name}
          </strong>

          <span>
            {getExtension(
              node.name
            )}
          </span>

        </div>

      </div>
    );
  }


  /*
    FOLDER
  */

  return (
    <div className="flow-folder-group">

      <div className="flow-folder-node">

        <div className="flow-folder-icon">
          /
        </div>


        <div>

          <strong>
            {node.name}
          </strong>

          <span>
            {node.children.length} items
          </span>

        </div>

      </div>


      {node.children.length > 0 && (

        <div className="flow-children">

          {node.children.map(
            (child) => (

              <div
                className="flow-child"
                key={child.path}
              >

                <div className="flow-connector" />

                <FlowNode
                  node={child}
                  level={level + 1}
                />

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
};


/*
  ============================================
  PROJECT STRUCTURE FOLDER EXPLORER
  ============================================
*/

const FolderExplorer = ({
  node,
  expandedFolders,
  onToggle,
  level = 0,
}) => {

  const isExpanded =
    expandedFolders[node.path] ||
    false;


  const folders =
    node.children.filter(
      (child) =>
        child.type === "folder"
    );


  const files =
    node.children.filter(
      (child) =>
        child.type === "file"
    );


  return (
    <div
      className="folder-explorer-node"
      style={{
        marginLeft:
          `${level * 18}px`,
      }}
    >

      <div
        className="folder-explorer-row"
        onClick={() =>
          onToggle(node.path)
        }
      >

        <span className="folder-arrow">

          {isExpanded
            ? "▾"
            : "▸"}

        </span>


        <span className="folder-icon">
          📁
        </span>


        <strong>
          {node.name}
        </strong>


        <span className="folder-item-count">
          {node.children.length}
        </span>

      </div>


      {isExpanded && (

        <div className="folder-explorer-children">

          {folders.map(
            (folder) => (

              <FolderExplorer
                key={folder.path}
                node={folder}
                expandedFolders={
                  expandedFolders
                }
                onToggle={
                  onToggle
                }
                level={
                  level + 1
                }
              />

            )
          )}


          {files.map(
            (file) => (

              <div
                key={file.path}
                className="folder-file-row"
                style={{
                  marginLeft:
                    `${(level + 1) * 18}px`,
                }}
              >

                <span className="folder-file-line">
                  ├──
                </span>


                <span className="folder-file-icon">
                  {getFileIcon(
                    file.name
                  )}
                </span>


                <span className="folder-file-name">
                  {file.name}
                </span>

              </div>

            )
          )}

        </div>
      )}

    </div>
  );
};


/*
  ============================================
  DASHBOARD
  ============================================
*/

const Dashboard = () => {

  /*
    PROJECT
  */

  const [
    projectName,
    setProjectName,
  ] = useState("");


  const [
    fileCount,
    setFileCount,
  ] = useState(0);


  const [
    folderCount,
    setFolderCount,
  ] = useState(0);


  const [
    projectSelected,
    setProjectSelected,
  ] = useState(false);


  const [
    fileTree,
    setFileTree,
  ] = useState(null);


  /*
    DEPENDENCIES
  */

  const [
    dependencyCount,
    setDependencyCount,
  ] = useState(0);


  const [
    dependencyConnections,
    setDependencyConnections,
  ] = useState([]);


  /*
    APIS
  */

  const [
    apiCount,
    setApiCount,
  ] = useState(0);


  const [
    apiConnections,
    setApiConnections,
  ] = useState([]);


  /*
    ANALYSIS STATUS
  */

  const [
    isAnalyzing,
    setIsAnalyzing,
  ] = useState(false);


  /*
    FOLDER EXPLORER
  */

  const [
    expandedFolders,
    setExpandedFolders,
  ] = useState({});


  /*
    ARCHITECTURE ZOOM
  */

  const [
    zoom,
    setZoom,
  ] = useState(1);


  /*
    ========================================
    TOGGLE FOLDER
    ========================================
  */

  const toggleFolder = (path) => {

    setExpandedFolders(
      (previous) => ({
        ...previous,

        [path]:
          !previous[path],
      })
    );
  };


  /*
    ========================================
    SELECT PROJECT FOLDER
    ========================================
  */

  const handleSelectProject =
    async () => {

      try {

        /*
          Open native folder picker.
        */

        const directoryHandle =
          await window.showDirectoryPicker({
            mode: "read",
          });


        /*
          Project name
        */

        const selectedProjectName =
          directoryHandle.name;


        /*
          Read all files recursively.
        */

        const fileArray =
          await readDirectory(
            directoryHandle,
            selectedProjectName
          );


        if (
          !fileArray ||
          fileArray.length === 0
        ) {

          alert(
            "No files found in this project."
          );

          return;
        }


        /*
          ==================================
          CALCULATE FOLDERS
          ==================================
        */

        const folders =
          new Set();


        fileArray.forEach(
          (file) => {

            const path =
              file.relativePath ||
              file.webkitRelativePath ||
              file.name;


            const parts =
              path.split("/");


            parts.pop();


            let currentPath = "";


            parts.forEach(
              (part) => {

                currentPath =
                  currentPath
                    ? `${currentPath}/${part}`
                    : part;


                folders.add(
                  currentPath
                );
              }
            );
          }
        );


        /*
          ==================================
          BUILD TREE
          ==================================
        */

        const tree =
          buildFileTree(
            fileArray
          );


        /*
          ==================================
          UPDATE BASIC STATE
          ==================================
        */

        setProjectName(
          selectedProjectName
        );


        setFileCount(
          fileArray.length
        );


        setFolderCount(
          Math.max(
            0,
            folders.size - 1
          )
        );


        setFileTree(
          tree
        );


        setProjectSelected(
          true
        );


        /*
          Reset folder expansion
        */

        setExpandedFolders(
          {}
        );


        /*
          Reset zoom
        */

        setZoom(1);


        /*
          ==================================
          START SOURCE LENS ANALYSIS
          ==================================
        */

        setIsAnalyzing(true);


        try {

          const analysis =
            await analyzeProject(
              fileArray
            );


          /*
            Resolve local imports
            into actual project files.
          */

          const resolvedDependencies =
            resolveDependencyConnections(
              analysis.dependencies,
              fileArray
            );


          /*
            Save dependency data.
          */

          setDependencyConnections(
            resolvedDependencies
          );


          /*
            Save API data.
          */

          setApiConnections(
            analysis.apis
          );


          /*
            Dependency count
          */

          setDependencyCount(
            resolvedDependencies.length
          );


          /*
            API count
          */

          setApiCount(
            analysis.apis.length
          );


          /*
            ==================================
            DEBUG OUTPUT
            ==================================
          */

          console.log(
            "================================"
          );

          console.log(
            "SOURCE LENS ANALYSIS"
          );

          console.log(
            "================================"
          );


          console.log(
            "Project:",
            selectedProjectName
          );


          console.log(
            "Files:",
            fileArray.length
          );


          console.log(
            "Folders:",
            folders.size - 1
          );


          console.log(
            "Dependencies:",
            resolvedDependencies
          );


          console.log(
            "APIs:",
            analysis.apis
          );


          console.log(
            "Resolved local dependencies:",
            resolvedDependencies.filter(
              (dependency) =>
                dependency.resolved
            )
          );


          console.log(
            "Unresolved local dependencies:",
            resolvedDependencies.filter(
              (dependency) =>
                dependency.type ===
                  "local-import" &&
                !dependency.resolved
            )
          );


        } catch (analysisError) {

          console.error(
            "Project analysis error:",
            analysisError
          );


          setDependencyCount(0);

          setApiCount(0);

          setDependencyConnections([]);

          setApiConnections([]);

        } finally {

          setIsAnalyzing(false);

        }


      } catch (error) {

        /*
          User cancelled picker.
        */

        if (
          error.name ===
          "AbortError"
        ) {
          return;
        }


        console.error(
          "Project selection error:",
          error
        );


        alert(
          "Unable to read this project folder."
        );
      }
    };


  /*
    ========================================
    ZOOM OUT
    ========================================
  */

  const handleZoomOut = () => {

    setZoom(
      (currentZoom) =>
        Math.max(
          0.5,
          Number(
            (
              currentZoom -
              0.1
            ).toFixed(1)
          )
        )
    );
  };


  /*
    ========================================
    ZOOM IN
    ========================================
  */

  const handleZoomIn = () => {

    setZoom(
      (currentZoom) =>
        Math.min(
          1.8,
          Number(
            (
              currentZoom +
              0.1
            ).toFixed(1)
          )
        )
    );
  };


  /*
    ========================================
    RESET ZOOM
    ========================================
  */

  const handleZoomReset = () => {
    setZoom(1);
  };


  return (

    <main className="dashboard">


      {/* =====================================
          HEADER
      ===================================== */}

      <section className="dashboard-header">

        <div>

          <div className="dashboard-label">
            SOURCE LENS / DASHBOARD
          </div>


          <h1>

            Understand Your

            <span>
              {" "}
              CodeBase....!!!!
            </span>

          </h1>


          <p>

            Select a project and let Source Lens map its files,
            folders,

            <br />

            dependencies, APIs, and architecture.

          </p>

        </div>


        <button
          className="select-project-btn"
          onClick={
            handleSelectProject
          }
          disabled={isAnalyzing}
        >

          <span>
            +
          </span>

          {isAnalyzing
            ? "Analyzing..."
            : "Select Project"}

        </button>

      </section>


      {/* =====================================
          PROJECT STATUS
      ===================================== */}

      <section className="project-status">

        <div className="status-icon">
          +
        </div>


        <div className="status-content">

          <strong>

            {projectSelected
              ? projectName
              : "No project selected"}

          </strong>


          <p>

            {isAnalyzing

              ? "Scanning files, dependencies, and APIs..."

              : projectSelected

              ? "Project successfully loaded and analyzed."

              : "Select a project folder to begin codebase analysis."}

          </p>

        </div>


        <div className="status-badge">

          {isAnalyzing

            ? "Analyzing..."

            : projectSelected
            ? "Ready"
            : "Waiting...."}

        </div>

      </section>


      {/* =====================================
          STATS
      ===================================== */}

      <section className="dashboard-stats">


        {/* FILES */}

        <div className="stat-card">

          <span>
            FILES
          </span>


          <strong>

            {projectSelected
              ? fileCount
              : "—"}

          </strong>


          <small>
            Detected files
          </small>

        </div>


        {/* FOLDERS */}

        <div className="stat-card">

          <span>
            FOLDERS
          </span>


          <strong>

            {projectSelected
              ? folderCount
              : "—"}

          </strong>


          <small>
            Project directories
          </small>

        </div>


        {/* DEPENDENCIES */}

        <div className="stat-card">

          <span>
            DEPENDENCIES
          </span>


          <strong>

            {projectSelected
              ? dependencyCount
              : "—"}

          </strong>


          <small>
            Detected connections
          </small>

        </div>


        {/* APIS */}

        <div className="stat-card">

          <span>
            APIs
          </span>


          <strong>

            {projectSelected
              ? apiCount
              : "—"}

          </strong>


          <small>
            Detected endpoints
          </small>

        </div>

      </section>


      {/* =====================================
          MAIN GRID
      ===================================== */}

      <section className="dashboard-grid">


        {/* =====================================
            ARCHITECTURE PANEL
        ===================================== */}

        <div className="architecture-panel">


          <div className="panel-header">

            <div>

              <span>
                ARCHITECTURE
              </span>


              <h2>
                Codebase Map
              </h2>

            </div>


            <button
              className="panel-action"
              type="button"
            >
              Explore →
            </button>

          </div>


          <div className="empty-architecture">


            {/* EMPTY STATE */}

            {!projectSelected && (

              <>

                <div className="architecture-core">

                  <span>
                    DND
                  </span>

                </div>


                <h3>
                  DND SUPPORTED
                </h3>


                <p>
                  Architecture will appear here
                </p>

              </>
            )}


            {/* PROJECT ARCHITECTURE */}

            {projectSelected &&
              fileTree && (

                <div className="source-flowchart">


                  {/* =================================
                      FIXED ZOOM CONTROLS
                  ================================= */}

                  <div className="architecture-zoom-controls">


                    <button
                      type="button"
                      onClick={
                        handleZoomOut
                      }
                      aria-label="Zoom out"
                    >
                      −
                    </button>


                    <button
                      type="button"
                      onClick={
                        handleZoomReset
                      }
                      className="zoom-percentage"
                      aria-label="Reset zoom"
                    >

                      {Math.round(
                        zoom * 100
                      )}%

                    </button>


                    <button
                      type="button"
                      onClick={
                        handleZoomIn
                      }
                      aria-label="Zoom in"
                    >
                      +
                    </button>

                  </div>


                  {/* =================================
                      ONLY ARCHITECTURE ZOOMS
                  ================================= */}

                  <div
                    className="architecture-zoom-content"
                    style={{
                      transform:
                        `scale(${zoom})`,
                    }}
                  >


                    {/* PROJECT ROOT */}

                    <div className="flow-root-node">

                      <div className="flow-root-icon">
                        SL
                      </div>


                      <div>

                        <strong>
                          {projectName}
                        </strong>


                        <span>

                          {fileCount} files ·{" "}

                          {folderCount} folders

                        </span>

                      </div>

                    </div>


                    {/* ROOT CONNECTOR */}

                    <div className="root-connector" />


                    {/* PROJECT TREE */}

                    <div className="flow-tree">

                      {fileTree.children.map(
                        (child) => (

                          <div
                            key={child.path}
                            className="flow-root-child"
                          >

                            <div className="main-flow-line" />


                            <FlowNode
                              node={child}
                            />

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </div>
              )}

          </div>

        </div>


        {/* =====================================
            PROJECT STRUCTURE PANEL
        ===================================== */}

        <div className="files-panel">


          <div className="panel-header">

            <div>

              <span>
                PROJECT STRUCTURE
              </span>


              <h2>
                Files
              </h2>

            </div>


            <button
              className="panel-action"
              type="button"
            >
              View all →
            </button>

          </div>


          <div className="empty-files">


            {/* EMPTY */}

            {!projectSelected && (

              <>

                <div className="empty-file-icon">
                  /
                </div>


                <h3>
                  No files detected
                </h3>


                <p>
                  Your project files will appear here after analysis.
                </p>

              </>
            )}


            {/* FOLDER EXPLORER */}

            {projectSelected &&
              fileTree && (

                <div className="folder-explorer">


                  {/* =================================
                      EXPLORER HEADER
                  ================================= */}

                  <div className="folder-explorer-header">

                    <strong>

                      {fileTree.children.filter(
                        (child) =>
                          child.type ===
                          "folder"
                      ).length}

                      {" "}
                      folders

                    </strong>


                    <span>
                      Click a folder to explore
                    </span>

                  </div>


                  {/* =================================
                      FOLDER LIST
                  ================================= */}

                  <div className="folder-explorer-list">

                    {fileTree.children
                      .filter(
                        (child) =>
                          child.type ===
                          "folder"
                      )
                      .map(
                        (folder) => (

                          <FolderExplorer
                            key={
                              folder.path
                            }
                            node={
                              folder
                            }
                            expandedFolders={
                              expandedFolders
                            }
                            onToggle={
                              toggleFolder
                            }
                          />

                        )
                      )}

                  </div>


                  {/* =================================
                      ANALYSIS INFORMATION
                  ================================= */}

                  <div className="analysis-summary">

                    <div className="analysis-summary-row">

                      <span>
                        Dependencies
                      </span>

                      <strong>
                        {dependencyCount}
                      </strong>

                    </div>


                    <div className="analysis-summary-row">

                      <span>
                        APIs
                      </span>

                      <strong>
                        {apiCount}
                      </strong>

                    </div>

                  </div>

                </div>
              )}

          </div>

        </div>

      </section>

    </main>
  );
};


export default Dashboard;