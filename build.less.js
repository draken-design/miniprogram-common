import less from "less";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __Path = path.join("build.less.js");
const __dirname = fileURLToPath(import.meta.url).replace(__Path, "");
const buildCssPath = path.join(__dirname, "styles");
const lessAssetsPath = [path.join(__dirname, "less")];
const buildCss = (cssContent, outputPath) => {
  return new Promise((resolve, reject) => {
    less
      .render(cssContent, {
        paths: lessAssetsPath,
        compress: false,
      })
      .then((res) => {
        if (res.css)
          fs.writeFile(outputPath, res.css, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};
const findLessAndBuild = async (lessPath, cssPath) => {
  const dir = fs.readdirSync(lessPath, { withFileTypes: true });
  for (let i = 0; i < dir.length; i++) {
    const ele = dir[i];
    const _Path = path.join(lessPath, ele.name);
    const _BuildPath = path.join(cssPath, ele.name);
    if (ele.isDirectory()) {
      lessAssetsPath.push(_Path);
      fs.mkdirSync(_BuildPath, { recursive: true });
      findLessAndBuild(_Path, _BuildPath);
    } else if (ele.isFile()) {
      const cssContent = fs.readFileSync(_Path);
      await buildCss(
        cssContent.toString(),
        _BuildPath.replace(".less", ".css")
      );
    }
  }
};
fs.mkdir(buildCssPath, { recursive: true }, (err) => {
  if (!err) {
    findLessAndBuild(lessAssetsPath[0], buildCssPath);
  } else {
    console.log(err);
  }
});
